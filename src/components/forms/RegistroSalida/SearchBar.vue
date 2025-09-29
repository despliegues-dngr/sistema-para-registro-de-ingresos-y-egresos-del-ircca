<template>
  <div class="form-section">
    <div class="section-header mb-4">
      <v-icon size="20" color="primary" class="mr-2">mdi-account-search</v-icon>
      <h4 class="text-h6 mb-0">Buscar Persona por Cédula o Matrícula</h4>
      <v-chip
        color="info"
        variant="tonal"
        size="small"
        class="ml-2"
      >
        {{ totalPersonas }} en el predio
      </v-chip>
    </div>

    <!-- Buscador con opciones integradas -->
    <v-autocomplete
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :items="items"
      item-title="displayText"
      item-value="persona"
      return-object
      label="Buscar por Cédula o Matrícula"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="comfortable"
      clearable
      autofocus
      hide-details="auto"
      :rules="rules"
      placeholder="Escriba cédula o matrícula del vehículo..."
      :search="search"
      @update:search="$emit('update:search', $event)"
      :custom-filter="() => true"
      no-filter
    >
      <!-- Slot personalizado para cada item -->
      <template #item="{ props: itemProps, item, index }">
        <v-list-item
          v-bind="itemProps"
          :class="[
            'persona-autocomplete-item pa-4',
            index % 2 === 0 ? 'bg-grey-lighten-5' : 'bg-white'
          ]"
        >
          <!-- Avatar más sutil -->
          <template #prepend>
            <v-avatar color="grey-lighten-2" size="32" class="avatar-sutil">
              <v-icon color="grey-darken-1" size="16">mdi-account</v-icon>
            </v-avatar>
          </template>

          <!-- Título personalizado -->
          <template #title>
            <div class="d-flex justify-space-between align-start w-100">

              <!-- Columna izquierda: Datos personales -->
              <div class="datos-personales flex-grow-1 pr-4">
                <!-- Nombre completo con cédula -->
                <div class="text-subtitle-1 font-weight-bold mb-2">
                  {{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}
                  <span class="text-body-2 text-medium-emphasis font-weight-normal ml-2">
                    (C.I: {{ item.raw.persona.cedula }})
                  </span>
                </div>

              <!-- Destino -->
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  color="info"
                  variant="tonal"
                  size="x-small"
                  prepend-icon="mdi-domain"
                >
                  {{ item.raw.persona.destino }}
                </v-chip>
              </div>
            </div>

            <!-- Columna derecha: Vehículo y tiempo -->
            <div class="datos-vehiculo-tiempo d-flex flex-column align-end">
              <!-- Tiempo en el predio -->
              <v-chip
                color="info"
                variant="tonal"
                size="small"
                prepend-icon="mdi-timer"
                class="mb-2"
              >
                {{ calcularTiempoEstadia(item.raw.persona.ingresoTimestamp) }}
              </v-chip>

              <!-- Información del vehículo o grupo -->
              <div class="vehiculo-grupo-info">
                <!-- Persona con vehículo propio -->
                <div v-if="item.raw.persona.conVehiculo && getVehiculoInfo(item.raw.persona.cedula)" class="vehiculo-info">
                  <div class="d-flex align-center mb-1">
                    <v-icon
                      :icon="getVehiculoIcon(getVehiculoInfo(item.raw.persona.cedula)?.tipo)"
                      size="16"
                      color="primary"
                      class="mr-1"
                    ></v-icon>
                    <span class="text-body-2 font-weight-medium text-primary">
                      {{ getVehiculoInfo(item.raw.persona.cedula)?.tipo }}
                    </span>
                  </div>
                  <div class="text-body-2 text-medium-emphasis text-right">
                    {{ getVehiculoInfo(item.raw.persona.cedula)?.matricula }}
                  </div>
                  <!-- Indicador si tiene acompañantes -->
                  <div v-if="getAcompanantesCount(item.raw.persona.cedula) > 0" class="text-body-2 text-warning text-right mt-1">
                    <v-icon size="12" class="mr-1">mdi-account-multiple</v-icon>
                    +{{ getAcompanantesCount(item.raw.persona.cedula) }} acompañantes
                  </div>
                </div>

                <!-- Acompañante (llegó en vehículo de otro) -->
                <div v-else-if="getVehiculoTitular(item.raw.persona.cedula)" class="acompanante-info">
                  <div class="text-body-2 text-medium-emphasis text-right mb-1">
                    <v-icon size="14" class="mr-1">mdi-account-arrow-right</v-icon>
                    Acompañante
                  </div>
                  <div class="d-flex align-center justify-end mb-1">
                    <v-icon
                      :icon="getVehiculoIcon(getVehiculoTitular(item.raw.persona.cedula)?.tipo)"
                      size="14"
                      color="info"
                      class="mr-1"
                    ></v-icon>
                    <span class="text-body-2 text-info">
                      {{ getVehiculoTitular(item.raw.persona.cedula)?.matricula }}
                    </span>
                  </div>
                </div>

                <!-- Persona sin vehículo -->
                <div v-else class="sin-vehiculo text-body-2 text-medium-emphasis text-right">
                  <v-icon size="14" class="mr-1">mdi-walk</v-icon>
                  A pie
                </div>
              </div>
            </div>

            </div>
          </template>
        </v-list-item>
      </template>

      <!-- Slot cuando no hay resultados -->
      <template #no-data>
        <div class="text-center pa-4">
          <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-account-search</v-icon>
          <p class="text-body-2 text-medium-emphasis mb-0">
            No se encontraron personas que coincidan
          </p>
        </div>
      </template>
    </v-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { useRegistroStore, type PersonaDentro, type RegistroIngreso } from '@/stores/registro'

interface SearchItem {
  displayText: string;
  persona: PersonaDentro;
  searchText: string;
}

interface Props {
  modelValue: SearchItem | null;
  items: SearchItem[];
  search: string;
  rules: ((value: SearchItem | null) => boolean | string)[];
  totalPersonas: number;
}

defineProps<Props>()
defineEmits(['update:modelValue', 'update:search'])

const registroStore = useRegistroStore()

// --- Helper methods moved from parent ---

const calcularTiempoEstadia = (ingresoTimestamp: Date): string => {
  const ahora = new Date()
  const ingreso = new Date(ingresoTimestamp)
  const diferenciaMs = ahora.getTime() - ingreso.getTime()

  const horas = Math.floor(diferenciaMs / (1000 * 60 * 60))
  const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60))

  if (horas > 0) {
    return `${horas}h ${minutos}m`
  } else {
    return `${minutos}m`
  }
}

