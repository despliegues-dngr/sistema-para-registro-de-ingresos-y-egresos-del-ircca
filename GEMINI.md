# Project Overview

This is a Progressive Web App (PWA) built with Vue.js 3 and Vuetify 3 to automate the registration, control, and consultation of income and expenses of people and vehicles at the surveillance post of the IRCCA.

## Key Technologies

*   **Frontend:** Vue.js 3, TypeScript, Composition API
*   **UI Framework:** Vuetify 3, Material Design Icons
*   **State Management:** Pinia
*   **Routing:** Vue Router 4
*   **PWA:** Workbox, Vite PWA Plugin
*   **Database:** IndexedDB
*   **Testing:** Vitest, Playwright
*   **Build Tool:** Vite
*   **Code Quality:** ESLint, Prettier

## Architecture

The project follows a modular architecture with a clear separation of concerns:

*   `src/components`: Reusable UI components.
*   `src/composables`: Shared logic using the Composition API.
*   `src/services`: Services for database, encryption, etc.
*   `src/stores`: Pinia stores for state management.
*   `src/views`: Main pages/routes.
*   `src/router`: Routing configuration.
*   `src/plugins`: Plugin configuration.
*   `src/assets`: Static assets.

# Building and Running

## Prerequisites

*   Node.js 18+
*   pnpm (recommended) or npm

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

This will start the Vite development server.

## Building for Production

```bash
pnpm build
```

This will create a production-ready build in the `dist` directory.

## Testing

```bash
# Run unit tests
pnpm test:unit

# Run end-to-end tests
pnpm test:e2e
```

# Development Conventions

*   **Coding Style:** The project uses ESLint and Prettier to enforce a consistent coding style.
*   **Testing:** Unit tests are written with Vitest and end-to-end tests with Playwright.
*   **Commits:** Conventional Commits are likely used, although not explicitly stated.
*   **State Management:** State is managed using Pinia, with a separate store for each feature (e.g., `auth`, `registro`).
*   **Components:** Components are kept small and focused on a single responsibility.
*   **TypeScript:** TypeScript is used throughout the project to ensure type safety.
