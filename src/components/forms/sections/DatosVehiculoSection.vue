<template>
  <FormSection
    title="Datos de Vehículo"
    icon="mdi-car"
    chip-label="Opcional"
    chip-color="info"
    :expanded="expanded"
    @update:expanded="$emit('update:expanded', $event)"
  >
    <v-row>
      <!-- Tipo de Vehículo -->
      <v-col cols="12" sm="6">
        <v-select
          :model-value="datosVehiculo.tipo"
          @update:model-value="onTipoChange"
          label="Tipo de Vehículo"
          prepend-inner-icon="mdi-car"
          :items="tiposVehiculo"
          :rules="vehiculoFieldRules"
          variant="outlined"
          density="comfortable"
          clearable
        />
      </v-col>

      <!-- Matrícula -->
      <v-col cols="12" sm="6">
        <v-text-field
          :model-value="datosVehiculo.matricula"
          @update:model-value="onMatriculaChange"
          label="Matrícula"
          prepend-inner-icon="mdi-card-text"
          :rules="matriculaRules"
          variant="outlined"
          density="comfortable"
          hint="Formato: ABC1234"
          persistent-hint
          @input="onMatriculaInput"
          @keypress="onlyAlphaNumeric"
        />
      </v-col>
    </v-row>
  </FormSection>
</template>

<script setup lang="ts">
import FormSection from '@/components/forms/FormSection.vue'
import type { DatosVehiculo } from '@/stores/registro'

interface Props {
  datosVehiculo: DatosVehiculo
  expanded?: number
}

interface Emits {
  'update:tipo': [value: string]
  'update:matricula': [value: string]
  'update:expanded': [value: number | undefined]
  'has-data-change': [hasData: boolean]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Constantes
const tiposVehiculo = ['Auto', 'Moto', 'Camión', 'Bus']

// Reglas de validación
const matriculaRules = [
  (v: string) => !v || /^[A-Za-z0-9]+$/.test(v) || 'Solo se permiten letras y números',
]

const vehiculoFieldRules = [
  (v: string) => {
    const { tipo, matricula } = props.datosVehiculo
    const hasAnyVehiculo = tipo || matricula
    if (hasAnyVehiculo && !v) {
      return 'Si ingresa datos de vehículo, complete todos los campos'
    }
    return true
  }
]

// Métodos
const onTipoChange = (value: string) => {
  emit('update:tipo', value)
  checkHasData()
}

const onMatriculaChange = (value: string) => {
  emit('update:matricula', value)
  checkHasData()
}

const onMatriculaInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toUpperCase()
  emit('update:matricula', value)
}

const checkHasData = () => {
  const { tipo, matricula } = props.datosVehiculo
  const hasData = !!(tipo || matricula)
  emit('has-data-change', hasData)
}

const onlyAlphaNumeric = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which)
  if (!/^[a-zA-Z0-9]$/.test(char)) {
    event.preventDefault()
  }
}
</script>
