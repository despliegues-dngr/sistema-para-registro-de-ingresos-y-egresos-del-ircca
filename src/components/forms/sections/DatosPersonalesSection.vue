<template>
  <FormSection
    title="Datos Personales"
    icon="mdi-account"
    chip-label="Obligatorio"
    chip-color="error"
    :expanded="expanded"
    @update:expanded="$emit('update:expanded', $event)"
  >
    <v-row>
      <!-- Cédula - CON AUTOCOMPLETE DE PERSONAS CONOCIDAS -->
      <v-col cols="12">
        <CedulaAutocomplete
          v-model="personaSeleccionada"
          v-model:search="cedulaBusqueda"
          :items="sugerenciasMapeadas"
          :loading="buscando"
          @persona-selected="autocompletarDatos"
        />
      </v-col>

      <!-- Nombre y Apellido -->
      <v-col cols="12" sm="6">
        <v-text-field
          :model-value="datosPersonales.nombre"
          @update:model-value="$emit('update:nombre', $event)"
          label="Nombre"
          prepend-inner-icon="mdi-account"
          :rules="nombreRules"
          variant="outlined"
          density="comfortable"
          autocomplete="off"
          spellcheck="false"
          :readonly="false"
          validate-on="blur"
          required
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          :model-value="datosPersonales.apellido"
          @update:model-value="$emit('update:apellido', $event)"
          label="Apellido"
          prepend-inner-icon="mdi-account"
          :rules="apellidoRules"
          variant="outlined"
          density="comfortable"
          autocomplete="off"
          spellcheck="false"
          :readonly="false"
          validate-on="blur"
          required
        />
      </v-col>

      <!-- Destino -->
      <v-col cols="12">
        <v-select
          :model-value="datosVisita.destino"
          @update:model-value="$emit('update:destino', $event)"
          label="Destino"
          prepend-inner-icon="mdi-domain"
          :items="destinos"
          :rules="requiredRules"
          variant="outlined"
          density="comfortable"
          validate-on="blur"
          required
          :menu-props="{ zIndex: 10000 }"
        />
      </v-col>
    </v-row>
  </FormSection>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import FormSection from '@/components/forms/FormSection.vue'
import CedulaAutocomplete from './CedulaAutocomplete.vue'
import { useAutocomplete } from '@/composables/useAutocomplete'
import { useAppStore } from '@/stores/app'
import type { DatosPersonales, DatosVisita } from '@/stores/registro'
import type { PersonaConocida } from '@/services/autocompleteService'

interface AutocompleteItem extends PersonaConocida {
  displayText: string
}

interface Props {
  datosPersonales: DatosPersonales
  datosVisita: DatosVisita
  expanded?: number
}

interface Emits {
  (e: 'update:expanded', value: number | undefined): void
  (e: 'update:cedula', value: string): void
  (e: 'update:nombre', value: string): void
  (e: 'update:apellido', value: string): void
  (e: 'update:destino', value: string): void
  (e: 'update:vehiculo', value: { tipo: string; matricula: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const appStore = useAppStore()
const { sugerenciasCedula, buscando, buscarPorCedula, limpiarSugerencias } = useAutocomplete()

// Estado local
const personaSeleccionada = ref<AutocompleteItem | null>(null)
const cedulaBusqueda = ref('')
const isAutocompletando = ref(false) // Flag para evitar búsqueda durante autocompletado

// ⭐ NUEVO: Destinos dinámicos desde el store (reactivo)
const destinos = computed(() => appStore.config.destinos)

// Computed: Mapear sugerencias a formato del autocomplete
const sugerenciasMapeadas = computed<AutocompleteItem[]>(() => {
  return sugerenciasCedula.value.map(persona => ({
    ...persona,
    displayText: `${persona.nombre} ${persona.apellido} (${persona.cedula})`
  }))
})

// Reglas de validación
const nombreRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
]

const apellidoRules = [
  (v: string) => !!v || 'El apellido es requerido',
  (v: string) => v.length >= 2 || 'El apellido debe tener al menos 2 caracteres',
]

const requiredRules = [
  (v: string) => !!v || 'Este campo es requerido',
]

/**
 * ⚡ OPTIMIZACIÓN: Debounce para emit de cédula (evita re-renders innecesarios)
 */
const debouncedEmitCedula = useDebounceFn((value: string) => {
  emit('update:cedula', value)
}, 150)

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
watch(() => props.datosPersonales.cedula, (newValue) => {
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
  
  // Autocompletar todos los campos
  emit('update:cedula', persona.cedula)
  emit('update:nombre', persona.nombre)
  emit('update:apellido', persona.apellido)
  emit('update:destino', persona.ultimoDestino)
  
  // ✅ Siempre emitir evento de vehículo (con datos o vacío)
  if (persona.ultimoVehiculo) {
    emit('update:vehiculo', persona.ultimoVehiculo)
  } else {
    // Limpiar vehículo si la persona no tiene uno registrado
    emit('update:vehiculo', { tipo: '', matricula: '' })
  }
  
  // Limpiar sugerencias después de seleccionar
  limpiarSugerencias()
  
  // ✅ Desactivar flag después de un breve delay
  setTimeout(() => {
    isAutocompletando.value = false
  }, 100)
}
</script>
