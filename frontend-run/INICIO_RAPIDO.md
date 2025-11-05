# 🚀 Inicio Rápido - Frontend

Esta es una guía simplificada para poner en marcha el frontend en menos de 5 minutos.

---

## ⚡ Pasos Rápidos

### 1️⃣ **Configurar Variables de Entorno**

Edita el archivo `.env` (ya fue creado para ti):

```bash
notepad .env
```

Reemplaza estos valores con tus credenciales reales:

```env
VITE_API_BASE=https://tu-servicio-real.run.app
VITE_FIREBASE_API_KEY=tu-api-key-real
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_APP_ID=tu-app-id-real
```

**¿Dónde obtengo estas credenciales?**
- **Firebase:** [console.firebase.google.com](https://console.firebase.google.com/) → Tu proyecto → ⚙️ Configuración → Tus aplicaciones
- **Backend URL:** [console.cloud.google.com](https://console.cloud.google.com/) → Cloud Run → Tu servicio → Copiar URL

---

### 2️⃣ **Verificar la Configuración**

```bash
npm run check-config
```

✅ Si todo está bien, verás: "¡Configuración completa!"  
⚠️ Si hay problemas, el script te dirá exactamente qué falta

---

### 3️⃣ **Iniciar el Servidor**

```bash
npm run dev
```

El servidor se iniciará en: **http://localhost:8080**

---

### 4️⃣ **Probar la Aplicación**

1. Abre: `http://localhost:8080`
2. Crea una cuenta en `/register`
3. Inicia sesión
4. ¡Listo! Deberías ver el dashboard

---

## 🆘 Problemas Comunes

### "Firebase: Error (auth/invalid-api-key)"
→ Tu API Key de Firebase es incorrecta, revisa el `.env`

### "Network Error"
→ Verifica que tu backend en Cloud Run esté funcionando

### Los cambios en .env no se aplican
→ Detén el servidor (`Ctrl+C`) y reinicia con `npm run dev`

---

## 📚 Más Documentación

- **`RESUMEN_REVISION.md`** - Resumen de la revisión completa
- **`DIAGNOSTICO_Y_SOLUCIONES.md`** - Soluciones detalladas
- **`CONFIGURACION.md`** - Guía completa paso a paso

---

## 📝 Comandos Útiles

```bash
npm run dev           # Iniciar desarrollo
npm run build         # Build para producción
npm run check-config  # Verificar configuración
npm run lint          # Ejecutar linter
```

---

## ✅ Checklist Mínimo

- [ ] `.env` configurado con credenciales reales
- [ ] `npm run check-config` pasa sin errores
- [ ] `npm run dev` inicia correctamente
- [ ] Puedo registrarme e iniciar sesión

---

**¡Eso es todo!** Si sigues estos pasos, tu frontend estará funcionando en minutos. 🎉

