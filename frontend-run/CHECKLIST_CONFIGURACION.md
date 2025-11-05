# ✅ Checklist de Configuración del Frontend

Usa este checklist para asegurarte de que todo está configurado correctamente.

---

## 📋 Antes de Empezar

- [ ] Tienes acceso a Firebase Console
- [ ] Tienes acceso a Google Cloud Console
- [ ] El backend está desplegado en Cloud Run
- [ ] Node.js está instalado en tu máquina
- [ ] npm está instalado en tu máquina

---

## 🔧 Configuración Inicial

### Paso 1: Variables de Entorno
- [ ] Abrí el archivo `.env`
- [ ] Configuré `VITE_API_BASE` con la URL real del backend
- [ ] Configuré `VITE_FIREBASE_API_KEY` con mi API Key de Firebase
- [ ] Configuré `VITE_FIREBASE_AUTH_DOMAIN` con mi dominio de Firebase
- [ ] Configuré `VITE_FIREBASE_PROJECT_ID` con mi ID de proyecto
- [ ] Configuré `VITE_FIREBASE_APP_ID` con mi App ID de Firebase
- [ ] Guardé el archivo `.env`

### Paso 2: Dependencias
- [ ] Ejecuté `npm install` sin errores
- [ ] Se creó la carpeta `node_modules`

### Paso 3: Verificación
- [ ] Ejecuté `npm run check-config`
- [ ] El script pasó sin errores ✅
- [ ] No hay warnings de "PLACEHOLDER"

---

## 🔥 Configuración de Firebase

- [ ] Firebase Authentication está habilitado en mi proyecto
- [ ] El método "Email/Password" está habilitado
- [ ] Los dominios autorizados incluyen:
  - [ ] `localhost` (para desarrollo)
  - [ ] Mi dominio de producción (si aplica)

---

## ☁️ Configuración de GCP

- [ ] Mi servicio en Cloud Run está desplegado
- [ ] La URL del servicio es accesible
- [ ] CORS está configurado en el backend para aceptar:
  - [ ] `http://localhost:8080` (desarrollo)
  - [ ] Mi dominio de producción (si aplica)
- [ ] El backend acepta tokens de Firebase en el header `Authorization`

---

## 🚀 Primer Inicio

- [ ] Ejecuté `npm run dev`
- [ ] El servidor inició sin errores
- [ ] Vi el mensaje: "Local: http://localhost:8080"
- [ ] Abrí `http://localhost:8080` en el navegador
- [ ] La página de login se cargó correctamente

---

## 👤 Pruebas de Autenticación

### Registro
- [ ] Fui a `/register`
- [ ] Pude ingresar un email y contraseña
- [ ] El botón "Crear cuenta" funcionó
- [ ] Fui redirigido al `/dashboard` después del registro
- [ ] No hubo errores en la consola del navegador

### Login
- [ ] Cerré sesión
- [ ] Fui a `/login`
- [ ] Pude ingresar mis credenciales
- [ ] El botón "Iniciar sesión" funcionó
- [ ] Fui redirigido al `/dashboard`
- [ ] No hubo errores en la consola del navegador

---

## 📊 Pruebas de Funcionalidad

### Dashboard
- [ ] Puedo ver el header con mi email
- [ ] Puedo ver el botón "Cerrar sesión"
- [ ] Veo la sección "Mi Perfil"
- [ ] Veo la sección "Subir Factura (PDF)"
- [ ] Veo la sección "Mis Facturas"

### Perfil
- [ ] Puedo ingresar RUC
- [ ] Puedo ingresar Razón Social
- [ ] Puedo ingresar Dirección
- [ ] El botón "Guardar perfil" funciona
- [ ] Veo la notificación de éxito

### Subir Factura
- [ ] Puedo seleccionar un archivo PDF
- [ ] El sistema rechaza archivos que no son PDF
- [ ] El botón "Subir factura" funciona
- [ ] Veo la notificación de éxito con Invoice ID
- [ ] La factura aparece en la tabla

### Tabla de Facturas
- [ ] Puedo ver las facturas subidas
- [ ] Veo el Invoice ID
- [ ] Veo el Estado
- [ ] Veo la Ruta de almacenamiento
- [ ] El botón "Copiar ruta" funciona

---

## 🔐 Pruebas de Seguridad

- [ ] Si cierro sesión y intento acceder a `/dashboard`, soy redirigido a `/login`
- [ ] Si no estoy autenticado, no puedo ver páginas protegidas
- [ ] El token se guarda correctamente en localStorage
- [ ] Al cerrar sesión, el token se elimina de localStorage

---

## 🐛 Verificación de Errores

### Consola del Navegador
- [ ] No hay errores en rojo en la consola
- [ ] No hay warnings críticos
- [ ] Las peticiones al backend responden correctamente

### Consola del Terminal
- [ ] No hay errores al ejecutar `npm run dev`
- [ ] No hay warnings críticos de compilación
- [ ] El hot reload funciona al editar archivos

---

## 📱 Pruebas Adicionales (Opcional)

- [ ] La aplicación funciona en Chrome
- [ ] La aplicación funciona en Firefox
- [ ] La aplicación funciona en Edge
- [ ] La interfaz es responsive en móvil
- [ ] Los formularios validan correctamente

---

## 🚢 Preparación para Producción (Opcional)

- [ ] Ejecuté `npm run build` sin errores
- [ ] Se creó la carpeta `dist/`
- [ ] Ejecuté `npm run preview` para probar el build
- [ ] El build funciona correctamente
- [ ] Configuré las variables de entorno para producción
- [ ] El dominio de producción está autorizado en Firebase

---

## 📝 Comandos de Verificación

Si algo no funciona, usa estos comandos para diagnosticar:

```bash
# Verificar configuración
npm run check-config

# Ver errores de linting
npm run lint

# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Ver logs detallados
npm run dev --verbose
```

---

## 🆘 Solución Rápida de Problemas

| Problema | Solución Rápida |
|----------|----------------|
| "Firebase: Error (auth/invalid-api-key)" | Verifica `VITE_FIREBASE_API_KEY` en `.env` |
| "Network Error" | Verifica que el backend esté funcionando y CORS configurado |
| Cambios en `.env` no se aplican | Detén el servidor (`Ctrl+C`) y reinicia |
| "Module not found" | Ejecuta `npm install` nuevamente |
| Puerto 8080 en uso | Cambia el puerto en `vite.config.ts` |

---

## ✅ Checklist Completo

Si marcaste **TODAS** las casillas anteriores:

🎉 **¡Felicitaciones! Tu frontend está completamente configurado y funcionando.**

Puedes proceder a:
- [ ] Integrar con el backend completo
- [ ] Agregar más funcionalidades
- [ ] Desplegar en producción
- [ ] Realizar pruebas de usuario

---

## 📚 Recursos Adicionales

Si necesitas más ayuda:
- **`INICIO_RAPIDO.md`** - Para empezar rápidamente
- **`DIAGNOSTICO_Y_SOLUCIONES.md`** - Para problemas específicos
- **`CONFIGURACION.md`** - Para configuración detallada
- **`RESUMEN_REVISION.md`** - Para análisis completo

---

**Última actualización:** 3 de noviembre de 2025

**Estado del proyecto:** ✅ Configurado y listo para desarrollo

