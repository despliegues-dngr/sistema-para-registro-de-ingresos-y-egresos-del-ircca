<template>
  <v-dialog
    v-model="localValue"
    max-width="700"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="white" size="28" class="mr-3">mdi-file-document-outline</v-icon>
            <div>
              <h3 class="text-h6 text-white mb-0">Detalle de Evento de Auditoría</h3>
              <p class="text-caption text-blue-lighten-4 mb-0">
                Información completa del evento
              </p>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            color="white"
            @click="cerrar"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <!-- Contenido -->
      <v-card-text v-if="evento" class="pa-6">
        <!-- ID del Evento -->
        <div class="detail-section mb-4">
          <div class="detail-label">ID del Evento</div>
          <div class="detail-value font-mono">
            {{ evento.id }}
            <v-btn
              icon
              size="x-small"
              variant="text"
              @click="copiarAlPortapapeles(evento.id)"
            >
              <v-icon size="16">mdi-content-copy</v-icon>
              <v-tooltip activator="parent" location="top">
                Copiar ID
              </v-tooltip>
            </v-btn>
          </div>
        </div>

        <v-divider class="mb-4" />

        <!-- Información temporal -->
        <div class="detail-section mb-4">
          <div class="detail-label">
            <v-icon size="20" class="mr-2">mdi-calendar-clock</v-icon>
            Fecha y Hora
          </div>
          <div class="detail-value">
            {{ formatTimestampCompleto(evento.timestamp) }}
          </div>
        </div>

        <v-divider class="mb-4" />

        <!-- Información del usuario -->
        <div class="detail-section mb-4">
          <div class="detail-label">
            <v-icon size="20" class="mr-2">mdi-account</v-icon>
            Usuario
          </div>
          <div class="detail-value">
            <div class="font-weight-medium">{{ evento.username }}</div>
            <div class="text-caption text-grey">ID: {{ evento.userId }}</div>
            <v-chip
              v-if="evento.details.role"
              size="small"
              class="mt-2"
              :color="getRoleColor(evento.details.role as string)"
            >
              {{ getRoleName(evento.details.role as string) }}
            </v-chip>
          </div>
        </div>

        <v-divider class="mb-4" />

        <!-- Tipo de evento y acción -->
        <v-row class="mb-4">
          <v-col cols="6">
            <div class="detail-section">
              <div class="detail-label">
                <v-icon size="20" class="mr-2">mdi-tag</v-icon>
                Tipo de Evento
              </div>
              <div class="detail-value">
                <v-chip
                  :color="getTipoEventoColor(evento.eventType)"
                  variant="tonal"
                >
                  {{ getTipoEventoTexto(evento.eventType) }}
                </v-chip>
              </div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="detail-section">
              <div class="detail-label">
                <v-icon size="20" class="mr-2">mdi-lightning-bolt</v-icon>
                Acción
              </div>
              <div class="detail-value">
                <v-chip
                  :color="getEventoColor(evento.action)"
                  variant="tonal"
                >
                  <v-icon size="16" class="mr-1">
                    {{ getEventoIcon(evento.action) }}
                  </v-icon>
                  {{ getEventoTexto(evento.action) }}
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-divider class="mb-4" />

        <!-- Detalles adicionales -->
        <div class="detail-section mb-4">
          <div class="detail-label">
            <v-icon size="20" class="mr-2">mdi-information</v-icon>
            Detalles Adicionales
          </div>
          <div class="detail-value">
            <v-list density="compact" class="bg-grey-lighten-5 rounded">
              <v-list-item
                v-for="(value, key) in detallesFiltrados"
                :key="key"
                class="px-4"
              >
                <template #prepend>
                  <v-icon size="16" class="mr-2">mdi-circle-small</v-icon>
                </template>
                <v-list-item-title class="text-caption">
                  <span class="font-weight-medium">{{ formatKey(key) }}:</span>
                  <span class="ml-2">{{ formatValue(value) }}</span>
                </v-list-item-title>
              </v-list-item>
              
              <!-- Si no hay detalles -->
              <v-list-item v-if="Object.keys(detallesFiltrados).length === 0" class="px-4">
                <v-list-item-title class="text-caption text-grey">
                  No hay detalles adicionales
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </div>

        <v-divider class="mb-4" />

        <!-- Información de sesión -->
        <div class="detail-section mb-4">
          <div class="detail-label">
            <v-icon size="20" class="mr-2">mdi-shield-lock</v-icon>
            Información de Sesión
          </div>
          <div class="detail-value">
            <div class="mb-2">
              <span class="text-caption text-grey">Session ID:</span>
              <span class="font-mono text-caption ml-2">{{ evento.sessionId }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copiarAlPortapapeles(evento.sessionId)"
              >
                <v-icon size="16">mdi-content-copy</v-icon>
              </v-btn>
            </div>
            <div v-if="evento.ipAddress" class="mb-2">
              <span class="text-caption text-grey">IP Address:</span>
              <span class="font-mono text-caption ml-2">{{ evento.ipAddress }}</span>
            </div>
            <div v-if="evento.userAgent" class="mb-2">
              <span class="text-caption text-grey">User Agent:</span>
              <span class="font-mono text-caption ml-2">{{ evento.userAgent }}</span>
            </div>
            <div v-if="!evento.ipAddress && !evento.userAgent">
              <span class="text-caption text-grey">Acceso local (sin información de red)</span>
            </div>
          </div>
        </div>

        <!-- Datos técnicos (JSON raw) -->
        <v-expansion-panels class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-code-json</v-icon>
              Ver JSON Completo
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <pre class="json-viewer">{{ JSON.stringify(evento, null, 2) }}</pre>
              <v-btn
                color="primary"
                size="small"
                variant="outlined"
                class="mt-2"
                @click="copiarAlPortapapeles(JSON.stringify(evento, null, 2))"
              >
                <v-icon class="mr-2">mdi-content-copy</v-icon>
                Copiar JSON
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <!-- Acciones -->
      <v-card-actions v-if="evento" class="pa-4">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="cerrar"
        >
          Cerrar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-download"
          @click="exportarEvento"
        >
          Exportar Evento
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuditFilters } from '@/composables/useAuditFilters'
import type { AuditEvent } from '@/stores/audit'

