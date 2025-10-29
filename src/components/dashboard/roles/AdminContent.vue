<template>
  <div class="admin-content">
    <!-- Dashboard Administrador - Solo Control de Usuarios -->
    <v-row class="mb-8">
      <!-- Card de Control de Usuarios -->
      <v-col cols="12">
        <v-card class="users-control-card" elevation="2">
          <v-card-title class="text-h6 pb-3 px-6 pt-6 d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-account-group</v-icon>
            Control de Usuarios del Sistema
          </v-card-title>

          <v-card-text class="px-6 pb-6">
            <!-- Estadísticas de usuarios -->
            <v-row class="mb-4">
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-primary">{{ usersData.totalUsers }}</div>
                  <div class="text-body-2 text-grey-darken-1">Total Usuarios</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-success">{{ usersData.operators }}</div>
                  <div class="text-body-2 text-grey-darken-1">Operadores</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-warning">{{ usersData.supervisors }}</div>
                  <div class="text-body-2 text-grey-darken-1">Supervisores</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-info">{{ usersData.newUsersToday }}</div>
                  <div class="text-body-2 text-grey-darken-1">Nuevos Hoy</div>
                </div>
              </v-col>
            </v-row>

            <!-- Botón de gestión -->
            <v-row>
              <v-col cols="12" class="text-center">
                <v-btn
                  color="primary"
                  size="large"
                  variant="elevated"
                  prepend-icon="mdi-account-cog"
                  @click="handleManageUsersClick"
                >
                  Gestionar Usuarios
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de Usuarios -->
    <v-row class="mb-8">
      <v-col cols="12">
        <UsersTable
          ref="usersTableRef"
          :show-actions="true"
          @edit-user="handleEditUser"
          @delete-user="handleDeleteUser"
          @users-loaded="handleUsersLoaded"
        />
      </v-col>
    </v-row>

    <!-- Sección de Derechos ARCO - Exportación de Datos -->
    <v-row class="mb-8">
      <v-col cols="12">
        <ArcoDataExportCard />
      </v-col>
    </v-row>

    <!-- Sección de Auditoría -->
    <AuditActivityCard class="mb-8" />

    <AuditTableSection
      @ver-detalles="handleVerDetalles"
      @exportar-pdf="handleExportarPDF"
      @exportar-csv="handleExportarCSV"
    />

    <!-- Modal de confirmación para eliminación de usuario -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title class="bg-error pa-4">
          <div class="d-flex align-center">
            <v-icon size="24" color="white" class="mr-3">mdi-alert-circle</v-icon>
            <div>
              <h3 class="text-h6 text-white mb-0">Confirmar Eliminación</h3>
              <p class="text-caption text-red-lighten-4 mb-0">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </v-card-title>

        <v-card-text class="pa-6">
          <div v-if="userToDelete" class="text-center">
            <v-avatar size="64" color="grey-lighten-2" class="mb-4">
              <v-icon size="32" color="grey-darken-1">mdi-account</v-icon>
            </v-avatar>

            <p class="text-body-1 mb-2">
              ¿Está seguro que desea eliminar el usuario?
            </p>

            <div class="bg-grey-lighten-5 pa-4 rounded mb-4">
              <div class="text-h6 mb-1">{{ userToDelete.nombre }}</div>
              <div class="text-body-2 text-grey-darken-1">C.I: {{ userToDelete.cedula }}</div>
              <div class="text-body-2 text-grey-darken-1">{{ userToDelete.grado }} - {{ getRoleText(userToDelete.role) }}</div>
            </div>

            <v-alert
              type="warning"
              variant="tonal"
              class="text-left mb-4"
            >
              <div class="text-body-2">
                <strong>Nota:</strong> Esta acción eliminará permanentemente el usuario del sistema.
                Si el usuario necesita acceso nuevamente, deberá ser registrado como un nuevo usuario.
              </div>
            </v-alert>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="cancelDeleteUser"
            :disabled="isDeleting"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmDeleteUser"
            :loading="isDeleting"
            :disabled="isDeleting"
          >
            <v-icon class="mr-2">mdi-delete</v-icon>
            Eliminar Usuario
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de detalles de evento -->
    <EventDetailDialog
      v-model="showEventDetailDialog"
      :evento="eventoSeleccionado"
      @close="showEventDetailDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDatabase } from '@/composables/useDatabase'
