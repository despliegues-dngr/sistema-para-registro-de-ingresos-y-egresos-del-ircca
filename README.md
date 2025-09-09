# Sistema IRCCA - Registro de Ingresos y Egresos

Progressive Web App (PWA) para automatizar el registro, control y consulta de ingresos y egresos de personas y vehículos en el puesto de vigilancia del Instituto de Rehabilitación del Cuerpo de Comandos de Aeronáutica (IRCCA).

## 🚀 Características Principales

- **PWA Completa:** Funciona offline con service workers
- **Seguridad:** Cifrado AES-256 con PBKDF2 (Ley N° 18.331)
- **Modo Kiosco:** Optimizado para tablet Android
- **Multiusuario:** Roles Admin/Operador
- **Base de Datos:** IndexedDB con respaldos automáticos
- **UI Moderna:** Vuetify 3 con tema gubernamental

## 🛠️ Stack Tecnológico

- **Frontend:** Vue 3 + TypeScript + Composition API
- **UI Framework:** Vuetify 3 + Material Design Icons
- **Estado:** Pinia (Vuex 5)
- **Enrutamiento:** Vue Router 4
- **PWA:** Workbox + Vite PWA Plugin
- **Base de Datos:** IndexedDB
- **Testing:** Vitest + Playwright
- **Herramientas:** ESLint + Prettier + TypeScript

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── composables/         # Lógica compartida (Composition API)
├── services/           # Servicios (DB, cifrado, API)
├── stores/             # Pinia stores (auth, registro, app)
├── views/              # Páginas/rutas principales
├── router/             # Configuración de rutas
├── plugins/            # Configuración de plugins
├── assets/            # Recursos estáticos
└── types/             # Definiciones TypeScript
```

## 🚀 Desarrollo

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar repositorio
git clone [URL_DEL_REPO]
cd sistema-para-registro-de-ingresos-y-egresos-del-ircca

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local
```

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm dev:kiosk        # Modo kiosco (host 0.0.0.0)

# Construcción
pnpm build            # Build completo (lint + type-check + build)
pnpm build:prod       # Build optimizado para producción
pnpm preview          # Preview del build

# Testing
pnpm test:unit        # Tests unitarios (Vitest)
pnpm test:e2e         # Tests E2E (Playwright)
pnpm test:all         # Todos los tests + lint + format

# Calidad de código
pnpm lint             # ESLint con autofix
pnpm lint:check       # ESLint solo verificación
pnpm format           # Prettier format
pnpm format:check     # Prettier verificación
pnpm type-check       # TypeScript type checking

# Utilidades
pnpm clean            # Limpiar cache y dist
pnpm deps:check       # Verificar dependencias desactualizadas
pnpm deps:update      # Actualizar dependencias
```

## 🔐 Seguridad

### Cifrado de Datos
- **Algoritmo:** AES-256-GCM
- **Derivación de Clave:** PBKDF2 (100,000 iteraciones)
- **Salt:** 16 bytes aleatorios
- **IV:** 12 bytes aleatorios

### Cumplimiento Legal
- **Ley N° 18.331:** Protección de Datos Personales (Uruguay)
- **Retención:** 365 días configurables
- **Auditoría:** Log completo de eventos
- **Backup:** Estrategia 3-2-1 con cifrado

## 👥 Usuarios del Sistema

### Administrador
- Gestión completa del sistema
- Configuración de usuarios
- Acceso a reportes y auditorías
- Gestión de backups

### Operador
- Registro de ingresos/egresos
- Consultas básicas
- Acceso limitado a configuración

## 📱 Instalación PWA

1. Abrir en navegador compatible
2. Buscar "Instalar aplicación" o ícono PWA
3. Confirmar instalación
4. La app estará disponible como aplicación nativa

## 🔧 Configuración de Kiosco

Para tablet Android en modo kiosco:

1. Habilitar modo desarrollador
2. Instalar navegador kiosco (Chrome, Firefox Kiosk)
3. Configurar URL: `http://[IP]:5173`
4. Activar pantalla completa
5. Deshabilitar navegación del sistema

## 📦 Construcción y Despliegue

```bash
# Build de producción
pnpm build:prod

# Los archivos estarán en /dist
# Servir con cualquier servidor web estático
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es propiedad del Instituto de Rehabilitación del Cuerpo de Comandos de Aeronáutica (IRCCA) - Uruguay.

## 📞 Contacto

**Gerente de Proyecto:** Mario BERNI  
**Patrocinador:** Tte. Rodrigo LOPEZ (Jefe del Servicio 222)  
**Organización:** IRCCA - Uruguay

---

**Versión:** 1.0.0  
**Fecha:** Septiembre 2024  
**Estado:** En Desarrollo

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chromium
pnpm test:e2e --project=chromium
# Runs the tests of a specific file
pnpm test:e2e tests/example.spec.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
"# Sistema IRCCA - Registro de Ingresos y Egresos" 
