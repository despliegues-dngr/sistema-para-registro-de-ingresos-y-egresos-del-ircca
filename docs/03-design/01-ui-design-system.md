# 🎨 SISTEMA DE DISEÑO UI - Sistema IRCCA

**Versión:** 2.0 (Consolidado)  
**Fecha:** 17-Oct-2025

> 📘 **Nota:** Este documento consolida el Design System, Requisitos de Pantallas y Guía de Íconos PWA.

---

## 1. PALETA DE COLORES

La paleta se basa en el tema gubernamental de Uruguay, asegurando identidad visual seria y profesional. Definida globalmente en `src/plugins/vuetify.ts`.

| Rol | Color | HEX | Uso Principal |
|-----|-------|-----|---------------|
| **Primary** | ■ Azul Institucional | `#1565C0` | Botones principales, headers, íconos activos |
| **Secondary** | ■ Gris Carbón | `#424242` | Texto secundario, bordes, elementos de apoyo |
| **Accent** | ■ Verde Gubernamental | `#00695C` | Elementos de énfasis, indicadores especiales |
| **Success** | ■ Verde Éxito | `#2E7D32` | Mensajes de confirmación, indicadores de éxito |
| **Warning** | ■ Naranja Advertencia | `#F57C00` | Alertas, avisos importantes no críticos |
| **Error** | ■ Rojo Error | `#C62828` | Mensajes de error, indicadores de fallo |
| **Info** | ■ Azul Información | `#1976D2` | Banners informativos, tooltips |
| **Surface** | ■ Superficie | `#FFFFFF` | Fondos de tarjetas, modales y menús |
| **Background** | ■ Fondo General | `#F5F5F5` | Color de fondo principal de la aplicación |

---

## 2. TIPOGRAFÍA

Fuente estándar: **Roboto** (legibilidad y compatibilidad Material Design).

| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| `h1` | 1.5rem | 500 (Medium) | Títulos principales de página |
| `h2` | 1.25rem | 500 (Medium) | Subtítulos y encabezados de sección |
| `body` | 1rem | 400 (Regular) | Texto de párrafo principal |
| `caption` | 0.875rem | 400 (Regular) | Texto de ayuda, leyendas, metadatos |

---

## 3. COMPONENTES BASE (VUETIFY)

> 📘 **Implementación:** Ver [`02-architecture/04-vuetify-guidelines.md`](../02-architecture/04-vuetify-guidelines.md) para detalles técnicos completos.

### Botones (`VBtn`)
- **Variant:** `flat`
- **Border-radius:** `rounded="lg"`
- **Uso:** Botones primarios color `primary`, secundarios color `secondary` o variante `text`

### Tarjetas (`VCard`)
- **Variant:** `flat`
- **Elevation:** `2`
- **Uso:** Contenedor principal para secciones de contenido (Dashboard, formularios)

### Campos de Texto (`VTextField`)
- **Variant:** `outlined`
- **Density:** `comfortable`
- **Uso:** Estándar para toda entrada de datos en formularios

### Diálogos (`VDialog`)
- **Persistent:** `true` (para formularios críticos)
- **Max-width:** `600px` (formularios), `900px` (tablas de datos)
- **Uso:** Modales de registro de ingreso/salida, confirmaciones

---

## 4. LAYOUT Y ESPACIADO

### Grid System
- **Container:** `v-container` (max-width automático según breakpoint)
- **Rows:** `v-row` con spacing estándar
- **Columns:** `v-col` con sistema de 12 columnas

### Spacing Estándar
- **Padding cards:** `py-6` (24px vertical)
- **Margin entre secciones:** `my-4` (16px vertical)
- **Gap en grid:** `dense` para formularios, estándar para dashboards

---

## 5. REQUISITOS DE PANTALLAS

### 5.1 Pantalla de Login

**Elementos:**
- Header institucional con logo/escudo
- Card centrado con formulario de login
- Campos: Cédula (8 dígitos), Contraseña
- Botón "Iniciar Sesión" (primary)
- Link "Registrarse" (text, secondary)
- Footer gubernamental

**UX:**
- Validación en tiempo real
- Mensajes de error claros
- Auto-focus en primer campo
- Enter para submit

---

### 5.2 Dashboard (Operador)

**Layout:**
- Header con saludo personalizado + fecha/hora en tiempo real
- 2 Cards de estadísticas principales:
  - Personas (Dentro / Ingresos Hoy / Salidas Hoy)
  - Vehículos (Total + desglose por tipo)
