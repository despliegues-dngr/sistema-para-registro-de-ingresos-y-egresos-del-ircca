# Guía del Proyecto IRCCA

## 1. Bienvenida y Propósito del Proyecto

Este documento es la guía central y el punto de partida para entender la estructura, el flujo de trabajo y las convenciones del proyecto **Sistema de Control de Accesos del IRCCA**.

El objetivo del proyecto es desarrollar e implementar una Progressive Web App (PWA) para automatizar y modernizar el registro, control y consulta de accesos de personas y vehículos en el instituto.

## 2. Primeros Pasos (Instalación)

Las instrucciones técnicas para instalar las dependencias, configurar el entorno y ejecutar la aplicación en modo de desarrollo se encuentran en el archivo `README.md` en la raíz del proyecto.

## 3. La Estructura de la Documentación (El Mapa)

La documentación de este proyecto está centralizada en la carpeta `/docs` y se organiza de la siguiente manera para facilitar su consulta:

### 📁 `01-management/` (3 archivos consolidados)

- **Contiene:** Los documentos formales que definen el **QUÉ**, el **PORQUÉ** y el **CUÁNDO** del proyecto.
- **Cuándo consultarla:** Para entender objetivos, alcance, cronograma y stakeholders.
- **📋 Documentos clave:**
  - `01-project-overview.md` - Resumen ejecutivo (Charter + Stakeholders + Formulation)
  - `02-project-execution.md` - Cronograma y entregables (Schedule + EDT + Communications)
  - `urcdp-registration-guide.md` - Guía legal para registro ante URCDP

### 📁 `02-architecture/` (12 archivos optimizados)

- **Contiene:** Las guías conceptuales sobre **CÓMO** está construido el sistema a nivel técnico (arquitectura PWA, seguridad, base de datos, testing).
- **Cuándo consultarla:** Para entender la estructura técnica, las tecnologías, la base de datos IndexedDB y las decisiones de alto nivel sin necesidad de leer el código fuente.
- **📋 Documentos clave:**
  - `01-pwa-architecture.md` - Arquitectura general PWA y decisiones de diseño
  - `03-technical-overview.md` - Stack tecnológico (fuente única de verdad)
  - `05-security-part1-architecture.md` + `part2-implementation.md` - Guía de seguridad completa
  - `06-database-part1-schema.md` + `part2-operations.md` - Base de datos IndexedDB completa
  - `07-features-index.md` - ✨ **Índice** de funcionalidades implementadas (referencias cruzadas)
  - `08-autocomplete-part1-design.md` + `part2-implementation.md` - Arquitectura de reutilización

### 📁 `03-design/` (2 archivos consolidados)

- **Contiene:** Todo lo relacionado con la **APARIENCIA** y la **EXPERIENCIA DE USUARIO** (UI/UX).
- **Cuándo consultarla:** Para saber qué paleta de colores usar, cómo deben ser los componentes, especificaciones de pantallas y flujos de usuario.
- **📋 Documentos clave:**
  - `01-ui-design-system.md` - Sistema de diseño completo (colores, tipografía, componentes, PWA icons)
  - `02-ux-flows-definitions.md` - Flujos de usuario y definiciones operativas

### 📁 `03-security/` (4 archivos)

- **Contiene:** Documentación de cumplimiento legal y normativo (AGESIC, Ley 18.331, ARCO).
- **Cuándo consultarla:** Para aspectos legales, compliance, notificaciones a autoridades y auditorías.

### 📁 `04-tasks/`

- **Contiene:** Los documentos para la **EJECUCIÓN Y SEGUIMIENTO** del día a día.
- **Cuándo consultarla:** Para saber en qué tarea trabajar y ver el progreso general del proyecto.
- **📊 Estado proyecto:**
  - Documentación: ✅ Optimizada al 100% (17-Oct-2025)
  - Tareas: 79% completado (19/24) - Actualizado 30-Sep-2025
  - 🔒 Seguridad: Sistema de auditoría implementado (09-Oct-2025) - Cumple AGESIC SO.7

## 4. El Flujo de Trabajo (Cómo Aportar al Proyecto)

Para mantener el orden y la consistencia, el desarrollo sigue este flujo de trabajo:

1.  **Revisar el Plan:** Consulta los documentos en `01-management/` para entender el contexto y los plazos generales.
2.  **Consultar el Tablero de Tareas:** Abre `04-tasks/00-tasks-tracker.md` para identificar cuál es la próxima tarea a realizar.
3.  **Entender la Tarea Específica:** Abre el archivo `TASK-....md` correspondiente a la tarea para ver los objetivos detallados, los requisitos y los criterios de aceptación.
4.  **Ejecutar:** Realiza el trabajo de desarrollo en el código fuente (`/src`), siguiendo las guías de `02-architecture` y `03-design`.
5.  **Actualizar el Progreso:** Al finalizar, marca la tarea como completada en `04-tasks/00-tasks-tracker.md` y añade notas de progreso si es necesario.

## 5. Principios y Convenciones

- **Nomenclatura de Documentación:** Las carpetas y archivos de documentación se nombran en **inglés**, usando el formato `kebab-case` (minúsculas y guiones).
- **Contenido de Documentos:** El texto dentro de los archivos `.md` se redacta en **español** para facilitar la lectura al equipo y stakeholders.
- **Código Fuente:** Todo el código en la carpeta `/src` se escribe en **inglés**.
