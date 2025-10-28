<template>
  <FullScreenModal
    v-model="modelValue"
    title="Gestión de Backups"
    subtitle="Exportar y administrar copias de seguridad"
    icon="mdi mdi-database-export"
    header-color="primary"
    :persistent="isExporting || isImporting"
    @close="handleClose"
  >
    <!-- Contenido del modal -->
    <div v-if="modelValue" class="backup-management-content">
      <!-- Información del backup -->
      <BackupInfoSection />

      <!-- Botón de exportación principal -->
      <BackupExportSection
        :is-exporting="isExporting"
        :last-backup-info="lastBackupInfo"
        @export="handleExportBackup"
      />

      <!-- Advertencia de seguridad -->
      <BackupWarningSection />

      <!-- Lista de backups disponibles -->
      <BackupListSection
        :backups-list="backupsList"
        :exporting-id="exportingId"
        @export-backup="exportSpecificBackup"
      />

      <!-- Sección de importación -->
      <BackupImportSection
        :is-importing="isImporting"
        :import-progress="importProgress"
        @import-file="handleImportBackup"
      />
    </div>

    <!-- Footer con botón de cerrar -->
    <template #footer>
      <div class="footer-actions">
        <button 
          class="btn-secondary" 
          @click="closeModal"
          :disabled="isExporting || isImporting"
        >
          <i class="mdi mdi-close"></i>
          Cerrar
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useBackupExport } from '@/composables/useBackupExport'
import { useBackupImport } from '@/composables/useBackupImport'
import FullScreenModal from './FullScreenModal.vue'
import BackupInfoSection from './backup/BackupInfoSection.vue'
import BackupExportSection from './backup/BackupExportSection.vue'
import BackupWarningSection from './backup/BackupWarningSection.vue'
import BackupListSection from './backup/BackupListSection.vue'
import BackupImportSection from './backup/BackupImportSection.vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
  success: [message: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const appStore = useAppStore()
const { isExporting, exportLatestBackup, exportBackup, getBackupsInfo } = useBackupExport()
const { isImporting, importProgress, importBackup } = useBackupImport()

const lastBackupInfo = ref<{ date: string; size: string } | null>(null)
const backupsList = ref<Array<{ id: string; timestamp: Date; size: number; fileName: string }>>([])
const exportingId = ref<string | null>(null)

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

onMounted(async () => {
  if (props.modelValue) {
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
    emit('success', 'Backup exportado exitosamente')
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
    emit('success', 'Backup exportado exitosamente')
  } else {
    appStore.addNotification('❌ Error al exportar backup', 'error')
  }
}

function closeModal() {
  emit('update:modelValue', false)
  emit('close')
}

async function handleImportBackup(file: File) {
  console.log('🎯 [MODAL] handleImportBackup llamado', { fileName: file.name, fileType: file.type, fileSize: file.size })
  
  // Confirmar antes de importar
  const confirmed = confirm(
    '⚠️ ADVERTENCIA CRÍTICA\n\n' +
    'Esta acción REEMPLAZARÁ TODOS los datos actuales del sistema.\n\n' +
    '¿Estás seguro de que deseas continuar?\n\n' +
    'Se recomienda exportar un backup antes de proceder.'
  )

  console.log('🎯 [MODAL] Usuario confirmó:', confirmed)
  if (!confirmed) return

  // Obtener CLAVE MAESTRA desde variable de entorno
  const masterKey = import.meta.env.VITE_BACKUP_MASTER_KEY || 'IRCCA_Sistema_MasterKey_2025_Secure'
  console.log('🎯 [MODAL] Usando CLAVE MAESTRA para importar')
  console.log('🎯 [MODAL] MasterKey configurada:', masterKey ? 'Sí' : 'No')

  console.log('🎯 [MODAL] Llamando a importBackup...')
  const result = await importBackup(file, masterKey)
  console.log('🎯 [MODAL] Resultado de importBackup:', result)
  
  if (result.success) {
    appStore.addNotification(
      '✅ Backup importado exitosamente. Todos los datos han sido restaurados.',
      'success'
    )
    emit('success', 'Backup importado exitosamente')
    // Recargar info de backups
    await loadBackupsInfo()
  } else {
    appStore.addNotification(
      '❌ Error al importar backup: ' + (result.error || 'Error desconocido'),
      'error'
    )
  }
}

function handleClose() {
  if (!isExporting.value && !isImporting.value) {
    closeModal()
  }
}
</script>

<style scoped>
.backup-management-content {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

/* Footer */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #757575;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #bdbdbd;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .backup-management-content {
    padding: 1rem;
  }
}
</style>
