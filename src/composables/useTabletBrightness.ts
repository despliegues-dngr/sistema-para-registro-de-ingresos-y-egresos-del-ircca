import { ref, onMounted, computed } from 'vue'

/**
 * Composable para gestionar el brillo de la pantalla con Fully Kiosk Browser
 * 
 * Funcionalidades:
 * - Controles siempre visibles (graceful degradation)
 * - Permite ajustar brillo (0-255) si Fully Kiosk está disponible
 * - Guarda preferencia del usuario en localStorage
 * - Restaura brillo al cargar la aplicación
 * - Si Fully Kiosk no está disponible, los controles se muestran pero no hacen nada
 * 
 * @returns {Object} Estado y métodos para controlar el brillo
 */
export function useTabletBrightness() {
  // Estado reactivo
  const brightness = ref(180) // 70% por defecto (valor medio-alto)
  const isTablet = ref(true) // ✅ Siempre visible - funciona con graceful degradation
  const isLoading = ref(true)

  // Constantes
  const MIN_BRIGHTNESS = 50  // ~20% - Mínimo legible
  const MAX_BRIGHTNESS = 255 // 100% - Máximo
  const DEFAULT_BRIGHTNESS = 180 // 70% - Valor por defecto
  const STORAGE_KEY = 'ircca-tablet-brightness'

  /**
   * Calcula el porcentaje de brillo actual
   */
  const brightnessPercent = computed(() => {
    return Math.round((brightness.value / MAX_BRIGHTNESS) * 100)
  })

  /**
   * Verifica si Fully Kiosk está disponible
   * Nota: Los controles son siempre visibles, esta función solo verifica
   * si las funcionalidades de Fully Kiosk están disponibles
   */
  const checkFullyKiosk = (): boolean => {
    return typeof window !== 'undefined' && !!window.fully
  }

  /**
   * Obtiene el brillo actual del dispositivo
   */
  const getCurrentBrightness = (): number => {
    if (window.fully && typeof window.fully.getScreenBrightness === 'function') {
      try {
        return window.fully.getScreenBrightness()
      } catch {
        // Error al obtener brillo actual
      }
    }
    return DEFAULT_BRIGHTNESS
  }

  /**
   * Carga la preferencia de brillo guardada
   */
  const loadSavedBrightness = (): number => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const value = parseInt(saved, 10)
        // Validar que esté en rango válido
        if (!isNaN(value) && value >= MIN_BRIGHTNESS && value <= MAX_BRIGHTNESS) {
          return value
        }
      }
    } catch {
      // Error al cargar brillo guardado
    }
    return DEFAULT_BRIGHTNESS
  }

  /**
   * Guarda la preferencia de brillo
   */
  const saveBrightness = (value: number): void => {
    try {
      localStorage.setItem(STORAGE_KEY, value.toString())
    } catch {
      // Error al guardar brillo
    }
  }

  /**
   * Aplica el brillo al dispositivo
   */
  const applyBrightness = (value: number): boolean => {
    if (!window.fully) return false

    try {
      window.fully.setScreenBrightness(value)
      return true
    } catch {
      // Error al aplicar brillo
      return false
    }
  }

  /**
   * Establece el brillo de la pantalla
   * @param value Valor de brillo (50-255)
   */
  const setBrightness = (value: number): void => {
    // Validar rango
    const clampedValue = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, value))
    
    brightness.value = clampedValue
    
    if (isTablet.value) {
      const success = applyBrightness(clampedValue)
      if (success) {
        saveBrightness(clampedValue)
      }
    }
  }

  /**
   * Incrementa el brillo en un paso
   */
  const increaseBrightness = (): void => {
    const step = 25 // ~10% por paso
    setBrightness(brightness.value + step)
  }

  /**
   * Decrementa el brillo en un paso
   */
  const decreaseBrightness = (): void => {
    const step = 25 // ~10% por paso
    setBrightness(brightness.value - step)
  }

  /**
   * Resetea el brillo al valor por defecto
   */
  const resetBrightness = (): void => {
    setBrightness(DEFAULT_BRIGHTNESS)
  }

  /**
   * Inicializa el control de brillo
   * Los controles son siempre visibles - funciona con graceful degradation
   */
  const initialize = (): void => {
    isLoading.value = true

    // Intentar obtener brillo actual del dispositivo (si Fully Kiosk está disponible)
    const currentBrightness = getCurrentBrightness()
    
    // Cargar preferencia guardada (tiene prioridad)
    const savedBrightness = loadSavedBrightness()
    
    // Usar el brillo guardado si existe, sino el actual del dispositivo
    const initialBrightness = savedBrightness !== DEFAULT_BRIGHTNESS 
      ? savedBrightness 
      : currentBrightness

    brightness.value = initialBrightness
    
    // Aplicar el brillo inicial (solo si Fully Kiosk está disponible)
    if (checkFullyKiosk()) {
      applyBrightness(initialBrightness)
    }

    isLoading.value = false
  }

  // Inicializar al montar
  onMounted(() => {
    initialize()
  })

  return {
    // Estado
    brightness,
    brightnessPercent,
    isTablet,
    isLoading,
    
    // Constantes
    MIN_BRIGHTNESS,
    MAX_BRIGHTNESS,
    
    // Métodos
    setBrightness,
    increaseBrightness,
    decreaseBrightness,
    resetBrightness,
    initialize,
  }
}