// Props
const props = defineProps<{
  modelValue: boolean
  evento: AuditEvent | null
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

// Local value para v-model del dialog
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
  getEventoColor,
  getEventoIcon,
  getEventoTexto,
  getRoleName,
  getTipoEventoTexto
} = useAuditFilters()

// Detalles filtrados (excluir campos que ya se muestran)
const detallesFiltrados = computed(() => {
  if (!props.evento) return {}
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { role, ...resto } = props.evento.details
  return resto
})

// Helpers
function formatTimestampCompleto(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('es-UY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getTipoEventoColor(eventType: AuditEvent['eventType']): string {
  const colores: Record<string, string> = {
    'auth': 'primary',
    'user_management': 'info',
    'data_operation': 'success',
    'backup': 'warning',
    'system_error': 'error'
  }
  // eslint-disable-next-line security/detect-object-injection
  return colores[eventType] || 'default'
}

function getRoleColor(role: string): string {
  const colores: Record<string, string> = {
    'admin': 'error',
    'supervisor': 'warning',
    'operador': 'success'
  }
  // eslint-disable-next-line security/detect-object-injection
  return colores[role] || 'default'
}

function formatKey(key: string | number): string {
  // Convertir camelCase a Title Case
  const keyStr = String(key)
  return keyStr
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return String(value)
}

async function copiarAlPortapapeles(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    // TODO: Mostrar notificación de éxito
  } catch {
    // Error silencioso
  }
}

function exportarEvento() {
  if (!props.evento) return
  
  const dataStr = JSON.stringify(props.evento, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `evento-auditoria-${props.evento.id}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function cerrar() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.detail-section {
  margin-bottom: 1rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.detail-value {
  font-size: 0.9375rem;
  color: rgba(0, 0, 0, 0.87);
}

.font-mono {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 6px;
  border-radius: 4px;
}

.json-viewer {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.875rem;
  max-height: 400px;
}
</style>
