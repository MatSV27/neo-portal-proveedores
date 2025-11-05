#!/usr/bin/env python3
"""
Script para asignar rol de admin a un usuario
Ejecutar con: python set-admin.py <email-del-usuario>
"""

import sys
import firebase_admin
from firebase_admin import credentials, auth

def set_admin_role(email):
    """Asigna el rol de admin a un usuario por su email"""
    try:
        # Inicializar Firebase Admin SDK
        if not firebase_admin._apps:
            # Usa las credenciales del archivo JSON
            import os
            script_dir = os.path.dirname(os.path.abspath(__file__))
            cred_path = os.path.join(script_dir, 'service-account.json')
            
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print(f"✅ Credenciales cargadas desde: {cred_path}\n")
            else:
                print(f"❌ Error: No se encontró el archivo 'service-account.json'")
                print(f"📍 Búscalo en: {cred_path}")
                print("\n💡 Descárgalo desde:")
                print("   https://console.cloud.google.com/iam-admin/serviceaccounts")
                sys.exit(1)
        
        # Obtener el usuario por email
        user = auth.get_user_by_email(email)
        
        print(f"\n📧 Usuario encontrado: {user.email}")
        print(f"🆔 UID: {user.uid}")
        
        # Asignar custom claim de admin
        auth.set_custom_user_claims(user.uid, {'role': 'admin'})
        
        print("\n✅ ¡Rol de admin asignado exitosamente!")
        print("\n⚠️  IMPORTANTE:")
        print("   El usuario debe cerrar sesión y volver a iniciar sesión")
        print("   para que los cambios surtan efecto.\n")
        
        # Verificar que se asignó correctamente
        updated_user = auth.get_user(user.uid)
        print(f"🔍 Custom claims actuales: {updated_user.custom_claims}")
        
    except auth.UserNotFoundError:
        print(f"\n❌ Error: No se encontró un usuario con el email '{email}'")
        print("💡 Sugerencia: Verifica que el email esté escrito correctamente")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❌ Error: Debes proporcionar el email del usuario")
        print("\nUso:")
        print("  python set-admin.py <email-del-usuario>")
        print("\nEjemplo:")
        print("  python set-admin.py matsv2703@gmail.com")
        sys.exit(1)
    
    email = sys.argv[1]
    set_admin_role(email)

