# 🔄 Arquitectura de Autocomplete (Parte 1) - Diseño y Componentes

**Versión:** 1.0  
**Fecha:** 30-Sep-2025  
**Parte:** 1/2 - Diseño y Arquitectura  
**Principio:** DRY (Don't Repeat Yourself)

> 📘 **Parte 2:** Ver [`07-autocomplete-implementation.md`](./07-autocomplete-implementation.md)

---

## 📋 Resumen Ejecutivo

Sistema de autocompletado inteligente basado en **componentes reutilizables** y **composables compartidos**, implementado para:
1. ✅ Campo de cédula del titular (modal ingreso)
2. ✅ Campo de cédula de acompañantes (modal ingreso)

**Reutilización:** 95% del código compartido entre ambas implementaciones.

---

## 🏗️ Arquitectura de Capas

```
┌────────────────────────────────────────────────┐
│  CAPA 1: COMPONENTES PRESENTACIONALES         │
│  - CedulaAutocomplete.vue (REUTILIZABLE)      │
└─────────────────┬──────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────┐
│  CAPA 2: LÓGICA DE COMPONENTES                │
│  - DatosPersonalesSection.vue (Titular)       │
│  - AcompananteCard.vue (Acompañante)          │
└─────────────────┬──────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────┐
│  CAPA 3: COMPOSABLES REACTIVOS                │
│  - useAutocomplete() (COMPARTIDO)             │
└─────────────────┬──────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────┐
│  CAPA 4: SERVICIOS DE DATOS + CIFRADO         │
│  - AutocompleteService (Singleton)            │
│  - EncryptionService (AES-256-GCM)            │
└─────────────────┬──────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────┐
│  CAPA 5: PERSISTENCIA CIFRADA                 │
│  - IndexedDB Store: personasConocidas         │
│  - ✅ Datos personales CIFRADOS               │
│  - ✅ Búsqueda por hash SHA-256               │
└────────────────────────────────────────────────┘
```

---

## 🧩 Componentes Reutilizables

### 1. **CedulaAutocomplete.vue** (UI Pura)

**Ubicación:** `src/components/forms/sections/CedulaAutocomplete.vue`

**Responsabilidades:**
- ✅ Presentación visual del autocomplete
- ✅ Renderizado de sugerencias con datos enriquecidos
- ✅ Gestión de eventos de selección
- ❌ NO contiene lógica de búsqueda (delegada a composable)

**Props requeridas:**
```typescript
interface Props {
  modelValue: AutocompleteItem | null
  items: AutocompleteItem[]       // Sugerencias a mostrar
  search: string                  // Término de búsqueda
  loading?: boolean               // Indicador de carga
}
```

**Eventos emitidos:**
```typescript
emit('update:modelValue')  // Valor seleccionado
emit('update:search')      // Término de búsqueda actualizado
emit('persona-selected')   // Persona completa seleccionada
```

**Ventajas de la reutilización:**
- ✅ Componente agnóstico (no sabe si es titular o acompañante)
- ✅ Estilos consistentes en toda la aplicación
- ✅ Un solo lugar para mantener lógica de UI
- ✅ Testing simplificado (1 componente = 1 test suite)

---

### 2. **useAutocomplete() Composable** (Lógica Compartida)

**Ubicación:** `src/composables/useAutocomplete.ts`

**Responsabilidades:**
- ✅ Búsqueda en tiempo real con debounce
- ✅ Manejo de estado reactivo (loading, sugerencias)
- ✅ Comunicación con AutocompleteService
- ✅ Limpieza de sugerencias

**API del composable:**
```typescript
export function useAutocomplete() {
  return {
    // Estado reactivo
    sugerenciasCedula: Ref<PersonaConocida[]>,
    buscando: Ref<boolean>,
    
    // Métodos
    buscarPorCedula: (cedulaParcial: string) => Promise<void>,
    limpiarSugerencias: () => void
  }
}
```

**Ventajas de la reutilización:**
- ✅ Lógica centralizada (búsqueda, debounce, estado)
- ✅ Misma experiencia de usuario en todos los campos
- ✅ Fácil ajuste de configuración (ej. cambiar debounce de 300ms a 500ms)
- ✅ Testing de lógica separado de UI

---

## 📊 Comparación de Implementaciones

### Titular (DatosPersonalesSection.vue)

```typescript
// ✅ REUTILIZA: Composable
const { sugerenciasCedula, buscando, buscarPorCedula, limpiarSugerencias } 
  = useAutocomplete()

// ✅ REUTILIZA: Mapeo de sugerencias
const sugerenciasMapeadas = computed(() => {
  return sugerenciasCedula.value.map(persona => ({
    ...persona,
    displayText: `${persona.nombre} ${persona.apellido} (${persona.cedula})`
  }))
})

// ✅ REUTILIZA: Watch para búsqueda
watch(cedulaBusqueda, async (newValue) => {
  emit('update:cedula', newValue)
  if (newValue && newValue.length >= 1) {
    await buscarPorCedula(newValue)
  }
})

// ✅ Lógica específica: autocompletar vehículo
const autocompletarDatos = (persona: PersonaConocida) => {
  emit('update:cedula', persona.cedula)
  emit('update:nombre', persona.nombre)
  emit('update:apellido', persona.apellido)
  emit('update:destino', persona.ultimoDestino)
  
  // ESPECÍFICO DEL TITULAR: Autocompletar vehículo
  if (persona.ultimoVehiculo) {
    emit('update:vehiculo', persona.ultimoVehiculo)
  }
}
```

### Acompañante (AcompananteCard.vue)

```typescript
// ✅ REUTILIZA: Composable (MISMO CÓDIGO)
const { sugerenciasCedula, buscando, buscarPorCedula, limpiarSugerencias } 
  = useAutocomplete()

// ✅ REUTILIZA: Mapeo de sugerencias (MISMO CÓDIGO)
const sugerenciasMapeadas = computed(() => {
  return sugerenciasCedula.value.map(persona => ({
    ...persona,
    displayText: `${persona.nombre} ${persona.apellido} (${persona.cedula})`
  }))
})

// ✅ REUTILIZA: Watch para búsqueda (MISMO CÓDIGO)
watch(cedulaBusqueda, async (newValue) => {
  emit('update:cedula', newValue)
  if (newValue && newValue.length >= 1) {
    await buscarPorCedula(newValue)
  }
})

// ✅ Lógica específica: sin vehículo
const autocompletarDatos = (persona: PersonaConocida) => {
  emit('update:cedula', persona.cedula)
  emit('update:nombre', persona.nombre)
  emit('update:apellido', persona.apellido)
  emit('update:destino', persona.ultimoDestino)
  
  // ESPECÍFICO DEL ACOMPAÑANTE: NO autocompletar vehículo
  // (el vehículo pertenece al titular)
}
```

**Diferencia:** Solo 4 líneas de código específicas (emit de vehículo).

---

## 🔄 Flujo de Datos Compartido

```
┌─────────────────────────────────────────────────────┐
│  Usuario escribe en campo de cédula                 │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  Watch detecta cambio en cedulaBusqueda             │
│  (LÓGICA COMPARTIDA en ambos componentes)           │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  useAutocomplete().buscarPorCedula()                │
│  (COMPOSABLE COMPARTIDO)                            │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  AutocompleteService.buscarPorCedulaParcial()       │
│  (SERVICIO SINGLETON)                               │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  IndexedDB Query en personasConocidas               │
│  (STORE ÚNICO)                                      │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  Resultados → sugerenciasCedula (reactive)          │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  Computed: sugerenciasMapeadas                      │
│  (LÓGICA COMPARTIDA)                                │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  CedulaAutocomplete renderiza sugerencias           │
│  (COMPONENTE REUTILIZADO)                           │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  Usuario selecciona → autocompletarDatos()          │
│  (Lógica específica por contexto)                   │
└─────────────────────────────────────────────────────┘
```

---

**Documento dividido para cumplir límite de 300 líneas:**
- Parte 1 (Diseño): Este documento (~250 líneas)
- Parte 2 (Implementación): `08-autocomplete-part2-implementation.md` (~230 líneas)

**Última actualización:** 17-Oct-2025
