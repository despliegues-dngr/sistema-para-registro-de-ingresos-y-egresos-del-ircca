<template>
  <v-card class="mb-8 welcome-header" elevation="4">
    <v-card-item class="header-solid text-white py-6 px-8">
      <div class="d-flex flex-column flex-sm-row justify-space-between align-center">
        <!-- Información del usuario con avatar -->
        <div class="d-flex align-center mb-4 mb-sm-0">
          <!-- Avatar elegante con iniciales -->
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-avatar 
                size="64" 
                color="white" 
                class="text-accent mr-4 user-avatar"
                v-bind="props"
                style="cursor: pointer; border: 3px solid rgba(255, 255, 255, 0.4); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);"
              >
                <span class="text-h5 font-weight-medium">{{ userInitials }}</span>
              </v-avatar>
            </template>
            
            <!-- Menú de usuario sobrio -->
            <v-card class="user-menu" elevation="8" min-width="240">
              <v-card-item class="pb-2">
                <div class="d-flex align-center">
                  <v-avatar size="40" color="accent" class="text-white mr-3">
                    <span class="text-h6">{{ userInitials }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-medium">{{ displayName }}</div>
                    <div class="text-caption text-grey-darken-1">{{ roleDisplay }}</div>
                  </div>
                </div>
              </v-card-item>
              
              <v-list density="compact" class="pt-0">
                <v-list-item @click="showViewProfile = true" prepend-icon="mdi-account-circle">
                  <v-list-item-title>Ver Perfil</v-list-item-title>
                </v-list-item>
                
                <v-list-item @click="showChangePassword = true" prepend-icon="mdi-lock-reset">
                  <v-list-item-title>Cambiar Contraseña</v-list-item-title>
                </v-list-item>
                
                <v-divider class="my-1"></v-divider>
                
                <v-list-item @click="$emit('logout')" prepend-icon="mdi-logout" class="text-error">
                  <v-list-item-title>Cerrar Sesión</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>

          <!-- Información textual institucional -->
          <div>
            <h2 class="text-h4 font-weight-bold mb-2">{{ displayName }}</h2>
            <p class="text-h6 mb-1 opacity-95 font-weight-medium">Sistema de Control de Acceso</p>
            <p class="text-body-2 mb-0 opacity-85">IRCCA</p>
          </div>
        </div>

        <!-- Fecha y hora -->
        <div class="text-center text-sm-right date-time-section">
          <div class="text-h6 font-weight-medium mb-1">{{ currentDate }}</div>
          <div class="text-body-1 opacity-90 font-mono time-display">
            <v-icon size="16" class="mr-1 opacity-75">mdi-clock-outline</v-icon>
            {{ currentTime }}
          </div>
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

// Información del usuario
const displayName = computed(() => {
  const user = authStore.user
  if (user?.username) {
    return user.username.charAt(0).toUpperCase() + user.username.slice(1)
  }
  return 'Usuario'
})

// Generar iniciales elegantes del usuario
const userInitials = computed(() => {
  const user = authStore.user
  if (user?.nombre && user?.apellido) {
    return (user.nombre.charAt(0) + user.apellido.charAt(0)).toUpperCase()
  } else if (user?.username) {
    const username = user.username
    if (username.length >= 2) {
      return (username.charAt(0) + username.charAt(1)).toUpperCase()
    }
    return username.charAt(0).toUpperCase()
  }
  return 'U'
})

const roleDisplay = computed(() => {
  const role = authStore.user?.role
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'operador':
      return 'Operador'
    default:
      return 'Operador'
  }
})

// Datos del usuario actual para los modales
const currentUserData = computed(() => ({
  cedula: authStore.user?.cedula || '12345678',
  grado: roleDisplay.value,
  nombre: authStore.user?.nombre || 'Usuario',
  apellido: authStore.user?.apellido || 'Sistema',
  fechaRegistro: authStore.user?.fechaRegistro || '2025-09-01',
}))

// Handlers para los modales
const handleProfileSuccess = (message: string) => {
  console.log('Perfil actualizado:', message)
  // TODO: Mostrar notificación de éxito
  // TODO: Actualizar datos del usuario en el store
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
/* Header gubernamental moderno y elegante */
.welcome-header {
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(21, 101, 192, 0.25) !important;
  transition: all 0.3s ease;
  overflow: hidden;
}

.welcome-header:hover {
  box-shadow: 0 6px 20px rgba(21, 101, 192, 0.35) !important;
}

/* Fondo azul gubernamental uruguayo - Autoridad institucional */
.header-solid {
  background: #1565C0 !important;
  position: relative;
}

.v-card-item {
  /* Border institucional sutil */
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.user-avatar {
  /* Transición suave para interacción */
  transition: all 0.2s ease;
}

.user-avatar:hover {
  /* Efecto hover elegante y discreto */
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.user-menu {
  /* Menú con sombra profesional */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px;
}

.font-mono {
  /* Fuente monospace para hora más legible */
  font-family: 'Consolas', 'Monaco', monospace;
}

/* Mejorar legibilidad con opacidad */
.opacity-90 {
  opacity: 0.9;
}

/* Hover effects sutiles para items del menú */
.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Refinamientos adicionales */
.date-time-section {
  min-width: 200px;
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 600px) {
  .time-display {
    justify-content: flex-end;
  }
}
</style>
