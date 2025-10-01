<template>
  <v-card class="mb-8 welcome-header" elevation="3">
    <!-- Navbar Verde Gubernamental - Layout Simple y Limpio -->
    <v-card-item class="bg-accent text-white pa-4" style="border: 2px solid rgba(255, 255, 255, 0.3);">
      <!-- Fila Superior: Info Usuario | Servicio -->
      <div class="d-flex justify-space-between align-start mb-2">
        <!-- Izquierda: Avatar + Info -->
        <div class="d-flex align-start">
          <!-- Avatar con Menú -->
          <v-menu location="bottom">
            <template v-slot:activator="{ props }">
              <v-avatar 
                size="56" 
                color="white" 
                class="user-avatar mr-3"
                v-bind="props"
                style="margin-top: 20px;"
              >
                <v-icon size="28" color="primary">mdi-account</v-icon>
              </v-avatar>
            </template>
            
            <!-- Menú Desplegable Refinado -->
            <v-card class="user-menu" elevation="12" min-width="280" rounded="lg">
              <!-- Header del menú con fondo azul -->
              <v-card-item class="bg-primary text-white py-4 px-5">
                <div class="d-flex align-center">
                  <v-avatar size="56" color="white" class="mr-3">
                    <v-icon size="28" color="primary">mdi-account-circle</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-body-1 font-weight-bold mb-1">{{ authStore.user?.nombre }} {{ authStore.user?.apellido }}</div>
                    <div class="text-caption opacity-90 mb-0">{{ userGradeDisplay }}</div>
                  </div>
                </div>
              </v-card-item>
              
              <!-- Opciones del menú con íconos Material -->
              <v-list density="comfortable" class="py-2">
                <v-list-item 
                  @click="showViewProfile = true" 
                  prepend-icon="mdi-account-circle-outline"
                  class="menu-item"
                >
                  <v-list-item-title class="font-weight-medium">Ver Perfil Completo</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Información personal</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item 
                  @click="showChangePassword = true" 
                  prepend-icon="mdi-lock-reset"
                  class="menu-item"
                >
                  <v-list-item-title class="font-weight-medium">Cambiar Contraseña</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Seguridad de cuenta</v-list-item-subtitle>
                </v-list-item>
                
                <v-divider class="my-2 mx-3"></v-divider>
                
                <v-list-item 
                  @click="$emit('logout')" 
                  prepend-icon="mdi-logout"
                  class="menu-item text-error"
                >
                  <v-list-item-title class="font-weight-bold">Cerrar Sesión</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Salir del sistema</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
          
          <div>
            <div class="text-caption opacity-75 text-uppercase mb-2" style="line-height: 1.2;">IRCCA - Control de Accesos</div>
            <div class="text-body-2 mb-1">{{ dynamicGreeting }}</div>
            <div class="text-h6 font-weight-bold mb-1" style="line-height: 1.3;">{{ gradeAndName }}</div>
          </div>
        </div>

        <!-- Derecha: Fecha -->
        <div class="text-right">
          <div class="d-flex align-center justify-end">
            <v-icon size="18" class="mr-2 opacity-75">mdi-calendar-today</v-icon>
            <span class="text-body-2 opacity-90 font-weight-medium">{{ currentDate }}</span>
          </div>
        </div>
      </div>

      <!-- Fila Inferior: Servicio | Hora -->
      <div class="d-flex justify-space-between align-center">
        <div class="text-caption opacity-50">Serv. Art. 222 - IRCCA</div>
        
        <div class="d-flex align-center">
          <v-icon size="18" class="mr-2 opacity-75">mdi-clock-outline</v-icon>
          <span class="text-h6 font-weight-bold font-mono">{{ currentTime }}</span>
        </div>
      </div>
    </v-card-item>

    <!-- Modales de usuario -->
    <UserProfileDialog
      v-model="showViewProfile"
      :user-data="currentUserData"
      @success="handleProfileSuccess"
      @close="handleDialogClose"
    />

    <ChangePasswordDialog
      v-model="showChangePassword"
      @success="handlePasswordSuccess"
      @close="handleDialogClose"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import UserProfileDialog from '@/components/ui/UserProfileDialog.vue'
import ChangePasswordDialog from '@/components/ui/ChangePasswordDialog.vue'

const authStore = useAuthStore()

// Estado de los modales
const showViewProfile = ref(false)
const showChangePassword = ref(false)

// Definir eventos que emite este componente
defineEmits<{
  'view-profile': []
  'edit-profile': []
  'change-password': []
  'logout': []
}>()

// Estado reactivo para fecha y hora
const currentDate = ref('')
const currentTime = ref('')
let timeInterval: number | null = null

// Variable displayName eliminada (ya no se usa tras el rediseño)

