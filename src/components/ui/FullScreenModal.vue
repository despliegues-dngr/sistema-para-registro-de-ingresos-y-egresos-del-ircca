<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fullscreen-modal-overlay"
        @click.self="handleOverlayClick"
      >
        <div class="fullscreen-modal-container">
          <!-- Header -->
          <div :class="['fullscreen-modal-header', `bg-${headerColor}`]">
            <div class="header-content">
              <div class="header-left">
                <div v-if="icon" class="header-icon">
                  <i :class="icon"></i>
                </div>
                <div class="header-text">
                  <h3 class="header-title">{{ title }}</h3>
                  <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
                </div>
              </div>
              <button
                v-if="showClose"
                class="close-button"
                @click="handleClose"
                aria-label="Cerrar"
              >
                <i class="mdi mdi-close"></i>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="fullscreen-modal-content">
            <slot />
          </div>

          <!-- Footer (opcional) -->
          <div v-if="$slots.footer" class="fullscreen-modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: boolean
  title: string
  subtitle?: string
  icon?: string
  headerColor?: string
  showClose?: boolean
  persistent?: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  headerColor: 'primary',
  showClose: true,
  persistent: false
})

const emit = defineEmits<Emits>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (!props.persistent) {
    handleClose()
  }
}

// ⚡ OPTIMIZACIÓN: Manejar tecla ESC directamente en el watch
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && modelValue.value && !props.persistent) {
    handleClose()
  }
}

// ⚡ PREVENIR CONFLICTOS: Gestión limpia de event listeners y body scroll
watch(modelValue, (newVal: boolean, oldVal: boolean) => {
  if (newVal && !oldVal) {
    // Modal se abre
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)
  } else if (!newVal && oldVal) {
    // Modal se cierra
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
  }
}, { immediate: false })

// ⚡ LIMPIEZA GARANTIZADA: Restaurar estado al desmontar componente
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* ========================================
   🎨 OVERLAY Y CONTENEDOR PRINCIPAL
   ======================================== */

.fullscreen-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  
  /* ⚡ GPU ACCELERATION - Sin blur para máxima performance */
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.fullscreen-modal-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: white;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

/* ========================================
   🎨 HEADER
   ======================================== */

.fullscreen-modal-header {
  padding: 1rem 1.5rem;
  color: white;
  flex-shrink: 0;
  
  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.header-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.header-subtitle {
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  line-height: 1.3;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
  
  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-button:active {
  transform: scale(0.95) translateZ(0);
}

/* ========================================
   🎨 CONTENT
   ======================================== */

.fullscreen-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  
  /* ⚡ OPTIMIZACIÓN DE SCROLL */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  transform: translateZ(0);
}

/* ========================================
   🎨 FOOTER
   ======================================== */

.fullscreen-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
  background: white;
  
  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
}

/* ========================================
   🎨 TRANSICIONES OPTIMIZADAS
   ======================================== */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .fullscreen-modal-container,
.modal-leave-active .fullscreen-modal-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .fullscreen-modal-container {
  transform: translateY(-100%) translateZ(0);
}

.modal-leave-to .fullscreen-modal-container {
  transform: translateY(-100%) translateZ(0);
}

/* ========================================
   🎨 COLORES DE HEADER (Vuetify-like)
   ======================================== */

.bg-primary {
  background-color: #1565C0;
}

.bg-secondary {
  background-color: #424242;
}

.bg-success {
  background-color: #2E7D32;
}

.bg-error {
  background-color: #C62828;
}

.bg-warning {
  background-color: #F57C00;
}

.bg-info {
  background-color: #1976D2;
}

/* ========================================
   📱 RESPONSIVE
   ======================================== */

@media (min-width: 768px) {
  .fullscreen-modal-container {
    min-height: auto;
    max-height: 90vh;
    margin: 2rem auto;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .fullscreen-modal-overlay {
    align-items: center;
    padding: 2rem;
  }
}

/* ========================================
   🎯 OPTIMIZACIÓN PARA TABLETS
   ======================================== */

@media (hover: none) and (pointer: coarse) {
  /* Dispositivos táctiles */
  .close-button {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  .close-button:active {
    transition: transform 0.05s ease;
  }
}
</style>
