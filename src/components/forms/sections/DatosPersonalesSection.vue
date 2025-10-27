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
import { computed, toRef } from 'vue'
import FormSection from '@/components/forms/FormSection.vue'
import CedulaAutocomplete from './CedulaAutocomplete.vue'
import { useCedulaAutocomplete } from '@/composables/useCedulaAutocomplete'
import { useAppStore } from '@/stores/app'
import type { DatosPersonales, DatosVisita } from '@/stores/registro'
import type { PersonaConocida } from '@/services/autocompleteService'

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

// ⭐ Destinos dinámicos desde el store (reactivo)
const destinos = computed(() => appStore.config.destinos)

// ✅ NUEVO: Usar composable reutilizable con lógica completa de autocompletado
const {
  personaSeleccionada,
  cedulaBusqueda,
  buscando,
  sugerenciasMapeadas,
  autocompletarDatos
} = useCedulaAutocomplete({
  cedulaProp: toRef(() => props.datosPersonales.cedula),
  onCedulaUpdate: (cedula) => emit('update:cedula', cedula),
  onAutocompletar: (persona: PersonaConocida) => {
    // Autocompletar todos los campos del titular
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
  }
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
</script>
