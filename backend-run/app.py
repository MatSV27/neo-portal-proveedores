import os
import uuid
import json
import io
from datetime import datetime
from typing import Optional, Dict, Any

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from google.cloud import storage
from google.cloud import firestore

import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials

import google.generativeai as genai
import PyPDF2

# -----------------------------------------------------------------------------
# Configuración básica
# -----------------------------------------------------------------------------
APP_PORT = int(os.environ.get("PORT", "8080"))
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "factoria-5ee80")
BUCKET_NAME = os.environ.get("BUCKET_NAME", "factoria-5ee80.firebasestorage.app")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL_ID = os.environ.get("GEMINI_MODEL_ID", "models/gemini-2.5-flash")

# Inicializa Firebase Admin con ADC (cuenta de servicio de Cloud Run)
if not firebase_admin._apps:
    firebase_admin.initialize_app()

# Clientes de GCP
storage_client = storage.Client()
firestore_client = firestore.Client()

# Configurar Google AI (Gemini API)
GEMINI_AI_ENABLED = False
GEMINI_MODEL = None

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Inicializar el modelo una sola vez
        GEMINI_MODEL = genai.GenerativeModel(GEMINI_MODEL_ID)
        GEMINI_AI_ENABLED = True
        print(f"✅ Gemini AI listo con modelo: {GEMINI_MODEL_ID} (Google AI SDK)")
    except Exception as e:
        print(f"⚠️ No se pudo preparar Gemini: {e}")
        GEMINI_AI_ENABLED = False
else:
    print(f"⚠️ GEMINI_API_KEY no configurada - IA deshabilitada")

# Flask
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:8080",
    "https://factoria-5ee80.web.app",
    "https://factoria-5ee80.firebaseapp.com"
])

# -----------------------------------------------------------------------------
# Utilidades
# -----------------------------------------------------------------------------
def _extract_bearer_uid_and_role() -> tuple[str, Optional[str]]:
    """
    Lee el header Authorization: Bearer <idToken> y devuelve (uid, role).
    Lanza ValueError si falta o es inválido.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise ValueError("Falta Authorization: Bearer <idToken>")

    id_token = auth_header.split(" ", 1)[1].strip()
    decoded = fb_auth.verify_id_token(id_token)
    uid = decoded["uid"]
    
    # Extraer rol de custom claims
    role = decoded.get("role") or decoded.get("claims", {}).get("role")
    
    return uid, role


def extract_text_from_pdf(file_stream) -> str:
    """
    Extrae texto de un PDF usando PyPDF2.
    """
    try:
        pdf_reader = PyPDF2.PdfReader(file_stream)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""


def process_invoice_with_gemini(pdf_text: str) -> Dict[str, Any]:
    """
    Procesa el texto del PDF con Google AI (Gemini API) para extraer datos estructurados.
    """
    if not GEMINI_AI_ENABLED:
        print("⚠️ Gemini AI deshabilitado - devolviendo datos de ejemplo")
        return {
            "monto_total": "1500.00",
            "moneda": "PEN",
            "ruc_emisor": "20123456789",
            "razon_social_emisor": "EMPRESA EJEMPLO SAC",
            "fecha_emision": "2025-11-01",
            "fecha_vencimiento": "2025-12-01",
            "numero_factura": "F001-00000123",
            "concepto": "Servicios profesionales",
            "confidence": 85,
            "note": "Datos de ejemplo - IA deshabilitada"
        }
    
    try:
        # Limitar texto a 4000 caracteres para no exceder límites
        texto_limitado = pdf_text[:4000] if len(pdf_text) > 4000 else pdf_text
        
        prompt = f"""
Analiza el siguiente documento y extrae información relevante.

Si es una factura peruana, extrae:
- Monto total (número con decimales)
- Moneda (PEN, USD, etc.)
- RUC del emisor (11 dígitos)
- Razón social del emisor
- Fecha de emisión (YYYY-MM-DD)
- Fecha de vencimiento (YYYY-MM-DD)
- Número de factura
- Concepto/descripción

