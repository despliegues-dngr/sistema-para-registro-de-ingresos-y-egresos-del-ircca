<template>
  <div class="import-section">
    <!-- Header colapsable -->
    <div class="section-header" @click="toggleSection">
      <div class="section-title">
        <i class="mdi mdi-upload"></i>
        Restaurar desde archivo
      </div>
      <i :class="['mdi', showSection ? 'mdi-chevron-up' : 'mdi-chevron-down']"></i>
    </div>

    <!-- Contenido colapsable -->
    <transition name="expand">
      <div v-if="showSection" class="section-content">
        <div class="alert alert-info">
          <div class="alert-header">
            <i class="mdi mdi-information-outline"></i>
            <strong>¿Cómo funciona?</strong>
          </div>
          <p class="alert-text">
            Selecciona un archivo <strong>.ircca</strong> guardado previamente para recuperar todos los datos.
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
          {{ isImporting ? 'Restaurando...' : 'Seleccionar Archivo .ircca' }}
        </button>

        <!-- Progreso de importación -->
        <div v-if="importProgress && importProgress < 100" class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: importProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ importProgress }}% completado</div>
        </div>

        <!-- Pantalla de confirmación de éxito -->
        <transition name="fade">
          <div v-if="showSuccessScreen" class="success-screen">
            <div class="success-icon">
              <i class="mdi mdi-check-circle-outline"></i>
            </div>
            <h3 class="success-title">¡Restauración Exitosa!</h3>
            <p class="success-message">Todos tus datos han sido recuperados correctamente</p>
            <p class="reload-info">La aplicación se actualizará en {{ countdown }}s</p>
          </div>
        </transition>

        <!-- Advertencia crítica -->
        <div class="alert alert-danger">
          <div class="alert-header">
            <i class="mdi mdi-alert-octagon"></i>
            <strong>⚠️ Importante:</strong>
          </div>
          <ul class="warning-list">
            <li>Esta acción <strong>reemplazará todos los datos actuales</strong></li>
            <li>Recomendamos descargar una copia antes de continuar</li>
            <li>El proceso no se puede deshacer</li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  isImporting: boolean
  importProgress: number | null
  importSuccess?: boolean
}

interface Emits {
  'import-file': [file: File]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement | null>(null)
const showSection = ref(false)
const showSuccessScreen = ref(false)
const countdown = ref(3)

// Detectar cuando la importación se completa
watch(() => props.importProgress, (newVal) => {
  if (newVal === 100 && props.isImporting) {
    // Mostrar pantalla de éxito
    showSuccessScreen.value = true
    
    // Iniciar countdown
    const interval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  }
})

function toggleSection() {
  showSection.value = !showSection.value
}

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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.section-header:hover {
  background: #ffe0b2;
  border-color: #ff9800;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #e65100;
  font-size: 0.95rem;
}

.section-content {
  margin-top: 1rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
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

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.success-screen {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 16px;
  color: white;
  margin: 1rem 0;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
}

.success-icon {
  margin-bottom: 1.5rem;
}

.success-icon i {
  font-size: 5rem;
  color: white;
  animation: scaleIn 0.5s ease;
}

.success-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.success-message {
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.95;
}

.reload-info {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
