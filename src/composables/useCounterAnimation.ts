import { ref, watch, type Ref } from 'vue'
import { useTransition, TransitionPresets } from '@vueuse/core'

/**
 * 🎯 Composable Genérico para Animar Contadores
 * 
 * Proporciona animación count-up para cualquier contador reactivo.
 * Utiliza @vueuse/core para transiciones suaves.
 * 
 * @example
 * ```ts
 * // Usar con computed del store
 * const { animatedValue } = useCounterAnimation(() => store.personasDentro.length)
 * 
 * // Usar con ref reactivo
 * const count = ref(0)
 * const { animatedValue, updateValue } = useCounterAnimation(count)
 * ```
 * 
 * @param source - Función getter o Ref reactivo del valor a animar
 * @param options - Opciones de configuración de la animación
 * @returns Objeto con el valor animado y funciones de control
 */
export function useCounterAnimation(
  source: (() => number) | Ref<number>,
  options: {
    duration?: number
    transition?: typeof TransitionPresets.easeOutCubic
    initialValue?: number
    autoWatch?: boolean
  } = {}
) {
  const {
    duration = 2000,
    transition = TransitionPresets.easeOutCubic,
    initialValue = 0,
    autoWatch = true
  } = options

  // ⭐ Valor fuente controlado manualmente (inicia en 0 o valor inicial)
  const sourceValue = ref(initialValue)

  // ⭐ Valor animado con useTransition
  const animatedValue = useTransition(sourceValue, {
    duration,
    transition
  })

  // ⭐ Valor final redondeado (para mostrar en UI)
  const roundedValue = ref(Math.round(animatedValue.value as unknown as number))

  // Actualizar valor redondeado cuando cambia la animación
  watch(animatedValue, (newValue) => {
    roundedValue.value = Math.round(newValue as unknown as number)
  })

  /**
   * Actualiza manualmente el valor del contador
   * @param newValue - Nuevo valor a animar
   */
  const updateValue = (newValue: number) => {
    sourceValue.value = newValue
  }

  /**
   * Inicia la animación desde 0 hasta el valor actual
   */
  const startAnimation = () => {
    const targetValue = typeof source === 'function' ? source() : source.value
    sourceValue.value = targetValue
  }

  /**
   * Reinicia el contador a 0
   */
  const reset = () => {
    sourceValue.value = 0
  }

  // ⭐ Auto-watch: Si está habilitado, observa cambios en source automáticamente
  if (autoWatch) {
    watch(
      typeof source === 'function' ? source : () => source.value,
      (newValue) => {
        sourceValue.value = newValue
      },
      { immediate: false } // No ejecutar inmediatamente para permitir animación inicial
    )
  }

  return {
    /** Valor animado redondeado (listo para mostrar en UI) */
    animatedValue: roundedValue,
    /** Actualiza manualmente el valor */
    updateValue,
    /** Inicia la animación desde 0 */
    startAnimation,
    /** Reinicia el contador a 0 */
    reset
  }
}

/**
 * 🎯 Hook para Múltiples Contadores
 * 
 * Simplifica la creación de múltiples contadores animados con la misma configuración.
 * 
 * @example
 * ```ts
 * const { createCounter } = useMultipleCounters({ duration: 1500 })
 * 
 * const totalCounter = createCounter(() => store.total)
 * const activeCounter = createCounter(() => store.active)
 * ```
 */
export function useMultipleCounters(
  defaultOptions: Parameters<typeof useCounterAnimation>[1] = {}
) {
  const counters: ReturnType<typeof useCounterAnimation>[] = []

  /**
   * Crea un nuevo contador con las opciones por defecto
   */
  const createCounter = (
    source: (() => number) | Ref<number>,
    options: Parameters<typeof useCounterAnimation>[1] = {}
  ) => {
    const counter = useCounterAnimation(source, { ...defaultOptions, ...options })
    counters.push(counter)
    return counter
  }

  /**
   * Inicia la animación de todos los contadores
   */
  const startAll = () => {
    counters.forEach(counter => counter.startAnimation())
  }

  /**
   * Reinicia todos los contadores a 0
   */
  const resetAll = () => {
    counters.forEach(counter => counter.reset())
  }

  return {
    createCounter,
    startAll,
    resetAll,
    counters
  }
}
