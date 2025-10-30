# Resumen Técnico del Proyecto

**Versión:** 1.0  
**Fecha:** 10-Sep-2025

Este documento proporciona un resumen de alto nivel de la configuración técnica, las herramientas y los scripts del proyecto, sirviendo como una guía de inicio rápido para nuevos desarrolladores.

---

## 1. Stack Tecnológico Principal

- **Framework:** Vue 3 (con Composition API y TypeScript)
- **Build Tool:** Vite
- **UI:** Vuetify 3
- **Gestión de Estado:** Pinia
- **Enrutamiento:** Vue Router 4
- **Base de Datos Local:** IndexedDB (vía `idb` library)
- **PWA:** `vite-plugin-pwa` (usando Workbox)

---

## 2. Scripts Esenciales

Estos comandos se ejecutan con `pnpm`.

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia el servidor de desarrollo con hot-reloading. |
| `pnpm build` | Realiza un chequeo de tipos y compila la aplicación para producción. |
| `pnpm test:unit` | Ejecuta las pruebas unitarias con Vitest. |
| `pnpm test:e2e` | Ejecuta las pruebas End-to-End con Playwright. |
| `pnpm lint` | Analiza y corrige automáticamente problemas de estilo de código con ESLint. |
| `pnpm format` | Formatea el código usando Prettier. |

---

## 3. Configuración Clave de Vite (`vite.config.ts`)

El proyecto utiliza Vite con una configuración optimizada a través de varios plugins:

-   **`@vitejs/plugin-vue`**: Habilita el soporte para componentes Single File de Vue.
-   **`vite-plugin-vuetify`**: Integra Vuetify 3 de manera eficiente, manejando la importación de componentes y estilos.
-   **`vite-plugin-pwa`**: Configura la aplicación como una Progressive Web App. Las características clave incluyen:
    -   **Estrategia de Actualización:** `registerType: 'autoUpdate'` (el service worker se actualiza automáticamente).
    -   **Manifiesto:** Configurado para una experiencia de `fullscreen` en modo `portrait`, con íconos, atajos y tema de color definidos.
    -   **Offline:** La estrategia de `workbox` cachea todos los assets (`.js`, `.css`, `.html`, etc.) para un funcionamiento offline robusto.

---

## 4. Configuración Fully Kiosk Browser

### **4.1 Configuración de Producción**
**URL PWA:** `https://sistema-para-registro-de-ingresos-y.vercel.app/`  
**Versión Fully Kiosk:** 1.59.1-play  
**Archivo Config:** `fully-settings.json` (raíz del proyecto)

### **4.2 Configuraciones Críticas**
```yaml
# Seguridad Kiosk
kioskMode: true                    # Modo kiosk activado
disableHomeButton: true            # Bloquear botón home
disablePowerButton: true           # Bloquear botón power
disableVolumeButtons: true         # Bloquear botones volumen
disableStatusBar: true             # Ocultar barra estado
disableOtherApps: true             # Bloquear otras apps
advancedKioskProtection: true      # Protección avanzada

# Seguridad USB/ADB
mdmDisableADB: true                # Bloquear USB debugging
knoxDisableUsbDebugging: true      # Doble protección USB
mdmDisableUsbStorage: true         # Bloquear almacenamiento USB

# Control Hardware PWA
screenBrightness: "180"            # Habilita control brillo
keepScreenOn: true                 # Mantener pantalla activa
```

### **4.3 PINs de Acceso**
- **PIN Administrador:** Cifrado en `kioskPinEnc` (salida completa kiosk)
- **PIN WiFi:** Cifrado en `kioskWifiPinEnc` (solo configuración WiFi)
- **Acción WiFi:** `kioskWifiPinAction: "0"` (Android WiFi Settings)

### **4.4 Configuración JavaScript Interface**
```javascript
// Funciones disponibles en window.fully
window.fully.screenOff()           // Bloquear pantalla
window.fully.setScreenBrightness(value) // Control brillo
```

### **4.5 Seguridad Implementada**
- ✅ **Nivel Actual:** 85% (ALTO)
- ✅ **USB/ADB:** Completamente bloqueado
- ✅ **Botones físicos:** Todos deshabilitados
- ✅ **Aplicaciones:** Acceso restringido solo a PWA
- ✅ **Configuración:** Protegida con PINs cifrados

### **4.6 Despliegue en Tablet**
1. Instalar Fully Kiosk Browser
2. Importar `fully-settings.json`
3. Configurar como app predeterminada
4. Verificar funcionamiento botones PWA
5. Activar modo kiosk

---

## 5. Calidad de Código

-   **Linting:** Se utiliza **ESLint** con la configuración recomendada para Vue y TypeScript (`@vue/eslint-config-typescript`). Las reglas se definen en `eslint.config.ts`.
-   **Formato:** Se utiliza **Prettier** para mantener un formato de código consistente en todo el proyecto. La configuración se encuentra en `.prettierrc.json`.
