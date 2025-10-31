<template>
  <div class="cedula-autocomplete-wrapper">
    <!-- Campo de texto simple -->
    <v-text-field
      :model-value="search"
      @update:model-value="handleInput"
      label="Documento"
      prepend-inner-icon="mdi-card-account-details"
      variant="outlined"
      density="comfortable"
      clearable
      hide-details="auto"
      placeholder="Escriba el número de documento..."
      :loading="loading"
      :rules="cedulaRules"
      :hint="getDocumentoHint(search)"
      persistent-hint
      :color="getDocumentoColor(search)"
      autocomplete="off"
      spellcheck="false"
      required
      @keypress="onlyNumbers"
    />

    <!-- Sugerencias inline (debajo del campo) -->
    <div v-if="items.length > 0 && search" class="sugerencias-container mt-2">
      <v-card variant="outlined" class="sugerencias-card">
        <v-card-text class="pa-2">
          <div class="text-caption text-medium-emphasis mb-2 px-2">
            <v-icon size="14" class="mr-1">mdi-lightbulb-on-outline</v-icon>
            {{ items.length }} persona{{items.length !== 1 ? 's' : ''}} conocida{{items.length !== 1 ? 's' : ''}} encontrada{{items.length !== 1 ? 's' : ''}}
          </div>
          
          <v-list density="compact" class="py-0">
            <v-list-item
              v-for="item in items"
              :key="item.cedula"
              class="persona-sugerencia-item"
              @click="seleccionarPersona(item)"
            >
              <template #prepend>
                <v-avatar
                  :color="getFrecuenciaColor(item.frecuencia)"
                  size="32"
                  class="mr-3"
                >
                  <v-icon color="white" size="16">mdi-account</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-subtitle-2 font-weight-bold">
                {{ item.nombre }} {{ item.apellido }}
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-caption">
                C.I: {{ formatCedula(item.cedula) }} • {{ item.ultimoDestino }}
                <span v-if="item.ultimoVehiculo" class="ml-2">
                  • {{ item.ultimoVehiculo.tipo }} ({{ item.ultimoVehiculo.matricula }})
                </span>
              </v-list-item-subtitle>

              <template #append>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="grey"
                >
                  {{ formatearUltimaVisita(item.ultimaVisita) }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCedulaFormat } from '@/composables/useCedulaFormat'
import type { PersonaConocida } from '@/services/autocomplete/types'

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

const { formatCedula } = useCedulaFormat()

// Reglas de validación para documento (solo requerido, sin límites de longitud)
const cedulaRules = [
  (v: string | AutocompleteItem) => {
    const cedula = typeof v === 'string' ? v : (v?.cedula || '')
    return !!cedula || 'El documento es requerido'
  }
]

/**
 * Genera un hint dinámico según la longitud del documento
 */
const getDocumentoHint = (documento: string): string => {
  const longitud = documento?.length || 0
  
  if (longitud === 0) {
    return 'Ingrese el número de documento sin puntos ni guiones'
  }
  
  if (longitud === 8) {
    return '✓ 8 dígitos ingresados (correcto para documento uruguayo)'
  }
  
  // Menos de 8 o más de 8 dígitos
  return `⚠ ${longitud} dígito${longitud !== 1 ? 's' : ''} ingresado${longitud !== 1 ? 's' : ''} (Puede ser documento extranjero o error en el ingreso)`
}

/**
 * Obtiene el color del hint según la longitud del documento
 */
const getDocumentoColor = (documento: string): string => {
  const longitud = documento?.length || 0
  
  if (longitud === 8) {
    return 'success' // Verde para documento uruguayo correcto
  }
  
  if (longitud > 0) {
    return 'warning' // Naranja para advertencia (posible error o extranjero)
  }
  
  return 'default' // Gris por defecto
}

// Filtro de entrada: solo números
const onlyNumbers = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which)
  if (!/^\d$/.test(char)) {
    event.preventDefault()
  }
}

/**
 * Maneja entrada manual de texto
 */
const handleInput = (value: string) => {
  const cedulaTexto = String(value || '').replace(/\D/g, '') // Solo números
  emit('update:search', cedulaTexto)
  emit('update:modelValue', null) // Limpiar selección de objeto
}

/**
 * Selecciona una persona de las sugerencias
 */
const seleccionarPersona = (persona: AutocompleteItem) => {
  emit('update:search', persona.cedula)
  emit('update:modelValue', persona)
  emit('persona-selected', persona)
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

</script>

<style scoped>
/* Contenedor de sugerencias */
.cedula-autocomplete-wrapper {
  position: relative;
}

.sugerencias-container {
  position: relative;
  z-index: 1;
}

.sugerencias-card {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Items de sugerencias */
.persona-sugerencia-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(var(--v-theme-surface-variant), 0.1);
}

.persona-sugerencia-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.persona-sugerencia-item:last-child {
  border-bottom: none;
}
</style>
