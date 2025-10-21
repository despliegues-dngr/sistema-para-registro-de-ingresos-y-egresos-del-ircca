# 🎭 Tests E2E con Playwright

Este directorio contiene los tests End-to-End del Sistema IRCCA implementados con Playwright.

## 📁 Estructura

```
e2e/
├── pages/          # Page Objects (POM)
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── fixtures/       # Datos de prueba
│   └── usuarios.ts
├── helpers/        # Funciones auxiliares
│   └── auth.ts
├── specs/          # Tests organizados por Epic
│   └── 01-auth.spec.ts
└── README.md
```

## 🚀 Ejecutar Tests

```bash
# Todos los tests
pnpm test:e2e

# Tests específicos
npx playwright test specs/01-auth.spec.ts

# Modo UI (debugging)
npx playwright test --ui

# Ver reporte
npx playwright show-report
```

## 📝 Convenciones

- **Page Objects:** Un archivo por página principal
- **Fixtures:** Datos de prueba reutilizables
- **Helpers:** Funciones auxiliares (auth, database, etc.)
- **Specs:** Tests organizados por Epic según estrategia

## ✅ Estado Actual

Ver `docs/02-architecture/10-e2e-testing-strategy.md` para tracking completo de progreso.
