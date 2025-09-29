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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
const { getRecords } = useDatabase()

// Estado reactivo
const usersData = ref({
  totalUsers: 0,
  admins: 0,
  supervisors: 0,
  operators: 0,
  newUsersToday: 0
})

// Método de manejo de eventos
const handleManageUsersClick = () => emit('manage-users')

// Cargar estadísticas de usuarios
const loadUsersStats = async () => {
  try {
    const users = await getRecords('usuarios') as User[]
    
    if (users && Array.isArray(users)) {
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

// Lifecycle
onMounted(() => {
  loadUsersStats()
})
</script>

<style scoped>
/* Estilos heredados del sistema de diseño Vuetify */
</style>
