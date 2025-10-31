<template>
  <v-card
    variant="outlined"
    class="vehiculo-card mb-3"
    hover
  >
    <v-card-text class="pa-3">
      <div class="vehiculo-header">
        <div class="vehiculo-content">
          <v-avatar :color="getVehicleColor(vehiculo.tipo)" size="40" class="vehiculo-avatar">
            <v-icon size="20" color="white">{{ getVehicleIcon(vehiculo.tipo) }}</v-icon>
          </v-avatar>
          <div class="vehiculo-info">
            <div class="vehiculo-name">
              {{ vehiculo.tipo }} - {{ vehiculo.matricula }}
            </div>
            <div class="vehiculo-details">
              <span class="detail-item">
                <span class="detail-label">Conductor:</span>
                <span class="detail-value">{{ vehiculo.conductor }}</span>
              </span>
              <span class="detail-separator">|</span>
              <span class="detail-item">
                <span class="detail-label">Ingreso:</span>
                <span class="detail-value">{{ formatearHoraCorta(vehiculo.ingresoTimestamp) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useDataListLogic } from '@/composables/useDataListLogic'

interface VehiculoModalData {
  id: string
  tipo: string
  matricula: string
  conductor: string
  ingresoTimestamp: Date
}

interface Props {
  vehiculo: VehiculoModalData
}

defineProps<Props>()

const { 
  formatearHoraCorta,
  getVehicleIcon,
  getVehicleColor
} = useDataListLogic()
</script>

<style scoped>
/* Cards de vehículos */
.vehiculo-card {
  transition: all 0.2s;
  border-color: rgba(0, 0, 0, 0.12);
}

.vehiculo-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vehiculo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.vehiculo-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.vehiculo-avatar {
  flex-shrink: 0;
}

.vehiculo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.vehiculo-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.vehiculo-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  flex-wrap: nowrap;
  overflow: hidden;
}

.detail-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
}

.detail-label {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.detail-value {
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.85);
  white-space: nowrap;
}

.detail-separator {
  color: rgba(var(--v-theme-on-surface), 0.25);
  font-weight: 300;
}
</style>