Si NO es una factura, resume el contenido principal del documento.

Texto del documento:
{texto_limitado}

Devuelve SOLO un objeto JSON válido con esta estructura (sin comentarios):
{{
    "es_factura": true o false,
    "resumen": "breve resumen si no es factura",
    "monto_total": "valor o null",
    "moneda": "PEN/USD o null",
    "ruc_emisor": "número o null",
    "razon_social_emisor": "nombre o null",
    "fecha_emision": "YYYY-MM-DD o null",
    "fecha_vencimiento": "YYYY-MM-DD o null",
    "numero_factura": "número o null",
    "concepto": "descripción",
    "confidence": número del 0 al 100
}}
"""
        
        # Usar el modelo ya inicializado
        response = GEMINI_MODEL.generate_content(prompt)
        
        # Parseo robusto: algunas versiones devuelven .text; otras requieren candidates/parts
        response_text = getattr(response, "text", None)
        if not response_text:
            # Fallback robusto
            cand = (getattr(response, "candidates", []) or [None])[0]
            if cand and hasattr(cand, "content") and cand.content and cand.content.parts:
                response_text = "".join(getattr(p, "text", "") or "" for p in cand.content.parts)
        
        if not response_text:
            raise ValueError("Gemini no devolvió texto")
        
        response_text = response_text.strip()
        
        print(f"🤖 Respuesta de Gemini: {response_text[:200]}...")
        
        # Limpiar bloques ```json
        if "```json" in response_text:
            response_text = response_text.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```", 1)[1].split("```", 1)[0].strip()
        
        # Intentar parsear JSON; si falla, buscar el primer/último { }
        try:
            extracted_data = json.loads(response_text)
        except json.JSONDecodeError:
            start = response_text.find("{")
            end = response_text.rfind("}")
            if start != -1 and end != -1 and end > start:
                extracted_data = json.loads(response_text[start:end+1])
            else:
                raise
        
        print(f"✅ Datos extraídos: {extracted_data}")
        
        return extracted_data
        
    except Exception as e:
        print(f"❌ Error procesando con Gemini: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            "error": str(e),
            "es_factura": False,
            "resumen": f"Error al procesar: {str(e)}",
            "monto_total": None,
            "moneda": None,
            "ruc_emisor": None,
            "razon_social_emisor": None,
            "fecha_emision": None,
            "fecha_vencimiento": None,
            "numero_factura": None,
            "concepto": "Error en procesamiento",
            "confidence": 0
        }


def require_admin(uid: str, role: Optional[str]):
    """
    Verifica que el usuario sea admin. Si no, lanza ValueError.
    """
    if role != "admin":
        raise ValueError("Se requiere rol de administrador")


# -----------------------------------------------------------------------------
# Rutas
# -----------------------------------------------------------------------------
@app.get("/health")
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "firestore": "ok",
            "storage": "ok",
            "gemini_ai": "disabled" if not GEMINI_AI_ENABLED else "ok"
        }
    }), 200


@app.get("/_debug/gemini-models")
def debug_gemini_models():
    """
    Endpoint de debug para listar modelos disponibles de Gemini.
    Útil para verificar que el SDK ve los modelos correctos.
    """
    if not GEMINI_API_KEY:
        return jsonify({"enabled": False, "reason": "No GEMINI_API_KEY"}), 400
    
    try:
        models = [m.name for m in genai.list_models()]
        return jsonify({
            "enabled": True,
            "configured_model": GEMINI_MODEL_ID,
            "available_models": models,
            "total": len(models)
        }), 200
    except Exception as e:
        return jsonify({"enabled": True, "error": str(e)}), 500


@app.post("/invoices")
def create_invoice():
    """
    Recibe un PDF, lo sube a Cloud Storage y crea documento en Firestore.
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 401

    # Validar archivo
    if "file" not in request.files:
        return jsonify({"error": "falta el archivo 'file' en form-data"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "archivo vacío"}), 400

    # Verificar que sea PDF
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "solo se permiten archivos PDF"}), 400

    # Nombre seguro y ruta en el bucket
    invoice_id = f"inv_{uuid.uuid4().hex[:12]}"
    safe_name = secure_filename(file.filename or "factura.pdf")
    gcs_path = f"invoices/{uid}/{invoice_id}.pdf"

    # Subir a Cloud Storage
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(gcs_path)
        
        # Leer el contenido del archivo
        file_content = file.read()
        
        # Subir a Cloud Storage
        blob.upload_from_string(file_content, content_type="application/pdf")
        blob.cache_control = "no-cache"
        blob.patch()
        
    except Exception as e:
        print(f"Error subiendo a Storage: {e}")
        return jsonify({"error": "error subiendo a Storage", "detail": str(e)}), 500

    # Crear documento en Firestore
    try:
        doc_ref = firestore_client.collection("invoices").document(invoice_id)
        doc = {
            "supplierUid": uid,
            "storagePath": gcs_path,
            "originalFilename": safe_name,
            "status": "Recibida",
            # Campos de IA vacíos (se llenarán al procesar)
            "monto_total": None,
            "moneda": None,
            "ruc_emisor": None,
            "razon_social_emisor": None,
            "fecha_emision": None,
            "fecha_vencimiento": None,
            "numero_factura": None,
            "concepto": None,
            "confidence": None,
            "processed": False,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        doc_ref.set(doc)
    except Exception as e:
        print(f"Error escribiendo en Firestore: {e}")
        return jsonify({"error": "error escribiendo en Firestore", "detail": str(e)}), 500

    return jsonify({
        "invoiceId": invoice_id,
        "status": "Recibida",
        "storagePath": gcs_path,
        "message": "Factura subida. Use /invoices/<id>/process para procesar con IA"
    }), 201


@app.post("/invoices/<invoice_id>/process")
def process_invoice(invoice_id: str):
    """
    Procesa una factura específica con Google AI (Gemini API) para extraer datos.
    SOLO puede ser llamado por un administrador.
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
        require_admin(uid, role)  # Solo admin puede procesar con IA
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 403

    # Obtener documento de Firestore
    try:
        doc_ref = firestore_client.collection("invoices").document(invoice_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "factura no encontrada"}), 404
        
        data = doc.to_dict()
        storage_path = data["storagePath"]
        
    except Exception as e:
        return jsonify({"error": "error leyendo Firestore", "detail": str(e)}), 500

    # Descargar PDF de Cloud Storage
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(storage_path)
        
        # Descargar contenido
        pdf_bytes = blob.download_as_bytes()
        pdf_stream = io.BytesIO(pdf_bytes)
        
        # Extraer texto
        pdf_text = extract_text_from_pdf(pdf_stream)
        
        if not pdf_text or len(pdf_text.strip()) < 50:
            return jsonify({
                "error": "No se pudo extraer texto del PDF",
                "detail": "El PDF podría estar escaneado o no contener texto"
            }), 400
        
    except Exception as e:
        print(f"Error descargando de Storage: {e}")
        return jsonify({"error": "error descargando PDF", "detail": str(e)}), 500

    # Procesar con Gemini
    try:
        extracted_data = process_invoice_with_gemini(pdf_text)
        
        # Verificar si hubo error en el procesamiento
        if extracted_data.get("error"):
            print(f"❌ Error en IA: {extracted_data.get('error')}")
            return jsonify({
                "error": "Error al procesar con IA",
                "detail": extracted_data.get("error"),
                "resumen": extracted_data.get("resumen", "No se pudo procesar el documento")
            }), 500
        
        # Solo actualizar si el procesamiento fue exitoso
        doc_ref.update({
            "es_factura": extracted_data.get("es_factura", False),
            "resumen": extracted_data.get("resumen"),
            "monto_total": extracted_data.get("monto_total"),
            "moneda": extracted_data.get("moneda"),
            "ruc_emisor": extracted_data.get("ruc_emisor"),
            "razon_social_emisor": extracted_data.get("razon_social_emisor"),
            "fecha_emision": extracted_data.get("fecha_emision"),
            "fecha_vencimiento": extracted_data.get("fecha_vencimiento"),
            "numero_factura": extracted_data.get("numero_factura"),
            "concepto": extracted_data.get("concepto"),
            "confidence": extracted_data.get("confidence", 0),
            "processed": True,
            "processedAt": firestore.SERVER_TIMESTAMP
        })
        
        print(f"✅ Documento procesado exitosamente: {invoice_id}")
        
        return jsonify({
            "message": "Documento procesado exitosamente con IA",
            "invoiceId": invoice_id,
            "extracted_data": extracted_data,
            "es_factura": extracted_data.get("es_factura", False)
        }), 200
        
    except Exception as e:
        print(f"❌ Error procesando con IA: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": "Error al procesar con IA",
            "detail": str(e)
        }), 500


@app.get("/invoices")
def list_invoices():
    """
    Lista facturas. Si es admin, ve todas. Si es proveedor, solo las suyas.
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 401

    # Consulta Firestore según el rol
    try:
        coll = firestore_client.collection("invoices")
        
        if role == "admin":
            # Admin ve todas las facturas
            q = coll.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(100)
        else:
            # Proveedor solo ve las suyas
            q = coll.where("supplierUid", "==", uid)\
                   .order_by("createdAt", direction=firestore.Query.DESCENDING)\
                   .limit(100)
        
        docs = q.stream()
        
        # Serializar a JSON
        items = []
        for d in docs:
            data = d.to_dict() or {}
            data["invoiceId"] = d.id
            
            # Convertir timestamps
            for field in ["createdAt", "processedAt"]:
                if field in data and data[field] is not None:
                    try:
                        data[field] = data[field].to_datetime().isoformat()
                    except:
                        pass
            
            # Si es admin, agregar info del proveedor (email y RUC)
            if role == "admin" and "supplierUid" in data:
                try:
                    # Obtener info del proveedor desde Auth
                    from firebase_admin import auth as admin_auth
                    user_record = admin_auth.get_user(data["supplierUid"])
                    data["supplierEmail"] = user_record.email
                    
                    # Intentar obtener RUC desde colección suppliers
                    supplier_doc = firestore_client.collection("suppliers").document(data["supplierUid"]).get()
                    if supplier_doc.exists:
                        supplier_data = supplier_doc.to_dict()
                        data["supplierRuc"] = supplier_data.get("ruc")
                except Exception as e:
                    print(f"Error obteniendo info del proveedor: {e}")
                    # No fallar si no se puede obtener info del proveedor
                    pass
            
            items.append(data)
        
        return jsonify({"items": items, "total": len(items)}), 200
        
    except Exception as e:
        print(f"Error listando facturas: {e}")
        return jsonify({"error": "error listando facturas", "detail": str(e)}), 500


@app.patch("/invoices/<invoice_id>/status")
def update_invoice_status(invoice_id: str):
    """
    Actualiza el estado de una factura. Solo admins.
    Body: {"status": "Por Pagar" | "Pagada" | "Vencida" | "Recibida"}
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
        require_admin(uid, role)
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 403

    # Validar body
    data = request.get_json()
    if not data or "status" not in data:
        return jsonify({"error": "falta campo 'status' en el body"}), 400
    
    new_status = data["status"]
    valid_statuses = ["Recibida", "Por Pagar", "Pagada", "Vencida"]
    
    if new_status not in valid_statuses:
        return jsonify({
            "error": f"estado inválido. Debe ser uno de: {', '.join(valid_statuses)}"
        }), 400

    # Actualizar Firestore
    try:
        doc_ref = firestore_client.collection("invoices").document(invoice_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "factura no encontrada"}), 404
        
        doc_ref.update({
            "status": new_status,
            "lastUpdatedAt": firestore.SERVER_TIMESTAMP,
            "lastUpdatedBy": uid
        })
        
        return jsonify({
            "message": "Estado actualizado",
            "invoiceId": invoice_id,
            "newStatus": new_status
        }), 200
        
    except Exception as e:
        print(f"Error actualizando estado: {e}")
        return jsonify({"error": "error actualizando estado", "detail": str(e)}), 500


@app.get("/suppliers")
def list_suppliers():
    """
    Lista todos los proveedores (usuarios registrados). Solo admins.
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
        require_admin(uid, role)
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 403

    try:
        # Listar usuarios de Firebase Auth
        users = []
        page = fb_auth.list_users()
        
        while page:
            for user in page.users:
                # Obtener perfil de Firestore desde colección 'suppliers'
                supplier_doc = firestore_client.collection("suppliers").document(user.uid).get()
                supplier_data = supplier_doc.to_dict() if supplier_doc.exists else {}
                
                users.append({
                    "uid": user.uid,
                    "email": user.email,
                    "displayName": user.display_name,
                    "createdAt": user.user_metadata.creation_timestamp,
                    "role": user.custom_claims.get("role") if user.custom_claims else None,
                    "profile": {
                        "ruc": supplier_data.get("ruc"),
                        "razonSocial": supplier_data.get("razonSocial"),
                        "representanteLegal": supplier_data.get("representanteLegal"),
                        "direccion": supplier_data.get("direccion"),
                        "status": supplier_data.get("status")
                    }
                })
            
            # Siguiente página
            page = page.get_next_page()
            if not page:
                break
        
        return jsonify({"suppliers": users, "total": len(users)}), 200
        
    except Exception as e:
        print(f"Error listando proveedores: {e}")
        return jsonify({"error": "error listando proveedores", "detail": str(e)}), 500


@app.get("/dashboard/stats")
def dashboard_stats():
    """
    Devuelve estadísticas para el dashboard de admin.
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
        require_admin(uid, role)
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 403

    try:
        # Contar facturas por estado
        invoices_coll = firestore_client.collection("invoices")
        
        all_invoices = list(invoices_coll.stream())
        
        stats = {
            "total_invoices": len(all_invoices),
            "by_status": {
                "Recibida": 0,
                "Por Pagar": 0,
                "Pagada": 0,
                "Vencida": 0
            },
            "processed_count": 0,
            "total_suppliers": 0,
            "recent_invoices": []
        }
        
        # Contar por estado
        for doc in all_invoices:
            data = doc.to_dict()
            status = data.get("status", "Recibida")
            if status in stats["by_status"]:
                stats["by_status"][status] += 1
            
            if data.get("processed"):
                stats["processed_count"] += 1
        
        # Contar proveedores únicos
        unique_suppliers = set(doc.to_dict().get("supplierUid") for doc in all_invoices if doc.to_dict().get("supplierUid"))
        stats["total_suppliers"] = len(unique_suppliers)
        
        # Facturas recientes (últimas 5) - ordenar por createdAt
        def get_created_at(doc):
            data = doc.to_dict()
            created_at = data.get("createdAt")
            if created_at:
                try:
                    return created_at.timestamp() if hasattr(created_at, 'timestamp') else 0
                except:
                    return 0
            return 0
        
        recent = sorted(all_invoices, key=get_created_at, reverse=True)[:5]
        
        for doc in recent:
            data = doc.to_dict()
            created_at = data.get("createdAt")
            try:
                created_at_str = created_at.isoformat() if hasattr(created_at, 'isoformat') else None
            except:
                created_at_str = None
            
            stats["recent_invoices"].append({
                "invoiceId": doc.id,
                "status": data.get("status"),
                "monto_total": data.get("monto_total"),
                "createdAt": created_at_str
            })
        
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"Error obteniendo estadísticas: {e}")
        return jsonify({"error": "error obteniendo estadísticas", "detail": str(e)}), 500


@app.post("/admin/set-role")
def set_user_role():
    """
    Asigna rol a un usuario. Solo admins (o puedes hacer esto desde Firebase Console).
    Body: {"uid": "user-uid", "role": "admin" | "proveedor"}
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
        require_admin(uid, role)
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 403

    data = request.get_json()
    if not data or "uid" not in data or "role" not in data:
        return jsonify({"error": "faltan campos 'uid' y 'role'"}), 400
    
    target_uid = data["uid"]
    target_role = data["role"]
    
    if target_role not in ["admin", "proveedor"]:
        return jsonify({"error": "rol debe ser 'admin' o 'proveedor'"}), 400

    try:
        # Asignar custom claim
        fb_auth.set_custom_user_claims(target_uid, {"role": target_role})
        
        return jsonify({
            "message": "Rol asignado exitosamente",
            "uid": target_uid,
            "role": target_role
        }), 200
        
    except Exception as e:
        print(f"Error asignando rol: {e}")
        return jsonify({"error": "error asignando rol", "detail": str(e)}), 500


# -----------------------------------------------------------------------------
# Perfiles de usuarios
# -----------------------------------------------------------------------------
@app.get("/profile")
def get_profile():
    """
    Obtiene el perfil del usuario actual.
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 401

    try:
        doc = firestore_client.collection("suppliers").document(uid).get()
        
        if doc.exists:
            data = doc.to_dict()
            data["uid"] = uid
            data["role"] = role
            return jsonify(data), 200
        else:
            return jsonify({"uid": uid, "role": role}), 200
            
    except Exception as e:
        print(f"Error obteniendo perfil: {e}")
        return jsonify({"error": "error obteniendo perfil", "detail": str(e)}), 500


@app.put("/profile")
def update_profile():
    """
    Actualiza el perfil del usuario actual.
    Body: {"ruc": "...", "razonSocial": "...", "direccion": "..."}
    """
    try:
        uid, role = _extract_bearer_uid_and_role()
    except Exception as e:
        return jsonify({"error": "no autorizado", "detail": str(e)}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "body vacío"}), 400

    try:
        # Guardar en Firestore (colección 'suppliers')
        doc_ref = firestore_client.collection("suppliers").document(uid)
        
        profile_data = {
            "ruc": data.get("ruc", ""),
            "razonSocial": data.get("razonSocial", ""),
            "representanteLegal": data.get("representanteLegal", ""),
            "direccion": data.get("direccion", ""),
            "status": data.get("status", "activo"),
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref.set(profile_data, merge=True)
        
        # Respuesta sin SERVER_TIMESTAMP (no es serializable a JSON)
        response_data = {
            "ruc": data.get("ruc", ""),
            "razonSocial": data.get("razonSocial", ""),
            "representanteLegal": data.get("representanteLegal", ""),
            "direccion": data.get("direccion", ""),
            "status": data.get("status", "activo")
        }
        
        return jsonify({"message": "Perfil actualizado", "profile": response_data}), 200
        
    except Exception as e:
        print(f"Error actualizando perfil: {e}")
        return jsonify({"error": "error actualizando perfil", "detail": str(e)}), 500


# -----------------------------------------------------------------------------
# Main (para ejecución local)
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    print(f"🚀 Servidor iniciando en puerto {APP_PORT}")
    print(f"📦 Proyecto: {PROJECT_ID}")
    print(f"🪣 Bucket: {BUCKET_NAME}")
    app.run(host="0.0.0.0", port=APP_PORT, debug=True)
