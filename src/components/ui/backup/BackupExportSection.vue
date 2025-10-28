<template>
  <div class="export-section">
    <button
      class="btn-export-large"
      @click="$emit('export')"
      :disabled="isExporting"
    >
      <i v-if="!isExporting" class="mdi mdi-download"></i>
      <i v-else class="mdi mdi-loading mdi-spin"></i>
      {{ isExporting ? 'Exportando...' : 'Exportar Backup Completo' }}
    </button>

    <!-- Información del último backup -->
    <div v-if="lastBackupInfo" class="last-backup-section">
      <div class="backup-info-card">
        <div class="backup-info-content">
          <div>
            <div class="text-caption">Último backup creado:</div>
            <div class="text-h6">{{ lastBackupInfo.date }}</div>
            <div class="text-caption text-muted">
              Tamaño: {{ lastBackupInfo.size }}
            </div>
          </div>
          <i class="mdi mdi-check-circle text-success icon-large"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isExporting: boolean
  lastBackupInfo?: { date: string; size: string } | null
}

interface Emits {
  export: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.export-section {
  margin-bottom: 2rem;
}

.btn-export-large {
  width: 100%;
  padding: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-export-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.btn-export-large:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-export-large i {
  font-size: 1.5rem;
}

.last-backup-section {
  margin-top: 2rem;
}

.backup-info-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
}

.backup-info-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-large {
  font-size: 3rem;
}

.text-success {
  color: #4CAF50;
}

.text-muted {
  color: #757575;
}

.text-caption {
  font-size: 0.85rem;
  color: #757575;
}

.text-h6 {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0.25rem 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .backup-info-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
