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
          required
        />
      </v-col>
    </v-row>
  </FormSection>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FormSection from '@/components/forms/FormSection.vue'
import CedulaAutocomplete from './CedulaAutocomplete.vue'
import { useAutocomplete } from '@/composables/useAutocomplete'
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
const { sugerenciasCedula, buscando, buscarPorCedula, limpiarSugerencias } = useAutocomplete()

// Estado local
const personaSeleccionada = ref<AutocompleteItem | null>(null)
const cedulaBusqueda = ref('')

// Constantes
const destinos = ['IRCCA', 'Ligeral', 'Simbiosys', 'Jabelor', 'Otra']

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
 * Watch: Buscar personas conocidas mientras escribe la cédula
 */
watch(cedulaBusqueda, async (newValue) => {
  // Actualizar cédula en el formulario padre
  emit('update:cedula', newValue)
  
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
  console.log('✅ [AUTOCOMPLETE] Persona seleccionada:', persona)
  
  // Autocompletar todos los campos
  emit('update:cedula', persona.cedula)
  emit('update:nombre', persona.nombre)
  emit('update:apellido', persona.apellido)
  emit('update:destino', persona.ultimoDestino)
  
  // Si tiene vehículo registrado, emitir evento para autocompletar vehículo
  if (persona.ultimoVehiculo) {
    emit('update:vehiculo', persona.ultimoVehiculo)
  }
  
  console.log('✅ [AUTOCOMPLETE] Datos autocompletados')
}
</script>
