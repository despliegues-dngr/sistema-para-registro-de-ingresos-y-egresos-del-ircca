<template>
  <FullScreenModal
    v-model="modelValue"
    title="Sesión por Expirar"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-clock-alert"
    header-color="warning"
    :persistent="true"
    @close="handleClose"
  >
    <div class="content-center">
      <i class="mdi mdi-timer warning-icon"></i>

      <h4 class="title">Su sesión está por expirar</h4>

      <p class="description">
        Por motivos de seguridad, su sesión se cerrará automáticamente por inactividad.
      </p>

      <div class="session-countdown">
        <div class="countdown-display">
          <i class="mdi mdi-clock-outline countdown-icon"></i>
          <span class="countdown-time">
            {{ formattedTime }}
          </span>
        </div>
        <p class="countdown-label">
          Tiempo restante antes del cierre automático
        </p>
      </div>

      <div class="info-alert">
        <i class="mdi mdi-information info-icon"></i>
        <div class="info-content">
          <strong>¿Desea continuar trabajando?</strong><br>
          Haga clic en "Extender Sesión" para continuar o "Cerrar Sesión" para salir del sistema de forma segura.
        </div>
      </div>
    </div>

    <!-- Footer con botones de acción -->
    <template #footer>
      <div class="footer-actions">
        <button class="btn-danger" @click="$emit('logout')">
          <i class="mdi mdi-logout"></i>
          Cerrar Sesión
        </button>
        <button class="btn-primary" @click="$emit('extend')">
          <i class="mdi mdi-clock-plus"></i>
          Extender Sesión
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatRemainingTime } from '@/composables/useSessionTimeout'
import FullScreenModal from './FullScreenModal.vue'

interface Props {
  modelValue: boolean
  remainingTime: number // en millisegundos
}

interface Emits {
  'update:modelValue': [value: boolean]
  extend: []
  logout: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed para v-model
const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Computed
const formattedTime = computed(() => formatRemainingTime(props.remainingTime))

const handleClose = () => {
  // No permitir cerrar con ESC o click fuera (persistent)
  // Solo se puede cerrar con los botones
}
</script>

<style scoped>
/* ========================================
   📋 CONTENIDO CENTRADO
   ======================================== */

.content-center {
  text-align: center;
  padding: 2rem 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.warning-icon {
  font-size: 4rem;
  color: #F57C00;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212121;
  margin-bottom: 1rem;
}

.description {
  font-size: 1rem;
  color: #616161;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* ========================================
   ⏱️ COUNTDOWN
   ======================================== */

.session-countdown {
  background: #FFF3E0;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #FFE0B2;
  margin-bottom: 1.5rem;
}

.countdown-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.countdown-icon {
  font-size: 1.5rem;
  color: #D32F2F;
}

.countdown-time {
  font-size: 2.5rem;
  font-weight: 700;
  color: #D32F2F;
}

.countdown-label {
  font-size: 0.75rem;
  color: #757575;
  margin: 0;
}

/* ========================================
   ℹ️ INFO ALERT
   ======================================== */

.info-alert {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #E3F2FD;
  border: 1px solid #BBDEFB;
  border-radius: 8px;
  text-align: left;
  margin-bottom: 1rem;
}

.info-icon {
  font-size: 1.5rem;
  color: #1976D2;
  flex-shrink: 0;
}

.info-content {
  font-size: 0.875rem;
  color: #424242;
  line-height: 1.5;
}

.info-content strong {
  color: #1976D2;
}

/* ========================================
   🎨 FOOTER ACTIONS
   ======================================== */

.footer-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.btn-danger,
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  flex: 1;
  
  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.btn-danger {
  background: transparent;
  color: #D32F2F;
  border: 1px solid #D32F2F;
}

.btn-danger:hover {
  background: #FFEBEE;
  border-color: #C62828;
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-danger:active {
  transform: scale(0.98) translateZ(0);
}

.btn-primary {
  background: #1565C0;
  color: white;
  border: 1px solid #1565C0;
}

.btn-primary:hover {
  background: #0D47A1;
  border-color: #0D47A1;
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary:active {
  transform: scale(0.98) translateZ(0);
}

.btn-danger i,
.btn-primary i {
  font-size: 1.125rem;
}

/* ========================================
   📱 RESPONSIVE
   ======================================== */

@media (max-width: 600px) {
  .content-center {
    padding: 1.5rem 1rem;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .btn-danger,
  .btn-primary {
    width: 100%;
  }
}
</style>
