<template>
  <v-card elevation="2">
    <!-- Header -->
    <v-card-title class="d-flex align-center pa-4">
      <v-icon color="primary" class="mr-2">mdi-history</v-icon>
      <span class="text-h6">Consulta de Historial de Personas</span>
      <v-spacer />
      <v-chip color="info" size="small">
        <v-icon start size="small">mdi-shield-check</v-icon>
        Supervisor
      </v-chip>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4">
      <!-- Formulario de Búsqueda -->
      <!-- Fila 1: Documento -->
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            v-model="cedula"
            v-model:search="searchText"
            :items="sugerenciasFormateadas"
            :loading="buscandoCedula"
            item-title="displayText"
            item-value="searchText"
            label="Documento de la Persona"
            placeholder="Ej: 12345678"
            prepend-inner-icon="mdi-card-account-details"
            variant="outlined"
            density="comfortable"
            clearable
            no-filter
            :error-messages="errorMessage"
            @update:search="onSearchUpdate"
            @update:model-value="onCedulaSelect"
            @click:clear="onClear"
            @keyup.enter="buscarHistorial"
          >
            <!-- Template para controlar qué se muestra en el campo cerrado -->
            <template #selection="{ item }">
              <span v-if="item.raw && item.raw.persona" class="text-body-2">
                <v-icon size="16" color="primary" class="mr-1">mdi-account-circle</v-icon>
                {{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}
                <span class="text-caption text-medium-emphasis ml-2">
                  ({{ item.raw.persona.cedula }})
                </span>
              </span>
              <span v-else class="text-body-2">{{ item.value }}</span>
            </template>
            <!-- Template para items de la lista -->
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="item.raw.displayText"
                class="persona-item"
                rounded="lg"
                @click="console.log('Item seleccionado:', item)"
              >
                <template #prepend>
                  <v-avatar color="primary" size="48" class="elevation-2">
                    <v-icon color="white" size="24">mdi-account</v-icon>
                  </v-avatar>
                </template>
              </v-list-item>
            </template>
            <template #no-data>
              <v-list-item>
                <v-list-item-title class="text-center text-grey">
                  <v-icon size="small" class="mr-2">mdi-magnify</v-icon>
                  {{ searchText.length > 0 ? 'No se encontraron coincidencias' : 'Comienza a escribir...' }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>

      <!-- Fila 2: Fechas -->
      <v-row class="mt-2">
        <v-col cols="12" sm="6">
          <v-text-field
            ref="fechaDesdeInput"
            v-model="fechaDesde"
            label="Desde"
            type="date"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            append-inner-icon="mdi-calendar"
            @click:append-inner="abrirSelectorFecha('fechaDesdeInput')"
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            ref="fechaHastaInput"
            v-model="fechaHasta"
            label="Hasta"
            type="date"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            append-inner-icon="mdi-calendar"
            @click:append-inner="abrirSelectorFecha('fechaHastaInput')"
          />
        </v-col>
      </v-row>

      <!-- Botones -->
      <v-row class="mt-2">
        <v-col cols="12">
          <v-btn
            color="primary"
            size="large"
            :loading="isLoading"
            :disabled="!cedula || cedula.length !== 8"
            class="mr-2"
            @click="buscarHistorial"
          >
            <v-icon start>mdi-magnify</v-icon>
            Consultar Historial
          </v-btn>

          <v-btn
            v-if="tieneRegistros"
            color="secondary"
            size="large"
            variant="tonal"
            @click="limpiarBusqueda"
          >
            <v-icon start>mdi-refresh</v-icon>
            Nueva Consulta
          </v-btn>
        </v-col>
      </v-row>

      <!-- Sin Resultados -->
      <v-alert
        v-if="sinResultados"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        No se encontraron registros para el documento {{ cedula }}
      </v-alert>

      <!-- Resultados -->
      <div v-if="historial" class="mt-4">
        <HistorialResumen :historial="historial" />
        <HistorialTable :registros="historial.registros" @exportar="exportarHistorial" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, type ComponentPublicInstance } from 'vue'
import { usePersonHistory } from '@/composables/usePersonHistory'
import { usePersonaAutocomplete } from '@/composables/usePersonaAutocomplete'
import { useAuthStore } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import HistorialResumen from './sections/HistorialResumen.vue'
import HistorialTable from './sections/HistorialTable.vue'

// Composables
const personHistory = usePersonHistory()
const authStore = useAuthStore()
const auditStore = useAuditStore()

// Autocomplete de personas
const {
  searchText,
  sugerenciasFormateadas,
  buscandoCedula,
  onSearchUpdate
} = usePersonaAutocomplete()

// Estado
const cedula = ref('')
const fechaDesde = ref('')
const fechaHasta = ref('')
const errorMessage = ref('')
const sinResultados = ref(false)

// Refs para los inputs de fecha (componentes Vuetify)
const fechaDesdeInput = ref<ComponentPublicInstance | null>(null)
const fechaHastaInput = ref<ComponentPublicInstance | null>(null)

// Computed
const isLoading = computed(() => personHistory.isLoading.value)
const historial = computed(() => personHistory.historial.value)
const tieneRegistros = computed(() => personHistory.tieneRegistros.value)

/**
 * Busca el historial de la persona
 */
async function buscarHistorial() {
  if (!cedula.value || cedula.value.length !== 8) {
    errorMessage.value = 'Ingrese un documento válido de 8 dígitos'
    return
  }

  errorMessage.value = ''
  sinResultados.value = false

  // Convertir fechas si existen
  const desde = fechaDesde.value ? new Date(fechaDesde.value) : undefined
  const hasta = fechaHasta.value ? new Date(fechaHasta.value + 'T23:59:59') : undefined

  // Validar rango de fechas
  if (desde && hasta && desde > hasta) {
    errorMessage.value = 'La fecha "Desde" no puede ser mayor que "Hasta"'
    return
  }

  const resultado = await personHistory.buscarHistorial(cedula.value, desde, hasta)

  if (!resultado) {
    sinResultados.value = true
  } else {
    // Registrar consulta en auditoría
    registrarConsulta()
  }
}

/**
 * Exporta el historial a CSV
 */
function exportarHistorial() {
  if (historial.value) {
    personHistory.exportarCSV(historial.value)
    registrarExportacion()
  }
}

/**
 * Limpia la búsqueda
 */
function limpiarBusqueda() {
  cedula.value = ''
  searchText.value = ''
  fechaDesde.value = ''
  fechaHasta.value = ''
  errorMessage.value = ''
  sinResultados.value = false
  personHistory.limpiar()
}

/**
 * Maneja selección de cédula del autocomplete
 */
function onCedulaSelect(value: string | null) {
  cedula.value = value || ''
  errorMessage.value = ''
}

/**
 * Maneja el evento de limpiar del autocomplete (click en X)
 */
function onClear() {
  cedula.value = ''
  searchText.value = ''
  errorMessage.value = ''
}

/**
 * Abre el selector de fecha nativo al hacer click en el ícono de calendario
 */
function abrirSelectorFecha(refName: string) {
  const inputRef = refName === 'fechaDesdeInput' ? fechaDesdeInput.value : fechaHastaInput.value

  if (inputRef && inputRef.$el) {
    // Buscar el input nativo dentro del componente v-text-field
    const nativeInput = inputRef.$el.querySelector('input[type="date"]')

    if (nativeInput) {
      // Intentar abrir el selector de fecha usando showPicker() (API moderna)
      if (typeof nativeInput.showPicker === 'function') {
        try {
          nativeInput.showPicker()
          console.log('✅ Selector de fecha abierto con showPicker()')
        } catch (error) {
          console.warn('⚠️ Error al abrir selector con showPicker():', error)
          // Fallback: hacer focus y click
          nativeInput.focus()
          nativeInput.click()
        }
      } else {
        // Fallback para navegadores que no soportan showPicker()
        console.log('ℹ️ showPicker() no disponible, usando focus + click')
        nativeInput.focus()
        nativeInput.click()
      }
    }
  }
}

/**
 * Registra la consulta en logs de auditoría
 */
async function registrarConsulta() {
  try {
    if (!authStore.user) return

    await auditStore.logEvent({
      userId: authStore.user.id,
      username: authStore.user.username,
      eventType: 'data_operation',
      action: 'person_history_query',
      details: {
        cedulaConsultada: cedula.value.substring(0, 4) + '****',
        fechaDesde: fechaDesde.value || 'sin filtro',
        fechaHasta: fechaHasta.value || 'sin filtro',
        registrosEncontrados: historial.value?.resumen.totalRegistros || 0,
        role: authStore.user.role
      },
      sessionId: crypto.randomUUID()
    })
  } catch (error) {
    console.error('Error al registrar consulta en auditoría:', error)
  }
}

/**
 * Registra la exportación en logs de auditoría
 */
async function registrarExportacion() {
  try {
    if (!authStore.user) return

    await auditStore.logEvent({
      userId: authStore.user.id,
      username: authStore.user.username,
      eventType: 'data_operation',
      action: 'person_history_export',
      details: {
        cedulaConsultada: cedula.value.substring(0, 4) + '****',
        formato: 'CSV',
        registrosExportados: historial.value?.resumen.totalRegistros || 0,
        role: authStore.user.role
      },
      sessionId: crypto.randomUUID()
    })
  } catch (error) {
    console.error('Error al registrar exportación en auditoría:', error)
  }
}
</script>

<style scoped>
/* Estilos para items de la lista de personas */
.persona-item {
  margin: 4px 8px;
  transition: all 0.2s ease-in-out;
}

.persona-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  transform: translateX(4px);
}

.persona-item :deep(.v-list-item-title) {
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

.persona-item :deep(.v-avatar) {
  margin-right: 16px;
}

/* Ocultar completamente el ícono nativo ya que usamos JavaScript para abrir el selector */
:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  display: none;
  -webkit-appearance: none;
}

:deep(input[type="date"]::-webkit-inner-spin-button),
:deep(input[type="date"]::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
