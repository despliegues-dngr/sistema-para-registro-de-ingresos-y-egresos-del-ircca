<template>
  <v-card class="people-stats-card h-100" elevation="2">
    <v-card-title class="text-h6 pb-3 px-6 pt-6">
      <v-icon class="mr-3" color="primary">mdi-account-group</v-icon>
      Control de Personas
    </v-card-title>
    
    <v-card-text class="px-6 pb-6">
      <!-- Layout de dos columnas -->
      <v-row class="h-100">
        <!-- Primera columna: Personas Dentro (prominente) -->
        <v-col cols="12" sm="6" class="d-flex align-center justify-center">
          <div class="current-status text-center">
            <v-avatar size="72" color="primary" class="text-white mb-3">
              <v-icon size="36">mdi-account-multiple</v-icon>
            </v-avatar>
            <div class="text-h2 font-weight-bold text-primary mb-1">{{ peopleData.personasDentro }}</div>
            <div class="text-h6 text-grey-darken-1 font-weight-medium">Personas Dentro</div>
          </div>
        </v-col>

        <!-- Segunda columna: Actividad del día (dividida en dos filas) -->
        <v-col cols="12" sm="6" class="d-flex flex-column justify-center">
          <div class="daily-activity">
            <!-- Ingresos Hoy -->
            <div class="activity-item mb-4">
              <div class="d-flex align-center">
                <v-avatar size="48" color="success" class="text-white mr-4">
                  <v-icon size="24">mdi-login</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold text-success mb-0">{{ peopleData.ingresosHoy }}</div>
                  <div class="text-body-2 text-grey-darken-1 font-weight-medium">Ingresos Hoy</div>
                </div>
              </div>
            </div>

            <!-- Salidas Hoy -->
            <div class="activity-item">
              <div class="d-flex align-center">
                <v-avatar size="48" color="warning" class="text-white mr-4">
                  <v-icon size="24">mdi-logout</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold text-warning mb-0">{{ peopleData.salidasHoy }}</div>
                  <div class="text-body-2 text-grey-darken-1 font-weight-medium">Salidas Hoy</div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  peopleData: {
    personasDentro: number
    ingresosHoy: number
    salidasHoy: number
  }
}

defineProps<Props>()
</script>

<style scoped>
/* Elegancia gubernamental para card de personas */
.people-stats-card {
  border-radius: 12px !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.people-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.h-100 {
  height: 100%;
}

.current-status {
  padding: 1.5rem;
}

.daily-activity {
  padding: 1rem;
}

.activity-item {
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.activity-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .text-h3 {
    font-size: 2rem !important;
  }
  
  .current-status {
    padding: 1rem;
  }
  
  .v-avatar {
    margin-right: 0.5rem !important;
  }
}
</style>