import type { AuditEvent } from '@/stores/audit'

// Componentes de auditoría
import AuditActivityCard from '../admin/audit/AuditActivityCard.vue'
import AuditTableSection from '../admin/audit/AuditTableSection.vue'
import EventDetailDialog from '../admin/audit/EventDetailDialog.vue'

// Componente ARCO
import ArcoDataExportCard from '../admin/ArcoDataExportCard.vue'

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

// Emits para comunicación con padre
const emit = defineEmits<{
  'manage-users': []
}>()

// Composables
const { getRecords, initDatabase, deleteRecord } = useDatabase()

// Interfaces para la tabla
interface UserTableRow {
  numero: number
  grado: string
  nombre: string
  cedula: string
  fechaCreacion: string
  ultimoAcceso: string
  role: string
  id: string
}

// Estado reactivo
const usersData = ref({
  totalUsers: 0,
  admins: 0,
  supervisors: 0,
  operators: 0,
  newUsersToday: 0
})

// Referencia al componente de tabla
const usersTableRef = ref<InstanceType<typeof UsersTable> | null>(null)

// Estado para modal de confirmación de eliminación
const showDeleteDialog = ref(false)
const userToDelete = ref<UserTableRow | null>(null)
const isDeleting = ref(false)

// Estado para modal de detalles de auditoría
const showEventDetailDialog = ref(false)
const eventoSeleccionado = ref<AuditEvent | null>(null)

// Función para obtener texto del rol (usada en modal de confirmación)
const getRoleText = (role: string): string => {
  const texts = {
    'admin': 'Administrador',
    'supervisor': 'Supervisor',
    'operador': 'Operador'
  }
  return texts[role as keyof typeof texts] || role
}

// Handler para cuando se cargan los usuarios
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleUsersLoaded = (_count: number) => {
  // Actualizar estadísticas cuando la tabla carga los datos
  loadUsersStats()
}

// Funciones para acciones de la tabla
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleEditUser = (_item: UserTableRow) => {
  // TODO: Implementar lógica de edición más adelante si es necesario
}

const handleDeleteUser = (user: UserTableRow) => {
  // Validación: No permitir eliminar el último administrador
  if (user.role === 'admin' && usersData.value.admins <= 1) {
    // TODO: Mostrar notificación de error
    return
  }

  userToDelete.value = user
  showDeleteDialog.value = true
}

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return

  isDeleting.value = true

  try {
    // Eliminar de la base de datos IndexedDB
    const result = await deleteRecord('usuarios', userToDelete.value.id)

    if (result.success) {
      // Recargar la tabla de usuarios
      if (usersTableRef.value) {
        await usersTableRef.value.reload()
      }
      
      // Recargar estadísticas
      await loadUsersStats()
    } else {
      throw new Error(result.error || 'Error desconocido')
    }

  } catch (error) {
    // TODO: Mostrar notificación de error al usuario
    alert('Error al eliminar usuario: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
    userToDelete.value = null
  }
}

const cancelDeleteUser = () => {
  showDeleteDialog.value = false
  userToDelete.value = null
}

// Handlers para auditoría
const handleVerDetalles = (evento: AuditEvent) => {
  eventoSeleccionado.value = evento
  showEventDetailDialog.value = true
}

const handleExportarPDF = () => {
  // TODO: Implementar exportación PDF
  alert('Exportación PDF en desarrollo')
}

const handleExportarCSV = () => {
  // TODO: Implementar exportación CSV
  alert('Exportación CSV en desarrollo')
}

// Método de manejo de eventos
const handleManageUsersClick = () => emit('manage-users')

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
  } catch {
    // Error silencioso
  }
}

// Lifecycle
onMounted(() => {
  loadUsersStats()
})
</script>

<style scoped>
/* Estilos heredados del sistema de diseño Vuetify */
</style>
