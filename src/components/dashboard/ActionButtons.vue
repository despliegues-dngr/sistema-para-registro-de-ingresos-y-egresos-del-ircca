<template>
  <v-card class="action-buttons-card mb-8" elevation="2">
    <v-card-title class="text-h6 pb-3 px-6 pt-6">
      <v-icon class="mr-3">mdi-lightning-bolt</v-icon>
      Acciones Rápidas
    </v-card-title>
    
    <v-card-text class="px-6 pb-6">
      <v-row class="action-row">
        <!-- Botón Registrar Ingreso -->
        <v-col cols="12" sm="6" class="mb-3 mb-sm-0">
          <v-tooltip text="Los datos se guardan automáticamente" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                color="primary"
                size="x-large"
                variant="elevated"
                block
                class="action-btn py-6"
                v-bind="props"
                @click="$emit('registro-ingreso')"
              >
                <div class="d-flex align-center">
                  <v-icon class="mr-4" size="32">mdi-account-plus</v-icon>
                  <div class="d-flex flex-column align-start">
                    <span class="text-h6 font-weight-bold">Registrar Ingreso</span>
                    <span class="text-body-2 opacity-90">Nueva persona o vehículo</span>
                  </div>
                </div>
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>

        <!-- Botón Registrar Salida -->
        <v-col cols="12" sm="6">
          <v-tooltip text="Búsqueda rápida por cédula" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                color="warning"
                size="x-large"
                variant="elevated" 
                block
                class="action-btn py-6"
                v-bind="props"
                @click="$emit('registro-salida')"
              >
                <div class="d-flex align-center">
                  <v-icon class="mr-4" size="32">mdi-account-minus</v-icon>
                  <div class="d-flex flex-column align-start">
                    <span class="text-h6 font-weight-bold">Registrar Salida</span>
                    <span class="text-body-2 opacity-90">Buscar y registrar salida</span>
                  </div>
                </div>
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
// Definir eventos que emite este componente
defineEmits<{
  'registro-ingreso': []
  'registro-salida': []
}>()
</script>

<style scoped>
/* Elegancia gubernamental para botones de acción */
.action-buttons-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.action-btn {
  /* Altura generosa para botones principales */
  min-height: 100px;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  /* Efecto hover elegante */
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.action-btn .v-icon {
  /* Iconos más prominentes */
  opacity: 0.95;
}

.info-alert {
  /* Alert con bordes más suaves */
  border-radius: 12px;
  border: 1px solid rgba(33, 150, 243, 0.12);
}

.opacity-90 {
  opacity: 0.9;
}

/* Mejorar spacing en tablet y mobile */
@media (max-width: 960px) {
  .action-btn {
    min-height: 90px;
    font-size: 0.95rem;
  }
  
  .action-btn .v-icon {
    margin-right: 0.75rem;
    font-size: 28px;
  }
}

/* Layout horizontal en tablets y desktop */
@media (min-width: 600px) {
  .action-row .v-col {
    display: flex;
    align-items: stretch;
  }
}

@media (max-width: 600px) {
  .action-btn {
    min-height: 80px;
    padding: 1rem;
  }
  
  .action-btn .v-icon {
    margin-right: 0.5rem;
    font-size: 24px;
  }
}
</style>
