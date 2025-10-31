<template>
  <v-card variant="outlined">
    <v-card-title class="text-subtitle-1 d-flex align-center justify-space-between">
      <span>
        <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
        Detalle de Registros
      </span>
      <v-btn
        color="success"
        variant="text"
        size="small"
        @click="$emit('exportar')"
      >
        <v-icon class="mr-1">mdi-file-excel</v-icon>
        Exportar CSV
      </v-btn>
    </v-card-title>

    <!-- Información de la Persona - Formato Texto Plano -->
    <v-card-text class="py-3 px-6">
      <v-row dense class="info-summary">
        <v-col cols="12" md="4">
          <div class="info-item">
            <span class="info-label">Persona:</span>
            <span class="info-value">{{ historial.persona.nombre }} {{ historial.persona.apellido }}</span>
          </div>
        </v-col>
        <v-col cols="6" md="2">
          <div class="info-item">
            <span class="info-label">C.I:</span>
            <span class="info-value">{{ formatCedula(historial.persona.cedula) }}</span>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="d-flex align-center" style="gap: 2rem;">
            <div class="info-item">
              <span class="info-label text-success">Ingresos:</span>
              <span class="info-value text-success font-weight-bold">{{ historial.resumen.totalIngresos }}</span>
            </div>
            <div class="info-item">
              <span class="info-label text-error">Salidas:</span>
              <span class="info-value text-error font-weight-bold">{{ historial.resumen.totalSalidas }}</span>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="2">
          <div class="info-item">
            <span class="info-label">Período:</span>
            <span class="info-value text-caption">{{ historial.resumen.periodoDesde }} - {{ historial.resumen.periodoHasta }}</span>
          </div>
        </v-col>
      </v-row>
      <v-divider class="mt-3" />
    </v-card-text>

    <v-data-table
      :headers="headers"
      :items="registros"
      :items-per-page="10"
      :items-per-page-options="[10, 25, 50, 100]"
      class="elevation-0"
      item-value="id"
      items-per-page-text="Elementos por página:"
      page-text="{0}-{1} de {2}"
      no-data-text="No hay registros disponibles"
    >
      <!-- Columna Tipo con Badge -->
      <!-- eslint-disable-next-line vue/valid-v-slot -- Vuetify 3 requires #item.xxx syntax for v-data-table slots -->
      <template #item.tipo="{ item }">
        <span :class="item.tipo === 'ingreso' ? 'text-success' : 'text-error'">
          {{ item.tipo === 'ingreso' ? 'Ingreso' : 'Salida' }}
        </span>
      </template>

      <!-- Columna Destino -->
      <!-- eslint-disable-next-line vue/valid-v-slot -- Vuetify 3 requires #item.xxx syntax for v-data-table slots -->
      <template #item.destino="{ item }">
        <span v-if="item.destino">{{ item.destino }}</span>
        <span v-else class="text-grey">-</span>
      </template>

      <!-- Columna Tipo Vehículo -->
      <!-- eslint-disable-next-line vue/valid-v-slot -- Vuetify 3 requires #item.xxx syntax for v-data-table slots -->
      <template #item.tipoVehiculo="{ item }">
        <div v-if="item.vehiculo?.tipo" class="d-flex align-center">
          <v-icon :color="getVehicleColor(item.vehiculo.tipo)" size="small" class="mr-1">
            {{ getVehicleIcon(item.vehiculo.tipo) }}
          </v-icon>
          <span>{{ item.vehiculo.tipo }}</span>
        </div>
        <span v-else class="text-grey">-</span>
      </template>

      <!-- Columna Matrícula -->
      <!-- eslint-disable-next-line vue/valid-v-slot -- Vuetify 3 requires #item.xxx syntax for v-data-table slots -->
      <template #item.matricula="{ item }">
        <span v-if="item.vehiculo?.matricula" class="font-weight-medium">{{ item.vehiculo.matricula }}</span>
        <span v-else class="text-grey">-</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type { RegistroHistorial, HistorialCompleto } from '@/composables/usePersonHistory'
import { useCedulaFormat } from '@/composables/useCedulaFormat'

defineProps<{
  registros: RegistroHistorial[]
  historial: HistorialCompleto
}>()

defineEmits<{
  exportar: []
}>()

const { formatCedula } = useCedulaFormat()

const headers = [
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Hora', key: 'hora', sortable: true },
  { title: 'Tipo', key: 'tipo', sortable: true },
  { title: 'Destino', key: 'destino', sortable: false },
  { title: 'Vehículo', key: 'tipoVehiculo', sortable: false },
  { title: 'Matrícula', key: 'matricula', sortable: false }
]

// Funciones auxiliares para iconos y colores de vehículos
const vehicleIconMap = new Map<string, string>([
  ['Auto', 'mdi-car'],
  ['Moto', 'mdi-motorbike'],
  ['Camión', 'mdi-truck'],
  ['Camion', 'mdi-truck'],
  ['Bus', 'mdi-bus']
])

const vehicleColorMap = new Map<string, string>([
  ['Auto', 'primary'],
  ['Moto', 'accent'],
  ['Camión', 'warning'],
  ['Camion', 'warning'],
  ['Bus', 'success']
])

function getVehicleIcon(tipo: string): string {
  return vehicleIconMap.get(tipo) || 'mdi-car'
}

function getVehicleColor(tipo: string): string {
  return vehicleColorMap.get(tipo) || 'primary'
}
</script>

<style scoped>
/* Información de resumen */
.info-summary {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 12px;
}

.info-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
  min-width: fit-content;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}
</style>
