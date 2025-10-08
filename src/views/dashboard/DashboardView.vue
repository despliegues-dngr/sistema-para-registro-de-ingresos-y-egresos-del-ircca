<template>
  <v-container fluid class="pa-6 dashboard-wrapper">
    <div class="dashboard-content">
      <!-- Header de bienvenida con tiempo real -->
      <WelcomeHeader
        @view-profile="handleViewProfile"
        @edit-profile="handleEditProfile"
        @change-password="handleChangePassword"
        @logout="handleLogout"
      />

    <!-- ✅ DASHBOARD DINÁMICO POR ROL -->
    <!-- Admin Dashboard -->
    <AdminContent 
      v-if="authStore.isAdmin" 
      @manage-users="handleManageUsers"
    />
    
    <!-- Supervisor Dashboard -->
    <SupervisorContent v-else-if="authStore.isSupervisor" />
    
    <!-- Operador Dashboard (por defecto) -->
    <template v-else>
      <!-- Estadísticas principales -->
      <v-row class="mb-8">
        <!-- Card de Personas y Actividad - Primera -->
        <v-col cols="12" lg="4" class="mb-4 mb-lg-0">
          <PeopleStatsCard 
            :people-data="peopleData" 
            @personas-dentro-click="handlePersonasDentroClick"
            @ingresos-hoy-click="handleIngresosHoyClick"
            @salidas-hoy-click="handleSalidasHoyClick"
          />
        </v-col>

        <!-- Card de Vehículos Detallada - Segunda -->
        <v-col cols="12" lg="8">
          <VehicleStatsCard 
            :vehicle-data="vehicleData" 
            @vehicle-click="handleVehicleClick"
          />
        </v-col>
      </v-row>

      <!-- Botones de Acción Rápida -->
      <ActionButtons
        @registro-ingreso="handleRegistroIngreso"
        @registro-salida="handleRegistroSalida"
      />
    </template>

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

    <!-- Diálogo de timeout de sesión -->
    <SessionTimeoutDialog
      v-model="showTimeoutWarning"
      :remaining-time="timeoutRemainingTime"
      @extend="handleExtendSession"
      @logout="handleSessionTimeout"
    />

    <!-- Modales para mostrar datos detallados -->
    <DataListModal
      v-model="showPersonasDentroModal"
      title="Personas Dentro del Predio"
      header-icon="mdi-account-multiple"
      data-type="personas"
      :data="personasDentroData"
      empty-title="No hay personas dentro"
      empty-subtitle="Actualmente no hay personas registradas en el predio"
      empty-icon="mdi-account-off"
    />

    <DataListModal
      v-model="showIngresosHoyModal"
      title="Ingresos de Hoy"
      header-icon="mdi-login"
      header-color="success"
      data-type="personas"
      :data="ingresosHoyData"
      empty-title="Sin ingresos hoy"
      empty-subtitle="No se han registrado ingresos el día de hoy"
      empty-icon="mdi-login-variant"
    />

    <DataListModal
      v-model="showSalidasHoyModal"
      title="Salidas de Hoy"
      header-icon="mdi-logout"
      header-color="warning"
      data-type="personas"
      :data="salidasHoyData"
      empty-title="Sin salidas hoy"
      empty-subtitle="No se han registrado salidas el día de hoy"
      empty-icon="mdi-logout-variant"
    />

    <DataListModal
      v-model="showVehiculosModal"
      :title="vehicleModalTitle"
      :header-icon="vehicleModalIcon"
      :header-color="vehicleModalHeaderColor"
      data-type="vehiculos"
      :data="vehiculosData"
      empty-title="Sin vehículos"
      :empty-subtitle="vehicleModalEmptySubtitle"
      :empty-icon="vehicleModalEmptyIcon"
    />
    </div>

    <!-- Pie de página gubernamental -->
    <DashboardFooter />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRegistroStore } from '@/stores/registro'
import { useSessionTimeout } from '@/composables/useSessionTimeout'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { useDashboardModals } from '@/composables/useDashboardModals'

// Componentes del Dashboard
import WelcomeHeader from '@/components/dashboard/WelcomeHeader.vue'
import VehicleStatsCard from '@/components/dashboard/VehicleStatsCard.vue'
import PeopleStatsCard from '@/components/dashboard/PeopleStatsCard.vue'
import ActionButtons from '@/components/dashboard/ActionButtons.vue'
import RegistroIngresoDialog from '@/components/ui/RegistroIngresoDialog.vue'
import RegistroSalidaDialog from '@/components/ui/RegistroSalidaDialog.vue'
import SessionTimeoutDialog from '@/components/ui/SessionTimeoutDialog.vue'
import DataListModal from '@/components/ui/DataListModal.vue'
import DashboardFooter from '@/components/layout/DashboardFooter.vue'

