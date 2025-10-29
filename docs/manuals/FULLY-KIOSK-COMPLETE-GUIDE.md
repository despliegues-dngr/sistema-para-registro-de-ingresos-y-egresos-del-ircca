# 📱 Guía Completa de Configuración Fully Kiosk Browser

**Versión:** 1.0  
**Fecha:** 29-Oct-2025  
**Propósito:** Configuración completa para PWA IRCCA con control de hardware

---

## 🎯 CONFIGURACIONES CRÍTICAS PARA IRCCA

### ⚡ CONFIGURACIÓN MÍNIMA REQUERIDA

Para que funcionen los botones de **bloqueo** y **brillo** en la PWA IRCCA:

#### 1. **Advanced Web Settings** ⚠️ CRÍTICO
```
Advanced Web Settings → JavaScript Interface
✅ DEBE ESTAR HABILITADO
```

#### 2. **Device Management** ⚠️ CRÍTICO
```
Device Management → Screen Brightness
📝 Cambiar de "default" a valor específico (ej: 180)
✅ Habilita control programático de brillo
```

#### 3. **Device Management** ⚠️ CRÍTICO
```
Device Management → Keep Screen On
✅ YA HABILITADO (correcto)
```

---

## 📋 ESTRUCTURA COMPLETA DE CONFIGURACIÓN

### **1. Web Content Settings**
**Propósito:** Configuración de contenido web y características HTML

- Start URL, HTML features
- File upload capabilities  
- Whitelist/blacklist de URLs
- PDF viewer settings
- Video playback settings
- Web overlay configurations
- Custom error URL handling

**Para IRCCA:** Configurar Start URL apuntando a la PWA

---

### **2. Web Browsing Settings**
**Propósito:** Comportamiento de navegación y interacción

- Pull-to-refresh functionality
- Navigation options
- Click sound feedback
- Back button behavior
- Swipe tabs functionality
- Search provider configuration
- NFC tags integration

**Para IRCCA:** Deshabilitar pull-to-refresh para evitar recargas accidentales

---

### **3. Web Zoom and Scaling**
**Propósito:** Control de zoom y escalado de páginas

- Enable/disable zooming
- Initial page scaling
- Text scaling settings
- Overview mode
- Wide viewport support
- Desktop mode emulation

**Para IRCCA:** Deshabilitar zoom para mantener interfaz consistente

---

### **4. Web Auto Reload**
**Propósito:** Recarga automática de contenido

- Reload on idle timeout
- Reload on page errors
- Reload on screen activation
- Reload on network reconnection
- Cache purging options
- Cookie management

**Para IRCCA:** Configurar reload en errores de red

---

### **5. Advanced Web Settings** ⚠️ CRÍTICO PARA IRCCA
**Propósito:** Configuraciones avanzadas de JavaScript y APIs

#### **Configuraciones Críticas:**
```
✅ JavaScript Interface: HABILITADO
   └── Permite window.fully API
   
✅ Web Automation: HABILITADO (opcional)
   └── Para testing automatizado
   
✅ QR Scanner: HABILITADO (si se usa)
   └── Para funcionalidad QR
   
⚪ Keyboard: Según necesidad
   └── Teclado virtual
   
✅ Cookies: HABILITADO
   └── Para persistencia de sesión
   
✅ Localhost: HABILITADO
   └── Para desarrollo local
   
⚪ HTTP Header: Según necesidad
   └── Headers personalizados
   
✅ SSL: HABILITADO
   └── Para HTTPS
   
⚪ Client CA: Según infraestructura
   └── Certificados cliente
   
✅ Caching: HABILITADO
   └── Para performance
   
⚪ Debugging: SOLO EN DESARROLLO
   └── Para troubleshooting
   
⚪ User Agent: Según necesidad
   └── String de user agent personalizado
```

---

### **6. Universal Launcher**
**Propósito:** Integración con otras aplicaciones

- Start other apps with kiosk protection
- Mix apps, files and web bookmarks
- Auto-start apps on Fully startup

**Para IRCCA:** Mantener solo la PWA como aplicación principal

---

### **7. Toolbars and Appearance**
**Propósito:** Personalización visual de la interfaz

- Fullscreen mode configuration
- Action bar customization
- Address bar visibility
- Progress bar settings
- Tab management
- Color scheme selection

