<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">
          <v-icon class="mr-2" size="large">mdi-cog</v-icon>
          Configuración del Sistema
        </h1>
      </v-col>
    </v-row>

    <!-- Sección de Backups (Solo Supervisor) -->
    <v-row v-if="authStore.user?.role === 'supervisor'">
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-shield-account</v-icon>
            Gestión de Backups (Solo Supervisor)
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Información del backup -->
            <v-alert type="info" variant="tonal" class="mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-2">
                ✅ Backup Completo Incluye:
              </div>
              <v-list density="compact" class="bg-transparent">
                <v-list-item>
                  <template #prepend>
                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Registros (ingresos/salidas)</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Usuarios (cuentas de operadores)</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Configuración (ajustes del sistema)</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Personas conocidas (recurrentes)</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Logs de auditoría (AGESIC)</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon size="small" color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Encuestas de satisfacción</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-alert>

            <!-- Botón de exportación principal -->
            <v-btn
              color="primary"
              size="x-large"
              @click="handleExportBackup"
              :loading="isExporting"
              :disabled="isExporting"
              block
              class="mb-4"
            >
              <v-icon start>mdi-download</v-icon>
              Exportar Backup Completo
            </v-btn>

            <!-- Advertencia de seguridad -->
            <v-alert type="warning" variant="tonal" class="mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-2">
                ⚠️ Importante:
              </div>
              <ul class="text-body-2">
                <li>Guarda el archivo <strong>.ircca</strong> en un lugar seguro (pendrive, nube)</li>
                <li>Lo necesitarás para recuperar datos si se pierde la tablet</li>
                <li>El archivo está cifrado con tu clave de sesión</li>
              </ul>
            </v-alert>

            <!-- Información del último backup -->
            <v-card v-if="lastBackupInfo" variant="outlined" class="mt-4">
              <v-card-text>
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-darken-1">Último backup creado:</div>
                    <div class="text-h6">{{ lastBackupInfo.date }}</div>
                    <div class="text-caption text-grey">
                      Tamaño: {{ lastBackupInfo.size }}
                    </div>
                  </div>
                  <v-icon size="48" color="success">mdi-check-circle</v-icon>
                </div>
              </v-card-text>
            </v-card>

            <!-- Lista de backups disponibles -->
            <v-expansion-panels v-if="backupsList.length > 0" class="mt-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon start>mdi-history</v-icon>
                  Ver backups disponibles ({{ backupsList.length }})
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list>
                    <v-list-item
                      v-for="backup in backupsList"
                      :key="backup.id"
                      class="mb-2"
                    >
                      <template #prepend>
                        <v-icon>mdi-database</v-icon>
                      </template>
                      <v-list-item-title>{{ backup.fileName }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ new Date(backup.timestamp).toLocaleString() }} -
                        {{ (backup.size / 1024 / 1024).toFixed(2) }} MB
                      </v-list-item-subtitle>
                      <template #append>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          @click="exportSpecificBackup(backup.id)"
                          :loading="exportingId === backup.id"
                        >
                          <v-icon>mdi-download</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Información adicional -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="bg-info text-white">
            <v-icon class="mr-2">mdi-information</v-icon>
            Información
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title class="text-caption text-grey">Sistema</v-list-item-title>
                <v-list-item-subtitle class="text-body-2">{{ systemInfo.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-grey">Versión</v-list-item-title>
                <v-list-item-subtitle class="text-body-2">{{ systemInfo.version }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-grey">Backup automático</v-list-item-title>
                <v-list-item-subtitle class="text-body-2">
                  {{ appStore.config.autoBackup ? 'Activado' : 'Desactivado' }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption text-grey">Intervalo</v-list-item-title>
                <v-list-item-subtitle class="text-body-2">
                  Cada {{ appStore.config.backupInterval }} minutos
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card elevation="2">
          <v-card-title class="bg-success text-white">
            <v-icon class="mr-2">mdi-help-circle</v-icon>
            Ayuda
          </v-card-title>
          <v-card-text>
            <p class="text-body-2 mb-2">
              <strong>¿Cómo usar el backup?</strong>
            </p>
            <ol class="text-body-2">
              <li>Click en "Exportar Backup"</li>
              <li>Se descarga archivo .ircca</li>
              <li>Guárdalo en pendrive o nube</li>
              <li>Para restaurar: usa la opción en Login</li>
            </ol>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mensaje si no es supervisor -->
    <v-row v-else>
      <v-col cols="12">
        <v-alert type="warning" variant="tonal">
          <v-icon start>mdi-shield-lock</v-icon>
          Solo el supervisor puede acceder a la gestión de backups
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useBackupExport } from '@/composables/useBackupExport'
import { SYSTEM_INFO } from '@/config/constants'

const authStore = useAuthStore()
const appStore = useAppStore()
const { isExporting, exportLatestBackup, exportBackup, getBackupsInfo } = useBackupExport()

const lastBackupInfo = ref<{ date: string; size: string } | null>(null)
const backupsList = ref<Array<{ id: string; timestamp: Date; size: number; fileName: string }>>([])
const exportingId = ref<string | null>(null)

const systemInfo = {
  name: SYSTEM_INFO.NAME,
  version: SYSTEM_INFO.VERSION
}

onMounted(async () => {
  if (authStore.user?.role === 'supervisor') {
    await loadBackupsInfo()
  }
})

async function loadBackupsInfo() {
  const backups = await getBackupsInfo()
  backupsList.value = backups

  if (backups.length > 0) {
    const latest = backups[0]
    lastBackupInfo.value = {
      date: new Date(latest.timestamp).toLocaleString('es-UY', {
        dateStyle: 'full',
        timeStyle: 'short'
      }),
      size: `${(latest.size / 1024 / 1024).toFixed(2)} MB`
    }
  }
}

async function handleExportBackup() {
  const result = await exportLatestBackup()
  if (result.success) {
    appStore.addNotification(
      '✅ Backup exportado exitosamente. Guárdalo en un lugar seguro.',
      'success'
    )
    // Recargar info de backups
    await loadBackupsInfo()
  } else {
    appStore.addNotification(
      '❌ Error al exportar backup: ' + (result.error || 'Error desconocido'),
      'error'
    )
  }
}

async function exportSpecificBackup(backupId: string) {
  exportingId.value = backupId
  const result = await exportBackup(backupId)
  exportingId.value = null

  if (result.success) {
    appStore.addNotification('✅ Backup exportado exitosamente', 'success')
  } else {
    appStore.addNotification('❌ Error al exportar backup', 'error')
  }
}
</script>

<style scoped>
.v-list-item {
  border-radius: 8px;
}

.v-expansion-panel {
  border-radius: 8px;
}
</style>
