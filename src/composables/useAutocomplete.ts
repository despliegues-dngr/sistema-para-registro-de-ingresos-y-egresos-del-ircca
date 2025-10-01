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
   * Busca personas por cédula con debounce de 300ms
   * ✅ Busca desde el PRIMER carácter
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

    // Aplicar debounce de 300ms
    timeoutId.value = setTimeout(async () => {
      try {
        const resultados = await autocompleteService.buscarPorCedulaParcial(cedulaParcial)
        sugerenciasCedula.value = resultados
      } catch (error) {
        console.error('Error en búsqueda por cédula:', error)
        sugerenciasCedula.value = []
      } finally {
        buscando.value = false
      }
    }, 300)
  }

  /**
   * Busca personas por matrícula con debounce de 300ms
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

    // Aplicar debounce de 300ms
    timeoutId.value = setTimeout(async () => {
      try {
        const resultados = await autocompleteService.buscarPorMatriculaParcial(matriculaParcial)
        sugerenciasMatricula.value = resultados
      } catch (error) {
        console.error('Error en búsqueda por matrícula:', error)
        sugerenciasMatricula.value = []
      } finally {
        buscando.value = false
      }
    }, 300)
  }

  /**
   * Obtiene persona exacta por cédula
   */
  const obtenerPersonaPorCedula = async (cedula: string): Promise<PersonaConocida | null> => {
    try {
      return await autocompleteService.obtenerPorCedula(cedula)
    } catch (error) {
      console.error('Error obteniendo persona por cédula:', error)
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
