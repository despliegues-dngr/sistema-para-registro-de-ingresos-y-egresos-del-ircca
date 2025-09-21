# 🧪 GUÍA DE TESTING - PWA IRCCA

**Versión:** 2.0
**Fecha:** 20-Sep-2025
**Última actualización:** Configuración oficial Vuetify + Vue Test Utils
**Propósito:** Este documento establece la estrategia, herramientas y convenciones para la realización de pruebas de software en el proyecto PWA IRCCA, con el fin de asegurar la calidad, fiabilidad y mantenibilidad de la aplicación.

---

## 1. Filosofía de Testing

La calidad es una responsabilidad compartida. Dado que esta aplicación es para uso en un entorno de seguridad institucional, la robustez y la ausencia de errores son críticas. Adoptamos un enfoque pragmático de la pirámide de testing, priorizando las pruebas unitarias rápidas, complementadas con pruebas End-to-End (E2E) para los flujos de usuario más importantes.

---

## 2. Herramientas de Testing

El proyecto está configurado con un stack de testing moderno y unificado:

*   **Pruebas Unitarias (Unit Tests)**:
    *   **Framework**: **Vitest**. Integrado con Vite para una ejecución y recarga instantánea.
    *   **Componentes UI**: **Vue Test Utils** + **Vuetify** oficialmente configurado
    *   **Ubicación**: Las pruebas se colocan en un directorio `__tests__` dentro del directorio del módulo que se está probando (ej. `src/stores/__tests__/auth.spec.ts`) o junto al archivo que prueban (ej. `useAuth.spec.ts`).
    *   **Comando**: `pnpm test:unit`

*   **Pruebas End-to-End (E2E)**:
    *   **Framework**: **Playwright**. Permite automatizar acciones en un navegador real para simular interacciones de usuario.
    *   **Ubicación**: Las pruebas se encuentran en el directorio `e2e/` en la raíz del proyecto.
    *   **Comando**: `pnpm test:e2e`

---

## 3. Estrategia y Flujo de Trabajo

### ¿Qué probar?

*   **Pruebas Unitarias**:
    *   **Stores (Pinia)**: Probar acciones, mutaciones (cambios de estado) y getters. Simular llamadas a servicios si es necesario.
    *   **Composables (`use...`)**: Probar la lógica de negocio pura, funciones de utilidad y estado reactivo.
    *   **Servicios**: Probar la lógica de servicios como `encryptionService` para asegurar que los algoritmos son correctos.
    *   **Componentes (Vue)**: Probar la renderización condicional, emisión de eventos y props. **CONFIGURACIÓN OFICIAL VUETIFY implementada** para testing robusto de componentes UI.

*   **Pruebas E2E**:
    *   **Flujos Críticos**: Probar los "caminos felices" de las funcionalidades más importantes.
        *   Autenticación (Login y Logout).
        *   Registro de un nuevo ingreso.
        *   Registro de una salida.
        *   Generación de un reporte (rol Supervisor).
    *   **Casos de Error**: Probar cómo reacciona la UI a entradas inválidas (ej. login con PIN incorrecto).

### ¿Cuándo probar?

1.  **Durante el Desarrollo**:
    *   Al crear o modificar una unidad de lógica (una función, una acción de store), crea o actualiza su **prueba unitaria**.
    *   Ejecuta `pnpm test:unit --watch` mientras desarrollas para obtener feedback instantáneo.

2.  **Al Finalizar una Funcionalidad**:
    *   Cuando un flujo de usuario esté completo (ej. el formulario de registro de ingreso funciona de principio a fin), considera añadir una **prueba E2E** para ese flujo.

3.  **Antes de un `commit`**:
    *   Ejecuta `pnpm test:unit` como mínimo. Esto asegura que no estás introduciendo una regresión.
    *   Idealmente, ejecuta también `pnpm build` para confirmar que no hay errores de tipo.

---

## 4. Configuración Testing con Vuetify (OFICIAL)

> **🎯 IMPLEMENTACIÓN EXITOSA**: Esta sección documenta la configuración oficial verificada de Vuetify + Vue Test Utils según documentación oficial.

### 4.1 Dependencias Requeridas

Para testing con componentes Vuetify, asegúrate de tener instaladas:

```bash
# Dependencias principales (ya instaladas)
@vue/test-utils
vitest

# Dependencia específica para Vuetify (CRÍTICA)
resize-observer-polyfill
```

### 4.2 Configuración test-setup.ts (OFICIAL)

El archivo `src/test-setup.ts` debe contener esta configuración oficial:

```typescript
// ResizeObserver polyfill para Vuetify (REQUERIDO por documentación oficial)
global.ResizeObserver = require('resize-observer-polyfill')

// Configuración oficial de Vuetify para tests
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components' // CRÍTICO: usar * as components
import * as directives from 'vuetify/directives' // CRÍTICO: usar * as directives

// Crear instancia siguiendo documentación oficial
const vuetify = createVuetify({
  components,
  directives,
})

// Helper global para mount (PATRÓN OFICIAL)
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

vi.stubGlobal('mountWithVuetify', (component: any, options: any = {}) => {
  const pinia = createPinia()
  
  return mount(component, {
    global: {
      plugins: [vuetify, pinia],
      stubs: {
        'router-link': true,
        'router-view': true
      },
      ...options.global
    },
    ...options
  })
})
```

### 4.3 Selectores CSS para Componentes Vuetify (OFICIAL)

**❌ INCORRECTO** (causará "Cannot call setValue on empty DOMWrapper"):
```typescript
// NO funciona con Vuetify - selectores nativos
wrapper.find('input[autocomplete="username"]')
wrapper.find('input[type="password"]')
```

