<template>
  <v-card
    variant="outlined"
    class="persona-card mb-3"
    hover
    @click="emit('click', persona)"
  >
    <v-card-text class="pa-3">
      <div class="persona-container">
        <!-- Fila 1: Avatar + Nombre/Apellido + Chip -->
        <div class="persona-header">
          <div class="persona-name-section">
            <v-avatar color="primary" size="40" class="persona-avatar">
              <v-icon size="20" color="white">mdi-account</v-icon>
            </v-avatar>
            <div class="persona-name">
              {{ persona.nombre }} {{ persona.apellido }}
            </div>
          </div>
          <v-chip
            :color="getChipColor(persona)"
            size="small"
            variant="flat"
            class="badge-vehiculo"
          >
            <v-icon size="14" class="mr-1">
              {{ getChipIcon(persona) }}
            </v-icon>
            {{ getChipText(persona) }}
          </v-chip>
        </div>
        
        <!-- Fila 2: Detalles (C.I, Destino, Ingreso) -->
        <div class="persona-details">
          <span class="detail-item">
            <span class="detail-label">C.I:</span>
            <span class="detail-value">{{ formatCedula(persona.cedula) }}</span>
          </span>
          <span class="detail-separator">|</span>
          <span class="detail-item">
            <span class="detail-label">Destino:</span>
            <span class="detail-value">{{ persona.destino }}</span>
          </span>
          <span class="detail-separator">|</span>
          <span class="detail-item">
            <span class="detail-label">Ingreso:</span>
            <span class="detail-value">{{ formatearHoraCorta(persona.ingresoTimestamp) }}</span>
          </span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useDataListLogic } from '@/composables/useDataListLogic'
import { useCedulaFormat } from '@/composables/useCedulaFormat'

interface PersonaModalData {
  cedula: string
  nombre: string
  apellido: string
  destino: string
  ingresoTimestamp?: Date
  conVehiculo?: boolean
  tipoVehiculo?: string
  esAcompanante?: boolean
}

interface Props {
  persona: PersonaModalData
}

defineProps<Props>()

const emit = defineEmits<{
  click: [persona: PersonaModalData]
}>()

const { 
  formatearHoraCorta,
  getChipColor,
  getChipIcon,
  getChipText
} = useDataListLogic()

const { formatCedula } = useCedulaFormat()
</script>

<style scoped>
/* Cards de personas */
.persona-card {
  transition: all 0.2s;
  border-color: rgba(0, 0, 0, 0.12);
}

.persona-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Contenedor principal de dos filas */
.persona-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Fila 1: Header con nombre y chip */
.persona-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

/* Sección izquierda: Avatar + Nombre */
.persona-name-section {
  display: flex;
  align-items: flex-start; /* Cambiar de center a flex-start para alineación superior */
  gap: 12px;
  flex: 1;
  min-width: 0;
}

/* Avatar con alineación consistente */
.persona-avatar {
  flex-shrink: 0;
}

.persona-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.badge-vehiculo {
  font-weight: 500;
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* Fila 2: Detalles en línea separada */
.persona-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-left: 52px; /* Alinear con el texto del nombre (40px avatar + 12px gap) */
  flex-wrap: nowrap;
}

.detail-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
}

.detail-label {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.detail-value {
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.85);
  white-space: nowrap;
}

.detail-separator {
  color: rgba(var(--v-theme-on-surface), 0.25);
  font-weight: 300;
}
</style>
