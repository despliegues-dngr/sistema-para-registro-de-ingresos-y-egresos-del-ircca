# 🛠️ Componentes de Desarrollo

Componentes auxiliares para debugging y monitoreo durante el desarrollo.

## 📋 Índice de Componentes

### 1. DebugConsolePanel.vue

**Propósito:** Panel flotante que captura y muestra `console.log`, `console.warn` y `console.error` directamente en la interfaz de la aplicación.

**Uso ideal:** Debugging en tablets/dispositivos móviles donde no hay acceso a DevTools del navegador.

#### Características

- ✅ **Captura automática** de logs mediante monkey-patching de console
- ✅ **Panel lateral deslizable** con botón FAB flotante
- ✅ **Filtros inteligentes** por categoría (🔒 Bloqueo, 🔆 Brillo, ❌ Errores, ⚠️ Warnings)
- ✅ **Timestamps precisos** con milisegundos
- ✅ **Límite configurable** de logs (default: 100, máx recomendado: 200)
- ✅ **Virtual scroll** para rendimiento con muchos logs
- ✅ **Solo en desarrollo** - Se desactiva automáticamente en producción
- ✅ **Mantiene console original** - Los logs siguen apareciendo en DevTools

#### Props

```typescript
interface Props {
  maxLogs?: number    // Máximo de logs a mantener (default: 100)
  autoOpen?: boolean  // Abrir panel automáticamente (default: false)
}
```

#### Ejemplo de Uso

```vue
<template>
  <v-app>
    <!-- Tu aplicación -->
    
    <!-- Panel de debug (solo en desarrollo) -->
    <DebugConsolePanel 
      v-if="isDevelopment" 
      :max-logs="150" 
      :auto-open="false" 
    />
  </v-app>
</template>

<script setup lang="ts">
import DebugConsolePanel from '@/components/dev/DebugConsolePanel.vue'

const isDevelopment = import.meta.env.DEV
</script>
```

#### Integración Actual

El componente está integrado en `App.vue` y se activa automáticamente en modo desarrollo:

```vue
<!-- App.vue -->
<DebugConsolePanel v-if="isDevelopment" :max-logs="150" />
```

#### Filtros Disponibles

| Filtro | Descripción | Detecta |
|--------|-------------|---------|
| 📋 Todos | Muestra todos los logs | - |
| 🔒 Bloqueo | Logs del sistema de bloqueo | Mensajes con emoji 🔒 |
| 🔆 Brillo | Logs del control de brillo | Mensajes con emoji 🔆 |
| ❌ Errores | Solo `console.error` | `type === 'error'` |
| ⚠️ Warnings | Solo `console.warn` | `type === 'warn'` |

#### Formato de Logs Recomendado

Para aprovechar los filtros, usar emojis al inicio del mensaje:

```typescript
// ✅ CORRECTO - Se filtrará correctamente
console.log('🔒 [Lock] Intentando bloquear pantalla')
console.log('🔆 [Brightness] Brillo aplicado:', value)

// ❌ NO ÓPTIMO - No se filtrará por categoría
console.log('Intentando bloquear pantalla')
```

#### Rendimiento

- **Overhead mínimo:** ~0.1ms por log
- **Memoria:** ~50KB por 100 logs (promedio)
- **Virtual scroll:** Renderiza solo logs visibles
- **Auto-limpieza:** Elimina logs antiguos al alcanzar límite

#### Limitaciones

- No captura logs de workers o service workers
- No captura `console.debug`, `console.info`, `console.trace`
- Límite de 200 logs recomendado para evitar problemas de memoria

---

### 2. StorageStatusPanel.vue

**Propósito:** Monitoreo del estado de IndexedDB y almacenamiento persistente.

**Uso:** Verificar cuota de almacenamiento, persistencia y estado de la base de datos.

---

### 3. TestCifradoPanel.vue

**Propósito:** Panel de pruebas para el sistema de cifrado AES-256-GCM.

**Uso:** Validar cifrado/descifrado de datos sensibles durante desarrollo.

---

## 🚀 Activación/Desactivación

### Modo Desarrollo (DEV)

```bash
pnpm dev
# DebugConsolePanel se activa automáticamente
```

### Modo Producción (PROD)

```bash
pnpm build
# DebugConsolePanel NO se incluye en el bundle
```