const getVehiculoInfo = (cedula: string) => {
  const registro = registroStore.registrosRaw.find(r =>
    r.tipo === 'ingreso' &&
    (r as RegistroIngreso).datosPersonales?.cedula === cedula
  ) as RegistroIngreso | undefined

  return registro?.datosVehiculo || null
}

const getVehiculoIcon = (tipoVehiculo?: string): string => {
  const iconos: Record<string, string> = {
    'Auto': 'mdi-car',
    'Moto': 'mdi-motorbike',
    'Camión': 'mdi-truck',
    'Bus': 'mdi-bus'
  }
  return iconos[tipoVehiculo || ''] || 'mdi-car'
}

const getAcompanantesCount = (cedulaTitular: string): number => {
  const acompanantesData = registroStore.getAcompanantesData(cedulaTitular)
  return acompanantesData ? acompanantesData.length : 0
}

const getVehiculoTitular = (cedulaAcompanante: string) => {
  const personaAcompanante = registroStore.personasDentro.find(p =>
    p.cedula === cedulaAcompanante
  )

  if (!personaAcompanante) return null

  const registrosConVehiculo = registroStore.registrosRaw.filter(r =>
    r.tipo === 'ingreso' &&
    (r as RegistroIngreso).datosVehiculo &&
    Math.abs(r.timestamp.getTime() - personaAcompanante.ingresoTimestamp.getTime()) < 60000
  ) as RegistroIngreso[]

  return registrosConVehiculo[0]?.datosVehiculo || null
}

</script>

<style scoped>
.form-section {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(var(--v-theme-warning), 0.2);
  padding-bottom: 0.5rem;
}

/* Estilos para el autocomplete personalizado */
.persona-autocomplete-item {
  border-bottom: 1px solid rgba(var(--v-theme-surface-variant), 0.2);
  transition: all 0.2s ease;
  min-height: 90px;
}

.persona-autocomplete-item:hover {
  background-color: rgba(var(--v-theme-warning), 0.06);
  border-left: 3px solid rgb(var(--v-theme-warning));
}

.persona-autocomplete-item:last-child {
  border-bottom: none;
}

/* Avatar sutil */
.avatar-sutil {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.persona-autocomplete-item:hover .avatar-sutil {
  opacity: 1;
}

/* Layout de dos columnas */
.datos-personales {
  min-width: 0; /* Permite que flexbox maneje el texto largo */
}

.datos-vehiculo-tiempo {
  min-width: 120px;
  flex-shrink: 0;
}

/* Espaciado mejorado para chips */
.datos-personales .gap-1 {
  gap: 4px;
}

/* Estilos para información de vehículo */
.vehiculo-info {
  text-align: right;
}

.sin-vehiculo {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-style: italic;
}

/* Responsive para pantallas pequeñas */
@media (max-width: 600px) {
  .datos-vehiculo-tiempo {
    min-width: 100px;
  }

  .persona-autocomplete-item .pa-4 {
    padding: 12px;
  }
}
</style>
