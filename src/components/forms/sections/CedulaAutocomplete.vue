<template>
  <!-- ✅ CAMBIADO: v-combobox permite entrada libre + sugerencias -->
  <v-combobox
    :model-value="search"
    @update:model-value="handleInput"
    :items="items"
    item-title="displayText"
    item-value="cedula"
    label="Cédula de Identidad"
    prepend-inner-icon="mdi-card-account-details"
    variant="outlined"
    density="comfortable"
    clearable
    hide-details="auto"
    placeholder="Escriba la cédula..."
    :custom-filter="() => true"
    no-filter
    :loading="loading"
    :rules="cedulaRules"
    hint="Ingrese el número de cédula sin puntos ni guiones"
    persistent-hint
    required
    @keypress="onlyNumbers"
  >
    <!-- Slot personalizado para cada item (persona conocida) -->
    <template #item="{ props: itemProps, item, index }">
      <v-list-item
        v-bind="itemProps"
        :class="[
          'persona-autocomplete-item pa-4',
          index % 2 === 0 ? 'bg-grey-lighten-5' : 'bg-white'
        ]"
      >
        <!-- Avatar -->
        <template #prepend>
          <v-avatar
            :color="getFrecuenciaColor(item.raw.frecuencia)"
            size="32"
            class="avatar-sutil"
          >
            <v-icon color="white" size="16">mdi-account</v-icon>
          </v-avatar>
        </template>

        <!-- Contenido principal -->
        <template #title>
          <div class="d-flex justify-space-between align-start w-100">
            <!-- Columna izquierda: Datos personales -->
            <div class="datos-personales flex-grow-1 pr-4">
              <!-- Nombre completo con cédula -->
              <div class="text-subtitle-1 font-weight-bold mb-2">
                {{ item.raw.nombre }} {{ item.raw.apellido }}
                <span class="text-body-2 text-medium-emphasis font-weight-normal ml-2">
                  (C.I: {{ item.raw.cedula }})
                </span>
              </div>

              <!-- Chips de información -->
              <div class="d-flex flex-wrap gap-1">
                <!-- Último destino -->
                <v-chip
                  color="info"
                  variant="tonal"
                  size="x-small"
                  prepend-icon="mdi-domain"
                >
                  {{ item.raw.ultimoDestino }}
                </v-chip>
              </div>
            </div>

            <!-- Columna derecha: Vehículo y última visita -->
            <div class="datos-vehiculo-tiempo d-flex flex-column align-end">
              <!-- Última visita -->
              <v-chip
                color="grey"
                variant="tonal"
                size="small"
                prepend-icon="mdi-calendar-clock"
                class="mb-2"
              >
                {{ formatearUltimaVisita(item.raw.ultimaVisita) }}
              </v-chip>

              <!-- Información del vehículo si existe -->
              <div v-if="item.raw.ultimoVehiculo" class="vehiculo-info">
                <div class="d-flex align-center mb-1">
                  <v-icon
                    :icon="getVehiculoIcon(item.raw.ultimoVehiculo.tipo)"
                    size="16"
                    color="primary"
                    class="mr-1"
                  ></v-icon>
                  <span class="text-body-2 font-weight-medium text-primary">
                    {{ item.raw.ultimoVehiculo.tipo }}
                  </span>
                </div>
                <div class="text-body-2 text-medium-emphasis text-right">
                  {{ item.raw.ultimoVehiculo.matricula }}
                </div>
              </div>

              <!-- Sin vehículo -->
              <div v-else class="sin-vehiculo text-body-2 text-medium-emphasis text-right">
                <v-icon size="14" class="mr-1">
                  {{ item.raw.esAcompanante ? 'mdi-account-multiple' : 'mdi-walk' }}
                </v-icon>
                {{ item.raw.esAcompanante ? 'Acompañante' : 'A pie usualmente' }}
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
          {{ search ? 'No se encontraron personas conocidas' : 'Escriba para buscar registros existentes' }}
        </p>
        <p v-if="search" class="text-caption text-medium-emphasis mt-1">
          Puede registrar una nueva persona o seleccionar una sugerencia
        </p>
      </div>
    </template>
  </v-combobox>
