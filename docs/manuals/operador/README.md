# 📖 Manual del Operador - Sistema IRCCA

## 🎯 Estructura Modular

Este manual ha sido modularizado para facilitar su mantenimiento y navegación.

### 📁 Archivos del Manual

```
operador/
├── index.html                    # 🏠 Índice principal (navegación web)
├── IMPRIMIR.html                 # 🖨️ Versión para impresión/PDF (carga todo)
├── estilos.css                   # 🎨 Estilos compartidos
├── 01-introduccion.html          # Sección 1: Introducción al Sistema
├── 02-inicio-sesion.html         # Sección 2: Inicio y Cierre de Sesión
├── 03-dashboard.html             # Sección 3: Dashboard Principal
├── 04-registro-ingreso.html      # Sección 4: Registrar Ingresos
├── 05-registro-salida.html       # Sección 5: Registrar Salidas
├── 06-consultas.html             # Sección 6: Consultas y Estadísticas
├── 07-errores.html               # Sección 7: Errores en Registros
├── 08-buenas-practicas.html      # Sección 8: Buenas Prácticas
├── 09-troubleshooting.html       # Sección 9: Solución de Problemas
├── 10-soporte.html               # Sección 10: Soporte Técnico
└── 11-privacidad-datos.html      # Sección 11: Privacidad y Protección de Datos
```

### 🚀 Cómo Usar

#### **Para Navegación Web:**
1. **Abrir el manual:** Inicie desde `index.html`
2. **Navegar:** Use los enlaces del índice para ir a cualquier sección
3. **Volver:** Cada sección tiene un enlace "← Volver al Índice"
4. **Secuencial:** Use los enlaces "➡️ Siguiente" para lectura lineal

#### **Para Imprimir/Exportar a PDF:**
1. **Abrir:** `IMPRIMIR.html` en el navegador
2. **Esperar:** El sistema carga automáticamente todas las secciones
3. **Imprimir:** Click en el botón "🖨️ Imprimir Manual Completo" o `Ctrl+P`
4. **Guardar:** Seleccionar "Guardar como PDF" en el diálogo de impresión

### ✅ Ventajas de la Modularización

- **Mantenibilidad:** Editar una sección sin afectar las demás
- **Navegación:** Acceso directo a contenido específico
- **Carga:** Archivos más pequeños y específicos
- **Reutilización:** Estilos compartidos en un solo CSS
- **Escalabilidad:** Fácil agregar/quitar secciones
- **Versionado:** Control de cambios por sección en Git
- **Impresión:** Sistema maestro que carga todo dinámicamente sin duplicar código

### 📝 Mantenimiento

**Para editar una sección:**
1. Abrir el archivo HTML correspondiente (ej: `04-registro-ingreso.html`)
2. Realizar los cambios necesarios
3. Guardar y verificar en el navegador
4. Los estilos se mantienen consistentes automáticamente

**Para agregar una nueva sección:**
1. Crear archivo `XX-nombre-seccion.html` siguiendo la estructura existente
2. Incluir header institucional y navegación
3. Agregar enlace en `index.html`
4. Actualizar enlaces "Siguiente" en secciones adyacentes

### 🔄 Backup

El archivo original monolítico se conserva como:
- `MANUAL-OPERADOR-ORIGINAL-BACKUP.html` (723 líneas)

### 📊 Estadísticas

- **Original:** 1 archivo de 723 líneas (~30KB)
- **Modular:** 12 archivos (índice + 11 secciones)
- **Promedio por sección:** ~70 líneas
- **Estilos:** 1 archivo CSS compartido (405 líneas)
- **Impresión:** 1 archivo maestro que carga dinámicamente (sin duplicar contenido)

### 🖨️ Sistema de Impresión

**Archivo:** `IMPRIMIR.html`

**Características:**
- ✅ Carga dinámicamente todas las secciones usando JavaScript
- ✅ NO duplica contenido (usa los archivos modulares existentes)
- ✅ CSS optimizado con `@page` y `@media print`
- ✅ Saltos de página automáticos entre secciones
- ✅ Botón flotante "Imprimir Manual Completo"
- ✅ Vista previa en pantalla antes de imprimir
- ✅ Compatible con "Guardar como PDF" del navegador

**Cómo funciona:**
1. JavaScript carga cada módulo con `fetch()`
2. Extrae solo el contenido (sin navegación/headers duplicados)
3. Organiza todo en un solo documento
4. Aplica estilos de impresión profesionales
5. Permite Ctrl+P → PDF completo

### 🎨 Diseño

Todos los archivos comparten:
- Header institucional con logo IRCCA
- Paleta de colores gubernamental (azul #1565C0)
- Tipografía Roboto
- Cajas de información (info, advertencia, éxito, crítico)
- Pasos numerados con diseño circular
- Tablas responsivas
- Optimización para impresión

---

**Versión:** 1.0  
**Fecha de modularización:** Octubre 2025  
**Sistema:** Control de Accesos del IRCCA
