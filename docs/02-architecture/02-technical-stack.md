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

## 4. Calidad de Código

-   **Linting:** Se utiliza **ESLint** con la configuración recomendada para Vue y TypeScript (`@vue/eslint-config-typescript`). Las reglas se definen en `eslint.config.ts`.
-   **Formato:** Se utiliza **Prettier** para mantener un formato de código consistente en todo el proyecto. La configuración se encuentra en `.prettierrc.json`.
