import { ref, watch } from 'vue'
import { useIdle, useTimeoutFn } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'

// Configuración de timeout - 3 horas de inactividad
const INACTIVITY_TIMEOUT = 3 * 60 * 60 * 1000 // 3 horas en ms
const WARNING_TIME = 5 * 60 * 1000 // 5 minutos antes de logout

/**
 * Composable para gestión de timeout de sesión por inactividad
 * Cumple con los requerimientos de security-architecture.md
 */
export function useSessionTimeout() {
  const authStore = useAuthStore()
  
  // Estado del diálogo de advertencia
  const showWarningDialog = ref(false)
  const remainingTime = ref(0)
  
  // Detectar inactividad del usuario 
  const { idle, lastActive, reset } = useIdle(INACTIVITY_TIMEOUT - WARNING_TIME)
  
  // Timer para el logout automático después de mostrar advertencia
  const { start: startLogoutTimer, stop: stopLogoutTimer } = useTimeoutFn(() => {
    logout()
  }, WARNING_TIME, { immediate: false })
  
  // Contador regresivo para mostrar en el diálogo (removido por no estar en uso)
  const { stop: stopCountdown } = useTimeoutFn(() => {
    updateCountdown()
  }, 1000, { immediate: false })
  
  // Función para actualizar el contador regresivo
  function updateCountdown() {
    if (remainingTime.value > 0) {
      remainingTime.value -= 1000
      
      if (remainingTime.value > 0) {
        // Continuar contando
        setTimeout(updateCountdown, 1000)
      } else {
        // Se acabó el tiempo
        logout()
      }
    }
  }
  
  // Observar cambios en el estado de inactividad
  watch(idle, (isIdle) => {
    // Solo procesar si el usuario está autenticado y realmente está inactivo
    if (isIdle && authStore.isAuthenticated && authStore.user) {
      showWarning()
    }
  })

  // También observar el estado de autenticación para limpiar timers si se desloguea
  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (!isAuth) {
      cleanup()
    }
  })
  
  // Función para mostrar advertencia de expiración
  function showWarning() {
    showWarningDialog.value = true
    remainingTime.value = WARNING_TIME
    startLogoutTimer()
    updateCountdown()
  }
  
  // Función para extender la sesión
  function extendSession() {
    showWarningDialog.value = false
    remainingTime.value = 0
    stopLogoutTimer()
    stopCountdown()
    reset() // Reset del timer de inactividad
  }
  
  // Función para cerrar sesión
  function logout() {
    showWarningDialog.value = false
    remainingTime.value = 0
    stopLogoutTimer()
    stopCountdown()
    authStore.logout()
    
    // Redirigir al login (se puede hacer desde el router guard)
    window.location.href = '/login'
  }
  
  // Función para resetear el timer manualmente (útil para acciones del usuario)
  function resetTimer() {
    if (authStore.isAuthenticated) {
      reset()
    }
  }
  
  // Función para inicializar el sistema de timeout
  function initializeTimeout() {
    if (authStore.isAuthenticated) {
      reset() // Iniciar el timer
    }
  }
  
  // Función para limpiar todos los timers
  function cleanup() {
    showWarningDialog.value = false
    remainingTime.value = 0
    stopLogoutTimer()
    stopCountdown()
  }
  
  return {
    // Estado reactivo
    showWarningDialog,
    remainingTime,
    idle,
    lastActive,
    
    // Métodos públicos
    extendSession,
    logout,
    resetTimer,
    initializeTimeout,
    cleanup
  }
}

// Función helper para formatear el tiempo restante
export function formatRemainingTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${remainingSeconds}s`
  }
}