</template>

<script setup lang="ts">
import type { PersonaConocida } from '@/services/autocompleteService'

interface AutocompleteItem extends PersonaConocida {
  displayText: string
}

interface Props {
  modelValue: AutocompleteItem | null
  items: AutocompleteItem[]
  search: string
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: AutocompleteItem | null): void
  (e: 'update:search', value: string): void
  (e: 'persona-selected', persona: PersonaConocida): void
}

withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// Reglas de validación para cédula (acepta documentos nacionales y extranjeros)
const cedulaRules = [
  (v: string | AutocompleteItem) => {
    const cedula = typeof v === 'string' ? v : (v?.cedula || '')
    return !!cedula || 'El documento es requerido'
  },
  (v: string | AutocompleteItem) => {
    const cedula = typeof v === 'string' ? v : (v?.cedula || '')
    return cedula.length >= 7 || 'El documento debe tener al menos 7 dígitos'
  },
  (v: string | AutocompleteItem) => {
    const cedula = typeof v === 'string' ? v : (v?.cedula || '')
    return cedula.length <= 15 || 'El documento no puede tener más de 15 dígitos'
  }
]

// Filtro de entrada: solo números
const onlyNumbers = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which)
  if (!/^\d$/.test(char)) {
    event.preventDefault()
  }
}

/**
 * ✅ NUEVO: Maneja tanto entrada libre como selección de sugerencias
 */
const handleInput = (value: string | AutocompleteItem) => {
  // Si es un objeto (selección de sugerencia)
  if (typeof value === 'object' && value !== null && 'cedula' in value) {
    const persona = value as AutocompleteItem
    emit('update:search', persona.cedula)
    emit('update:modelValue', persona)
    emit('persona-selected', persona)
  } 
  // Si es string (entrada manual)
  else {
    const cedulaTexto = String(value || '').replace(/\D/g, '') // Solo números
    emit('update:search', cedulaTexto)
    emit('update:modelValue', null) // Limpiar selección de objeto
  }
}

/**
 * Obtiene el color según la frecuencia de visita
 */
const getFrecuenciaColor = (frecuencia: 'alta' | 'media' | 'baja'): string => {
  const colores: Record<string, string> = {
    alta: 'success',
    media: 'info',
    baja: 'warning'
  }
  // eslint-disable-next-line security/detect-object-injection -- Safe: frecuencia is 'alta' | 'media' | 'baja' from system
  return colores[frecuencia] || 'default'
}

/**
 * Formatea la última visita en formato relativo
 */
const formatearUltimaVisita = (fecha: Date): string => {
  const ahora = new Date()
  const ultimaVisita = new Date(fecha)
  const diferenciaMs = ahora.getTime() - ultimaVisita.getTime()
  const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))

  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`
  if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`
  return `Hace ${Math.floor(dias / 365)} años`
}

/**
 * Obtiene el ícono del vehículo según el tipo
 */
const getVehiculoIcon = (tipoVehiculo?: string): string => {
  const iconos: Record<string, string> = {
    'Auto': 'mdi-car',
    'Moto': 'mdi-motorbike',
    'Camión': 'mdi-truck',
    'Bus': 'mdi-bus'
  }
  return iconos[tipoVehiculo || ''] || 'mdi-car'
}
</script>

<style scoped>
/* Estilos para el autocomplete personalizado */
.persona-autocomplete-item {
  border-bottom: 1px solid rgba(var(--v-theme-surface-variant), 0.2);
  transition: all 0.2s ease;
  min-height: 90px;
}

.persona-autocomplete-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.persona-autocomplete-item:last-child {
  border-bottom: none;
}

/* Avatar sutil */
.avatar-sutil {
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.persona-autocomplete-item:hover .avatar-sutil {
  opacity: 1;
}

/* Layout de dos columnas */
.datos-personales {
  min-width: 0;
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
