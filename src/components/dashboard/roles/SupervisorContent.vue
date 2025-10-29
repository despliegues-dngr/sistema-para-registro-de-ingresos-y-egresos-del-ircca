<template>
  <div class="supervisor-content">
    <!-- Dashboard Supervisor - Vista Operacional sin Acciones de Registro -->
    
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
          Descargar Planilla de Registros
        </v-btn>
      </v-col>
    </v-row>

    <!-- ⭐ NUEVA SECCIÓN: Consulta de Historial de Personas -->
    <v-row class="mb-8">
      <v-col cols="12">
        <PersonHistoryCard />
      </v-col>
    </v-row>

    <!-- ⭐ NUEVA SECCIÓN: Gestión de Destinos -->
    <v-row class="mb-8">
      <v-col cols="12">
        <DestinosManager />
      </v-col>
    </v-row>

    <!-- Control de Usuarios del Sistema - Estadísticas + Tabla -->
    <v-row class="mb-8" style="margin-top: -1rem;">
      <v-col cols="12">
        <v-card class="users-control-card" elevation="2">
          <v-card-title class="text-h6 pb-3 px-6 pt-6 d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-account-group</v-icon>
            Control de Usuarios del Sistema
          </v-card-title>
          
          <v-card-text class="px-6 pb-6">
            <!-- Estadísticas de usuarios - Una sola línea -->
            <v-row class="mb-6">
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

            <!-- Divider -->
            <v-divider class="mb-6" />

            <!-- Tabla de usuarios (solo lectura) -->
            <UsersTable
              :show-actions="false"
              @users-loaded="handleUsersLoaded"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de Generación PDF -->
    <PdfGeneratorDialog
      v-model="showPdfDialog"
      @pdf-generated="handlePdfGenerated"
      @close="handlePdfDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDatabase } from '@/composables/useDatabase'
import { useMultipleCounters } from '@/composables/useCounterAnimation'

// Componentes del supervisor
import PersonHistoryCard from '../supervisor/PersonHistoryCard.vue'
import DestinosManager from './sections/DestinosManager.vue'
import PdfGeneratorDialog from '@/components/ui/PdfGeneratorDialog.vue'

// Componente compartido de tabla de usuarios
import UsersTable from '../shared/UsersTable.vue'

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

// Composables
const { getRecords, initDatabase } = useDatabase()

// Estado reactivo para estadísticas de usuarios (valores reales)
const usersDataRaw = ref({
  totalUsers: 0,
  admins: 0,
  supervisors: 0,
  operators: 0,
  newUsersToday: 0
})

// ⭐ NUEVO: Contadores animados usando composable genérico
const { createCounter, startAll: startUsersAnimation } = useMultipleCounters({
  duration: 2000,
  autoWatch: false // Control manual porque usersDataRaw es ref
})

// Crear contadores individuales
const totalUsersCounter = createCounter(() => usersDataRaw.value.totalUsers, { autoWatch: true })
const operatorsCounter = createCounter(() => usersDataRaw.value.operators, { autoWatch: true })
const supervisorsCounter = createCounter(() => usersDataRaw.value.supervisors, { autoWatch: true })
const newUsersTodayCounter = createCounter(() => usersDataRaw.value.newUsersToday, { autoWatch: true })

// ⭐ Datos finales con animación para mostrar en UI
const usersData = computed(() => ({
  totalUsers: totalUsersCounter.animatedValue.value,
  admins: usersDataRaw.value.admins, // Sin animación (no se muestra)
  supervisors: supervisorsCounter.animatedValue.value,
  operators: operatorsCounter.animatedValue.value,
  newUsersToday: newUsersTodayCounter.animatedValue.value
}))

// Estado para modal de PDF
const showPdfDialog = ref(false)

// Handler para cuando se cargan los usuarios desde la tabla
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleUsersLoaded = (_count: number) => {
  // Actualizar estadísticas cuando la tabla carga los datos
  loadUsersStats()
}

// Cargar estadísticas de usuarios
const loadUsersStats = async () => {
  try {
    // Inicializar la base de datos primero
    const dbResult = await initDatabase()
    
    if (!dbResult.success) {
      return
    }
    
    const users = await getRecords('usuarios') as User[]
    
    if (users && Array.isArray(users)) {
      // Actualizar estadísticas (datos reales sin animación)
      usersDataRaw.value.totalUsers = users.length
      usersDataRaw.value.admins = users.filter((u: User) => u.role === 'admin').length
      usersDataRaw.value.supervisors = users.filter((u: User) => u.role === 'supervisor').length
      usersDataRaw.value.operators = users.filter((u: User) => u.role === 'operador').length
      
      // Usuarios creados hoy
      const today = new Date().toDateString()
      usersDataRaw.value.newUsersToday = users.filter((u: User) => 
        u.createdAt && new Date(u.createdAt).toDateString() === today
      ).length
    }
  } catch {
    // Error silencioso
  }
}

// Handlers para modal de PDF
const handlePdfGenerated = () => {
  // TODO: Mostrar notificación global de éxito
}

const handlePdfDialogClose = () => {
  showPdfDialog.value = false
}

// Lifecycle
onMounted(async () => {
  await loadUsersStats()
  
  // ⭐ NUEVO: Iniciar animación de contadores después de cargar datos
  setTimeout(() => {
    startUsersAnimation()
  }, 100) // Pequeño delay para asegurar que los datos estén cargados
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