- 2 Botones de acción principales:
  - "Registrar Ingreso" (verde)
  - "Registrar Salida" (naranja)

**Interacciones:**
- Click en estadísticas → Modal con listado detallado
- Actualización reactiva tras cada registro

---

### 5.3 Dashboard (Supervisor)

**Diferencias con Operador:**
- ✅ Visualiza estadísticas (lectura)
- ✅ Acceso a generación de reportes PDF
- ❌ NO puede registrar ingresos/salidas

---

### 5.4 Dashboard (Administrador)

**Adicional a Supervisor:**
- Panel de gestión de usuarios (tabla)
- Sistema de auditoría modular:
  - Card de actividad del día
  - Tabla de eventos con filtros avanzados
  - Modal de detalles de eventos
- Acceso a configuración del sistema

---

### 5.5 Modal de Registro de Ingreso

**Secciones expandibles:**
1. **Datos Personales** (obligatorio)
   - Cédula (8 dígitos) con autocompletado
   - Nombre, Apellido

2. **Datos de Visita** (obligatorio)
   - Destino (selector)

3. **Datos de Vehículo** (opcional, expandible)
   - Tipo: Auto/Moto/Camión/Bus
   - Matrícula (formato ABC1234)

4. **Acompañantes** (opcional, expandible)
   - Múltiples acompañantes con nombre/apellido
   - Cada uno con su destino

**Validaciones:**
- Cédula: 8 dígitos numéricos
- Matrícula: Formato válido uruguayo
- Campos obligatorios marcados con *

---

### 5.6 Modal de Registro de Salida

**Funcionalidad:**
- Búsqueda por cédula
- Lista de resultados (persona encontrada + tiempo de estadía)
- Selección y confirmación de salida
- Observaciones opcionales

---

## 6. ÍCONOS PWA

### 6.1 Diseño del Ícono

**Concepto:**
- **Ícono:** `mdi-shield-account` (Material Design)
- **Fondo:** #1565C0 (Azul institucional)
- **Color ícono:** #FFFFFF (Blanco)
- **Estilo:** Minimalista, profesional, gubernamental

### 6.2 Archivos Necesarios

| Archivo | Tamaño | Propósito |
|---------|--------|-----------|
| `favicon.ico` | 32×32 px | Favicon del navegador |
| `icon-192x192.png` | 192×192 px | Ícono PWA estándar |
| `icon-512x512.png` | 512×512 px | Ícono PWA alta resolución |

### 6.3 Generación de Íconos

**Método Recomendado:** Favicon.io

1. Ir a: https://favicon.io/favicon-converter/
2. Subir ícono `mdi-shield-account` descargado de Material Design Icons
3. Configurar:
   - Background: Solid color → `#1565C0`
   - Padding: 20%
4. Generar y descargar ZIP
5. Extraer archivos a `public/`

**Ubicación final:**
```
public/
├── favicon.ico
├── icon-192x192.png
└── icon-512x512.png
```

---

## 7. ACCESIBILIDAD

### 7.1 Contraste
- ✅ Ratio mínimo 4.5:1 (texto normal)
- ✅ Ratio mínimo 3:1 (texto grande)
- ✅ Paleta institucional cumple WCAG AA

### 7.2 Navegación por Teclado
- Tab para navegar entre campos
- Enter para submit en formularios
- Esc para cerrar modales

### 7.3 Etiquetas
- Todos los campos con `<label>` asociado
- Placeholders descriptivos
- Mensajes de error claros y específicos

---

## 8. RESPONSIVE DESIGN

### Breakpoints (Vuetify)
- **xs:** <600px (Mobile)
- **sm:** 600-960px (Tablet)
- **md:** 960-1264px (Desktop pequeño)
- **lg:** 1264-1904px (Desktop)
- **xl:** >1904px (Desktop grande)

### Adaptaciones Mobile
- Dashboard: Cards apilados verticalmente
- Formularios: Campos a ancho completo
- Tablas: Scroll horizontal + cards compactas

---

**Documentos consolidados en esta versión:**
- `01-screen-requirements.md` (59 líneas)
- Parte de `02-design-system.md` (~50 líneas)
- `05-pwa-icon-guide.md` (256 líneas)

**Total:** ~365 líneas → 280 líneas (23% reducción)
