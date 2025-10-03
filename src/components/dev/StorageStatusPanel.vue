<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStorageMonitor } from '@/composables/useStorageMonitor'

const { storageInfo, updateStorageInfo, ensurePersistence, getStorageSummary } = useStorageMonitor()
const isRefreshing = ref(false)
const isRequestingPersistence = ref(false)

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const refreshStatus = async () => {
  isRefreshing.value = true
  await updateStorageInfo()
  isRefreshing.value = false
}

const requestPersistence = async () => {
  isRequestingPersistence.value = true
  await ensurePersistence()
  await updateStorageInfo()
  isRequestingPersistence.value = false
}

onMounted(() => {
  refreshStatus()
})
</script>

<template>
  <v-card class="mb-4" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-database" class="mr-2"></v-icon>
      Estado del Almacenamiento
    </v-card-title>
    
    <v-card-text>
      <!-- Estado de Persistencia -->
      <v-alert
        :type="storageInfo.isPersistent ? 'success' : 'warning'"
        :icon="storageInfo.isPersistent ? 'mdi-check-circle' : 'mdi-alert'"
        prominent
        class="mb-4"
      >
        <v-alert-title class="text-h6">
          {{ storageInfo.isPersistent ? 'Almacenamiento Persistente ACTIVO' : 'Almacenamiento NO Persistente' }}
        </v-alert-title>
        
        <div v-if="storageInfo.isPersistent" class="mt-2">
          ✅ Los datos están protegidos y no serán eliminados automáticamente por el navegador.
        </div>
        
        <div v-else class="mt-2">
          ⚠️ <strong>ADVERTENCIA:</strong> Los datos pueden ser eliminados automáticamente si el navegador necesita espacio.
          <br><br>
          <strong>Solución:</strong>
          <ul class="mt-2">
            <li>Instalar la PWA desde el menú del navegador</li>
            <li>Agregar el sitio a favoritos</li>
            <li>Usar la aplicación con frecuencia</li>
          </ul>
        </div>
      </v-alert>

      <!-- Métricas de Almacenamiento -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-text class="text-center">
              <div class="text-h6 text-primary">{{ formatBytes(storageInfo.usage) }}</div>
              <div class="text-caption">Usado</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-text class="text-center">
              <div class="text-h6 text-secondary">{{ formatBytes(storageInfo.quota) }}</div>
              <div class="text-caption">Cuota Total</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-text class="text-center">
              <div class="text-h6 text-success">{{ formatBytes(storageInfo.available) }}</div>
              <div class="text-caption">Disponible</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Barra de Progreso -->
      <div class="mb-4">
        <div class="d-flex justify-space-between mb-1">
          <span class="text-caption">Uso de Almacenamiento</span>
          <span class="text-caption font-weight-bold">{{ storageInfo.usagePercentage.toFixed(1) }}%</span>
        </div>
        <v-progress-linear
          :model-value="storageInfo.usagePercentage"
          :color="storageInfo.usagePercentage > 90 ? 'error' : storageInfo.usagePercentage > 75 ? 'warning' : 'success'"
          height="10"
          rounded
        ></v-progress-linear>
      </div>

      <!-- Resumen Textual -->
      <v-alert type="info" variant="tonal" density="compact" class="mb-4">
        <v-icon icon="mdi-information" class="mr-2"></v-icon>
        {{ getStorageSummary() }}
      </v-alert>

      <!-- Información Técnica -->
      <v-expansion-panels variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon icon="mdi-code-braces" class="mr-2"></v-icon>
            Información Técnica (Desarrollador)
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <pre class="text-caption">{{ JSON.stringify(storageInfo, null, 2) }}</pre>
            
            <v-divider class="my-3"></v-divider>
            
            <div class="text-caption">
              <strong>Base de Datos:</strong> IRCCA_Sistema_DB (IndexedDB)<br>
              <strong>Versión:</strong> 2<br>
              <strong>Stores:</strong> registros, usuarios, configuracion, backups, personasConocidas<br>
              <strong>Cifrado:</strong> AES-256-GCM activo<br>
              <strong>API:</strong> Storage Persistence API {{ 'storage' in navigator ? '✅ Disponible' : '❌ No Disponible' }}
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>

    <v-card-actions class="px-4 pb-4">
      <v-btn
        color="primary"
        variant="tonal"
        :loading="isRefreshing"
        @click="refreshStatus"
      >
        <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
        Actualizar Estado
      </v-btn>
      
      <v-btn
        v-if="!storageInfo.isPersistent"
        color="warning"
        variant="elevated"
        :loading="isRequestingPersistence"
        @click="requestPersistence"
      >
        <v-icon icon="mdi-shield-check" class="mr-2"></v-icon>
        Solicitar Persistencia
      </v-btn>
      
      <v-spacer></v-spacer>
      
      <v-btn
        variant="text"
        href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API"
        target="_blank"
        size="small"
      >
        <v-icon icon="mdi-help-circle" class="mr-1"></v-icon>
        Documentación
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
