<template>
  <v-card variant="outlined" class="pa-4 acompanante-card">
    <div class="d-flex align-center justify-space-between mb-3">
      <h4 class="text-subtitle-1">
        <v-icon size="16" class="mr-2">mdi-account</v-icon>
        Acompañante {{ index + 1 }}
      </h4>
      <v-btn
        icon="mdi-close"
        size="small"
        variant="text"
        color="error"
        @click="$emit('remove')"
      />
    </div>
    
    <v-row>
      <!-- Cédula - CON AUTOCOMPLETE DE PERSONAS CONOCIDAS (REUTILIZANDO COMPONENTE) -->
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
          :model-value="acompanante.nombre"
          @update:model-value="$emit('update:nombre', $event)"
          label="Nombre"
          prepend-inner-icon="mdi-account"
          :rules="nombreRules"
          variant="outlined"
          density="comfortable"
          autocomplete="off"
          spellcheck="false"
          :readonly="false"
          required
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          :model-value="acompanante.apellido"
          @update:model-value="$emit('update:apellido', $event)"
          label="Apellido"
          prepend-inner-icon="mdi-account"
          :rules="apellidoRules"
          variant="outlined"
          density="comfortable"
          autocomplete="off"
          spellcheck="false"
          :readonly="false"
          required
        />
      </v-col>

      <!-- Destino -->
      <v-col cols="12">
        <v-select
          :model-value="acompanante.destino"
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
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CedulaAutocomplete from './CedulaAutocomplete.vue'
import { useAutocomplete } from '@/composables/useAutocomplete'
import type { DatosAcompanante } from '@/stores/registro'
import type { PersonaConocida } from '@/services/autocompleteService'

interface AutocompleteItem extends PersonaConocida {
  displayText: string
}

interface Props {
  acompanante: DatosAcompanante
  index: number
  destinoTitular?: string
}

interface Emits {
  'update:cedula': [value: string]
  'update:nombre': [value: string]
  'update:apellido': [value: string]
  'update:destino': [value: string]
  'remove': []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ✅ REUTILIZAR: Composable de autocomplete (misma lógica que DatosPersonalesSection)
const { sugerenciasCedula, buscando, buscarPorCedula, limpiarSugerencias } = useAutocomplete()

// Estado local
const personaSeleccionada = ref<AutocompleteItem | null>(null)
const cedulaBusqueda = ref('')

// Constantes
const destinos = ['IRCCA', 'Ligeral', 'Simbiosys', 'Jabelor', 'Otra']

// ✅ REUTILIZAR: Mapeo de sugerencias (misma lógica)
const sugerenciasMapeadas = computed<AutocompleteItem[]>(() => {
  return sugerenciasCedula.value.map(persona => ({
    ...persona,
    displayText: `${persona.nombre} ${persona.apellido} (${persona.cedula})`
  }))
})

/**
 * ✅ REUTILIZAR: Watch para búsqueda automática (misma lógica que DatosPersonalesSection)
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
watch(() => props.acompanante.cedula, (newValue) => {
  if (newValue !== cedulaBusqueda.value) {
    cedulaBusqueda.value = newValue
  }
})

/**
 * ✅ REUTILIZAR: Autocompletar datos (misma lógica que DatosPersonalesSection)
 */
const autocompletarDatos = (persona: PersonaConocida) => {
  // Autocompletar todos los campos del acompañante
  emit('update:cedula', persona.cedula)
  emit('update:nombre', persona.nombre)
  emit('update:apellido', persona.apellido)
  emit('update:destino', persona.ultimoDestino)
}

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
</script>

<style scoped>
.acompanante-card {
  transition: all 0.2s ease;
  border-left: 3px solid rgba(var(--v-theme-primary), 0.3);
}

.acompanante-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