### Forzar Activación en Producción (NO RECOMENDADO)

Si necesitas debugging en producción (solo para troubleshooting temporal):

```vue
<!-- App.vue -->
<DebugConsolePanel 
  v-if="isDevelopment || forceDebug" 
  :max-logs="150" 
/>

<script setup lang="ts">
const isDevelopment = import.meta.env.DEV
const forceDebug = false // Cambiar a true solo temporalmente
</script>
```

⚠️ **IMPORTANTE:** Nunca dejar `forceDebug = true` en producción permanentemente.

---

## 📊 Casos de Uso

### 1. Debugging en Tablet (Fully Kiosk)

**Problema:** No hay acceso a Chrome DevTools en tablet con Fully Kiosk.

**Solución:**
1. Abrir aplicación en tablet
2. Tocar botón FAB 🐛 (esquina inferior derecha)
3. Ver logs en tiempo real
4. Filtrar por categoría (🔒 Bloqueo, 🔆 Brillo)

### 2. Verificar Integración con Fully Kiosk API

```typescript
// En TabletLockFAB.vue
console.log('🔒 [Lock] window.fully existe:', !!window.fully)
console.log('🔒 [Lock] screenOff es función:', 
  window.fully ? typeof window.fully.screenOff === 'function' : false)

// Ver en DebugConsolePanel:
// ✅ Filtro "🔒 Bloqueo" muestra solo estos logs
// ✅ Timestamps precisos para debugging de timing
```

### 3. Debugging de Brillo

```typescript
// En TabletBrightnessControl.vue
console.log('🔆 [Brightness] Intentando aplicar brillo:', value)
console.log('🔆 [Brightness] Brillo aplicado exitosamente')

// Ver en DebugConsolePanel:
// ✅ Filtro "🔆 Brillo" muestra solo estos logs
// ✅ Ver valores en tiempo real
```

---

## 🔧 Troubleshooting

### Panel no aparece

**Causa:** Modo producción o variable `isDevelopment` incorrecta.

**Solución:**
```bash
# Verificar modo
pnpm dev  # Debe estar en modo desarrollo

# Verificar en consola del navegador (si tienes acceso)
console.log(import.meta.env.DEV)  // Debe ser true
```

### Logs no se capturan

**Causa:** Componente montado después de los logs.

**Solución:** El componente está en `App.vue` y se monta al inicio, capturando todos los logs subsecuentes. Los logs anteriores al montaje no se capturan (es el comportamiento esperado).

### Demasiados logs (lag)

**Causa:** Límite de logs muy alto o logs muy frecuentes.

**Solución:**
```vue
<!-- Reducir límite -->
<DebugConsolePanel :max-logs="50" />

<!-- O limpiar logs manualmente -->
<!-- Botón "Limpiar logs" en el panel -->
```

---

## 📝 Convenciones

### Formato de Logs

```typescript
// ✅ CORRECTO
console.log('🔒 [Lock] Acción:', data)
console.log('🔆 [Brightness] Estado:', value)
console.warn('⚠️ [Lock] Advertencia:', message)
console.error('❌ [Lock] Error:', error)

// ❌ EVITAR
console.log('lock action', data)  // Sin emoji, difícil de filtrar
console.log(data)                  // Sin contexto
```

### Categorías de Emojis

| Emoji | Categoría | Uso |
|-------|-----------|-----|
| 🔒 | Lock | Sistema de bloqueo de pantalla |
| 🔆 | Brightness | Control de brillo |
| 💾 | Storage | IndexedDB, localStorage |
| 🔐 | Security | Cifrado, autenticación |
| 🚀 | Init | Inicialización de sistemas |
| ✅ | Success | Operaciones exitosas |
| ❌ | Error | Errores críticos |
| ⚠️ | Warning | Advertencias |
| 🔍 | Debug | Información de debugging |

---

## 🎯 Roadmap

### Futuras Mejoras

- [ ] Exportar logs a archivo JSON
- [ ] Búsqueda de texto en logs
- [ ] Captura de `console.debug` y `console.info`
- [ ] Integración con sistema de reportes de errores
- [ ] Modo "sticky" para mantener panel abierto
- [ ] Notificaciones de errores críticos

---

**Última actualización:** 29-Oct-2025  
**Autor:** Sistema Synapse-DevelOS Pro v4.0
