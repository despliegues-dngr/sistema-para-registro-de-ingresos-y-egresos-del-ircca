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
                  <div class="text-h3 font-weight-bold text-warning">{{ usersData.admins }}</div>
                  <div class="text-body-2 text-grey-darken-1">Administradores</div>
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
        <v-card class="pa-0" elevation="2">
          <!-- Header de la tabla -->
          <v-card-title class="bg-primary pa-4">
            <div class="d-flex align-center">
              <v-icon size="24" color="white" class="mr-3">mdi-account-multiple-outline</v-icon>
              <div>
                <h3 class="text-h6 text-white mb-0">Lista de Usuarios del Sistema</h3>
                <p class="text-caption text-blue-lighten-4 mb-0">Usuarios registrados y activos</p>
              </div>
            </div>
          </v-card-title>

          <!-- Barra de búsqueda rápida -->
          <v-card-text class="pa-4 pb-0">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar usuarios..."
              placeholder="Buscar por nombre completo o cédula..."
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="mb-4"
            />
          </v-card-text>

          <!-- Tabla de datos -->
          <v-data-table
            :headers="tableHeaders"
            :items="filteredUsersData"
            item-value="id"
            class="elevation-0"
            :items-per-page="10"
            :no-data-text="searchQuery.trim() ? `No se encontraron usuarios que coincidan con '${searchQuery}'` : 'No hay usuarios registrados'"
            loading-text="Cargando usuarios..."
          >
            <!-- Columna personalizada para el grado -->
            <template v-slot:[`item.grado`]="{ item }">
              <span class="font-weight-medium">{{ item.grado }}</span>
            </template>

            <!-- Columna personalizada para cédula -->
            <template v-slot:[`item.cedula`]="{ item }">
              <v-chip
                color="primary"
                variant="outlined"
                size="small"
              >
                {{ item.cedula }}
              </v-chip>
            </template>

            <!-- Columna personalizada para rol -->
            <template v-slot:[`item.role`]="{ item }">
              <v-chip
                :color="getRoleColor(item.role)"
                size="small"
                variant="tonal"
              >
                <v-icon size="16" class="mr-1">
                  {{ item.role === 'admin' ? 'mdi-shield-crown' : item.role === 'supervisor' ? 'mdi-account-tie' : 'mdi-account' }}
                </v-icon>
                {{ getRoleText(item.role) }}
              </v-chip>
            </template>

            <!-- Columna de acciones -->
            <template v-slot:[`item.actions`]="{ item }">
              <div class="d-flex gap-2 justify-center">
                <v-btn
                  icon
                  size="small"
                  color="primary"
                  variant="text"
                  @click="handleEditUser(item)"
                >
                  <v-icon size="18">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">
                    Editar usuario
                  </v-tooltip>
                </v-btn>
                
                <v-btn
                  icon
                  size="small"
                  color="error"
                  variant="text"
                  @click="handleDeleteUser(item)"
                  :disabled="item.role === 'admin' && usersData.admins <= 1"
                >
                  <v-icon size="18">mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">
                    {{ item.role === 'admin' && usersData.admins <= 1 
                      ? 'No se puede eliminar el último administrador' 
                      : 'Eliminar usuario' }}
                  </v-tooltip>
                </v-btn>
              </div>
            </template>

            <!-- Información del pie de tabla -->
            <template #bottom>
              <div class="pa-4 text-center text-body-2 text-grey-darken-1">
                <span v-if="searchQuery.trim()">
                  Mostrando: {{ filteredUsersData.length }} de {{ usersTableData.length }} usuarios para "<strong>{{ searchQuery }}</strong>"
                </span>
                <span v-else>
                  Total de usuarios: {{ usersTableData.length }}
                </span>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDatabase } from '@/composables/useDatabase'

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

// Estado para la tabla de usuarios
const usersTableData = ref<UserTableRow[]>([])

// Estado para búsqueda en la tabla
const searchQuery = ref('')

