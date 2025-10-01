<template>
  <FormSection
    title="Acompañantes"
    icon="mdi-account-multiple"
    chip-label="Opcional"
    chip-color="info"
    :expanded="expanded"
    @update:expanded="$emit('update:expanded', $event)"
  >
    <!-- Información explicativa -->
    <v-alert
      color="info"
      variant="tonal"
      class="mb-4"
      density="compact"
    >
      <div class="d-flex align-center">
        <v-icon size="16" class="mr-2">mdi-information</v-icon>
        <span class="text-body-2">
          Agregue personas que ingresan junto al titular (mismo vehículo)
        </span>
      </div>
    </v-alert>

    <!-- Lista de acompañantes -->
    <div v-for="(acompanante, index) in acompanantes" :key="index" class="mb-4">
      <AcompananteCard
        :acompanante="acompanante"
        :index="index"
        :destino-titular="destinoTitular"
        @update:cedula="updateAcompanante(index, 'cedula', $event)"
        @update:nombre="updateAcompanante(index, 'nombre', $event)"
        @update:apellido="updateAcompanante(index, 'apellido', $event)"
        @update:destino="updateAcompanante(index, 'destino', $event)"
        @remove="$emit('remove-acompanante', index)"
      />
    </div>

    <!-- Botón para agregar acompañante -->
    <v-btn
      color="primary"
      variant="tonal"
      prepend-icon="mdi-account-plus"
      @click="$emit('add-acompanante')"
      :disabled="acompanantes.length >= 20"
      class="mb-2"
    >
      Agregar Acompañante
    </v-btn>
    
    <div v-if="acompanantes.length >= 20" class="text-body-2 text-warning ml-2">
      Máximo 20 acompañantes por registro (buses/camionetas)
    </div>
  </FormSection>
</template>

<script setup lang="ts">
import FormSection from '@/components/forms/FormSection.vue'
import AcompananteCard from './AcompananteCard.vue'
import type { DatosAcompanante } from '@/stores/registro'

interface Props {
  acompanantes: DatosAcompanante[]
  destinoTitular?: string
  expanded?: number
}

interface Emits {
  'add-acompanante': []
  'remove-acompanante': [index: number]
  'update-acompanante': [index: number, field: string, value: string]
  'update:expanded': [value: number | undefined]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const updateAcompanante = (index: number, field: string, value: string) => {
  emit('update-acompanante', index, field, value)
}
</script>
