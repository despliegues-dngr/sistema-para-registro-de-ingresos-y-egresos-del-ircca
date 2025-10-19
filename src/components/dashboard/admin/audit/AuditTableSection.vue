<template>
  <v-card elevation="2" class="mb-8">
    <v-card-title class="bg-primary pa-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="white" size="28" class="mr-3">mdi-shield-lock</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Registro Completo de Auditoría</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">
              Trazabilidad completa del sistema
            </p>
          </div>
        </div>
        
        <!-- Botón de exportación -->
        <v-btn
          color="white"
          variant="outlined"
          size="small"
          prepend-icon="mdi-file-delimited"
          @click="exportarCSV"
        >
          Exportar CSV
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Filtros avanzados (colapsables) -->
      <v-expansion-panels class="mb-4">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-filter</v-icon>
              <span>Filtros Avanzados</span>
              <v-chip
                v-if="filtrosActivos > 0"
                color="primary"
                size="small"
                class="ml-2"
              >
                {{ filtrosActivos }} activo{{ filtrosActivos > 1 ? 's' : '' }}
              </v-chip>
            </div>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text>
            <v-row>
              <!-- Rango de fechas -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="filtros.fechaInicio"
                  label="Fecha Inicio"
                  type="date"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="filtros.fechaFin"
                  label="Fecha Fin"
                  type="date"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>

              <!-- Tipo de evento -->
              <v-col cols="12" md="4">
                <v-select
                  v-model="filtros.eventType"
                  :items="tiposEvento"
                  label="Tipo de Evento"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>

              <!-- Usuario -->
              <v-col cols="12" md="4">
                <v-select
                  v-model="filtros.userId"
                  :items="usuariosDisponibles"
                  label="Usuario"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>

              <!-- Acción -->
              <v-col cols="12" md="4">
                <v-select
                  v-model="filtros.action"
                  :items="accionesDisponibles"
                  label="Acción Específica"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>

              <!-- Checkboxes -->
              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="filtros.soloCriticos"
                  label="Solo eventos críticos"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="filtros.soloErrores"
                  label="Solo errores"
                  density="compact"
                  hide-details
                />
              </v-col>

              <!-- Botones de acción -->
              <v-col cols="12" class="d-flex gap-2">
                <v-btn
                  color="primary"
                  @click="aplicarFiltrosClick"
                  prepend-icon="mdi-filter-check"
                >
                  Aplicar Filtros
                </v-btn>
                <v-btn
                  variant="outlined"
                  @click="limpiarFiltros"
                  prepend-icon="mdi-filter-remove"
                >
                  Limpiar
                </v-btn>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Búsqueda de texto -->
      <v-text-field
        v-model="busquedaTexto"
        prepend-inner-icon="mdi-magnify"
        label="Buscar en todos los campos..."
        placeholder="Usuario, acción, tipo de evento..."
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="mb-4"
      />

      <!-- Tabla de eventos -->
      <v-data-table
        :headers="headers"
        :items="eventosFiltrados"
        :items-per-page="25"
        :loading="auditStore.isLoading"
        class="elevation-1"
      >
        <!-- Timestamp -->
        <template v-slot:[`item.timestamp`]="{ item }">
          <div class="text-caption">
            {{ formatTimestamp(item.timestamp) }}
          </div>
        </template>

        <!-- Usuario -->
        <template v-slot:[`item.username`]="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ maskCedula(item.username) }}
              <v-icon size="12" color="info" class="ml-1">mdi-shield-lock</v-icon>
            </div>
            <div class="text-caption text-grey">
              {{ getRoleName(item.details.role as string) }}
            </div>
          </div>
        </template>

        <!-- Tipo de Evento -->
        <template v-slot:[`item.eventType`]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="getTipoEventoColor(item.eventType)"
          >
            {{ getTipoEventoTexto(item.eventType) }}
          </v-chip>
        </template>

        <!-- Acción -->
        <template v-slot:[`item.action`]="{ item }">
          <v-chip
            :color="getEventoColor(item.action)"
            size="small"
            variant="tonal"
          >
            <v-icon size="16" class="mr-1">
              {{ getEventoIcon(item.action) }}
            </v-icon>
            {{ getEventoTexto(item.action) }}
          </v-chip>
        </template>

        <!-- Detalles -->
        <template v-slot:[`item.details`]="{ item }">
          <v-btn
            size="small"
            variant="text"
            color="primary"
            @click="verDetalles(item)"
          >
            Ver detalles
            <v-icon class="ml-1" size="18">mdi-arrow-right</v-icon>
          </v-btn>
        </template>

        <!-- Footer personalizado -->
        <template #bottom>
          <div class="pa-4 text-center text-body-2 text-grey-darken-1">
            <span v-if="busquedaTexto.trim() || filtrosActivos > 0">
              Mostrando: {{ eventosFiltrados.length }} de {{ auditStore.auditLogs.length }} eventos
            </span>
            <span v-else>
              Total de eventos: {{ auditStore.auditLogs.length }}
            </span>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuditStore } from '@/stores/audit'
