<template>
  <v-container fluid class="pa-6">
    <!-- Header de bienvenida con tiempo real -->
    <WelcomeHeader 
      @view-profile="handleViewProfile"
      @edit-profile="handleEditProfile" 
      @change-password="handleChangePassword"
      @logout="handleLogout"
    />

    <!-- Estadísticas principales -->
    <v-row class="mb-8">
      <!-- Card de Personas y Actividad - Primera -->
      <v-col cols="12" lg="4" class="mb-4 mb-lg-0">
        <PeopleStatsCard :people-data="peopleData" />
      </v-col>

      <!-- Card de Vehículos Detallada - Segunda -->
      <v-col cols="12" lg="8">
        <VehicleStatsCard :vehicle-data="vehicleData" />
      </v-col>
    </v-row>

    <!-- Botones de Acción Rápida -->
    <ActionButtons 
      @registro-ingreso="handleRegistroIngreso"
      @registro-salida="handleRegistroSalida"
    />

  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Componentes del Dashboard - Todos necesarios y en uso
import WelcomeHeader from '@/components/dashboard/WelcomeHeader.vue'        // Header con avatar y menú
import VehicleStatsCard from '@/components/dashboard/VehicleStatsCard.vue'  // Para estadísticas detalladas de vehículos
import PeopleStatsCard from '@/components/dashboard/PeopleStatsCard.vue'    // Para control de personas y actividad
import ActionButtons from '@/components/dashboard/ActionButtons.vue'        // Botones principales de registro

const router = useRouter()
const authStore = useAuthStore()
const isLoggingOut = ref(false)

// ========== DATOS SIMULADOS (TODO: Conectar con stores reales) ==========

// Estadísticas detalladas de vehículos por categoría - Usadas por VehicleStatsCard  
const vehicleData = reactive({
  automoviles: 12,    // 🚗 Autos particulares
  motocicletas: 5,    // 🏍️ Motos y scooters
  camiones: 2,        // 🚚 Vehículos de carga
  buses: 1            // 🚌 Transporte público
})

// Estadísticas de control de personas - Usadas por PeopleStatsCard
const peopleData = reactive({
  personasDentro: 15,  // 🏢 Personas actualmente en el predio  
  ingresosHoy: 23,     // ➡️ Total de ingresos del día
  salidasHoy: 8        // ⬅️ Total de salidas del día
})

// Handlers para los botones de acción
const handleRegistroIngreso = () => {
  // TODO: Abrir modal de registro de ingreso
  console.log('Abrir modal de registro de ingreso')
}

const handleRegistroSalida = () => {
  // TODO: Abrir modal de registro de salida
  console.log('Abrir modal de registro de salida')
}

// Handlers para el menú de perfil
const handleViewProfile = () => {
  // TODO: Abrir modal de ver perfil
  console.log('Ver perfil del usuario')
}

const handleEditProfile = () => {
  // TODO: Abrir modal de editar perfil
  console.log('Editar perfil del usuario')
}

const handleChangePassword = () => {
  // TODO: Abrir modal de cambio de contraseña
  console.log('Cambiar contraseña')
}

const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    
    // Ejecutar el logout del store
    await authStore.logout()
    
    // Redirigir al login
    await router.push('/login')
  } catch (error) {
    console.error('Error durante el logout:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
/* Layout refinado para el Dashboard gubernamental */
.v-container {
  max-width: 1400px;
  padding: 1.5rem !important;
}

/* Mejorar espaciado en tablets y desktop */
@media (min-width: 960px) {
  .v-container {
    padding: 2rem !important;
  }
}

/* Espaciado óptimo en pantallas grandes */
@media (min-width: 1264px) {
  .v-container {
    padding: 2.5rem !important;
  }
}

/* Ajustes para móviles */
@media (max-width: 600px) {
  .v-container {
    padding: 1rem !important;
  }
}
</style>
