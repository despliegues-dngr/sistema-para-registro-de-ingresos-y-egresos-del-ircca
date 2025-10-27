import { ref, computed, watch, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useAutocomplete } from '@/composables/useAutocomplete'
import type { PersonaConocida } from '@/services/autocompleteService'

/**
 * 🎯 Composable reutilizable para autocompletado de cédula con personas conocidas
 * 
 * Encapsula toda la lógica de:
 * - Búsqueda de personas por cédula
 * - Autocompletado de datos
 * - Prevención de búsquedas duplicadas durante autocompletado
 * - Sincronización bidireccional con formulario padre
 * 
 * Usado en: DatosPersonalesSection, AcompananteCard
 */

export interface AutocompleteItem extends PersonaConocida {
  displayText: string
}

export interface UseCedulaAutocompleteOptions {
  /**
   * Valor actual de la cédula en el formulario padre
   */
  cedulaProp: Ref<string>
  
  /**
   * Callback para emitir actualización de cédula al padre
   */
  onCedulaUpdate: (cedula: string) => void
  
  /**
   * Callback para autocompletar todos los campos
   */
  onAutocompletar: (persona: PersonaConocida) => void
  
  /**
   * Delay del debounce para emit de cédula (ms)
   * @default 150
   */
  debounceDelay?: number
}

export function useCedulaAutocomplete(options: UseCedulaAutocompleteOptions) {
  const {
    cedulaProp,
    onCedulaUpdate,
    onAutocompletar,
    debounceDelay = 150
  } = options

  // Composable base de autocomplete
  const { sugerenciasCedula, buscando, buscarPorCedula, limpiarSugerencias } = useAutocomplete()

  // Estado local
  const personaSeleccionada = ref<AutocompleteItem | null>(null)
  const cedulaBusqueda = ref('')
  const isAutocompletando = ref(false) // ✅ Flag para evitar búsqueda durante autocompletado

  /**
   * Mapeo de sugerencias a formato del autocomplete
   */
  const sugerenciasMapeadas = computed<AutocompleteItem[]>(() => {
    return sugerenciasCedula.value.map(persona => ({
      ...persona,
      displayText: `${persona.nombre} ${persona.apellido} (${persona.cedula})`
    }))
  })

  /**
   * ⚡ Debounce para emit de cédula (evita re-renders innecesarios)
   */
  const debouncedEmitCedula = useDebounceFn((value: string) => {
    onCedulaUpdate(value)
  }, debounceDelay)

  /**
   * Watch: Buscar personas conocidas mientras escribe la cédula
   */
  watch(cedulaBusqueda, async (newValue) => {
    // ⚡ Actualizar cédula con debounce para evitar lag
    debouncedEmitCedula(newValue)
    
    // ✅ No buscar si estamos autocompletando (evita re-búsqueda)
    if (isAutocompletando.value) {
      return
    }
    
    // Buscar sugerencias si hay al menos 1 dígito
    if (newValue && newValue.length >= 1) {
      await buscarPorCedula(newValue)
    } else {
      limpiarSugerencias()
    }
  })

  /**
   * Watch: Sincronizar cédula del padre con búsqueda local
   */
  watch(cedulaProp, (newValue) => {
    if (newValue !== cedulaBusqueda.value) {
      cedulaBusqueda.value = newValue
    }
  })

  /**
   * Autocompletar datos cuando se selecciona una persona conocida
   */
  const autocompletarDatos = (persona: PersonaConocida) => {
    // ✅ Activar flag para evitar búsqueda durante autocompletado
    isAutocompletando.value = true
    
    // Llamar callback de autocompletado (cada componente define su lógica)
    onAutocompletar(persona)
    
    // Limpiar sugerencias después de seleccionar
    limpiarSugerencias()
    
    // ✅ Desactivar flag después de un breve delay
    setTimeout(() => {
      isAutocompletando.value = false
    }, 100)
  }

  return {
    // Estado
    personaSeleccionada,
    cedulaBusqueda,
    buscando,
    sugerenciasMapeadas,
    
    // Métodos
    autocompletarDatos,
    limpiarSugerencias
  }
}
