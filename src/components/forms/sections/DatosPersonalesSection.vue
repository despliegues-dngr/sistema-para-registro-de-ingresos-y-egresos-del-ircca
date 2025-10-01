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
      <!-- Cédula con Autocompletado -->
      <v-col cols="12">
        <PersonaAutocomplete
          :model-value="autocomplete.personaSeleccionada.value"
          @update:model-value="onPersonaSelect"
          :search="autocomplete.searchText.value"
          @update:search="autocomplete.onSearchUpdate"
          :items="autocomplete.sugerenciasFormateadas.value"
          :loading="autocomplete.buscandoCedula.value"
          :rules="cedulaRules"
          autofocus
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
import FormSection from '@/components/forms/FormSection.vue'
import PersonaAutocomplete from '@/components/forms/PersonaAutocomplete.vue'
import { usePersonaAutocomplete } from '@/composables/usePersonaAutocomplete'
import type { DatosPersonales, DatosVisita } from '@/stores/registro'
import type { PersonaConocida } from '@/services/autocompleteService'

interface Props {
  datosPersonales: DatosPersonales
  datosVisita: DatosVisita
  expanded?: number
}

interface Emits {
  'update:cedula': [value: string]
  'update:nombre': [value: string]
  'update:apellido': [value: string]
  'update:destino': [value: string]
  'update:expanded': [value: number | undefined]
  'persona-selected': [persona: PersonaConocida]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Autocomplete reutilizable
const autocomplete = usePersonaAutocomplete()

// Constantes
const destinos = ['IRCCA', 'Ligeral', 'Simbiosys', 'Jabelor', 'Otra']

// Reglas de validación
const cedulaRules = autocomplete.generarReglasValidacion(() => props.datosPersonales.cedula)

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

// Manejar selección de persona
const onPersonaSelect = (item: { persona: PersonaConocida; displayText: string; searchText: string } | null) => {
  const persona = autocomplete.onPersonaSelect(item)
  if (persona) {
    // Emitir actualización de cédula
    emit('update:cedula', persona.cedula)
    emit('persona-selected', persona)
  }
}
</script>
