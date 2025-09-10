# IRCCA Design System

**Versión:** 1.0  
**Fecha:** 10-Sep-2025

Este documento sirve como la guía de referencia central para todos los elementos de la interfaz de usuario (UI) del Sistema de Registro IRCCA. Su propósito es asegurar la consistencia, coherencia y calidad en todas las pantallas y componentes de la aplicación.

---

## 1. Paleta de Colores

La paleta de colores se basa en el tema gubernamental de Uruguay, asegurando una identidad visual seria y profesional. Estos colores están definidos globalmente en el tema de Vuetify (`src/plugins/vuetify.ts`).

| Rol         | Color                                       | HEX       | Uso Principal                               |
|-------------|---------------------------------------------|-----------|---------------------------------------------|
| **Primary** | <span style="color:#1565C0">■</span> Azul Institucional | `#1565C0` | Botones principales, headers, íconos activos. |
| **Secondary** | <span style="color:#424242">■</span> Gris Carbón      | `#424242` | Texto secundario, bordes, elementos de apoyo. |
| **Accent**    | <span style="color:#00695C">■</span> Verde Gubernamental | `#00695C` | Elementos de énfasis, indicadores especiales. |
| **Success**   | <span style="color:#2E7D32">■</span> Verde Éxito      | `#2E7D32` | Mensajes de confirmación, indicadores de éxito. |
| **Warning**   | <span style="color:#F57C00">■</span> Naranja Advertencia | `#F57C00` | Alertas, avisos importantes no críticos.     |
| **Error**     | <span style="color:#C62828">■</span> Rojo Error        | `#C62828` | Mensajes de error, indicadores de fallo.      |
| **Info**      | <span style="color:#1976D2">■</span> Azul Información   | `#1976D2` | Banners informativos, tooltips.             |
| **Surface**   | <span style="color:#FFFFFF">■</span> Superficie       | `#FFFFFF` | Fondos de tarjetas, modales y menús.        |
| **Background**| <span style="color:#F5F5F5">■</span> Fondo General    | `#F5F5F5` | Color de fondo principal de la aplicación.    |

---

## 2. Tipografía

La tipografía estándar para toda la aplicación es **Roboto**, garantizando legibilidad y una apariencia moderna compatible con Material Design.

| Elemento  | Tamaño de Fuente | Peso (Weight) | Uso                               |
|-----------|------------------|---------------|-----------------------------------|
| `h1`      | 1.5rem           | 500 (Medium)  | Títulos principales de página.    |
| `h2`      | 1.25rem          | 500 (Medium)  | Subtítulos y encabezados de sección. |
| `body`    | 1rem             | 400 (Regular) | Texto de párrafo principal.       |
| `caption` | 0.875rem         | 400 (Regular) | Texto de ayuda, leyendas, metadatos. |

---

## 3. Componentes Base

Para mantener la consistencia, los componentes de Vuetify se utilizan con los siguientes estilos por defecto, definidos globalmente en `src/plugins/vuetify.ts`.

### Botones (`VBtn`)
- **Variant:** `flat`
- **Border-radius:** `rounded="lg"`
- **Uso:** Los botones primarios deben usar el color `primary`. Las acciones secundarias pueden usar el color `secondary` o la variante `text`.

### Tarjetas (`VCard`)
- **Variant:** `flat`
- **Elevation:** `2`
- **Uso:** Contenedor principal para secciones de contenido, como en el Dashboard o formularios.

### Campos de Texto (`VTextField`)
- **Variant:** `outlined`
- **Density:** `comfortable`
- **Uso:** Estándar para toda la entrada de datos en formularios.
