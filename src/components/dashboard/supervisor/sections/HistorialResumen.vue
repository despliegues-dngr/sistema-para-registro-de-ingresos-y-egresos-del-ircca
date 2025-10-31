<template>
  <v-card variant="tonal" color="primary" class="mb-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <div class="text-h6 mb-2">
            {{ historial.persona.nombre }} {{ historial.persona.apellido }}
          </div>
          <div class="text-body-2">
            <strong>C.I:</strong> {{ formatCedula(historial.persona.cedula) }}
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <v-row dense>
            <v-col cols="6">
              <div class="text-caption text-success">Ingresos</div>
              <div class="text-h5 font-weight-bold text-success">{{ historial.resumen.totalIngresos }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-error">Salidas</div>
              <div class="text-h5 font-weight-bold text-error">{{ historial.resumen.totalSalidas }}</div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-divider class="my-3" />
      <div class="text-caption text-grey-darken-1">
        Período: {{ historial.resumen.periodoDesde }} - {{ historial.resumen.periodoHasta }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { HistorialCompleto } from '@/composables/usePersonHistory'
import { useCedulaFormat } from '@/composables/useCedulaFormat'

defineProps<{
  historial: HistorialCompleto
}>()

const { formatCedula } = useCedulaFormat()
</script>
