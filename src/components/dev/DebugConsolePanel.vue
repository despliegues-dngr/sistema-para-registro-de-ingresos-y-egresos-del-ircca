<template>
  <!-- FAB para abrir/cerrar el panel de debug -->
  <div class="debug-console-wrapper">
    <!-- Botón flotante -->
    <v-btn
      v-if="!isOpen"
      class="debug-fab"
      color="secondary"
      icon
      size="small"
      elevation="4"
      @click="togglePanel"
    >
      <v-icon>mdi-bug</v-icon>
      <v-badge
        v-if="logs.length > 0"
        :content="logs.length"
        color="error"
        overlap
      />
      <v-tooltip activator="parent" location="left">
        Debug Console ({{ logs.length }} logs)
      </v-tooltip>
    </v-btn>

    <!-- Panel lateral deslizable -->
    <v-navigation-drawer
      v-model="isOpen"
      location="right"
      temporary
      width="400"
      class="debug-drawer"
    >
      <!-- Header -->
      <v-card flat>
        <v-card-title class="d-flex align-center bg-secondary text-white py-3">
          <v-icon class="mr-2" color="white">mdi-bug-outline</v-icon>
          <span class="flex-grow-1">Debug Console</span>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="clearLogs"
            :disabled="logs.length === 0"
          >
            <v-icon color="white">mdi-delete-sweep</v-icon>
            <v-tooltip activator="parent" location="bottom">
              Limpiar logs
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="togglePanel"
          >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Filtros -->
        <v-card-text class="py-2 bg-grey-lighten-4">
          <div class="d-flex gap-2 flex-wrap">
            <v-chip
              v-for="filter in filters"
              :key="filter.value"
              :color="activeFilter === filter.value ? 'primary' : 'default'"
              :variant="activeFilter === filter.value ? 'flat' : 'outlined'"
              size="small"
              @click="activeFilter = filter.value"
            >
              {{ filter.icon }} {{ filter.label }}
              <v-badge
                v-if="getFilterCount(filter.value) > 0"
                :content="getFilterCount(filter.value)"
                inline
                color="error"
                class="ml-1"
              />
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <!-- Lista de logs -->
      <v-card flat class="logs-container">
        <v-virtual-scroll
          :items="filteredLogs"
          :height="scrollHeight"
          item-height="auto"
        >
          <template #default="{ item }">
            <v-card
              :class="['log-item', `log-item--${item.type}`]"
              flat
              tile
            >
              <v-card-text class="py-2 px-3">
                <div class="d-flex align-start">
                  <!-- Timestamp -->
                  <span class="log-timestamp text-caption text-grey-darken-1 mr-2">
                    {{ formatTime(item.timestamp) }}
                  </span>
                  
                  <!-- Tipo -->
                  <v-icon
                    :color="getTypeColor(item.type)"
                    size="16"
                    class="mr-2 mt-1"
                  >
                    {{ getTypeIcon(item.type) }}
                  </v-icon>
                  
                  <!-- Mensaje -->
                  <div class="log-message flex-grow-1">
                    <div
                      v-for="(msg, idx) in item.messages"
                      :key="idx"
                      class="log-line"
                    >
                      {{ formatMessage(msg) }}
                    </div>
                  </div>
                </div>
              </v-card-text>
              <v-divider />
            </v-card>
          </template>
        </v-virtual-scroll>

        <!-- Empty state -->
        <div
          v-if="filteredLogs.length === 0"
          class="text-center py-8 text-grey"
        >
          <v-icon size="64" color="grey-lighten-1">mdi-console</v-icon>
          <p class="text-body-2 mt-2">
            {{ logs.length === 0 ? 'No hay logs aún' : 'No hay logs con este filtro' }}
          </p>
        </div>
      </v-card>

      <!-- Footer con info -->
      <template #append>
        <v-card flat class="bg-grey-lighten-5">
          <v-card-text class="py-2 px-3 text-caption text-center">
            <v-icon size="12" class="mr-1">mdi-information</v-icon>
            Mostrando {{ filteredLogs.length }} de {{ logs.length }} logs
            <span v-if="logs.length >= maxLogs" class="text-warning">
              (límite alcanzado)
            </span>
          </v-card-text>
        </v-card>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// Tipos
interface LogEntry {
  timestamp: number
  type: 'log' | 'warn' | 'error'
  messages: unknown[]
  category?: string
}

interface Filter {
  value: string
  label: string
  icon: string
}

// Props
interface Props {
  maxLogs?: number
  autoOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxLogs: 100,
  autoOpen: false
})

// Estado
const isOpen = ref(props.autoOpen)
const logs = ref<LogEntry[]>([])
const activeFilter = ref<string>('all')

// Constantes
const scrollHeight = computed(() => {
  // Altura dinámica: viewport - header - filtros - footer
  return 'calc(100vh - 180px)'
})

