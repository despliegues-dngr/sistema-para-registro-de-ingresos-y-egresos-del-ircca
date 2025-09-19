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

    <!-- Modales de Registro -->
    <RegistroIngresoDialog
      v-model="showRegistroIngreso"
      @success="handleRegistroIngresoSuccess"
      @close="handleDialogClose"
    />

    <RegistroSalidaDialog
      v-model="showRegistroSalida"
      @success="handleRegistroSalidaSuccess"
      @close="handleDialogClose"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRegistroStore } from '@/stores/registro'

// Componentes del Dashboard - Todos necesarios y en uso
import WelcomeHeader from '@/components/dashboard/WelcomeHeader.vue' // Header con avatar y menú
import VehicleStatsCard from '@/components/dashboard/VehicleStatsCard.vue' // Para estadísticas detalladas de vehículos
import PeopleStatsCard from '@/components/dashboard/PeopleStatsCard.vue' // Para control de personas y actividad
import ActionButtons from '@/components/dashboard/ActionButtons.vue' // Botones principales de registro
import RegistroIngresoDialog from '@/components/ui/RegistroIngresoDialog.vue' // Modal de registro de ingreso
import RegistroSalidaDialog from '@/components/ui/RegistroSalidaDialog.vue' // Modal de registro de salida

const router = useRouter()
const authStore = useAuthStore()
const registroStore = useRegistroStore()

// Estado para controlar modales
const isLoggingOut = ref(false)
const showRegistroIngreso = ref(false)
const showRegistroSalida = ref(false)

// ========== DATOS CONECTADOS CON STORES ==========

// Estadísticas en tiempo real desde el store de registro
const peopleData = computed(() => ({
  personasDentro: registroStore.estadisticasHoy.personasDentro,
  ingresosHoy: registroStore.estadisticasHoy.ingresosHoy,
  salidasHoy: registroStore.estadisticasHoy.salidasHoy,
}))

// Estadísticas detalladas de vehículos por categoría - Usadas por VehicleStatsCard
const vehicleData = computed(() => ({
  autos: registroStore.estadisticasHoy.vehiculosDentro, // TODO: Separar por categorías
  motos: 0, // TODO: Implementar categorización
  camiones: 0, // TODO: Implementar categorización
  buses: 0, // TODO: Implementar categorización
}))

// Handlers para los botones de acción
const handleRegistroIngreso = () => {
  showRegistroIngreso.value = true
}

const handleRegistroSalida = () => {
  showRegistroSalida.value = true
}

// Handlers para modales de registro
const handleRegistroIngresoSuccess = (message: string) => {
  console.log('Registro de ingreso exitoso:', message)
  // TODO: Mostrar notificación de éxito global
}

const handleRegistroSalidaSuccess = (message: string) => {
  console.log('Registro de salida exitoso:', message)
  // TODO: Mostrar notificación de éxito global
}

const handleDialogClose = () => {
  showRegistroIngreso.value = false
  showRegistroSalida.value = false
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
