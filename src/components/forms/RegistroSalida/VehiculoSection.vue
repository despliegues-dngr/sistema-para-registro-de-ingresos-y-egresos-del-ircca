<template>
  <div class="vehiculo-section">
    <!-- Vista Previa (Modo Lectura) - Formato Texto Limpio -->
    <div v-if="!modoEdicion && infoVehiculo" class="mb-4">
      <v-divider class="mb-3" />
      <div class="info-row">
        <span class="info-label">🚗 Vehículo:</span>
        <span class="info-value">{{ infoVehiculo.tipo }} - {{ infoVehiculo.matricula }}</span>
      </div>
    </div>

    <!-- Modo Edición -->
    <div v-if="modoEdicion" class="mb-4">
      <v-divider class="mb-3" />
      <div class="edit-section-title mb-3">
        🚗 Vehículo:
      </div>
      
      <!-- Checkbox simple -->
      <div class="mb-3">
        <v-checkbox
          :model-value="conVehiculo"
          @update:model-value="(val) => $emit('update:conVehiculo', !!val)"
          color="primary"
          density="compact"
          hide-details
        >
          <template #label>
            <span v-if="infoVehiculoOriginal">
              Sale con {{ infoVehiculoOriginal.tipo }} - {{ infoVehiculoOriginal.matricula }}
            </span>
            <span v-else>
              Vincular vehículo (ingresó sin vehículo)
            </span>
          </template>
        </v-checkbox>
      </div>
      
      <!-- Campos editables (más compactos) -->
      <div v-if="conVehiculo" class="ml-8">
        <v-row dense>
          <v-col cols="6">
            <v-select
              :model-value="tipoVehiculo"
              @update:model-value="$emit('update:tipoVehiculo', $event)"
              label="Tipo"
              :items="tiposVehiculo"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              :model-value="matricula"
              @update:model-value="$emit('update:matricula', $event)"
              label="Matrícula"
              variant="outlined"
              density="compact"
              hide-details
              placeholder="ABC1234"
            />
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DatosVehiculo {
  tipo: string
  matricula: string
}

interface Props {
  modoEdicion: boolean
  infoVehiculo: DatosVehiculo | null
  infoVehiculoOriginal: DatosVehiculo | null
  conVehiculo: boolean
  tipoVehiculo: string
  matricula: string
}

defineProps<Props>()

defineEmits<{
  'update:conVehiculo': [value: boolean]
  'update:tipoVehiculo': [value: string]
  'update:matricula': [value: string]
}>()

const tiposVehiculo = ['Auto', 'Moto', 'Camión', 'Bus']
</script>

<style scoped>
.vehiculo-section {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
}

.info-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  min-width: 120px;
}

.info-value {
  color: rgb(var(--v-theme-on-surface));
}

.edit-section-title {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.9rem;
}
</style>
