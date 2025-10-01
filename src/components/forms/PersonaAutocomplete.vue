<template>
  <v-autocomplete
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :search="search"
    @update:search="$emit('update:search', $event)"
    :items="items"
    :loading="loading"
    item-title="displayText"
    item-value="persona"
    return-object
    :label="label"
    :prepend-inner-icon="icon"
    :rules="rules"
    variant="outlined"
    density="comfortable"
    :hint="hint"
    persistent-hint
    required
    :autofocus="autofocus"
    clearable
    :custom-filter="() => true"
    no-filter
    @keypress="onlyNumbers"
  >
    <!-- Template para item de sugerencia -->
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps">
        <template #prepend>
          <v-avatar :color="item.raw.persona.frecuencia === 'alta' ? 'success' : 'info'" size="32">
            <v-icon size="16">mdi-account-check</v-icon>
          </v-avatar>
        </template>
        <template #title>
          <div class="text-subtitle-1 font-weight-bold">
            {{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}
            <span class="text-body-2 text-medium-emphasis ml-2">
              (C.I: {{ item.raw.persona.cedula }})
            </span>
          </div>
        </template>
        <template #subtitle>
          <span class="text-caption">
            <v-icon size="12">mdi-clock-outline</v-icon>
            {{ item.raw.persona.totalVisitas }} visita{{ item.raw.persona.totalVisitas !== 1 ? 's' : '' }}
            <template v-if="showDestino">
              - Último destino: {{ item.raw.persona.ultimoDestino }}
            </template>
          </span>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import type { PersonaConocida } from '@/services/autocompleteService'

/**
 * Componente reutilizable de autocompletado de personas
 * Usado en formularios de ingreso (titular y acompañantes)
 */

interface SearchItem {
  displayText: string
  persona: PersonaConocida
  searchText: string
}

interface Props {
  modelValue: SearchItem | null
  search: string
  items: SearchItem[]
  loading?: boolean
  label?: string
  hint?: string
  icon?: string
  autofocus?: boolean
  showDestino?: boolean
  rules?: ((value: SearchItem | null) => boolean | string)[]
}

withDefaults(defineProps<Props>(), {
  loading: false,
  label: 'Cédula de Identidad',
  hint: 'Escriba la cédula - Aparecerán sugerencias de visitas previas',
  icon: 'mdi-card-account-details',
  autofocus: false,
  showDestino: true,
  rules: () => []
})

defineEmits<{
  'update:modelValue': [value: SearchItem | null]
  'update:search': [value: string]
}>()

/**
 * Filtro de entrada: solo números
 */
const onlyNumbers = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which)
  if (!/^\d$/.test(char)) {
    event.preventDefault()
  }
}
</script>

<style scoped>
/* Sin estilos personalizados - usa defaults de Vuetify */
</style>
