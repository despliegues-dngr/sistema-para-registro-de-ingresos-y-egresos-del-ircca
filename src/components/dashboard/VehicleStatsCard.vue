<template>
  <v-card class="vehicle-stats-card h-100" elevation="2">
    <v-card-title class="text-h6 pb-3 px-6 pt-6">
      <v-icon class="mr-3" color="accent">mdi-car-multiple</v-icon>
      Vehículos en el Predio
    </v-card-title>

    <v-card-text class="px-6 pb-6">
      <v-row>
        <!-- Autos -->
        <v-col cols="6" sm="3" class="mb-4">
          <div 
            class="vehicle-item clickable-vehicle" 
            @click="handleVehicleClick('Auto')"
            role="button"
            tabindex="0"
            @keyup.enter="handleVehicleClick('Auto')"
          >
            <div class="d-flex align-center">
              <v-avatar size="48" color="primary" class="text-white mr-4">
                <v-icon size="24">mdi-car</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-h5 font-weight-bold text-primary mb-0">
                  {{ vehicleData.autos }}
                </div>
                <div class="text-body-2 text-grey-darken-1 font-weight-medium">Autos</div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Motos -->
        <v-col cols="6" sm="3" class="mb-4">
          <div 
            class="vehicle-item clickable-vehicle" 
            @click="handleVehicleClick('Moto')"
            role="button"
            tabindex="0"
            @keyup.enter="handleVehicleClick('Moto')"
          >
            <div class="d-flex align-center">
              <v-avatar size="48" color="accent" class="text-white mr-4">
                <v-icon size="24">mdi-motorbike</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-h5 font-weight-bold text-accent mb-0">
                  {{ vehicleData.motos }}
                </div>
                <div class="text-body-2 text-grey-darken-1 font-weight-medium">Motos</div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Camiones -->
        <v-col cols="6" sm="3" class="mb-4">
          <div 
            class="vehicle-item clickable-vehicle" 
            @click="handleVehicleClick('Camión')"
            role="button"
            tabindex="0"
            @keyup.enter="handleVehicleClick('Camión')"
          >
            <div class="d-flex align-center">
              <v-avatar size="48" color="warning" class="text-white mr-4">
                <v-icon size="24">mdi-truck</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-h5 font-weight-bold text-warning mb-0">
                  {{ vehicleData.camiones }}
                </div>
                <div class="text-body-2 text-grey-darken-1 font-weight-medium">Camiones</div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Buses -->
        <v-col cols="6" sm="3" class="mb-4">
          <div 
            class="vehicle-item clickable-vehicle" 
            @click="handleVehicleClick('Bus')"
            role="button"
            tabindex="0"
            @keyup.enter="handleVehicleClick('Bus')"
          >
            <div class="d-flex align-center">
              <v-avatar size="48" color="success" class="text-white mr-4">
                <v-icon size="24">mdi-bus</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-h5 font-weight-bold text-success mb-0">
                  {{ vehicleData.buses }}
                </div>
                <div class="text-body-2 text-grey-darken-1 font-weight-medium">Buses</div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Total -->
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-center align-center">
        <v-chip color="accent" variant="tonal" size="large" class="font-weight-bold">
          Total: {{ totalVehicles }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  vehicleData: {
    autos: number
    motos: number
    camiones: number
    buses: number
  }
}

const props = defineProps<Props>()

// Emits para comunicar clicks al componente padre
const emit = defineEmits<{
  'vehicle-click': [tipoVehiculo: string]
}>()

// Calcular total de vehículos
const totalVehicles = computed(() => {
  return (
    props.vehicleData.autos +
    props.vehicleData.motos +
    props.vehicleData.camiones +
    props.vehicleData.buses
  )
})

// Handler para clicks en vehículos
function handleVehicleClick(tipoVehiculo: string) {
  emit('vehicle-click', tipoVehiculo)
}
</script>

<style scoped>
/* Elegancia gubernamental para card de vehículos */
.vehicle-stats-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.vehicle-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.h-100 {
  height: 100%;
}

.vehicle-item {
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.vehicle-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Estilos para vehículos clickeables */
.clickable-vehicle {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-vehicle:hover {
  background-color: rgba(0, 0, 0, 0.06);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.clickable-vehicle:focus {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}

.click-indicator {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.clickable-vehicle:hover .click-indicator {
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .vehicle-item {
    padding: 0.75rem;
  }

  .v-avatar {
    width: 42px;
    height: 42px;
    margin-right: 0.75rem;
  }

  .text-h5 {
    font-size: 1.3rem;
  }
}
</style>
