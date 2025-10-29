<template>
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
        placeholder="Buscar por nombre completo o documento..."
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

      <!-- Columna de acciones (solo si showActions = true) -->
      <template v-if="showActions" v-slot:[`item.actions`]="{ item }">
        <div class="d-flex gap-2 justify-center">
          <v-btn
            icon
            size="small"
            color="primary"
            variant="text"
            @click="handleEdit(item)"
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
            @click="handleDelete(item)"
            :disabled="item.role === 'admin' && adminCount <= 1"
          >
            <v-icon size="18">mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">
              {{ item.role === 'admin' && adminCount <= 1
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDatabase } from '@/composables/useDatabase'

// Props
interface Props {
  showActions?: boolean
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  autoLoad: true
})

// Emits
const emit = defineEmits<{
  'edit-user': [user: UserTableRow]
  'delete-user': [user: UserTableRow]
  'users-loaded': [count: number]
}>()

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

// Interface para la tabla
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

// Composables
const { getRecords, initDatabase } = useDatabase()

// Estado reactivo
const usersTableData = ref<UserTableRow[]>([])
const searchQuery = ref('')
const adminCount = ref(0)

// Datos filtrados
const filteredUsersData = computed(() => {
  if (!searchQuery.value.trim()) {
    return usersTableData.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  return usersTableData.value.filter((user: UserTableRow) => {
    const nombre = user.nombre.toLowerCase()
    const cedula = user.cedula.toLowerCase()

    return nombre.includes(query) || cedula.includes(query)
  })
})

// Headers para la tabla (dinámicos según showActions)
const tableHeaders = computed(() => {
  const baseHeaders = [
    { title: '#', key: 'numero', sortable: true, width: '80px' },
    { title: 'Grado', key: 'grado', sortable: true },
    { title: 'Nombre Completo', key: 'nombre', sortable: true },
    { title: 'Cédula', key: 'cedula', sortable: true },
    { title: 'Rol', key: 'role', sortable: true, width: '140px' },
    { title: 'Fecha Creación', key: 'fechaCreacion', sortable: true },
    { title: 'Último Acceso', key: 'ultimoAcceso', sortable: true }
  ]

  if (props.showActions) {
    baseHeaders.push({
      title: 'Acciones',
      key: 'actions',
      sortable: false,
      width: '120px'
    })
  }

  return baseHeaders
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

// Handlers para acciones
const handleEdit = (user: UserTableRow) => {
  emit('edit-user', user)
}

const handleDelete = (user: UserTableRow) => {
  emit('delete-user', user)
}

// Cargar usuarios desde la base de datos
const loadUsers = async () => {
  try {
    // Inicializar la base de datos primero
    const dbResult = await initDatabase()

    if (!dbResult.success) {
      return
    }

    const users = await getRecords('usuarios') as User[]

    if (users && Array.isArray(users)) {
      // Contar administradores
      adminCount.value = users.filter((u: User) => u.role === 'admin').length

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

      // Emitir evento de carga completada
      emit('users-loaded', users.length)
    }
  } catch {
    // Error silencioso
  }
}

// Método público para recargar datos (expuesto para componentes padre)
const reload = async () => {
  await loadUsers()
}

// Exponer método reload
defineExpose({
  reload
})

// Lifecycle
onMounted(() => {
  if (props.autoLoad) {
    loadUsers()
  }
})

// Watch para recargar cuando autoLoad cambie
watch(() => props.autoLoad, (newValue) => {
  if (newValue) {
    loadUsers()
  }
})
</script>

<style scoped>
/* Estilos específicos si son necesarios */
</style>
