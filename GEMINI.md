# Project Overview

This project is a **Progressive Web App (PWA)** designed to automate the registration, control, and consultation of entries and exits of people and vehicles for the **Instituto de Rehabilitación del Cuerpo de Comandos de Aeronáutica (IRCCA)** in Uruguay.

It is built as an offline-first application, intended to run in a kiosk mode on an Android tablet. It features a robust security model with data encryption and role-based access control (Admin/Operator).

## Main Technologies

*   **Frontend Framework**: Vue 3 (with Composition API)
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **UI Framework**: Vuetify 3 (with Material Design Icons)
*   **State Management**: Pinia
*   **Routing**: Vue Router 4
*   **PWA**: Vite PWA Plugin (using Workbox)
*   **Local Database**: IndexedDB (managed with the `idb` library)
*   **Testing**: Vitest for unit tests and Playwright for E2E tests.
*   **Code Quality**: ESLint and Prettier

## Architecture

The application follows a modern frontend architecture:

*   **Offline-First**: Utilizes a Service Worker to cache assets and data, allowing it to function without a persistent internet connection.
*   **Client-Side Database**: All data is stored locally in IndexedDB. This includes user data, access records, and audit logs.
*   **Security**: Implements strong client-side encryption (AES-256) for all sensitive data stored in IndexedDB, complying with Uruguayan data protection law (N° 18.331).
*   **Component-Based**: Organized into a clear structure of reusable components, composables for shared logic, and views for different application pages.
*   **Centralized State**: Pinia stores manage global application state, such as user authentication and access records.

# Building and Running

## Prerequisites

*   Node.js v18+
*   `pnpm` package manager is recommended.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Create a local environment file from the example:
    ```bash
    cp .env.example .env.local
    ```

## Key Commands

*   **Development Server**: Run the app in development mode with hot-reloading.
    ```bash
    pnpm dev
    ```
*   **Kiosk Mode Development**: Run the app on the local network for tablet testing.
    ```bash
    pnpm dev:kiosk
    ```
*   **Production Build**: Type-check and build the application for production.
    ```bash
    pnpm build
    ```
*   **Preview Production Build**: Serve the production build locally.
    ```bash
    pnpm preview
    ```
*   **Unit Testing**: Run unit tests using Vitest.
    ```bash
    pnpm test:unit
    ```
*   **End-to-End Testing**: Run E2E tests using Playwright.
    ```bash
    pnpm test:e2e
    ```
*   **Linting & Formatting**: Check and fix code style issues.
    ```bash
    pnpm lint
    pnpm format
    ```

# Development Conventions

## Code Style

*   The project uses **ESLint** and **Prettier** to enforce a consistent code style.
*   Configuration can be found in `eslint.config.ts` and `.prettierrc.json`.
*   The style is based on `@vue/eslint-config-typescript` with Prettier integration.

## State Management (Pinia)

*   Global state is managed using Pinia.
*   Store modules are located in `src/stores/`.
*   Key stores include `auth.ts` (for user authentication and roles) and `registro.ts` (for managing access records).

## Routing (Vue Router)

*   Application routing is handled by Vue Router.
*   Route definitions are in `src/router/index.ts`.
*   Navigation guards are used to protect routes based on authentication status (`requiresAuth`) and user roles (`requiresAdmin`).

## Database (IndexedDB)

*   The application uses IndexedDB for all local data storage.
*   The database schema is defined and versioned in `src/services/databaseService.ts` (or a similar service file).
*   The schema includes object stores for `registros`, `auditoria`, `usuarios`, and `personas_dentro`.

## Testing

*   **Unit Tests**: Located in `src/__tests__/`, written with Vitest and `@vue/test-utils`.
*   **E2E Tests**: Located in the `e2e/` directory, written with Playwright.

## Directory Structure

The `src` directory is organized as follows:

*   `assets/`: Static assets like images and styles.
*   `components/`: Reusable Vue components (categorized into `forms`, `layout`, `ui`).
*   `composables/`: Shared Composition API functions (e.g., `useAuth.ts`).
*   `plugins/`: Configuration for Vue plugins like Vuetify (`vuetify.ts`).
*   `router/`: Vue Router configuration (`index.ts`).
*   `services/`: Core logic services (e.g., `databaseService.ts`, `encryptionService.ts`).
*   `stores/`: Pinia store modules.
*   `views/`: Top-level page components for each route.
