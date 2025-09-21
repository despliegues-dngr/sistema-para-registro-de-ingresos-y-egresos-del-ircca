# Project Overview

This is a Progressive Web App (PWA) built with Vue.js 3 and Vuetify 3 to automate the registration, control, and consultation of personnel and vehicle entries and exits for the IRCCA (Instituto de Rehabilitación del Cuerpo de Comandos de Aeronáutica).

The application is designed to work offline and in a kiosk mode on an Android tablet. It features a multi-user system with 'Admin' and 'Operator' roles.

## Key Technologies

*   **Frontend:** Vue 3, TypeScript, Composition API
*   **UI Framework:** Vuetify 3, Material Design Icons
*   **State Management:** Pinia
*   **Routing:** Vue Router 4
*   **PWA:** Workbox, Vite PWA Plugin
*   **Database:** IndexedDB
*   **Testing:** Vitest, Playwright
*   **Build Tool:** Vite
*   **Package Manager:** pnpm

## Architecture

The project follows a standard Vue.js project structure:

*   `src/components`: Reusable UI components.
*   `src/composables`: Shared logic using the Composition API.
*   `src/services`: Services for database interaction, encryption, etc.
*   `src/stores`: Pinia stores for state management (auth, registration, app).
*   `src/views`: Main pages/routes.
*   `src/router`: Routing configuration.
*   `src/plugins`: Plugin configuration.
*   `src/assets`: Static assets.

Authentication is handled by a Pinia store (`src/stores/auth.ts`) and uses `IndexedDB` to store user data. Passwords are encrypted using AES-256 with PBKDF2. The application uses route guards to protect routes based on authentication and user roles.

# Building and Running

## Prerequisites

*   Node.js 18+
*   pnpm

## Installation

```bash
pnpm install
```

## Development

```bash
# Run the development server
pnpm dev

# Run in kiosk mode
pnpm dev:kiosk
```

## Building

```bash
# Build for production
pnpm build
```

## Testing

```bash
# Run unit tests
pnpm test:unit

# Run end-to-end tests
pnpm test:e2e

# Run all tests
pnpm test:all
```

# Development Conventions

*   **Coding Style:** The project uses ESLint and Prettier for code formatting and linting.
*   **Testing:** Unit tests are written with Vitest and end-to-end tests with Playwright.
*   **Commits:** No explicit commit message convention is mentioned in the documentation, but the project uses Git for version control.
*   **State Management:** State is managed using Pinia, with separate stores for different modules (e.g., `auth`, `registro`).
*   **UI:** The UI is built with Vuetify 3, and custom components are organized in the `src/components` directory.