import { useAuditFilters } from '@/composables/useAuditFilters'
import { useAuditExport } from '@/composables/useAuditExport'
import type { AuditEvent } from '@/stores/audit'

// Emits
const emit = defineEmits<{
  'ver-detalles': [evento: AuditEvent]
}>()

const auditStore = useAuditStore()
const {
  filtros,
  busquedaTexto,
  aplicarFiltros,
  limpiarFiltros,
  formatTimestamp,
  getEventoColor,
  getEventoIcon,
  getEventoTexto,
  getRoleName,
  getTipoEventoTexto,
  maskCedula
} = useAuditFilters()

const { exportarCSV: exportCSV } = useAuditExport()

// Headers de la tabla
const headers = [
  { title: 'Fecha/Hora', key: 'timestamp', sortable: true, width: '180px' },
  { title: 'Usuario', key: 'username', sortable: true },
  { title: 'Tipo', key: 'eventType', sortable: true, width: '160px' },
  { title: 'Acción', key: 'action', sortable: true, width: '200px' },
  { title: 'Detalles', key: 'details', sortable: false, width: '140px', align: 'center' as const }
]

// Tipos de evento disponibles
const tiposEvento = [
  { title: 'Autenticación', value: 'auth' },
  { title: 'Gestión de Usuarios', value: 'user_management' },
  { title: 'Operación de Datos', value: 'data_operation' },
  { title: 'Respaldo', value: 'backup' },
  { title: 'Error del Sistema', value: 'system_error' }
]

// Usuarios disponibles
const usuariosDisponibles = computed(() => {
  const usuarios = new Set(auditStore.auditLogs.map(e => e.username))
  return Array.from(usuarios).map(u => ({ title: u, value: u }))
})

// Acciones disponibles
const accionesDisponibles = computed(() => {
  const acciones = new Set(auditStore.auditLogs.map(e => e.action))
  return Array.from(acciones).map(a => ({ title: a, value: a }))
})

// Contador de filtros activos
const filtrosActivos = computed(() => {
  let count = 0
  if (filtros.value.fechaInicio) count++
  if (filtros.value.fechaFin) count++
  if (filtros.value.eventType) count++
  if (filtros.value.userId) count++
  if (filtros.value.action) count++
  if (filtros.value.soloCriticos) count++
  if (filtros.value.soloErrores) count++
  return count
})

// Eventos filtrados
const eventosFiltrados = computed(() => {
  return aplicarFiltros(auditStore.auditLogs)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

// Helper para color de tipo de evento
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

// Handlers
function aplicarFiltrosClick() {
  // Los filtros se aplican automáticamente via computed
  // Este método puede usarse para analytics o feedback
}

function verDetalles(evento: AuditEvent) {
  emit('ver-detalles', evento)
}

function exportarCSV() {
  exportCSV(eventosFiltrados.value, 'registro-auditoria-ircca')
}
</script>

<style scoped>
/* Estilos heredados del sistema Vuetify */
</style>