**Para IRCCA:** Fullscreen mode habilitado, ocultar barras de navegación

---

### **8. Screensaver (PLUS)**
**Propósito:** Protector de pantalla cuando inactivo

- Video playback as screensaver
- Slideshow functionality
- Website screensaver
- Android Screen Saver integration

**Para IRCCA:** Configurar screensaver institucional si es necesario

---

### **9. Device Management** ⚠️ CRÍTICO PARA IRCCA
**Propósito:** Control de hardware del dispositivo

#### **Configuraciones Actuales y Recomendadas:**

```
✅ Keep Screen On: HABILITADO
   └── Estado: CORRECTO
   
⚪ Keep Screen On (Advanced): DESHABILITADO
   └── Recomendación: MANTENER deshabilitado
   
📝 Screen Brightness: default
   └── Cambiar a: 180 (valor específico)
   └── CRÍTICO: Habilita window.fully.setScreenBrightness()
   
⚪ Screen Orientation: Auto
   └── Recomendación: Portrait para tablets
   
⚪ Force Screen Orientation Globally: DESHABILITADO
   └── Recomendación: MANTENER deshabilitado
   
✅ Unlock Screen: HABILITADO
   └── Estado: CORRECTO
   
⚪ Unlock Swipe Screen Lock: DESHABILITADO
   └── Recomendación: MANTENER deshabilitado
   
📝 Screen Off Timer (PLUS): 0
   └── Configurar según política de seguridad
   
⚪ System Wallpaper: No configurado
   └── Opcional: Logo institucional
   
⚪ Lockscreen Wallpaper: No configurado
   └── Opcional: Logo institucional
   
⚪ Turn Screen Off on Proximity (PLUS): DESHABILITADO
   └── Recomendación: MANTENER deshabilitado
   
⚪ Launch on Boot: DESHABILITADO
   └── Recomendación: HABILITAR para producción
```

#### **Configuraciones de Audio y Red:**
```
⚪ Redirect Audio to Phone Earpiece (PLUS): DESHABILITADO
⚪ Set Volume Levels (PLUS): No configurado
⚪ Bluetooth Mode: Auto
⚪ Wifi Mode: Auto
⚪ Hotspot Mode: Auto
⚪ Reset Wifi on Internet Disconnection: DESHABILITADO
⚪ Forced Wifi SSID (PLUS): No configurado
⚪ Forced Wifi Keyphrase (PLUS): No configurado
```

---

### **10. Power Settings**
**Propósito:** Gestión de energía y programación

- Scheduled sleep/wakeup times
- Sleep on power connect/disconnect
- Wakelocks management
- Battery warning thresholds

**Para IRCCA:** Configurar según horarios operativos del instituto

---

### **11. Kiosk Mode (PLUS)** ⚠️ IMPORTANTE PARA SEGURIDAD
**Propósito:** Bloqueo de dispositivo para uso dedicado

- Device lockdown
- Prevent access to other apps
- Settings protection
- Button disabling
- PIN protection
- Single app mode

**Para IRCCA:** Habilitar en producción para seguridad

---

### **12. Motion Detection (PLUS)**
**Propósito:** Detección de movimiento para activación

- Front camera motion detection
- Microphone motion detection
- Screen activation triggers
- Screensaver stopping

**Para IRCCA:** Opcional, para ahorro de energía

---

### **13. Device Movement Detection (PLUS)**
**Propósito:** Detección de movimiento del dispositivo

- Device movement sensors
- Screen activation on movement
- Anti-theft alarm functionality

**Para IRCCA:** Habilitar anti-theft en tablets móviles

---

### **14. Remote Administration (PLUS)**
**Propósito:** Administración remota del dispositivo

- Web browser access to device
- Local network administration
- Remote configuration changes

**Para IRCCA:** Habilitar para soporte técnico remoto

---

### **15. Root Settings (PLUS)**
**Propósito:** Configuraciones avanzadas para dispositivos rooteados

- Advanced system-level controls
- Deep hardware access

**Estado:** Deshabilitado (dispositivo no rooteado)

---

### **16. Device Owner Settings (PLUS)**
**Propósito:** Configuraciones de política empresarial

