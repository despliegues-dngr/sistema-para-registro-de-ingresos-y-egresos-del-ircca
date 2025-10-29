# 📱 Configuración Fully Kiosk Browser - Tablet IRCCA

**Versión Fully Kiosk:** 1.59.1-play (Gratuita)  
**Fecha configuración:** 29-Oct-2025  
**Tablet:** Puesto de Vigilancia IRCCA  
**PWA:** https://sistema-para-registro-de-ingresos-y.vercel.app

---

## 🎯 Objetivo de Configuración

Configurar tablet en **modo kiosk** para que:
- ✅ **Operadores:** Solo accedan a la PWA (sin salir a Android)
- ✅ **Supervisor/Admin:** Puedan salir del kiosk con PIN
- ✅ **PWA:** Funcione offline-first con máxima seguridad

---

## 📋 Índice de Secciones Configuradas

- [x] **Web Content Settings** - Configurado ✅
- [x] **Toolbars and Appearance** - Configurado ✅
- [x] **Device Management** - Configurado ✅
- [x] **Advanced Web Settings** - Configurado ✅
- [ ] **Web Browsing Settings** - No requiere cambios
- [ ] **Web Zoom and Scaling** - No requiere cambios
- [ ] **Web Auto Reload** - No requiere cambios
- [ ] **Power Settings** - No requiere cambios
- [ ] **Kiosk Mode (PLUS)** - Requiere licencia €15 🔒
- [ ] **Other Settings** - Pendiente (export config)

---

## 1️⃣ Web Content Settings ✅

### **Cambios Aplicados:**

```yaml
# URL Principal
Start URL: https://sistema-para-registro-de-ingresos-y.vercel.app
  ↳ URL base (sin /login) para navegación automática

# Seguridad - Whitelist
URL Whitelist:
  - https://sistema-para-registro-de-ingresos-y.vercel.app/*
  - https://*.vercel.app/*
  ↳ Solo permite acceso a dominios de la PWA

# Comportamiento
Redirect Blocked to Start URL: ENABLED
  ↳ URLs bloqueadas redirigen a PWA (no muestran error)

Autoplay Videos: DISABLED
  ↳ Ahorra batería, PWA no usa videos
```

### **Configuraciones Mantenidas (Correctas):**

```yaml
# Autenticación HTTP
Username: (vacío) - PWA maneja auth internamente
Password: (vacío) - PWA maneja auth internamente

# Multimedia
Enable Fullscreen Videos: ENABLED
Autoplay Audio: DISABLED

# Permisos (Todos DISABLED)
Enable File Upload: DISABLED
Enable Camera Capture Upload: DISABLED
Enable Video Capture Upload: DISABLED
Enable Audio Record Upload: DISABLED
Enable Webcam Access: DISABLED
Enable Microphone Access: DISABLED
Enable Geolocation Access: DISABLED

# Navegación
Enable JavaScript Alerts: ENABLED (necesario para UX)
Enable Popups: DISABLED (PWA es SPA)
Open Other URL Schemes: DISABLED (evita salir a otras apps)
```

### **Justificación Técnica:**

**Whitelist configurada:**
- Bloquea acceso a sitios externos
- Operadores no pueden navegar fuera de la PWA
- Mejora seguridad del sistema

**Redirect Blocked:**
- Mejor UX que mostrar error
- Mantiene operador dentro de la PWA

---

## 2️⃣ Toolbars and Appearance ✅

### **Cambios Aplicados:**

```yaml
# Todas las barras DISABLED (configuración correcta por defecto)
Show Navigation Bar: DISABLED ✅
Show Status Bar: DISABLED ✅
Show Action Bar: DISABLED ✅
Show Tabs: DISABLED ✅
Show Address Bar: DISABLED ✅
Show Progress Bar: DISABLED ✅
```

### **Justificación:**

**Modo kiosk limpio:**
- Sin barras de navegación Android
- Sin barra de direcciones (operadores no ven URL)
- Sin pestañas (PWA es single-page)
- Pantalla completa dedicada a la PWA

---

## 3️⃣ Device Management ✅

### **Cambios Aplicados:**

```yaml
# Brillo de pantalla
Screen Brightness: 180
  ↳ Valor fijo 70% para legibilidad constante

# Orientación de pantalla
Screen Orientation: Landscape (o Portrait según montaje)
  ↳ Evita rotaciones accidentales
```

### **Configuraciones Mantenidas (Correctas):**

```yaml
Keep Screen On: ENABLED ✅
  ↳ Pantalla siempre encendida (puesto 24/7)

Launch on Boot: ENABLED ✅
  ↳ Fully arranca automáticamente al reiniciar tablet

Unlock Screen: ENABLED ✅
  ↳ Fully se muestra sobre lockscreen

Get Device Admin: ENABLED ✅
  ↳ Permisos de administrador para kiosk mode
```

