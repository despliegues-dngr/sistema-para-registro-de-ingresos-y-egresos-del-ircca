import { ref, computed } from 'vue'
import { autocompleteService, type PersonaConocida } from '@/services/autocompleteService'

/**
 * Composable para funcionalidad de autocompletado
 * Maneja búsqueda en tiempo real con debounce
 */
export function useAutocomplete() {
  // Estado reactivo
  const sugerenciasCedula = ref<PersonaConocida[]>([])
  const sugerenciasMatricula = ref<PersonaConocida[]>([])
  const buscando = ref(false)
  const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Busca personas por cédula con debounce de 150ms
   * ✅ Busca desde el PRIMER carácter
   * ⚡ OPTIMIZACIÓN: Limita resultados a 10 para mejorar performance
   * ⚡ OPTIMIZADO: Debounce reducido a 150ms para tablets (antes 300ms)
   */
  const buscarPorCedula = async (cedulaParcial: string) => {
    // Limpiar timeout anterior
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
    }

    // ✅ Limpiar sugerencias si está vacío
    if (!cedulaParcial || cedulaParcial.length < 1) {
      sugerenciasCedula.value = []
      return
    }

    // Indicar que está buscando
    buscando.value = true

    // Aplicar debounce de 150ms (optimizado para tablets)
    timeoutId.value = setTimeout(async () => {
      try {
        const resultados = await autocompleteService.buscarPorCedulaParcial(cedulaParcial)
        // ⚡ Limitar a 10 resultados para mejorar rendimiento del dropdown
        sugerenciasCedula.value = resultados.slice(0, 10)
      } catch (error) {
        console.error('Error en búsqueda por documento:', error)
        sugerenciasCedula.value = []
      } finally {
        buscando.value = false
      }
    }, 150) // ⚡ Reducido de 300ms a 150ms
  }

  /**
   * Busca personas por matrícula con debounce de 150ms
   * ⚡ OPTIMIZACIÓN: Limita resultados a 10 para mejorar performance
   * ⚡ OPTIMIZADO: Debounce reducido a 150ms para tablets (antes 300ms)
   */
  const buscarPorMatricula = async (matriculaParcial: string) => {
    // Limpiar timeout anterior
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
    }

    // Limpiar sugerencias si la búsqueda es muy corta
    if (!matriculaParcial || matriculaParcial.length < 2) {
      sugerenciasMatricula.value = []
      return
    }

    buscando.value = true

    // Aplicar debounce de 150ms (optimizado para tablets)
    timeoutId.value = setTimeout(async () => {
      try {
        const resultados = await autocompleteService.buscarPorMatriculaParcial(matriculaParcial)
        // ⚡ Limitar a 10 resultados para mejorar rendimiento del dropdown
        sugerenciasMatricula.value = resultados.slice(0, 10)
      } catch (error) {
        console.error('Error en búsqueda por matrícula:', error)
        sugerenciasMatricula.value = []
      } finally {
        buscando.value = false
      }
    }, 150) // ⚡ Reducido de 300ms a 150ms
  }

  /**
   * Obtiene persona exacta por cédula
   */
  const obtenerPersonaPorCedula = async (cedula: string): Promise<PersonaConocida | null> => {
    try {
      return await autocompleteService.obtenerPorCedula(cedula)
    } catch (error) {
      console.error('Error obteniendo persona por documento:', error)
      return null
    }
  }

  /**
   * Limpia las sugerencias
   */
  const limpiarSugerencias = () => {
    sugerenciasCedula.value = []
    sugerenciasMatricula.value = []
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
    }
  }

  /**
   * Computed: tiene sugerencias de cédula
   */
  const tieneSugerenciasCedula = computed(() => sugerenciasCedula.value.length > 0)

  /**
   * Computed: tiene sugerencias de matrícula
   */
  const tieneSugerenciasMatricula = computed(() => sugerenciasMatricula.value.length > 0)

  return {
    // Estado
    sugerenciasCedula,
    sugerenciasMatricula,
    buscando,
    tieneSugerenciasCedula,
    tieneSugerenciasMatricula,

    // Métodos
    buscarPorCedula,
    buscarPorMatricula,
    obtenerPersonaPorCedula,
    limpiarSugerencias
  }
}
