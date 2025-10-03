# 🎨 FRONTEND IRCCA - GUÍA CONCEPTUAL DE PANTALLAS Y UX

**Versión:** 3.0.0 (Refactorizado)
**Fecha:** 10-Sep-2025
**Propósito:** Este documento sirve como una guía conceptual de alto nivel para los requisitos de la interfaz de usuario. **No contiene código de implementación.** La implementación real y los detalles de estilo se definen en el código fuente y en el `design_system.md`.

---

## 1. Flujo de Usuario

El flujo principal para un operador del sistema es el siguiente:

```
INICIO → LOGIN → DASHBOARD → [REGISTRAR INGRESO/SALIDA] → DASHBOARD
```

**Casos de Uso Principales:**

1.  **Inicio de Turno:** El operador se autentica.
2.  **Registro de Visitante:** El operador registra un ingreso o una salida a través de acciones en el Dashboard.
3.  **Consulta:** El operador visualiza quién está actualmente en el predio.
4.  **Fin de Turno:** El operador cierra su sesión.

_(Nota: El flujo detallado con un diagrama se encuentra en `design/docs/user_flow.md`)_

---

## 2. Tema Gubernamental IRCCA

La aplicación implementa un sistema de diseño basado en **Vuetify 3** siguiendo estrictamente las mejores prácticas oficiales.

### Implementación Técnica

- **Sistema de Temas:** Configurado en `src/plugins/vuetify.ts`
- **Background Automático:** `#F5F5F5` aplicado nativamente por Vuetify
- **Clases de Utilidad:** `bg-primary`, `text-*`, `d-flex`, etc.
- **CSS Variables:** `var(--v-theme-primary)` para colores dinámicos

### Paleta de Colores Institucional

- **Primary:** `#1565C0` (Azul gubernamental Uruguay)
- **Secondary:** `#424242` (Gris neutro)
- **Background:** `#F5F5F5` (Fondo institucional)
- **Surface:** `#FFFFFF` (Superficies de tarjetas)
- **Success/Error/Warning:** Colores de estado Material Design

### Tipografía y Layout

- **Fuente:** Roboto (nativa de Vuetify)
- **Grid System:** `v-container`, `v-row`, `v-col` oficial
- **Spacing:** Sistema de espaciado Vuetify (`py-6`, `mx-auto`)

_(Implementación detallada en: `docs/02-architecture/04-vuetify-guidelines.md`)_

---

## 3. Requisitos de Pantallas del Sistema

### 3.1. Pantalla de Login

- **Diseño:** Una vista centrada vertical y horizontalmente.
- **Contenedor:** Una tarjeta (`v-card`) con elevación para destacar sobre el fondo.
- **Header:** Un cabecero prominente usando el color `primary` de la paleta, que debe incluir un ícono representativo de seguridad (`mdi-shield-account`), el nombre del sistema ("Sistema de Control de Accesos del IRCCA") y el nombre completo del instituto.
- **Formulario:**
  - Campo de texto para "Usuario".
  - Campo de texto para "Contraseña" (tipo password).
  - Botón de acción principal para "Ingresar".
- **Footer:** Un pie de tarjeta con texto institucional ("@2025, Dirección Nacional Guardia Republicana").

### 3.2. Dashboard Principal

- **Header de Bienvenida:** Una sección superior destacada que saluda al usuario logueado y muestra la fecha y hora actual en tiempo real.
- **Tarjetas de Estadísticas (`StatsCard`):** Un conjunto de 4 tarjetas que deben mostrar las siguientes métricas clave en tiempo real:
  - Personas Dentro
  - Vehículos Dentro
  - Ingresos Hoy
  - Salidas Hoy
- **Acciones Rápidas:** Dos botones grandes y claros para las acciones más comunes: "Registrar Ingreso" y "Registrar Salida".
- **Lista Rápida:** Una lista o tabla que muestre las últimas 5-10 personas que ingresaron, con su nombre, cédula y hora de ingreso. Debe incluir un botón "Ver todas" que redirija a la vista detallada.

### 3.3. Modal de Registro de Ingreso

- **Contenedor:** Debe presentarse en un modal (`v-dialog`) que se superponga al Dashboard.
- **Secciones del Formulario:**
  - **Datos Personales:** Cédula, Nombre, Apellido.
  - **Datos de Visita:** Destino (selector), Observaciones (campo de texto opcional, max 100 caracteres).
  - **Datos de Vehículo (Opcional):** Una sección expandible para no sobrecargar la UI, que contendrá campos para Tipo de vehículo (selector) y Matrícula.
  - **Acompañantes (Opcional):** Sección expandible para registrar hasta 20 acompañantes, cada uno con Cédula, Nombre, Apellido y Destino.
- **Acciones:** Botones para "Cancelar" y "Registrar Ingreso". El botón de registro debe estar deshabilitado si los campos obligatorios no son válidos.

### 3.4. Modal de Registro de Salida

- **Contenedor:** Un modal similar al de ingreso.
- **Funcionalidad de Búsqueda:** Un campo de texto principal para buscar a la persona que egresa por su número de Cédula.
- **Lista de Resultados:** La búsqueda debe filtrar en tiempo real una lista de las personas que se encuentran actualmente dentro del predio.
- **Selección:** El operador debe poder seleccionar a la persona correcta de la lista. La selección debe ser visualmente clara.
- **Información Adicional:** Al seleccionar una persona, se debe mostrar el tiempo transcurrido desde su ingreso.
- **Observaciones:** Un campo de texto opcional para añadir notas sobre la salida.
- **Acciones:** Botones para "Cancelar" y "Registrar Salida".

---

## 4. Requisitos de Validación

- Los campos obligatorios no pueden estar vacíos.
- El campo Cédula debe aceptar un formato numérico de 7-8 dígitos.
- El campo Matrícula de vehículo, si se ingresa, debe tener mínimo 6 caracteres (formato estándar uruguayo).
- El campo Observaciones tiene un límite de 100 caracteres.
