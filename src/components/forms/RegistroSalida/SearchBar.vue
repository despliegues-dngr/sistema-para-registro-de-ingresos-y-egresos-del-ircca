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
      hide-details="auto"
      :rules="rules"
      placeholder="Escriba cédula o matrícula del vehículo..."
      :search="search"
      @update:search="$emit('update:search', $event)"
      :custom-filter="() => true"
      no-filter
      validate-on="blur"
    >
      <!-- ✅ Slot para controlar qué se muestra cuando está seleccionado -->
      <template #selection="{ item }">
        <span class="text-body-2">
          <v-icon size="16" color="primary" class="mr-1">mdi-account-circle</v-icon>
          {{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}
          <span class="text-caption text-medium-emphasis ml-2">
            ({{ item.raw.persona.cedula }})
          </span>
        </span>
      </template>
      <!-- ✅ Diseño copiado del autocomplete de ingreso -->
      <template #item="{ props: itemProps, item }">
        <v-list-item
          v-bind="itemProps"
          class="persona-list-item"
        >
          <template #prepend>
            <v-avatar color="warning" size="32">
              <v-icon size="16">mdi-exit-to-app</v-icon>
            </v-avatar>
          </template>
          <template #title>
            <div class="d-flex align-center justify-space-between">
              <!-- Columna izquierda: Nombre y Cédula -->
              <div>
                <span class="text-subtitle-1 font-weight-bold">
                  {{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}
                </span>
                <span class="text-body-2 text-medium-emphasis ml-2">
                  (C.I: {{ item.raw.persona.cedula }})
                </span>
              </div>

              <!-- Columna derecha: Chip de tiempo -->
              <v-chip
                color="warning"
                variant="flat"
                size="small"
              >
                <v-icon start size="14">mdi-clock-outline</v-icon>
                {{ calcularTiempoEstadia(item.raw.persona.ingresoTimestamp) }}
              </v-chip>
            </div>
          </template>
          <template #subtitle>
            <div class="d-flex align-center justify-space-between mt-1">
              <!-- Columna izquierda: Destino -->
              <span class="text-caption">
                <v-icon size="12">mdi-domain</v-icon>
                {{ item.raw.persona.destino }}
              </span>

              <!-- Columna derecha: Vehículo/Estado (diseño elegante con outlined) -->
              <div>
                <!-- Titular con vehículo -->
                <v-chip
                  v-if="item.raw.persona.conVehiculo && getVehiculoInfo(item.raw.persona.cedula)"
                  color="primary"
                  variant="outlined"
                  size="small"
                  class="font-weight-medium"
                >
                  <v-icon :icon="getVehiculoIcon(getVehiculoInfo(item.raw.persona.cedula)?.tipo)" start size="14"></v-icon>
                  {{ getVehiculoInfo(item.raw.persona.cedula)?.matricula }}
                  <span
                    v-if="getAcompanantesCount(item.raw.persona.cedula) > 0"
                    class="ml-2 text-success font-weight-bold"
                  >
                    (+{{ getAcompanantesCount(item.raw.persona.cedula) }})
                  </span>
                </v-chip>

                <!-- Acompañante -->
                <v-chip
                  v-else-if="getVehiculoTitular(item.raw.persona.cedula)"
                  color="info"
                  variant="outlined"
                  size="small"
                  class="font-weight-medium"
                >
                  <v-icon start size="14">mdi-account-arrow-right</v-icon>
                  Acompañante
                </v-chip>

                <!-- A pie -->
                <v-chip
                  v-else
                  color="secondary"
                  variant="outlined"
                  size="small"
                  class="font-weight-medium"
                >
                  <v-icon start size="14">mdi-walk</v-icon>
                  A pie
                </v-chip>
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

/* ✅ Estilos para items de la lista (igual que autocomplete de ingreso) */
.persona-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 12px 16px;
  min-height: 72px;
}

.persona-list-item:last-child {
  border-bottom: none;
}
</style>