- Lock task mode
- Advanced device policies
- App installation controls
- Enterprise provisioning

**Estado:** Deshabilitado (dispositivo no provisionado)

---

### **17. KNOX Settings (PLUS)**
**Propósito:** Configuraciones Samsung KNOX

- Samsung enterprise security
- KNOX container management
- Advanced Samsung features

**Aplicabilidad:** Solo dispositivos Samsung con KNOX

---

### **18. Other Settings**
**Propósito:** Configuraciones misceláneas

- Usage statistics
- Barcode scanner integration
- MQTT connectivity
- Sensor access
- App recovery mechanisms
- Settings export/import
- Permissions management
- Licensing information
- Device information display

---

## 🚀 CONFIGURACIÓN PASO A PASO PARA IRCCA

### **Fase 1: Configuraciones Críticas**

1. **Acceder a configuración:**
   - Tocar 4 veces esquina superior izquierda
   - O usar contraseña de administrador

2. **Habilitar JavaScript Interface:**
   ```
   Advanced Web Settings → JavaScript Interface → ✅ HABILITAR
   ```

3. **Configurar Screen Brightness:**
   ```
   Device Management → Screen Brightness → Cambiar de "default" a "180"
   ```

4. **Verificar Keep Screen On:**
   ```
   Device Management → Keep Screen On → ✅ Verificar habilitado
   ```

### **Fase 2: Configuraciones de Seguridad**

5. **Configurar Kiosk Mode (Producción):**
   ```
   Kiosk Mode (PLUS) → Habilitar según política de seguridad
   ```

6. **Configurar Launch on Boot:**
   ```
   Device Management → Launch on Boot → ✅ HABILITAR
   ```

### **Fase 3: Configuraciones de Red**

7. **Configurar Start URL:**
   ```
   Web Content Settings → Start URL → https://tu-pwa-ircca.com
   ```

8. **Configurar Auto Reload:**
   ```
   Web Auto Reload → Reload on network reconnect → ✅ HABILITAR
   ```

### **Fase 4: Verificación**

9. **Reiniciar Fully Kiosk**

10. **Verificar en consola:**
    ```javascript
    console.log('Fully disponible:', !!window.fully)
    console.log('setScreenBrightness:', typeof window.fully?.setScreenBrightness)
    console.log('screenOff:', typeof window.fully?.screenOff)
    ```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

### **Configuraciones Mínimas (CRÍTICAS):**
- [ ] JavaScript Interface habilitado
- [ ] Screen Brightness configurado (no "default")
- [ ] Keep Screen On habilitado
- [ ] Start URL configurado

### **Configuraciones Recomendadas:**
- [ ] Kiosk Mode habilitado (producción)
- [ ] Launch on Boot habilitado
- [ ] Auto Reload en errores de red
- [ ] Remote Administration habilitado

### **Configuraciones Opcionales:**
- [ ] Screensaver institucional
- [ ] Motion Detection para ahorro energía
- [ ] Anti-theft en tablets móviles
- [ ] Wallpapers institucionales

---

## 🔧 TROUBLESHOOTING

### **Problema: window.fully no existe**
**Causa:** JavaScript Interface deshabilitado  
**Solución:** Advanced Web Settings → JavaScript Interface → ✅ HABILITAR

### **Problema: setScreenBrightness no funciona**
**Causa:** Screen Brightness en "default"  
**Solución:** Device Management → Screen Brightness → Valor específico (ej: 180)

### **Problema: screenOff no funciona**
**Causa:** Permisos de Device Administrator  
**Solución:** Device Management → Get Device Admin → ✅ HABILITAR

### **Problema: App no inicia automáticamente**
**Causa:** Launch on Boot deshabilitado  
**Solución:** Device Management → Launch on Boot → ✅ HABILITAR

---

## 📞 SOPORTE TÉCNICO

**Documentación Oficial:** [Fully Kiosk Browser Documentation](https://www.fully-kiosk.com)

**Configuración IRCCA:**
- Email técnico: soporte@ircca.gub.uy
- Documentación interna: Ver `docs/manuals/`

---

**Última actualización:** 29-Oct-2025  
**Autor:** Sistema Synapse-DevelOS Pro v4.0  
**Revisión:** Configuración específica para PWA IRCCA
