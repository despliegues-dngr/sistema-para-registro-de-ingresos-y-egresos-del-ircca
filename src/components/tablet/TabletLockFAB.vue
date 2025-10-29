<template>
  <!-- Botón Flotante de Bloqueo - Siempre visible -->
  <div class="lock-fab-container">
    <!-- Botón Principal -->
    <v-btn
      :class="['lock-fab', { 'lock-fab--waiting': isWaitingSecondTap }]"
      :size="isWaitingSecondTap ? 'x-large' : 'large'"
      :color="isWaitingSecondTap ? 'warning' : 'primary'"
      icon
      elevation="6"
      @click="handleLockTap"
    >
      <v-icon :size="isWaitingSecondTap ? 32 : 28">
        {{ isWaitingSecondTap ? 'mdi-lock-alert' : 'mdi-lock' }}
      </v-icon>
      
      <!-- Tooltip solo cuando no está esperando segundo tap -->
      <v-tooltip v-if="!isWaitingSecondTap" activator="parent" location="top">
        Bloquear pantalla
      </v-tooltip>
    </v-btn>

    <!-- Texto de Confirmación -->
    <v-slide-y-reverse-transition>
      <div v-if="isWaitingSecondTap" class="lock-confirmation-text">
        <v-icon size="20" class="mr-1">mdi-gesture-tap</v-icon>
        Toca de nuevo para bloquear
      </div>
    </v-slide-y-reverse-transition>

    <!-- Indicador de Progreso (countdown visual) -->
    <v-progress-circular
      v-if="isWaitingSecondTap"
      :model-value="progressValue"
      :size="isWaitingSecondTap ? 80 : 64"
      :width="3"
      color="warning"
      class="lock-progress"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Estado del componente
const isWaitingSecondTap = ref(false)
const progressValue = ref(0)
let timeoutId: number | null = null
let intervalId: number | null = null

// Constantes
const CONFIRMATION_TIMEOUT = 3000 // 3 segundos para confirmar
const PROGRESS_INTERVAL = 30 // Actualizar cada 30ms

/**
 * Maneja el tap en el botón de bloqueo
 */
const handleLockTap = (): void => {
  console.log('🔒 [Lock] Click detectado en botón de bloqueo')
  console.log('🔒 [Lock] Esperando segundo tap:', isWaitingSecondTap.value)
  
  if (!isWaitingSecondTap.value) {
    // Primer tap: Activar modo de confirmación
    console.log('🔒 [Lock] Primer tap - activando modo confirmación')
    startConfirmationMode()
  } else {
    // Segundo tap: Bloquear pantalla
    console.log('🔒 [Lock] Segundo tap - bloqueando pantalla')
    lockScreen()
  }
}

/**
 * Inicia el modo de confirmación (esperando segundo tap)
 */
const startConfirmationMode = (): void => {
  isWaitingSecondTap.value = true
  progressValue.value = 100

  // Iniciar countdown visual
  const startTime = Date.now()
  intervalId = window.setInterval(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, CONFIRMATION_TIMEOUT - elapsed)
    progressValue.value = (remaining / CONFIRMATION_TIMEOUT) * 100

    if (remaining === 0) {
      clearInterval(intervalId!)
      intervalId = null
    }
  }, PROGRESS_INTERVAL)

  // Timer para cancelar si no hay segundo tap
  timeoutId = window.setTimeout(() => {
    cancelConfirmationMode()
  }, CONFIRMATION_TIMEOUT)
}

/**
 * Cancela el modo de confirmación
 */
const cancelConfirmationMode = (): void => {
  isWaitingSecondTap.value = false
  progressValue.value = 0
  
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

/**
 * Bloquea la pantalla usando Fully Kiosk API
 */
const lockScreen = (): void => {
  console.log('🔒 [Lock] Intentando bloquear pantalla')
  console.log('🔒 [Lock] window.fully existe:', !!window.fully)
  
  // Limpiar timers
  cancelConfirmationMode()

  // Llamar a Fully Kiosk API
  if (window.fully && typeof window.fully.screenOff === 'function') {
    try {
      console.log('🔒 [Lock] Llamando a window.fully.screenOff()')
      window.fully.screenOff()
      console.log('✅ [Lock] Pantalla bloqueada exitosamente')
    } catch (error) {
      console.error('❌ [Lock] Error al bloquear pantalla:', error)
    }
  } else {
    console.warn('⚠️ [Lock] Fully Kiosk no disponible o sin función screenOff')
    console.log('🔍 [Lock] Diagnóstico:')
    console.log('  - window existe:', typeof window !== 'undefined')
    console.log('  - window.fully existe:', !!window.fully)
    console.log('  - screenOff es función:', window.fully ? typeof window.fully.screenOff === 'function' : false)
  }
}
</script>

<style scoped>
/* Contenedor del FAB */
.lock-fab-container {
  position: fixed;
  /* Calcular posición respetando el footer (altura típica ~80px + margen) */
  bottom: max(24px, calc(var(--footer-height, 80px) + 16px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  
  /* Transición suave cuando cambia la posición */
  transition: bottom 0.3s ease;
}

/* Botón Flotante */
.lock-fab {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.lock-fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.lock-fab--waiting {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Texto de Confirmación */
.lock-confirmation-text {
  position: absolute;
  bottom: 100%;
  margin-bottom: 16px;
  background: rgba(255, 152, 0, 0.95);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Indicador de Progreso Circular */
.lock-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* Responsive: Ajustar para pantallas pequeñas */
@media (max-width: 600px) {
  .lock-fab-container {
    bottom: 16px;
  }
}
</style>
