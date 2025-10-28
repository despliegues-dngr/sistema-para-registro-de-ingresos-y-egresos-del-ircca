<template>
  <div class="import-section">
    <div class="section-divider">
      <span>O restaurar desde archivo</span>
    </div>

    <div class="alert alert-info">
      <div class="alert-header">
        <i class="mdi mdi-upload"></i>
        <strong>Importar Backup:</strong>
      </div>
      <p class="alert-text">
        Selecciona un archivo <strong>.ircca</strong> para restaurar todos los datos del sistema.
      </p>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".ircca"
      style="display: none"
      @change="handleFileSelect"
    />

    <button
      class="btn-import-large"
      @click="triggerFileInput"
      :disabled="isImporting"
    >
      <i v-if="!isImporting" class="mdi mdi-upload"></i>
      <i v-else class="mdi mdi-loading mdi-spin"></i>
      {{ isImporting ? 'Importando...' : 'Importar Backup desde Archivo' }}
    </button>

    <!-- Progreso de importación -->
    <div v-if="importProgress" class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: importProgress + '%' }"></div>
      </div>
      <div class="progress-text">{{ importProgress }}% completado</div>
    </div>

    <!-- Advertencia crítica -->
    <div class="alert alert-danger">
      <div class="alert-header">
        <i class="mdi mdi-alert-octagon"></i>
        <strong>⚠️ Advertencia Crítica:</strong>
      </div>
      <ul class="warning-list">
        <li>Esta acción <strong>reemplazará todos los datos actuales</strong></li>
        <li>Se recomienda exportar un backup antes de importar</li>
        <li>El proceso no se puede deshacer</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isImporting: boolean
  importProgress: number | null
}

interface Emits {
  'import-file': [file: File]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    emit('import-file', file)
    // Limpiar input para permitir seleccionar el mismo archivo nuevamente
    target.value = ''
  }
}
</script>

<style scoped>
.import-section {
  margin-bottom: 2rem;
}

.section-divider {
  text-align: center;
  margin: 2rem 0;
  position: relative;
}

.section-divider::before,
.section-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e0e0e0;
}

.section-divider::before {
  left: 0;
}

.section-divider::after {
  right: 0;
}

.section-divider span {
  background: white;
  padding: 0 1rem;
  color: #757575;
  font-size: 0.9rem;
}

.alert {
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid;
  margin-bottom: 1rem;
}

.alert-info {
  background-color: rgba(33, 150, 243, 0.1);
  border-left-color: #2196F3;
}

.alert-danger {
  background-color: rgba(244, 67, 54, 0.1);
  border-left-color: #F44336;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.alert-header i {
  font-size: 1.25rem;
}

.alert-text {
  margin: 0;
  font-size: 0.95rem;
  color: #424242;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.warning-list li::before {
  content: '•';
  font-size: 1.2rem;
  color: #F44336;
}

.btn-import-large {
  width: 100%;
  padding: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #43A047 0%, #388E3C 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(67, 160, 71, 0.3);
  margin-bottom: 1rem;
}

.btn-import-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(67, 160, 71, 0.4);
}

.btn-import-large:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-import-large i {
  font-size: 1.5rem;
}

.progress-section {
  margin: 1rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #43A047 0%, #66BB6A 100%);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: #757575;
  font-weight: 500;
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
</style>