const filters: Filter[] = [
  { value: 'all', label: 'Todos', icon: '📋' },
  { value: 'lock', label: 'Bloqueo', icon: '🔒' },
  { value: 'brightness', label: 'Brillo', icon: '🔆' },
  { value: 'error', label: 'Errores', icon: '❌' },
  { value: 'warn', label: 'Warnings', icon: '⚠️' }
]

// Computed
const filteredLogs = computed(() => {
  if (activeFilter.value === 'all') return logs.value

  return logs.value.filter(log => {
    if (activeFilter.value === 'error') return log.type === 'error'
    if (activeFilter.value === 'warn') return log.type === 'warn'
    
    // Filtrar por categoría (emoji en el mensaje)
    const firstMessage = String(log.messages[0] || '')
    if (activeFilter.value === 'lock') return firstMessage.includes('🔒')
    if (activeFilter.value === 'brightness') return firstMessage.includes('🔆')
    
    return true
  })
})

// Referencias originales de console
let originalConsole: {
  log: typeof console.log
  warn: typeof console.warn
  error: typeof console.error
} | null = null

// Funciones
const togglePanel = (): void => {
  isOpen.value = !isOpen.value
}

const clearLogs = (): void => {
  logs.value = []
}

const getFilterCount = (filterValue: string): number => {
  if (filterValue === 'all') return logs.value.length
  
  return logs.value.filter(log => {
    if (filterValue === 'error') return log.type === 'error'
    if (filterValue === 'warn') return log.type === 'warn'
    
    const firstMessage = String(log.messages[0] || '')
    if (filterValue === 'lock') return firstMessage.includes('🔒')
    if (filterValue === 'brightness') return firstMessage.includes('🔆')
    
    return false
  }).length
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${time}.${ms}`
}

const formatMessage = (msg: unknown): string => {
  if (typeof msg === 'string') return msg
  if (typeof msg === 'number' || typeof msg === 'boolean') return String(msg)
  if (msg === null) return 'null'
  if (msg === undefined) return 'undefined'
  
  try {
    return JSON.stringify(msg, null, 2)
  } catch {
    return String(msg)
  }
}

const getTypeColor = (type: LogEntry['type']): string => {
  switch (type) {
    case 'error': return 'error'
    case 'warn': return 'warning'
    default: return 'info'
  }
}

const getTypeIcon = (type: LogEntry['type']): string => {
  switch (type) {
    case 'error': return 'mdi-alert-circle'
    case 'warn': return 'mdi-alert'
    default: return 'mdi-information'
  }
}

const addLog = (type: LogEntry['type'], ...messages: unknown[]): void => {
  const entry: LogEntry = {
    timestamp: Date.now(),
    type,
    messages
  }

  logs.value.push(entry)

  // Limitar cantidad de logs
  if (logs.value.length > props.maxLogs) {
    logs.value.shift()
  }

  // Auto-scroll al final
  nextTick(() => {
    // El virtual-scroll maneja el scroll automáticamente
  })
}

// Interceptar console methods
const interceptConsole = (): void => {
  if (typeof window === 'undefined') return

  // Guardar referencias originales
  originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  }

  // Monkey-patch console.log
  console.log = (...args: unknown[]) => {
    addLog('log', ...args)
    originalConsole!.log(...args) // Mantener comportamiento original
  }

  // Monkey-patch console.warn
  console.warn = (...args: unknown[]) => {
    addLog('warn', ...args)
    originalConsole!.warn(...args)
  }

  // Monkey-patch console.error
  console.error = (...args: unknown[]) => {
    addLog('error', ...args)
    originalConsole!.error(...args)
  }
}

// Restaurar console original
const restoreConsole = (): void => {
  if (originalConsole) {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    originalConsole = null
  }
}

// Lifecycle
onMounted(() => {
  interceptConsole()
})

onUnmounted(() => {
  restoreConsole()
})
</script>

<style scoped>
.debug-console-wrapper {
  position: relative;
  z-index: 2000; /* Por encima de modales */
}

/* FAB flotante */
.debug-fab {
  position: fixed;
  bottom: 100px;
  right: 16px;
  z-index: 2001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.debug-fab:hover {
  transform: scale(1.05);
}

/* Drawer */
.debug-drawer {
  z-index: 2002 !important;
}

/* Logs container */
.logs-container {
  height: 100%;
  overflow: hidden;
}

/* Log items */
.log-item {
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease;
}

.log-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.log-item--log {
  border-left-color: rgb(var(--v-theme-info));
}

.log-item--warn {
  border-left-color: rgb(var(--v-theme-warning));
  background-color: rgba(var(--v-theme-warning), 0.05);
}

.log-item--error {
  border-left-color: rgb(var(--v-theme-error));
  background-color: rgba(var(--v-theme-error), 0.05);
}

/* Log message */
.log-message {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
}

.log-line {
  margin-bottom: 2px;
}

.log-timestamp {
  font-family: 'Courier New', monospace;
  min-width: 90px;
  flex-shrink: 0;
}

/* Utilidades */
.gap-2 {
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 600px) {
  .debug-fab {
    bottom: 80px;
    right: 12px;
  }
}
</style>
