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
          validate-on="blur"
          clearable
          :menu-props="{ zIndex: 10000 }"
        />
      </v-col>

      <!-- Matrícula -->
      <v-col cols="12" sm="6">
        <v-text-field
          :model-value="datosVehiculo.matricula"
          @update:model-value="onMatriculaChange"
          label="Matrícula"
          prepend-inner-icon="mdi-card-text"
          :rules="vehiculoFieldRules"
          variant="outlined"
          density="comfortable"
          autocomplete="off"
          spellcheck="false"
          :readonly="false"
          validate-on="blur"
          placeholder="ABC1234"
          class="matricula-uppercase"
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

/**
 * Maneja cambios en matrícula y convierte automáticamente a mayúsculas
 * ✅ Formato estándar uruguayo: ABC1234 (siempre en mayúsculas)
 */
const onMatriculaChange = (value: string) => {
  // Convertir a mayúsculas automáticamente
  const matriculaMayuscula = value.toUpperCase()
  emit('update:matricula', matriculaMayuscula)
  checkHasData()
}

const checkHasData = () => {
  const { tipo, matricula } = props.datosVehiculo
  const hasData = !!(tipo || matricula)
  emit('has-data-change', hasData)
}
</script>

<style scoped>
/**
 * ✅ Forzar visualización en mayúsculas para el campo de matrícula
 * Mejora UX: El usuario ve inmediatamente el formato correcto
 */
.matricula-uppercase :deep(input) {
  text-transform: uppercase;
}
</style>
