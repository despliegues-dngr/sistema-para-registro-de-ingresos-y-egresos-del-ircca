<script setup lang="ts">
// App principal - Estructura limpia según arquitectura documentada
// Importamos AuthBackground para aplicar el fondo gubernamental a toda la aplicación
import { onMounted } from 'vue'
import AuthBackground from '@/components/layout/AuthBackground.vue'
import TabletLockFAB from '@/components/tablet/TabletLockFAB.vue'
import DebugConsolePanel from '@/components/dev/DebugConsolePanel.vue'
import { useStorageMonitor } from '@/composables/useStorageMonitor'
import { useAutoBackup } from '@/composables/useAutoBackup'
import { useAppStore } from '@/stores/app'

// Detectar si estamos en modo desarrollo
const isDevelopment = import.meta.env.DEV

// Inicializar stores y composables
const appStore = useAppStore()
const { ensurePersistence, startMonitoring } = useStorageMonitor()

// Inicializar sistema de backups automáticos
useAutoBackup()

onMounted(async () => {
  // Asegurar persistencia de almacenamiento al iniciar la aplicación
  await ensurePersistence()
  
  // ⭐ NUEVO: Cargar configuración desde IndexedDB (incluyendo destinos)
  await appStore.loadConfigFromDB()
  
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
    
    <!-- Botón Flotante de Bloqueo (solo visible en tablets) -->
    <TabletLockFAB />
    
    <!-- Panel de Debug Console (solo en desarrollo) -->
    <DebugConsolePanel v-if="isDevelopment" :max-logs="150" />
  </v-app>
</template>