**✅ CORRECTO** (según documentación oficial Vue Test Utils):
```typescript
// Estrategia oficial: buscar inputs DENTRO de componentes Vuetify
wrapper.find('.v-text-field input[type="text"]')     // Campo de texto
wrapper.find('.v-text-field input[type="password"]') // Campo contraseña
wrapper.findComponent({ name: 'VTextField' })         // Componente completo
```

### 4.4 Patrón de Montaje Recomendado

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
// NO importar mount directamente - usar helper global

describe('MiComponente', () => {
  const mountComponent = (props = {}) => {
    return global.mountWithVuetify(MiComponente, {
      props
    })
  }

  it('debe interactuar con input de Vuetify', async () => {
    const wrapper = mountComponent()
    
    // Estrategia oficial para setValue
    const textInput = wrapper.find('.v-text-field input[type="text"]')
    await textInput.setValue('valor de prueba')
    
    expect(textInput.element.value).toBe('valor de prueba')
  })
})
```

### 4.5 Casos Comunes y Soluciones

**Interacciones con botones Vuetify:**
```typescript
// Botón submit
const submitBtn = wrapper.find('button[type="submit"]')
await submitBtn.trigger('click')

// Verificar estado disabled
expect(submitBtn.attributes('disabled')).toBeDefined()
```

**Toggle de visibilidad (ej. contraseña):**
```typescript
// Buscar ícono en append-inner
const toggleIcon = wrapper.find('.v-field__append-inner .v-icon')
await toggleIcon.trigger('click')

// Verificar cambio de tipo
const passwordVisible = wrapper.find('.v-text-field input[type="text"]')
expect(passwordVisible.exists()).toBe(true)
```

**Verificar alertas Vuetify:**
```typescript
const alert = wrapper.find('.v-alert')
expect(alert.exists()).toBe(true)
expect(alert.text()).toContain('Mensaje esperado')
```

### 4.6 Debugging Tips

**Si los tests fallan con "Cannot call setValue":**
1. Verificar que usas `global.mountWithVuetify`
2. Usar selectores `.v-text-field input[type="..."]` 
3. Confirmar que `resize-observer-polyfill` está instalado

**Para inspeccionar el DOM generado:**
```typescript
console.log(wrapper.html()) // Ver estructura completa
console.log(wrapper.findAll('input')) // Ver todos los inputs
```

---

## 5. Convenciones y Buenas Prácticas

*   **Nomenclatura**: Los archivos de pruebas unitarias deben terminar en `.spec.ts`. Los de E2E también usan `.spec.ts` pero viven en la carpeta `e2e`.
*   **Descripción Clara**: Usa `describe` para agrupar pruebas de una misma funcionalidad y `it` o `test` para describir claramente qué comportamiento se está probando.
*   **Componentes Vuetify**: SIEMPRE usar `global.mountWithVuetify()` y selectores CSS oficiales.
    ```typescript
    describe('useAuth', () => {
      it('should return isAuthenticated as true after successful login', () => {
        // ... test logic
      });
    });
    ```
*   **AAA (Arrange, Act, Assert)**: Estructura tus pruebas siguiendo este patrón para que sean fáciles de leer.
    *   **Arrange**: Configura el estado inicial, mocks o datos necesarios.
    *   **Act**: Ejecuta la función o acción que quieres probar.
    *   **Assert**: Comprueba que el resultado es el esperado usando las aserciones de Vitest (`expect`, `toBe`, etc.).
*   **Independencia**: Cada prueba debe ser independiente. No debe depender del resultado de una prueba anterior. Usa los hooks `beforeEach` o `afterEach` para limpiar el estado entre pruebas.

### 5.1 Ejemplo Completo - LoginForm

```typescript
import { describe, it, expect } from 'vitest'
import LoginForm from '../LoginForm.vue'

describe('LoginForm', () => {
  const mountComponent = (props = {}) => {
    return global.mountWithVuetify(LoginForm, { props })
  }

  it('debe renderizar campos de usuario y contraseña', () => {
    const wrapper = mountComponent()
    
    const textFields = wrapper.findAllComponents({ name: 'VTextField' })
    expect(textFields.length).toBeGreaterThanOrEqual(2)
  })

  it('debe permitir escribir en campo usuario', async () => {
    const wrapper = mountComponent()
    
    const usernameInput = wrapper.find('.v-text-field input[type="text"]')
    await usernameInput.setValue('testuser')
    
    expect(usernameInput.element.value).toBe('testuser')
  })

  it('debe emitir evento submit con datos válidos', async () => {
    const wrapper = mountComponent()
    
    // Llenar campos
    await wrapper.find('.v-text-field input[type="text"]').setValue('admin')
    await wrapper.find('.v-text-field input[type="password"]').setValue('pass123')
    
    // Simular submit
    await wrapper.find('form').trigger('submit.prevent')
    
    // Verificar evento
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

---

## 6. Checklist de Testing

### ✅ Antes de escribir tests de componentes:
- [ ] `resize-observer-polyfill` instalado
- [ ] `test-setup.ts` configurado con código oficial
- [ ] Usar `global.mountWithVuetify()` para montaje
- [ ] Usar selectores `.v-text-field input[type="..."]`

### ✅ Durante el desarrollo:
- [ ] Tests pasan con `pnpm test:unit`
- [ ] Selectores CSS encuentran elementos reales
- [ ] `setValue()` funciona sin errores "empty DOMWrapper"

### ✅ Antes del commit:
- [ ] Todos los tests unitarios pasan
- [ ] Build completo sin errores TypeScript
- [ ] Tests E2E críticos funcionan

---
