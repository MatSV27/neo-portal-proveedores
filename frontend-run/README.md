# Portal de Proveedores

MVP funcional para gestión de proveedores con autenticación Firebase y carga de facturas PDF.

## Stack Tecnológico

- **Frontend**: React 18 + Vite + TypeScript
- **Autenticación**: Firebase Auth (Web SDK v9 modular)
- **UI**: shadcn/ui + Tailwind CSS
- **HTTP Client**: fetch nativo
- **State Management**: React Hooks + Context API

## Características

- ✅ Registro e inicio de sesión con email/password
- ✅ Perfil de proveedor (RUC, Razón Social, Dirección)
- ✅ Carga de facturas PDF con validación
- ✅ Listado de facturas subidas
- ✅ Integración con backend en Cloud Run
- ✅ Protección de rutas autenticadas
- ✅ Manejo de tokens JWT automático

## Configuración

### 1. Variables de Entorno

El archivo `.env` ya existe con una plantilla. Edítalo con tus credenciales reales:

```bash
# Windows
notepad .env

# Linux/Mac
nano .env
```

Configura estos valores:

```env
VITE_API_BASE=https://tu-servicio.run.app
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_APP_ID=tu-app-id
```

**¿Dónde obtengo las credenciales?**
- **Firebase**: [console.firebase.google.com](https://console.firebase.google.com/) → Tu proyecto → ⚙️ Configuración
- **Cloud Run URL**: [console.cloud.google.com](https://console.cloud.google.com/) → Cloud Run → Tu servicio

### 2. Instalación

```bash
npm install
```

### 3. Verificar Configuración

Antes de iniciar, verifica que todo esté configurado correctamente:

```bash
npm run check-config
```

Este comando validará:
- ✅ Existencia del archivo `.env`
- ✅ Todas las variables de entorno requeridas
- ✅ Que no sean valores placeholder
- ✅ URL del backend correctamente formateada
- ✅ Dependencias instaladas

### 4. Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

### 5. Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 📚 Documentación Adicional

- **`INICIO_RAPIDO.md`** - Guía de 5 minutos para empezar
- **`CONFIGURACION.md`** - Guía detallada de configuración
- **`DIAGNOSTICO_Y_SOLUCIONES.md`** - Solución de problemas comunes
- **`RESUMEN_REVISION.md`** - Análisis completo del proyecto

## Deploy en Firebase Hosting

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login en Firebase

```bash
firebase login
```

### 3. Inicializar proyecto (solo primera vez)

```bash
firebase init hosting
```

- Selecciona tu proyecto de Firebase
- Usa `dist` como directorio público
- Configura como SPA (Single Page App): **Yes**
- No sobreescribir index.html

### 4. Desplegar

```bash
npm run build
firebase deploy --only hosting
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── InvoiceUpload.tsx
│   ├── InvoicesTable.tsx
│   ├── ProfileForm.tsx
│   └── RouteGuard.tsx
├── contexts/
│   └── AuthContext.tsx  # Contexto de autenticación
├── lib/
│   └── firebase.ts      # Configuración Firebase
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── NotFound.tsx
├── utils/
│   └── api.ts          # Utilidades para llamadas API
└── App.tsx
```

## Endpoints del Backend

### POST /invoices
Sube una factura en formato PDF.

**Headers:**
- `Authorization: Bearer <ID_TOKEN>`

**Body:**
- `file`: archivo PDF (multipart/form-data)

**Response 200:**
```json
{
  "invoiceId": "string",
  "status": "string",
  "storagePath": "string"
}
```

### GET /invoices
Lista todas las facturas del proveedor autenticado.

**Headers:**
- `Authorization: Bearer <ID_TOKEN>`

**Response 200:**
```json
{
  "items": [
    {
      "invoiceId": "string",
      "status": "string",
      "storagePath": "string",
      "createdAt": "string"
    }
  ]
}
```

## Flujo de Usuario

1. **Registro**: El usuario crea una cuenta con email/password
2. **Login**: Inicia sesión y obtiene un token de Firebase Auth
3. **Dashboard**: Accede al panel principal con tres secciones:
   - **Mi Perfil**: Edita RUC, Razón Social y Dirección
   - **Subir Factura**: Carga archivos PDF
   - **Mis Facturas**: Ve el listado de facturas subidas
4. **Logout**: Cierra sesión y limpia el token

## Seguridad

- ✅ Tokens JWT renovados automáticamente por Firebase
- ✅ Rutas protegidas con RouteGuard
- ✅ Redirección automática en caso de sesión expirada
- ✅ Validación de archivos (solo PDF)
- ✅ Headers de autorización en todas las llamadas API

## Notas para el MVP

- El perfil se guarda en `localStorage` (en producción considerar Firestore)
- Los tokens se refrescan automáticamente mediante Firebase Auth
- La UI es funcional sin priorizar diseño elaborado
- Manejo de errores básico con mensajes claros al usuario

## Soporte

Para problemas o preguntas sobre el backend en Cloud Run, contactar al equipo de backend.
