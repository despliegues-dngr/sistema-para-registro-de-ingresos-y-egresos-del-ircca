<template>
  <v-container fluid class="pa-6">
    <!-- Header de bienvenida temporal -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6" elevation="2">
          <v-card-title class="bg-primary text-white pa-4">
            <v-icon left class="mr-2">mdi-view-dashboard</v-icon>
            Dashboard - Sistema IRCCA
          </v-card-title>
          <v-card-text class="pa-4">
            <h2 class="text-h4 mb-2">¡Bienvenido al Sistema!</h2>
            <p class="text-body-1 mb-0">
              Esta es una vista temporal del Dashboard. La funcionalidad completa se desarrollará en futuras tareas.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Información del usuario actual -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="1">
          <v-card-title class="text-h6">
            <v-icon left class="mr-2">mdi-account-circle</v-icon>
            Información de Sesión
          </v-card-title>
          <v-card-text>
            <p><strong>Usuario:</strong> {{ authStore.user?.username || 'Usuario de prueba' }}</p>
            <p><strong>Rol:</strong> {{ authStore.user?.role || 'Operador' }}</p>
            <p><strong>Estado:</strong> 
              <v-chip color="success" small>
                <v-icon left small>mdi-check-circle</v-icon>
                Autenticado
              </v-chip>
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Acciones disponibles -->
      <v-col cols="12" md="6">
        <v-card elevation="1">
          <v-card-title class="text-h6">
            <v-icon left class="mr-2">mdi-cog</v-icon>
            Acciones
          </v-card-title>
          <v-card-text>
            <v-btn
              color="error"
              variant="elevated"
              @click="handleLogout"
              :loading="isLoggingOut"
              block
              class="mb-2"
            >
              <v-icon left>mdi-logout</v-icon>
              Cerrar Sesión
            </v-btn>
            
            <p class="text-caption text-center mt-2">
              El Dashboard completo se implementará en las próximas tareas del proyecto.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Placeholder para futuras funcionalidades -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card elevation="1" class="text-center pa-6">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-construction</v-icon>
          <h3 class="text-h5 mb-2">Funcionalidades en Desarrollo</h3>
          <p class="text-body-1 text-grey">
            Aquí se implementarán las estadísticas, acciones rápidas de registro y la lista de personas dentro del predio.
          </p>
          <v-chip color="info" variant="outlined">
            <v-icon left small>mdi-calendar-clock</v-icon>
            Próximamente en TASK-1.3.2-FE
          </v-chip>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isLoggingOut = ref(false)

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
/* Estilos específicos del componente si son necesarios */
.v-container {
  max-width: 1200px;
}
</style>
