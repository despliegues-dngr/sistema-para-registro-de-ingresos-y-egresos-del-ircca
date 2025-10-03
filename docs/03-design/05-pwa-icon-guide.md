# Guía de Íconos PWA - Sistema IRCCA

**Fecha:** 03-Oct-2025  
**Objetivo:** Generar íconos para Progressive Web App usando ícono Material Design existente

---

## 🎨 Diseño del Ícono

### **Concepto:**
- **Ícono:** `mdi-shield-account` de Material Design (mismo del login)
- **Color de fondo:** #1565C0 (Azul institucional IRCCA)
- **Color del ícono:** #FFFFFF (Blanco)
- **Estilo:** Minimalista, profesional, gubernamental

---

## 📐 Archivos Necesarios

La PWA necesita estos archivos:

| Archivo | Tamaño | Propósito |
|---------|--------|-----------|
| `favicon.ico` | 32×32 px | Favicon del navegador |
| `icon-192x192.png` | 192×192 px | Ícono PWA estándar |
| `icon-512x512.png` | 512×512 px | Ícono PWA alta resolución |

---

## 🚀 MÉTODO SIMPLE: Descargar desde Material Design Icons (Recomendado)

### **Paso 1: Ir a Material Design Icons**
```
URL: https://pictogrammers.com/library/mdi/icon/shield-account/
```

### **Paso 2: Descargar el Ícono**
1. En la página del ícono `shield-account`
2. Click en botón **"Download"**
3. Seleccionar **"PNG"**
4. Elegir tamaño: **512px** (máximo disponible)
5. Guardar como: `shield-white.png`

### **Paso 3: Usar Generador de Favicon**

**Opción A: Favicon.io (MÁS FÁCIL)**
```
URL: https://favicon.io/favicon-converter/
```

1. Click "Select image"
2. Subir `shield-white.png` (descargado en paso 2)
3. Ajustar configuración:
   - Background: Solid color → `#1565C0`
   - Padding: 20%
4. Click "Generate"
5. Descargar ZIP

**Opción B: Real Favicon Generator**
```
URL: https://realfavicongenerator.net/
```

1. Subir `shield-white.png`
2. Configurar:
   - iOS: Background `#1565C0`
   - Android: Theme color `#1565C0`
3. Generar y descargar

### **Paso 4: Extraer Archivos**
```
Del ZIP descargado:
  ├── favicon.ico → copiar a /public/
  ├── android-icon-192x192.png → renombrar y copiar a /public/icons/icon-192x192.png
  └── android-icon-512x512.png → renombrar y copiar a /public/icons/icon-512x512.png
```

**IMPORTANTE:** Si el generador no tiene 512px, usa el 192px y escálalo con una herramienta online:
```
URL: https://www.simpleimageresizer.com/
- Subir icon-192x192.png
- Cambiar tamaño a 512×512
- Mantener aspecto
- Guardar como icon-512x512.png
```

---

## 🖼️ MÉTODO 2: Usar Figma (Diseñadores)

### **Paso 1: Importar a Figma**
1. Crear nuevo archivo en Figma
2. Importar `shield-source.svg`

### **Paso 2: Crear Artboards**
```
Frame 1: 32×32 px (favicon)
Frame 2: 192×192 px (icon-192)
Frame 3: 512×512 px (icon-512)
```

### **Paso 3: Ajustar Tamaños**
- Copiar el ícono a cada frame
- Ajustar tamaño manteniendo proporciones
- Centrar en cada frame

### **Paso 4: Exportar**
```
Formato: PNG
Escala: 1x
Nombre: icon-192x192.png, icon-512x512.png
Para favicon: Exportar como ICO (usar convertidor online)
```

---

## 🔧 MÉTODO 3: Línea de Comandos (Avanzado)

### **Requisitos:**
- Node.js instalado
- `sharp` package

### **Instalación:**
```bash
npm install -g sharp-cli
```

### **Comandos:**
```bash
# Convertir SVG a PNG de diferentes tamaños
sharp -i public/icons/shield-source.svg -o public/icons/icon-192x192.png --resize 192
sharp -i public/icons/shield-source.svg -o public/icons/icon-512x512.png --resize 512
sharp -i public/icons/shield-source.svg -o public/favicon-32.png --resize 32

# Convertir PNG a ICO (usar tool online o ImageMagick)
convert public/favicon-32.png public/favicon.ico
```

---

## ✅ Verificación Post-Generación

### **1. Verificar Archivos Creados:**
```
/public/
  ├── favicon.ico ✅
  └── icons/
      ├── icon-192x192.png ✅
      └── icon-512x512.png ✅
```

### **2. Verificar Tamaños:**
- **192×192:** Debe ser cuadrado perfecto
- **512×512:** Debe ser cuadrado perfecto
- **favicon.ico:** 32×32 o múltiples tamaños

### **3. Verificar Calidad Visual:**
- [ ] Ícono centrado
- [ ] Sin píxeles borrosos
- [ ] Colores correctos (#1565C0 fondo, #FFFFFF ícono)
- [ ] Fondo no transparente (necesario para Android)

### **4. Probar en Navegador:**
```bash
npm run dev
```

Abrir DevTools:
1. Application tab
2. Manifest
3. Verificar que los íconos se muestran correctamente

### **5. Probar Instalación PWA:**
1. Abrir en Chrome/Edge
2. Click en ícono de instalación (barra de direcciones)
3. Verificar que el ícono se vea bien en:
   - Instalación
   - Pantalla de inicio (móvil)
   - Ventana de aplicación

---

## 🎯 Resultado Final

Después de implementar los íconos:

### **En Navegador:**
```
Pestaña mostrará:
  - Favicon: Escudo IRCCA (32×32)
  - Título: "Sistema de Control de Accesos del IRCCA"
```

### **Al Instalar PWA:**
```
Pantalla de inicio mostrará:
  - Ícono: Escudo IRCCA (192×192 o 512×512)
  - Nombre: "Sistema de Control de Accesos del IRCCA"
  - Short name: "IRCCA Control" (en espacios reducidos)
```

### **En Splash Screen (Android):**
```
Al abrir app:
  - Fondo: #FFFFFF
  - Ícono: Escudo IRCCA (512×512)
  - Nombre: "Sistema de Control de Accesos del IRCCA"
```

---

## 📱 Pruebas Recomendadas

### **Desktop:**
- [ ] Chrome (Windows)
- [ ] Edge (Windows)
- [ ] Firefox (Windows)

### **Mobile:**
- [ ] Chrome (Android)
- [ ] Samsung Internet (Android)
- [ ] Safari (iOS) - si es posible

### **Verificar:**
- [ ] Ícono visible en pestaña
- [ ] Instalación PWA funciona
- [ ] Ícono correcto en pantalla de inicio
- [ ] Splash screen se ve bien
- [ ] No hay errores en consola

---

## 🔄 Actualización Futura

Si necesitas cambiar el ícono en el futuro:

1. Editar `/public/icons/shield-source.svg`
2. Regenerar PNG con cualquier método
3. Reemplazar archivos en `/public/` y `/public/icons/`
4. Limpiar cache del navegador
5. Reinstalar PWA en dispositivos de prueba

---

## 📚 Referencias

- **Real Favicon Generator:** https://realfavicongenerator.net/
- **Material Design Icons:** https://materialdesignicons.com/
- **PWA Icon Guidelines:** https://web.dev/add-manifest/
- **Android Icon Design:** https://developer.android.com/develop/ui/views/launch/icon_design_adaptive

---

**Preparado por:** Equipo de Desarrollo IRCCA  
**Última actualización:** 03-Oct-2025