---

## 4️⃣ Advanced Web Settings ✅

### **Cambios Aplicados:**

```yaml
Enable Webview Contents Debugging: DISABLED
  ↳ Seguridad: Evita debugging remoto en producción
```

### **Configuraciones Mantenidas (Correctas):**

```yaml
# Interacción del usuario
Enable Text Input: ENABLED ✅
Enable User Interactions: ENABLED ✅
Enable Long Tap: ENABLED ✅
Enable Dragging: ENABLED ✅
Enable Scrolling: ENABLED ✅

# Headers HTTP
Add Referer Header: ENABLED ✅

# Reproducción multimedia
Resume Playback when Getting to Foreground: ENABLED ✅
Keep Screen On while in Fullscreen Mode: ENABLED ✅

# Seguridad
Enable JavaScript Interface: DISABLED ✅
Ignore SSL Errors: DISABLED ✅
Enable Safe Browsing: DISABLED ✅
```

### **Justificación Técnica:**

**Interacción habilitada:**
- Operadores necesitan tocar, escribir y navegar en la PWA
- Long tap para seleccionar texto en campos

**Debugging desactivado:**
- Evita acceso remoto no autorizado
- Configuración de producción segura

---

## 🔐 Notas de Seguridad

### **Nivel Actual: Básico**
- ✅ Whitelist configurada
- ✅ Popups bloqueados
- ✅ Permisos multimedia desactivados
- ⚠️ **Falta Kiosk Mode con PIN** (requiere PLUS)

### **Para Seguridad Completa:**
- 🔒 Comprar licencia PLUS (€15)
- 🔒 Activar Kiosk Mode con PIN
- 🔒 Bloquear botones de sistema (HOME, BACK, RECENT)

---

## 📊 Estado de Configuración

| Sección | Estado | Prioridad | Requiere PLUS |
|---------|--------|-----------|---------------|
| Web Content Settings | ✅ Completo | 🔴 Alta | No |
| Toolbars and Appearance | ✅ Completo | 🔴 Alta | No |
| Device Management | ✅ Completo | 🟡 Media | No |
| Advanced Web Settings | ✅ Completo | 🟡 Media | No |
| Web Browsing Settings | ✅ OK (sin cambios) | 🟢 Baja | No |
| Web Zoom and Scaling | ✅ OK (sin cambios) | 🟢 Baja | No |
| Web Auto Reload | ✅ OK (sin cambios) | 🟢 Baja | No |
| Power Settings | ✅ OK (sin cambios) | 🟢 Baja | No |
| **Kiosk Mode** | ⏳ **PENDIENTE** | 🔴 **CRÍTICA** | **Sí (€15)** |

---

## 🎯 Próximos Pasos

### **✅ CONFIGURACIÓN BÁSICA COMPLETA**

Has completado todas las secciones críticas con la versión gratuita:
- ✅ Web Content Settings (whitelist, seguridad)
- ✅ Toolbars and Appearance (pantalla completa)
- ✅ Device Management (brillo, orientación, boot)
- ✅ Advanced Web Settings (debugging off)

### **🔴 DECISIÓN CRÍTICA: Licencia PLUS**

**Estado actual (versión gratuita):**
- ✅ PWA funciona en pantalla completa
- ✅ Configuración básica de seguridad
- ❌ **Operadores PUEDEN salir del kiosk** (swipe izquierda → Exit Fully)
- ❌ No hay PIN de protección real

**Con licencia PLUS (€15):**
- ✅ **Kiosk Mode con PIN** (operadores NO pueden salir)
- ✅ Supervisor/Admin salen con PIN
- ✅ Remote Administration (soporte remoto)
- ✅ Motion Detection (ahorro energía)

### **Recomendación:**

**COMPRAR PLUS** - €15 es inversión mínima para cumplir tu requisito principal: "operadores solo usan PWA, supervisor/admin acceden a toda la tablet"

### **Pasos Finales:**

1. **AHORA:** Exportar configuración actual (Other Settings → Export)
2. **DECISIÓN:** ¿Comprar PLUS?
3. **Si SÍ:** Configurar Kiosk Mode + PIN
4. **Si NO:** Sistema funciona pero sin bloqueo real

---

## 📞 Contacto y Soporte

**Responsable:** Mario BERNI  
**Proyecto:** Sistema IRCCA  
**Documentación:** `docs/manuals/TABLET-FULLY-KIOSK-CONFIG.md`

---

**Última actualización:** 29-Oct-2025  
**Versión documento:** 1.0
