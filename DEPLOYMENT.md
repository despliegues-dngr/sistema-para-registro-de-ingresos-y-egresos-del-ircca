# 🚀 Guía de Despliegue en Vercel - Sistema IRCCA

## 📋 **Prerrequisitos**

1. **Cuenta de Vercel**: [Crear cuenta gratuita](https://vercel.com/signup)
2. **Vercel CLI**: `npm i -g vercel`
3. **Git configurado** con el repositorio del proyecto

## 🔧 **Configuración Inicial**

### 1. **Instalación de Vercel CLI**
```bash
npm install -g vercel
```

### 2. **Login en Vercel**
```bash
vercel login
```

### 3. **Configuración del proyecto**
```bash
# En la raíz del proyecto
vercel
```

Vercel detectará automáticamente:
- ✅ **Framework**: Vite
- ✅ **Build Command**: `npm run build`
- ✅ **Output Directory**: `dist`
- ✅ **Install Command**: `npm install`

## 🌐 **Métodos de Despliegue**

### **Opción A: Despliegue desde Git (Recomendado)**

1. **Conectar repositorio**:
   - Ir a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Conectar con GitHub/GitLab/Bitbucket
   - Seleccionar repositorio `sistema-para-registro-de-ingresos-y-egresos-del-ircca`

2. **Configuración automática**:
   - Vercel detectará `vercel.json`
   - Build settings se configurarán automáticamente
   - Deploy automático en cada push a `main`

### **Opción B: Despliegue Manual via CLI**

```bash
# Preview deployment (para testing)
npm run vercel:preview

# Production deployment
npm run vercel:deploy
```

## ⚙️ **Variables de Entorno en Vercel**

### **Configuración en Dashboard**:
1. Ir a **Project Settings** → **Environment Variables**
2. Agregar las siguientes variables:

```env
# Production Environment
VITE_VERCEL_ENV=production
VITE_APP_BASE_URL=https://tu-proyecto.vercel.app
VITE_PWA_NAME=IRCCA - Sistema de Registro de Accesos
VITE_SECURE_MODE=true
VITE_ENABLE_DEVTOOLS=false
```

### **Variables automáticas de Vercel**:
Estas se configuran automáticamente:
- `VITE_VERCEL_URL`: URL del deployment
- `VITE_VERCEL_PROJECT_PRODUCTION_URL`: URL de producción
- `VITE_VERCEL_ENV`: Entorno (production/preview/development)

## 📱 **Configuración PWA Específica**

### **Headers de Seguridad**
El archivo `vercel.json` incluye headers optimizados para PWA:

```json
{
  "source": "/sw.js",
  "headers": [
    {
      "key": "Cache-Control", 
      "value": "public, max-age=0, must-revalidate"
    },
    {
      "key": "Service-Worker-Allowed",
      "value": "/"
    }
  ]
}
```

### **Manifest y Service Worker**
- ✅ **Manifest**: `/manifest.json` servido correctamente
- ✅ **Service Worker**: `/sw.js` con headers apropiados
- ✅ **Icons**: Servidos desde `/icons/` con caché optimizado

## 🔍 **Verificación Post-Despliegue**

### **1. Testing PWA**
```bash
# Lighthouse PWA audit
npx lighthouse https://tu-proyecto.vercel.app --view

# PWA installability test
# Chrome DevTools → Application → Manifest
```

### **2. Verificar Service Worker**
```bash
# En Chrome DevTools
# Application → Service Workers
# Verificar que esté registrado y activo
```

### **3. Testing Offline**
```bash
# Chrome DevTools → Network → Offline
# Recargar página - debe funcionar offline
```

## 📊 **Monitoreo y Analytics**

### **Vercel Analytics** (Opcional)
```bash
# Instalar Vercel Analytics
npm install @vercel/analytics

# En src/main.ts
import { inject } from '@vercel/analytics'
inject()
```

### **Logs de Deployment**
- Ver logs en [Vercel Dashboard](https://vercel.com/dashboard)
- Revisar **Functions** tab para errores
- **Real-time logs** durante el build

## 🚨 **Troubleshooting**

### **Build Fails**
```bash
# Local build test
npm run build

# Verificar logs
vercel logs tu-proyecto.vercel.app
```

### **PWA no se instala**
1. Verificar **HTTPS** (Vercel proporciona SSL automático)
2. Verificar **manifest.json** accesible
3. Verificar **service worker** registrado
4. Icons de 192x192 y 512x512 disponibles

### **Rutas no funcionan**
- El archivo `vercel.json` incluye rewrites para SPA
- Todas las rutas redirigen a `/index.html`

## 📱 **Instalación en Tablet**

### **Una vez desplegado**:
1. **Abrir URL** en Chrome/Edge en tablet
2. **Menu** → "Add to Home Screen"
3. **Configurar** modo kiosco si es necesario
4. **Verificar** funcionamiento offline

### **URL Final**:
```
https://sistema-ircca.vercel.app
```

## 🔄 **Updates Automáticos**

### **Service Worker Update Strategy**:
- ✅ **Auto-update**: Configurado en `vite.config.ts`
- ✅ **Background sync**: Nuevas versiones se descargan automáticamente
- ✅ **User prompt**: Usuario puede recargar para aplicar updates

### **Deploy Process**:
1. **Push a main** → Deploy automático
2. **Service Worker** detecta cambios
3. **Background download** de nueva versión
4. **User notification** para aplicar update

---

## 📞 **Soporte**

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **PWA Guide**: [https://web.dev/progressive-web-apps/](https://web.dev/progressive-web-apps/)
- **Issues**: Crear issue en el repositorio del proyecto

---

**🎯 Tu proyecto está configurado siguiendo las mejores prácticas oficiales de Vercel para PWAs con Vue/Vite.**
