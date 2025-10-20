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

    <v-data-table
      :headers="headers"
      :items="registros"
      :items-per-page="10"
      :items-per-page-options="[10, 25, 50, 100]"
      class="elevation-0"
      item-value="id"
    >
      <!-- Columna Tipo con Badge -->
      <template v-slot:[`item.tipo`]="{ item }">
        <v-chip
          :color="item.tipo === 'ingreso' ? 'success' : 'error'"
          size="small"
          variant="flat"
        >
          <v-icon start size="small">
            {{ item.tipo === 'ingreso' ? 'mdi-login' : 'mdi-logout' }}
          </v-icon>
          {{ item.tipo === 'ingreso' ? 'INGRESO' : 'SALIDA' }}
        </v-chip>
      </template>

      <!-- Columna Destino -->
      <template v-slot:[`item.destino`]="{ item }">
        <span v-if="item.destino">{{ item.destino }}</span>
        <span v-else class="text-grey">-</span>
      </template>

      <!-- Columna Vehículo -->
      <template v-slot:[`item.vehiculo`]="{ item }">
        <div v-if="item.vehiculo?.matricula">
          <div class="font-weight-medium">{{ item.vehiculo.matricula }}</div>
          <div class="text-caption text-grey">
            {{ item.vehiculo.marca }} {{ item.vehiculo.modelo }}
          </div>
        </div>
        <div v-else class="text-center text-grey">-</div>
      </template>

      <!-- Columna Operador -->
      <template v-slot:[`item.operadorId`]="{ item }">
        <v-chip size="x-small" variant="outlined">
          {{ item.operadorId }}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type { RegistroHistorial } from '@/composables/usePersonHistory'

defineProps<{
  registros: RegistroHistorial[]
}>()

defineEmits<{
  exportar: []
}>()

const headers = [
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Hora', key: 'hora', sortable: true },
  { title: 'Tipo', key: 'tipo', sortable: true },
  { title: 'Destino', key: 'destino', sortable: false },
  { title: 'Vehículo', key: 'vehiculo', sortable: false },
  { title: 'Operador', key: 'operadorId', sortable: false }
]
</script>