// Componentes específicos por rol
import AdminContent from '@/components/dashboard/roles/AdminContent.vue'
import SupervisorContent from '@/components/dashboard/roles/SupervisorContent.vue'

// --- Inicialización de Stores y Router ---
const router = useRouter()
const authStore = useAuthStore()
const registroStore = useRegistroStore()

// --- Lógica extraída en Composables ---

// Composable para el manejo del timeout de sesión
const {
  showWarningDialog: showTimeoutWarning,
  remainingTime: timeoutRemainingTime,
  extendSession,
  initializeTimeout,
  cleanup: cleanupTimeout,
  resetTimer
} = useSessionTimeout()

// Composable para toda la lógica de modales
const {
  showRegistroIngreso,
  showRegistroSalida,
  showPersonasDentroModal,
  showIngresosHoyModal,
  showSalidasHoyModal,
  showVehiculosModal,
  selectedVehicleType,
  handleRegistroIngreso,
  handleRegistroSalida,
  handlePersonasDentroClick,
  handleIngresosHoyClick,
  handleSalidasHoyClick,
  handleVehicleClick,
  handleDialogClose,
  vehicleModalTitle,
  vehicleModalIcon,
  vehicleModalEmptySubtitle,
  vehicleModalEmptyIcon,
  vehicleModalHeaderColor
} = useDashboardModals()

// Composable para todas las propiedades computadas de estadísticas
const {
  peopleData,
  vehicleData,
  personasDentroData,
  ingresosHoyData,
  salidasHoyData,
  vehiculosData: vehiculosDataComputed,
  startAnimation,
  updateVehicleAnimation
} = useDashboardStats(registroStore)

// Adaptador para vehiculosData que depende de un estado local (selectedVehicleType)
const vehiculosData = vehiculosDataComputed(selectedVehicleType.value)

// --- Lógica que permanece en el componente ---

const isLoggingOut = ref(false)

// Handlers para los eventos de éxito de los modales
const handleRegistroIngresoSuccess = () => {
  // TODO: Mostrar notificación de éxito global
}

const handleRegistroSalidaSuccess = () => {
  // TODO: Mostrar notificación de éxito global
}

// Handler para gestión de usuarios (Admin)
const handleManageUsers = () => {
  // TODO: Abrir modal con tabla de usuarios
}

// Handlers para el menú de perfil
const handleViewProfile = () => {
  // TODO: Abrir modal de ver perfil
}

const handleEditProfile = () => {
  // TODO: Abrir modal de editar perfil
}

const handleChangePassword = () => {
  // TODO: Abrir modal de cambio de contraseña
}

// Handler para el logout
const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    cleanupTimeout()
    await authStore.logout()
    await router.push('/login')
  } catch {
    // Error silencioso
  } finally {
    isLoggingOut.value = false
  }
}

// Handlers para el sistema de timeout de sesión
const handleExtendSession = () => {
  extendSession()
  resetTimer()
}

const handleSessionTimeout = async () => {
  await handleLogout()
}

// --- Ciclo de Vida del Componente ---
onMounted(async () => {
  initializeTimeout()
  await registroStore.initializeStoreWhenAuthenticated()
  
  // ⭐ NUEVO: Iniciar animación de contadores cada vez que se carga el dashboard
  setTimeout(() => {
    startAnimation()
    updateVehicleAnimation()
  }, 100) // Pequeño delay para asegurar que los datos estén cargados
})

onUnmounted(() => {
  cleanupTimeout()
})
</script>

<style scoped>
/* Layout refinado para el Dashboard gubernamental */
.v-container {
  max-width: 1400px;
  padding: 1.5rem;
}

/* ✅ Sticky Footer - El footer siempre al final de la pantalla */
.dashboard-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  flex: 1;
}

/* Mejorar espaciado en tablets y desktop */
@media (min-width: 960px) {
  .v-container {
    padding: 2rem;
  }
}

/* Espaciado óptimo en pantallas grandes */
@media (min-width: 1264px) {
  .v-container {
    padding: 2.5rem;
  }
}

/* Ajustes para móviles */
@media (max-width: 600px) {
  .v-container {
    padding: 1rem;
  }
}
</style>
