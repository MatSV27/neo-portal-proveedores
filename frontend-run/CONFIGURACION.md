# Guía de Configuración del Frontend

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o bun instalado
- Cuenta de Firebase (para autenticación)
- Backend desplegado en Google Cloud Run

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto `frontend-run`:

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales reales:

```env
# Backend API URL (Cloud Run)
VITE_API_BASE=https://tu-servicio.run.app

# Firebase Configuration
VITE_FIREBASE_API_KEY=tu-api-key-de-firebase
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_APP_ID=tu-app-id-de-firebase
```

### 2. Obtener Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **Configuración del proyecto** (⚙️)
4. En la sección **Tus aplicaciones**, selecciona tu app web
5. Copia los valores de configuración:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`

### 3. Habilitar Autenticación en Firebase

1. En Firebase Console, ve a **Authentication**
2. Haz clic en **Comenzar**
3. En la pestaña **Sign-in method**, habilita:
   - ✅ **Correo electrónico/contraseña**
4. Guarda los cambios

### 4. Configurar URL del Backend

En el archivo `.env`, configura la URL de tu servicio en Cloud Run:

```env
VITE_API_BASE=https://tu-servicio-xxxxxx.run.app
```

**Nota:** No incluyas la barra final `/` en la URL.

## 📦 Instalación de Dependencias

```bash
npm install
```

## 🔨 Comandos Disponibles

### Desarrollo Local

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:8080`

### Build para Producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

### Preview de Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 🔍 Verificación de Configuración

Antes de ejecutar el proyecto, verifica:

1. ✅ El archivo `.env` existe y tiene todas las variables
2. ✅ Las credenciales de Firebase son correctas
3. ✅ El backend en Cloud Run está funcionando
4. ✅ Firebase Authentication está habilitado

## 🐛 Solución de Problemas Comunes

### Error: "Firebase: Error (auth/invalid-api-key)"

**Causa:** La API Key de Firebase es incorrecta.

**Solución:** Verifica que `VITE_FIREBASE_API_KEY` en `.env` sea correcta.

### Error: "Network Error" o CORS

**Causa:** El backend no está configurado correctamente o la URL es incorrecta.

**Solución:** 
- Verifica que `VITE_API_BASE` tenga la URL correcta
- Asegúrate de que el backend esté desplegado y funcionando
- Verifica la configuración de CORS en el backend

### El archivo .env no se carga

**Causa:** Vite solo carga archivos `.env` en tiempo de build.

**Solución:**
- Detén el servidor de desarrollo (`Ctrl+C`)
- Reinicia con `npm run dev`

### Error: "auth/email-already-in-use"

**Causa:** El email ya está registrado en Firebase.

**Solución:** Usa otro email o inicia sesión con el existente.

## 🔐 Seguridad

### ⚠️ IMPORTANTE

- **NUNCA** commitees el archivo `.env` al repositorio
- El archivo `.env` ya está incluido en `.gitignore`
- Las variables `VITE_*` son públicas en el código compilado
- Para información sensible, usa el backend

### Variables de Entorno Públicas vs. Privadas

✅ **Seguro para VITE_*** (frontend):
- API Keys de Firebase (tienen restricciones de dominio)
- URLs públicas
- IDs de proyecto

❌ **NO uses VITE_*** para:
- Claves secretas
- Tokens de API privados
- Credenciales de bases de datos

## 📝 Notas Adicionales

- El proyecto usa **Vite** como bundler
- **shadcn/ui** para componentes UI
- **React Router** para navegación
- **Firebase Auth** para autenticación
- **Tailwind CSS** para estilos

## 🚢 Deployment

### Firebase Hosting

```bash
# Build del proyecto
npm run build

# Deploy a Firebase Hosting
firebase deploy --only hosting
```

### Otras opciones de hosting

El build genera archivos estáticos en `dist/`, que pueden desplegarse en:
- Vercel
- Netlify
- GitHub Pages
- Google Cloud Storage + CDN

## 📞 Soporte

Si tienes problemas con:
- **Frontend:** Revisa esta guía y los logs del navegador
- **Backend:** Contacta al equipo de backend
- **Firebase:** Revisa la [documentación oficial](https://firebase.google.com/docs)