// Computed para mostrar el grado completo del usuario
const userGradeDisplay = computed(() => {
  const user = authStore.user
  if (!user?.grado) return 'Usuario Sistema'
  
  // Opciones de grado para mostrar el título completo
  const gradoOptions = [
    { title: 'Guardia Republicano', value: 'guardia_republicano' },
    { title: 'Cabo', value: 'cabo' },
    { title: 'Sargento', value: 'sargento' },
    { title: 'Sub Oficial', value: 'sub_oficial' },
    { title: 'Alférez', value: 'alferez' },
    { title: 'Teniente', value: 'teniente' },
    { title: 'Tte. 1°', value: 'teniente_primero' },
    { title: 'Capitán', value: 'capitan' },
    { title: 'Cte. Mayor', value: 'comandante_mayor' },
    { title: 'Cte. General', value: 'comandante_general' },
  ]
  
  const gradoOption = gradoOptions.find(option => option.value === user.grado)
  return gradoOption?.title || user.grado
})

// Saludo dinámico según la hora del día (se actualiza automáticamente con el tiempo)
const dynamicGreeting = computed(() => {
  // Usar la hora actual que se actualiza cada segundo
  const now = new Date()
  const hour = now.getHours()
  
  if (hour >= 6 && hour < 12) {
    return '¡Buenos días!'
  } else if (hour >= 12 && hour < 20) {
    return '¡Buenas tardes!'
  } else {
    return '¡Buenas noches!'
  }
})

// Grado + Nombre completo
const gradeAndName = computed(() => {
  const user = authStore.user
  if (!user) return 'Usuario no identificado'
  
  // Obtener grado completo desde las opciones
  const gradoOptions = [
    { title: 'Guardia Republicano', value: 'guardia_republicano' },
    { title: 'Cabo', value: 'cabo' },
    { title: 'Sargento', value: 'sargento' },
    { title: 'Sub Oficial', value: 'sub_oficial' },
    { title: 'Alférez', value: 'alferez' },
    { title: 'Teniente', value: 'teniente' },
    { title: 'Tte. 1°', value: 'teniente_primero' },
    { title: 'Capitán', value: 'capitan' },
    { title: 'Cte. Mayor', value: 'comandante_mayor' },
    { title: 'Cte. General', value: 'comandante_general' },
  ]
  
  // Buscar el título completo del grado
  const gradoOption = gradoOptions.find(option => option.value === user.grado)
  const gradoDisplay = gradoOption?.title || user.grado || ''
  
  // Construir nombre completo
  const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim()
  
  // Si hay grado, mostrarlo con el nombre
  if (gradoDisplay && nombreCompleto) {
    return `${gradoDisplay} ${nombreCompleto}`
  } else if (nombreCompleto) {
    return nombreCompleto
  } else {
    return 'Usuario Sistema'
  }
})


// Datos del usuario actual para los modales
const currentUserData = computed(() => {
  console.log('🔍 DEBUG WelcomeHeader - authStore.user completo:', authStore.user)
  console.log('🔍 DEBUG WelcomeHeader - authStore.user.grado:', authStore.user?.grado)
  console.log('🔍 DEBUG WelcomeHeader - authStore.user.role:', authStore.user?.role)
  
  const userData = {
    cedula: authStore.user?.cedula || '12345678',
    grado: authStore.user?.grado || '',  // ✅ USAR GRADO MILITAR, NO ROL
    nombre: authStore.user?.nombre || 'Usuario',
    apellido: authStore.user?.apellido || 'Sistema',
    fechaRegistro: authStore.user?.fechaRegistro || '2025-09-01',
  }
  
  console.log('🔍 DEBUG WelcomeHeader - currentUserData generado:', userData)
  return userData
})

// Handlers para los modales
const handleProfileSuccess = (message: string) => {
  console.log('Perfil actualizado:', message)
  // TODO: Mostrar notificación de éxito
}

const handlePasswordSuccess = (message: string) => {
  console.log('Contraseña cambiada:', message)
  // TODO: Mostrar notificación de éxito
}

const handleDialogClose = () => {
  // Los modales se cerrarán automáticamente por el v-model
  console.log('Modal cerrado')
}

// Función para actualizar fecha y hora
const updateDateTime = () => {
  const now = new Date()
  
  // Formatear fecha
  currentDate.value = now.toLocaleDateString('es-UY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // Formatear hora en formato 24h gubernamental
  currentTime.value = now.toLocaleTimeString('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// Lifecycle hooks
onMounted(() => {
  updateDateTime()
  // Actualizar cada segundo
  timeInterval = window.setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* Navbar limpio y profesional */
.welcome-header {
  border-radius: 12px;
  overflow: hidden;
}

/* Avatar interactivo */
.user-avatar {
  cursor: pointer;
  border: 3px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Menú desplegable premium */
.user-menu {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* Items del menú con hover elegante */
.menu-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0 8px;
}

.menu-item:hover {
  background-color: rgba(21, 101, 192, 0.08);
  transform: translateX(4px);
}

/* Fuente monospace para hora */
.font-mono {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  letter-spacing: 0.5px;
}
</style>
