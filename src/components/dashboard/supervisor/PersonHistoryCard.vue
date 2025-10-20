<template>
  <v-card class="person-history-card" elevation="2">
    <v-card-title class="text-h6 pb-3 px-6 pt-6 d-flex align-center">
      <v-icon class="mr-3" color="primary">mdi-history</v-icon>
      Consulta de Historial de Personas
      <v-spacer />
      <v-chip color="info" size="small" variant="flat">
        <v-icon start>mdi-shield-check</v-icon>
        Supervisor
      </v-chip>
    </v-card-title>

    <v-card-text class="px-6 pb-6">
      <!-- Formulario de Búsqueda -->
      <v-row>
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="cedula"
            v-model:search="searchText"
            :items="sugerenciasFormateadas"
            :loading="buscandoCedula"
            item-title="displayText"
            item-value="searchText"
            label="Cédula de la Persona"
            placeholder="Comienza a escribir la cédula..."
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
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-avatar color="primary" size="32">
                    <v-icon size="18" color="white">mdi-account</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>
                  <span class="font-weight-medium">{{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}</span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  C.I: {{ item.raw.persona.cedula }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>
            <template #no-data>
              <v-list-item>
                <v-list-item-title class="text-grey">
                  {{ searchText.length > 0 ? 'No se encontraron coincidencias' : 'Comienza a escribir...' }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>

        <!-- Filtro de Fechas (misma línea) -->
        <v-col cols="12" md="6">
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="fechaDesde"
                label="Desde"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                clearable
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="fechaHasta"
                label="Hasta"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                clearable
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Botones de Acción -->
      <v-row>
        <v-col cols="12" class="d-flex gap-2">
          <v-btn
            color="primary"
            :loading="isLoading"
            :disabled="!cedula || cedula.length !== 8"
            @click="buscarHistorial"
          >
            <v-icon class="mr-2">mdi-magnify</v-icon>
            Consultar Historial
          </v-btn>

          <v-btn
            v-if="tieneRegistros"
            color="secondary"
            variant="outlined"
            @click="limpiarBusqueda"
          >
            <v-icon class="mr-2">mdi-refresh</v-icon>
            Limpiar
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
        <v-row align="center">
          <v-col class="grow">
            No se encontraron registros para la cédula {{ cedula }}
          </v-col>
        </v-row>
      </v-alert>

      <!-- Resultados -->
      <div v-if="historial" class="mt-6">
        <HistorialResumen :historial="historial" />
        <HistorialTable :registros="historial.registros" @exportar="exportarHistorial" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

// Computed
const isLoading = computed(() => personHistory.isLoading.value)
const historial = computed(() => personHistory.historial.value)
const tieneRegistros = computed(() => personHistory.tieneRegistros.value)

/**
 * Busca el historial de la persona
 */
async function buscarHistorial() {
  if (!cedula.value || cedula.value.length !== 8) {
    errorMessage.value = 'Ingrese una cédula válida de 8 dígitos'
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
.person-history-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.gap-2 {
  gap: 0.5rem;
}
</style>
