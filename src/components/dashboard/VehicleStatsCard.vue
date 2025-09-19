<template>
  <v-card class="vehicle-stats-card h-100" elevation="2">
    <v-card-title class="text-h6 pb-3 px-6 pt-6">
      <v-icon class="mr-3" color="accent">mdi-car-multiple</v-icon>
      Vehículos en el Predio
    </v-card-title>
    
    <v-card-text class="px-6 pb-6">
      <v-row>
        <!-- Automóviles -->
        <v-col cols="6" sm="3" class="mb-3">
          <div class="vehicle-category">
            <div class="d-flex align-center mb-2">
              <v-avatar size="40" color="primary" class="text-white mr-3">
                <v-icon size="20">mdi-car</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold text-primary mb-0">{{ vehicleData.automoviles }}</div>
                <div class="text-caption text-grey-darken-1">Automóviles</div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Motocicletas -->
        <v-col cols="6" sm="3" class="mb-3">
          <div class="vehicle-category">
            <div class="d-flex align-center mb-2">
              <v-avatar size="40" color="accent" class="text-white mr-3">
                <v-icon size="20">mdi-motorbike</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold text-accent mb-0">{{ vehicleData.motocicletas }}</div>
                <div class="text-caption text-grey-darken-1">Motocicletas</div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Camiones -->
        <v-col cols="6" sm="3" class="mb-3">
          <div class="vehicle-category">
            <div class="d-flex align-center mb-2">
              <v-avatar size="40" color="warning" class="text-white mr-3">
                <v-icon size="20">mdi-truck</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold text-warning mb-0">{{ vehicleData.camiones }}</div>
                <div class="text-caption text-grey-darken-1">Camiones</div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Buses -->
        <v-col cols="6" sm="3" class="mb-3">
          <div class="vehicle-category">
            <div class="d-flex align-center mb-2">
              <v-avatar size="40" color="success" class="text-white mr-3">
                <v-icon size="20">mdi-bus</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold text-success mb-0">{{ vehicleData.buses }}</div>
                <div class="text-caption text-grey-darken-1">Buses</div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Total -->
      <v-divider class="my-4"></v-divider>
      <div class="d-flex justify-center align-center">
        <v-chip
          color="accent"
          variant="tonal"
          size="large"
          class="font-weight-bold"
        >
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
    automoviles: number
    motocicletas: number
    camiones: number
    buses: number
  }
}

const props = defineProps<Props>()

// Calcular total de vehículos
const totalVehicles = computed(() => {
  return props.vehicleData.automoviles + 
         props.vehicleData.motocicletas + 
         props.vehicleData.camiones + 
         props.vehicleData.buses
})
</script>

<style scoped>
/* Elegancia gubernamental para card de vehículos */
.vehicle-stats-card {
  border-radius: 12px !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.vehicle-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.h-100 {
  height: 100%;
}

.vehicle-category {
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.vehicle-category:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-avatar {
    width: 36px !important;
    height: 36px !important;
    margin-right: 0.75rem !important;
  }
  
  .text-h5 {
    font-size: 1.3rem !important;
  }
}
</style>
