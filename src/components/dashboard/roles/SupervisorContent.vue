<template>
  <div class="supervisor-content">
    <!-- Dashboard Supervisor - Vista Operacional sin Acciones de Registro -->
    
    <!-- Estadísticas principales del operador (reutilizables) -->
    <v-row class="mb-8">
      <!-- Card de Personas y Actividad -->
      <v-col cols="12" lg="4" class="mb-4 mb-lg-0">
        <PeopleStatsCard 
          :people-data="peopleData" 
          @personas-dentro-click="handlePersonasDentroClick"
          @ingresos-hoy-click="handleIngresosHoyClick"
          @salidas-hoy-click="handleSalidasHoyClick"
        />
      </v-col>

      <!-- Card de Vehículos Detallada -->
      <v-col cols="12" lg="8">
        <VehicleStatsCard 
          :vehicle-data="vehicleData" 
          @vehicle-click="handleVehicleClick"
        />
      </v-col>
    </v-row>

    <!-- Control de Usuarios del Sistema - Solo estadísticas -->
    <v-row class="mb-8" style="margin-top: -1rem;">
      <v-col cols="12">
        <v-card class="users-control-card" elevation="2">
          <v-card-title class="text-h6 pb-3 px-6 pt-6 d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-account-group</v-icon>
            Control de Usuarios del Sistema
          </v-card-title>
          
          <v-card-text class="px-6 pb-6">
            <!-- Estadísticas de usuarios - Una sola línea -->
            <v-row>
              <v-col cols="3">
                <div class="text-center user-stat-item">
                  <div class="text-h3 font-weight-bold text-primary">{{ usersData.totalUsers }}</div>
                  <div class="text-body-2 text-grey-darken-1">Total Usuarios</div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="text-center user-stat-item">
                  <div class="text-h3 font-weight-bold text-success">{{ usersData.operators }}</div>
                  <div class="text-body-2 text-grey-darken-1">Operadores</div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="text-center user-stat-item">
                  <div class="text-h3 font-weight-bold text-warning">{{ usersData.supervisors }}</div>
                  <div class="text-body-2 text-grey-darken-1">Supervisores</div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="text-center user-stat-item">
                  <div class="text-h3 font-weight-bold text-info">{{ usersData.newUsersToday }}</div>
                  <div class="text-body-2 text-grey-darken-1">Nuevos Hoy</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Botón de Descarga PDF -->
    <v-row class="mb-8">
      <v-col cols="12" class="text-center">
        <v-btn
          color="success"
          size="large"
          variant="elevated"
          prepend-icon="mdi-file-pdf-box"
          @click="showPdfDialog = true"
        >
          Descargar PDF
        </v-btn>
      </v-col>
    </v-row>

    <!-- Modales de datos para consulta (mismo comportamiento que operador) -->
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

    <!-- Modal de Generación PDF -->
    <PdfGeneratorDialog
      v-model="showPdfDialog"
      @pdf-generated="handlePdfGenerated"
      @close="handlePdfDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRegistroStore } from '@/stores/registro'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { useDashboardModals } from '@/composables/useDashboardModals'
import { useDatabase } from '@/composables/useDatabase'

// Componentes reutilizables del dashboard operador
import PeopleStatsCard from '@/components/dashboard/PeopleStatsCard.vue'
import VehicleStatsCard from '@/components/dashboard/VehicleStatsCard.vue'
import DataListModal from '@/components/ui/DataListModal.vue'
import PdfGeneratorDialog from '@/components/ui/PdfGeneratorDialog.vue'

// Interface para usuarios de la BD
interface User {
  id: string
  username: string
  role: 'admin' | 'supervisor' | 'operador'
  nombre: string
  apellido: string
  grado: string
  createdAt: string
  lastLogin?: string
}

// Store de registros para estadísticas
const registroStore = useRegistroStore()

// Composables
const { getRecords, initDatabase } = useDatabase()

// Composable para estadísticas (mismas que operador)
const {
  peopleData,
  vehicleData,
  personasDentroData,
  ingresosHoyData,
  salidasHoyData,
  vehiculosData: vehiculosDataComputed
} = useDashboardStats(registroStore)

// Composable para modales (sin registro, solo consulta)
const {
  showPersonasDentroModal,
  showIngresosHoyModal,
  showSalidasHoyModal,
  showVehiculosModal,
  selectedVehicleType,
  handlePersonasDentroClick,
  handleIngresosHoyClick,
  handleSalidasHoyClick,
  handleVehicleClick,
  vehicleModalTitle,
  vehicleModalIcon,
  vehicleModalEmptySubtitle,
  vehicleModalEmptyIcon,
  vehicleModalHeaderColor
} = useDashboardModals()

// Datos específicos de vehículos
const vehiculosData = vehiculosDataComputed(selectedVehicleType.value)

// Estado reactivo para estadísticas de usuarios
const usersData = ref({
  totalUsers: 0,
  admins: 0,
  supervisors: 0,
  operators: 0,
  newUsersToday: 0
})

// Estado para modal de PDF
const showPdfDialog = ref(false)

// Cargar estadísticas de usuarios
const loadUsersStats = async () => {
  try {
    // Inicializar la base de datos primero
    const dbResult = await initDatabase()
    
    if (!dbResult.success) {
      console.error('Error inicializando BD:', dbResult.error)
      return
    }
    
    const users = await getRecords('usuarios') as User[]
    
    if (users && Array.isArray(users)) {
      // Actualizar estadísticas
      usersData.value.totalUsers = users.length
      usersData.value.admins = users.filter((u: User) => u.role === 'admin').length
      usersData.value.supervisors = users.filter((u: User) => u.role === 'supervisor').length
      usersData.value.operators = users.filter((u: User) => u.role === 'operador').length
      
      // Usuarios creados hoy
      const today = new Date().toDateString()
      usersData.value.newUsersToday = users.filter((u: User) => 
        u.createdAt && new Date(u.createdAt).toDateString() === today
      ).length
    }
  } catch (error) {
    console.error('Error al cargar estadísticas de usuarios:', error)
  }
}

// Handlers para modal de PDF
const handlePdfGenerated = (message: string) => {
  console.log('PDF generado exitosamente:', message)
  // TODO: Mostrar notificación global de éxito
}

const handlePdfDialogClose = () => {
  showPdfDialog.value = false
}

// Lifecycle
onMounted(() => {
  loadUsersStats()
})
</script>

<style scoped>
.users-control-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Diseño formal para estadísticas de usuarios */
.user-stat-item {
  padding: 1rem;
  transition: all 0.2s ease;
}

.user-stat-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}
</style>
