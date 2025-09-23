<script setup lang="ts">
// App principal - Estructura limpia según arquitectura documentada
// Importamos AuthBackground para aplicar el fondo gubernamental a toda la aplicación
import { onMounted } from 'vue'
import AuthBackground from '@/components/layout/AuthBackground.vue'
import { useStorageMonitor } from '@/composables/useStorageMonitor'

// Inicializar monitor de almacenamiento a nivel de aplicación
const { ensurePersistence, startMonitoring } = useStorageMonitor()

onMounted(async () => {
  // Asegurar persistencia de almacenamiento al iniciar la aplicación
  await ensurePersistence()
  
  // Iniciar monitoreo automático cada 30 minutos
  startMonitoring(30)
})
</script>

<template>
  <v-app>
    <v-main>
      <!-- AuthBackground envuelve toda la aplicación para consistencia visual gubernamental -->
      <AuthBackground>
        <router-view />
      </AuthBackground>
    </v-main>
  </v-app>
</template>

