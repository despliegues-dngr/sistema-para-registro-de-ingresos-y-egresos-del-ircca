# 🚀 PWA IRCCA - GUÍA CONCEPTUAL DE ARQUITECTURA TÉCNICA

**Versión:** 3.0.0 (Refactorizado)
**Fecha:** 10-Sep-2025
**Propósito:** Este documento describe la arquitectura técnica y las decisiones estructurales de alto nivel para la PWA del IRCCA. No contiene código de implementación, el cual se encuentra en el código fuente y se resume en `docs/technical_overview.md`.

---

## 1. Stack Tecnológico

> 📘 **Stack Tecnológico Completo:** Ver [`03-technical-overview.md`](./03-technical-overview.md#1-stack-tecnológico-principal) para detalles completos de tecnologías, versiones y configuración.

La aplicación se construye sobre un stack moderno de JavaScript (Vue 3 + Vite + Vuetify 3), enfocado en el rendimiento, escalabilidad y PWA offline-first.

---

## 2. Estructura de Directorios

La estructura del proyecto está organizada para separar claramente las responsabilidades, promoviendo la modularidad y la mantenibilidad.

```
ircca-sistema-pwa/
├── public/             # Assets estáticos y configuración PWA (iconos, manifest)
├── src/                # Código fuente de la aplicación
│   ├── assets/         # Imágenes, hojas de estilo globales, etc.
│   ├── components/     # Componentes Vue reutilizables (UI, layout, formularios)
│   ├── composables/    # Lógica reutilizable con Composition API (ej. useAuth)
│   ├── plugins/        # Configuración de plugins de Vue (ej. vuetify.ts)
│   ├── router/         # Definición de rutas y guards de navegación
│   ├── services/       # Lógica de negocio central (ej. database, encryption)
│   ├── stores/         # Módulos de estado global de Pinia
│   ├── views/          # Componentes de página principal para cada ruta
│   ├── App.vue         # Componente raíz de la aplicación
│   └── main.ts         # Punto de entrada de la aplicación
├── docs/               # Documentación del proyecto
└── vite.config.ts      # Archivo de configuración principal de Vite
```

---

## 3. Configuración PWA

La aplicación se configura como una Progressive Web App para garantizar su funcionamiento offline y una experiencia nativa en dispositivos móviles.

- **Manifest:** Se define un `manifest.json` con el nombre de la aplicación, colores del tema, íconos y modo de visualización (`fullscreen`, `standalone`, etc.).
- **Service Worker:** Se utiliza Workbox (a través de `vite-plugin-pwa`) para gestionar el ciclo de vida del service worker.
- **Estrategia de Caching:** La estrategia principal es cachear todos los assets estáticos (`js`, `css`, `html`, `png`, etc.) para permitir que la aplicación se cargue y funcione sin conexión a internet.

*(Nota: La configuración detallada se encuentra en el objeto `VitePWA` dentro de `vite.config.ts`)*

---

## 4. Sistema de Stores (Pinia)

Se utiliza Pinia para la gestión del estado global de la aplicación. Se definen stores modulares para manejar diferentes piezas de estado de forma aislada.

- **Store de Autenticación (`auth`):** Responsable de gestionar el estado del usuario actual, su sesión, su rol y los permisos asociados.
- **Store de Registros (`registros`):** Manejará la lista de ingresos/egresos, las personas actualmente dentro del predio y las estadísticas computadas para el Dashboard.
- **Store de Auditoría (`audit`):** Gestionará los eventos de auditoría que se generen en la aplicación.

---

## 5. Router y Navegación

La navegación entre las diferentes vistas de la aplicación es gestionada por Vue Router.

- **Rutas:** Se definen rutas para las vistas principales como `Login`, `Dashboard`, `PersonasDentro`, etc.
- **Guards de Navegación:** Se implementan `navigation guards` para proteger las rutas. Estos guards verifican si un usuario está autenticado y si tiene los permisos necesarios para acceder a una ruta específica, redirigiendo a la pantalla de Login en caso contrario.

---

## 6. Base de Datos (IndexedDB)

La persistencia de datos en el lado del cliente se maneja a través de IndexedDB, una base de datos NoSQL disponible en el navegador, ideal para aplicaciones offline.

- **Librería:** Se utiliza la librería `idb` para simplificar las interacciones con la API de IndexedDB.
- **Esquema y Versionado:** La base de datos se versiona para permitir actualizaciones de esquema no destructivas. En la `v2`, el esquema debe incluir los siguientes "object stores" (similares a tablas):
    - `registros`: Almacena cada evento de ingreso y salida.
    - `auditoria`: Guarda los logs de eventos importantes del sistema.
    - `respaldos_automaticos`: Contiene los backups generados por el sistema.
    - `feedback_usuarios`: Almacena las respuestas de las encuestas de feedback.
    - `usuarios`: Guarda los perfiles de los usuarios del sistema.
    - `personas_dentro`: Mantiene una lista actualizada de las personas que están actualmente en el predio para consultas rápidas.

---

## 7. Build y Despliegue

El proceso de construcción y empaquetado de la aplicación para producción es gestionado por Vite.

- **Comando de Build:** El script `pnpm build` se encarga de transpilar, minificar y optimizar todo el código fuente, generando los archivos estáticos finales en el directorio `/dist`.
- **Optimización:** Se aplica `tree-shaking` para eliminar código no utilizado y `code-splitting` (mediante `manualChunks`) para dividir el código en fragmentos más pequeños, mejorando los tiempos de carga inicial.