// Datos filtrados usando el mismo patrón exitoso del DataListModal
const filteredUsersData = computed(() => {
  if (!searchQuery.value.trim()) {
    return usersTableData.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  
  return usersTableData.value.filter((user: UserTableRow) => {
    // Buscar solo en nombre completo y cédula como solicitaste
    const nombre = user.nombre.toLowerCase()
    const cedula = user.cedula.toLowerCase()
    
    return nombre.includes(query) || cedula.includes(query)
  })
})

// Función utilitaria para formatear fechas
const formatearFecha = (fecha: string | undefined): string => {
  if (!fecha) return 'N/A'
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

// Headers para la tabla
const tableHeaders = [
  { title: '#', key: 'numero', sortable: true, width: '80px' },
  { title: 'Grado', key: 'grado', sortable: true },
  { title: 'Nombre Completo', key: 'nombre', sortable: true },
  { title: 'Cédula', key: 'cedula', sortable: true },
  { title: 'Rol', key: 'role', sortable: true, width: '140px' },
  { title: 'Fecha Creación', key: 'fechaCreacion', sortable: true },
  { title: 'Último Acceso', key: 'ultimoAcceso', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px', align: 'center' as const }
]

// Función para obtener color del chip según el rol
const getRoleColor = (role: string): string => {
  const colors = {
    'admin': 'error',
    'supervisor': 'warning', 
    'operador': 'success'
  }
  return colors[role as keyof typeof colors] || 'default'
}

// Función para obtener texto del rol
const getRoleText = (role: string): string => {
  const texts = {
    'admin': 'Administrador',
    'supervisor': 'Supervisor',
    'operador': 'Operador'
  }
  return texts[role as keyof typeof texts] || role
}

// Estado para modal de confirmación de eliminación
const showDeleteDialog = ref(false)
const userToDelete = ref<UserTableRow | null>(null)
const isDeleting = ref(false)

// Funciones para acciones de la tabla
const handleEditUser = (user: UserTableRow) => {
  console.log('Editar usuario:', user)
  // TODO: Implementar lógica de edición más adelante si es necesario
}

const handleDeleteUser = (user: UserTableRow) => {
  // Validación: No permitir eliminar el último administrador
  if (user.role === 'admin' && usersData.value.admins <= 1) {
    console.warn('No se puede eliminar el último administrador del sistema')
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
    console.log('Eliminando usuario de la base de datos:', userToDelete.value)
    
    // Eliminar de la base de datos IndexedDB
    const result = await deleteRecord('usuarios', userToDelete.value.id)
    
    if (result.success) {
      console.log('Usuario eliminado exitosamente de la base de datos')
      
      // Actualizar el array local
      const index = usersTableData.value.findIndex(u => u.id === userToDelete.value!.id)
      if (index > -1) {
        usersTableData.value.splice(index, 1)
        
        // Actualizar estadísticas
        usersData.value.totalUsers = usersTableData.value.length
        usersData.value.admins = usersTableData.value.filter(u => u.role === 'admin').length
        usersData.value.supervisors = usersTableData.value.filter(u => u.role === 'supervisor').length
        usersData.value.operators = usersTableData.value.filter(u => u.role === 'operador').length
        
        // Usuarios creados hoy (recalcular)
        const today = new Date().toDateString()
        usersData.value.newUsersToday = usersTableData.value.filter((u: UserTableRow) => 
          u.fechaCreacion && new Date(u.fechaCreacion).toDateString() === today
        ).length
      }
    } else {
      console.error('Error al eliminar usuario de la base de datos:', result.error)
      throw new Error(result.error || 'Error desconocido')
    }
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
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

// Método de manejo de eventos
const handleManageUsersClick = () => emit('manage-users')

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
      
      // Cargar datos completos para la tabla
      usersTableData.value = users.map((user, index) => ({
        numero: index + 1,
        grado: user.grado || 'N/A',
        nombre: `${user.nombre} ${user.apellido}`,
        cedula: user.username,
        fechaCreacion: formatearFecha(user.createdAt),
        ultimoAcceso: formatearFecha(user.lastLogin),
        role: user.role,
        id: user.id
      }))
    }
  } catch (error) {
    console.error('Error al cargar estadísticas de usuarios:', error)
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
