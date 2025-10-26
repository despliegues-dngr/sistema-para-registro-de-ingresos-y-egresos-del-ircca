<template>
  <div class="acompanantes-section">
    <!-- Vista Previa (Modo Lectura) - Formato Texto Limpio -->
    <div v-if="!modoEdicion && acompanantes.length > 0">
      <v-divider class="mb-3" />
      <div class="info-row mb-2">
        <span class="info-label">👥 Acompañantes:</span>
        <span class="info-value">{{ acompanantes.length }} {{ acompanantes.length === 1 ? 'persona' : 'personas' }}</span>
      </div>

      <div v-for="(persona, index) in acompanantes" :key="persona.cedula" class="acompanante-item">
        <span class="acompanante-numero">{{ index + 1 }}.</span>
        <span class="acompanante-nombre">{{ persona.nombre }} {{ persona.apellido }}</span>
        <span class="acompanante-detalle">({{ persona.cedula }})</span>
      </div>
    </div>

    <!-- Modo Edición -->
    <div v-if="modoEdicion" class="mb-4">
      <v-divider class="mb-3" />
      <div class="edit-section-title mb-3">
        👥 Acompañantes que salen:
      </div>

      <!-- Lista de checkboxes simples -->
      <div v-if="acompanantesOriginales.length > 0" class="mb-4">
        <div v-for="acomp in acompanantesOriginales" :key="acomp.cedula" class="checkbox-row">
          <v-checkbox
            :model-value="acompanantesSalen"
            @update:model-value="(val) => $emit('update:acompanantesSalen', val as string[])"
            :value="acomp.cedula"
            :label="`${acomp.nombre} ${acomp.apellido} (${acomp.cedula})`"
            color="primary"
            density="compact"
            hide-details
          />
        </div>
      </div>
      <div v-else class="text-caption text-medium-emphasis mb-4 ml-2">
        No hay acompañantes originales
      </div>

      <!-- Agregar más personas -->
      <div class="mt-4">
        <div class="edit-section-title mb-2">
          ➕ Agregar más personas:
        </div>

        <v-autocomplete
          :model-value="null"
          :search="busqueda"
          @update:search="$emit('update:busqueda', $event)"
          :items="personasDisponibles"
          item-title="nombre"
          item-value="cedula"
          label="Buscar por nombre o documento"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          :custom-filter="() => true"
          no-filter
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item
              v-bind="itemProps"
              class="acompanante-autocomplete-item"
              @click="$emit('agregar-acompanante', item.raw)"
            >
              <template #prepend>
                <v-avatar color="success" size="32">
                  <v-icon size="16">mdi-account-plus</v-icon>
                </v-avatar>
              </template>

              <template #title>
                <span class="text-subtitle-2 font-weight-bold">
                  {{ item.raw.nombre }} {{ item.raw.apellido }}
                </span>
                <span class="text-body-2 text-medium-emphasis ml-2">
                  (C.I: {{ item.raw.cedula }})
                </span>
              </template>

              <template #subtitle>
                <div class="d-flex align-center mt-1">
                  <v-icon size="12" class="mr-1">mdi-domain</v-icon>
                  <span class="text-caption">{{ item.raw.destino }}</span>
                </div>
              </template>
            </v-list-item>
          </template>

          <template #no-data>
            <div class="pa-2 text-caption text-medium-emphasis">
              {{ busqueda ? 'No se encontraron personas' : 'Escriba para buscar' }}
            </div>
          </template>
        </v-autocomplete>
      </div>

      <!-- Personas agregadas -->
      <div v-if="acompanantesAdicionales.length > 0" class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">
          Personas agregadas:
        </div>
        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="cedula in acompanantesAdicionales"
            :key="`adicional-${cedula}`"
            class="persona-agregada-item"
          >
            <template #prepend>
              <v-avatar color="success" size="28" class="mr-3">
                <v-icon size="14" color="white">mdi-check</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ getPersonaNombre(cedula) }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-caption">
              C.I: {{ cedula }}
            </v-list-item-subtitle>

            <template #append>
              <v-btn
                icon="mdi-close"
                size="x-small"
                color="error"
                variant="text"
                @click="$emit('remover-acompanante', cedula)"
              />
            </template>
          </v-list-item>
        </v-list>
      </div>

      <!-- Resumen simple -->
      <div class="mt-3 text-caption text-medium-emphasis">
        Total: {{ totalAcompanantes + 1 }} {{ totalAcompanantes === 0 ? 'persona' : 'personas' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PersonaDentro } from '@/stores/registro'

interface Props {
  modoEdicion: boolean
  acompanantes: PersonaDentro[]
  acompanantesOriginales: PersonaDentro[]
  acompanantesSalen: string[]
  acompanantesAdicionales: string[]
  personasDisponibles: PersonaDentro[]
  busqueda: string
}

const props = defineProps<Props>()

defineEmits<{
  'update:acompanantesSalen': [value: string[]]
  'update:busqueda': [value: string]
  'agregar-acompanante': [persona: PersonaDentro]
  'remover-acompanante': [cedula: string]
}>()

const totalAcompanantes = computed(() => {
  return props.acompanantesSalen.length + props.acompanantesAdicionales.length
})

const getPersonaNombre = (cedula: string): string => {
  const persona = props.personasDisponibles.find(p => p.cedula === cedula)
  return persona ? `${persona.nombre} ${persona.apellido}` : cedula
}
</script>

<style scoped>
.acompanantes-section {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
}

.info-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  min-width: 120px;
}

.info-value {
  color: rgb(var(--v-theme-on-surface));
}

.acompanante-item {
  display: flex;
  align-items: center;
  padding: 6px 0 6px 132px;
  gap: 8px;
}

.acompanante-numero {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  min-width: 24px;
}

.acompanante-nombre {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.acompanante-detalle {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.875rem;
}

/* Estilos para modo edición */
.edit-section-title {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.9rem;
}

.checkbox-row {
  padding: 4px 0;
}

.persona-agregada-item {
  background: rgba(var(--v-theme-success), 0.04);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  transition: all 0.2s;
}

.persona-agregada-item:hover {
  background: rgba(var(--v-theme-success), 0.08);
  border-color: rgba(var(--v-theme-success), 0.3);
}

.acompanante-autocomplete-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  min-height: 72px;
  transition: background-color 0.2s;
}

.acompanante-autocomplete-item:hover {
  background-color: rgba(var(--v-theme-success), 0.05);
}

.acompanante-autocomplete-item:last-child {
  border-bottom: none;
}
</style>
