<template>
  <div class="status-card">
    <div class="status-card-header">
      <div class="status-icon">
        <i class="mdi mdi-shield-check"></i>
      </div>
      <div class="status-info">
        <h4 class="status-title">Estado del Sistema</h4>
        <p class="status-subtitle">Tus datos están protegidos</p>
      </div>
    </div>

    <div v-if="lastBackupInfo" class="status-details">
      <div class="detail-item">
        <i class="mdi mdi-calendar-clock"></i>
        <div>
          <div class="detail-label">Última copia de seguridad</div>
          <div class="detail-value">{{ lastBackupInfo.date }}</div>
        </div>
      </div>
      <div class="detail-item">
        <i class="mdi mdi-database"></i>
        <div>
          <div class="detail-label">Tamaño</div>
          <div class="detail-value">{{ lastBackupInfo.size }}</div>
        </div>
      </div>
    </div>

    <div v-else class="status-empty">
      <i class="mdi mdi-information-outline"></i>
      <p>Aún no hay copias guardadas.</p>
      <p class="status-empty-hint">Descarga tu primera copia de seguridad ahora.</p>
    </div>

    <!-- Mensaje de éxito temporal -->
    <transition name="fade">
      <div v-if="showSuccess" class="success-message">
        <i class="mdi mdi-check-circle"></i>
        <div class="success-text">
          <strong>¡Descarga completada!</strong>
          <p>Tu copia de seguridad está guardada en Descargas</p>
        </div>
      </div>
    </transition>

    <!-- Botón de acción principal -->
    <button
      class="btn-primary-large"
      @click="$emit('export')"
      :disabled="isExporting"
    >
      <i v-if="!isExporting" class="mdi mdi-download"></i>
      <i v-else class="mdi mdi-loading mdi-spin"></i>
      {{ isExporting ? 'Descargando...' : 'Descargar Copia de Seguridad' }}
    </button>

    <!-- Ayuda rápida -->
    <div class="help-section">
      <button class="help-toggle" @click="showHelp = !showHelp">
        <i :class="['mdi', showHelp ? 'mdi-chevron-up' : 'mdi-chevron-down']"></i>
        ¿Qué se guarda en la copia?
      </button>
      <transition name="expand">
        <div v-if="showHelp" class="help-content">
          <ul class="help-list">
            <li><i class="mdi mdi-check"></i> Registros de ingresos y salidas</li>
            <li><i class="mdi mdi-check"></i> Usuarios del sistema</li>
            <li><i class="mdi mdi-check"></i> Configuración</li>
            <li><i class="mdi mdi-check"></i> Personas conocidas</li>
            <li><i class="mdi mdi-check"></i> Historial de auditoría</li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  lastBackupInfo?: { date: string; size: string } | null
  isExporting: boolean
  exportSuccess?: boolean
}

interface Emits {
  export: []
}

const props = defineProps<Props>()
defineEmits<Emits>()

const showHelp = ref(false)
const showSuccess = ref(false)

// Mostrar mensaje de éxito cuando exportSuccess cambia a true
watch(() => props.exportSuccess, (newVal) => {
  if (newVal) {
    showSuccess.value = true
    // Ocultar después de 4 segundos
    setTimeout(() => {
      showSuccess.value = false
    }, 4000)
  }
})
</script>

<style scoped>
.status-card {
  background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(21, 101, 192, 0.3);
}

.status-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.status-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
}

.status-details {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.detail-item > i {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.detail-label {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
}

.status-empty {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.status-empty i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.7;
}

.status-empty p {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

.status-empty-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  opacity: 0.75;
}

.btn-primary-large {
  width: 100%;
  padding: 1.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  background: white;
  color: #1565C0;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.btn-primary-large:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-primary-large i {
  font-size: 1.5rem;
}

.help-section {
  margin-top: 1.5rem;
}

.help-toggle {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.help-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
}

.help-content {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.help-list i {
  font-size: 1.1rem;
  opacity: 0.9;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.2);
  border: 2px solid rgba(76, 175, 80, 0.4);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.success-message i {
  font-size: 2rem;
  color: #4CAF50;
}

.success-text {
  flex: 1;
}

.success-text strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.success-text p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .status-card {
    padding: 1.5rem;
  }

  .status-card-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
