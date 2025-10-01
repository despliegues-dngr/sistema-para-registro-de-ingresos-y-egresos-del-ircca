import { ref, computed } from 'vue'
import { useAutocomplete } from '@/composables/useAutocomplete'
import type { PersonaConocida } from '@/services/autocompleteService'

/**
 * Composable reutilizable para lógica de autocompletado de personas
 * Encapsula búsqueda, selección y formateo de datos
 */

export interface SearchItem {
  displayText: string
  persona: PersonaConocida
  searchText: string
}

export function usePersonaAutocomplete() {
  // Composable base de búsqueda
  const {
    sugerenciasCedula,
    buscando: buscandoCedula,
    buscarPorCedula
  } = useAutocomplete()

  // Estado local
  const personaSeleccionada = ref<SearchItem | null>(null)
  const searchText = ref('')

  /**
   * Formatea sugerencias para el v-autocomplete
   * displayText = cédula (lo que se muestra en el campo)
   */
  const sugerenciasFormateadas = computed(() => {
    return sugerenciasCedula.value.map((persona: PersonaConocida) => ({
      displayText: persona.cedula,
      persona: persona,
      searchText: persona.cedula
    }))
  })

  /**
   * Maneja actualización de búsqueda
   */
  const onSearchUpdate = (valor: string) => {
    searchText.value = valor
    
    if (valor) {
      buscarPorCedula(valor)
    }
  }

  /**
   * Maneja selección de persona
   * Retorna los datos de la persona seleccionada
   */
  const onPersonaSelect = (item: SearchItem | null): PersonaConocida | null => {
    personaSeleccionada.value = item
    
    if (item && item.persona) {
      return item.persona
    }
    
    return null
  }

  /**
   * Limpia el estado del autocomplete
   */
  const limpiar = () => {
    personaSeleccionada.value = null
    searchText.value = ''
  }

  /**
   * Genera reglas de validación para la cédula
   * Recibe el valor actual de la cédula en formData
   */
  const generarReglasValidacion = (cedulaActual: () => string) => [
    () => !!cedulaActual() || 'El documento es requerido',
    () => /^\d+$/.test(cedulaActual()) || 'Solo se permiten números',
  ]

  return {
    // Estado
    personaSeleccionada,
    searchText,
    buscandoCedula,
    sugerenciasFormateadas,
    
    // Métodos
    onSearchUpdate,
    onPersonaSelect,
    limpiar,
    generarReglasValidacion
  }
}
