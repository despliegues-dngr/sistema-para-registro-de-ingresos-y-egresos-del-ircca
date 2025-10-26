<template>
  <FullScreenModal
    v-model="modelValue"
    :title="title"
    subtitle="Sistema de Control de Accesos del IRCCA"
    :icon="headerIcon"
    :header-color="headerColor"
    @close="handleClose"
  >
    <!-- Búsqueda rápida -->
    <div class="search-container" v-if="data.length > 0">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Buscar..."
          :placeholder="dataType === 'personas' ? 'Buscar por nombre, documento o área...' : 'Buscar por tipo, matrícula o conductor...'"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
    </div>

    <!-- Contenido principal -->
    <div class="content-container">
        <!-- Lista de personas con Virtual Scroll -->
        <template v-if="dataType === 'personas'">
          <v-virtual-scroll
            :items="filteredData"
            :height="virtualScrollHeight"
            item-height="80"
          >
            <template v-slot:default="{ item }">
              <v-card
                variant="outlined"
                class="persona-card mb-3"
                hover
                @click="emit('item-click', item)"
              >
                <v-card-text class="pa-3">
                  <div class="persona-header">
                    <div class="d-flex align-center">
                      <v-avatar color="primary" size="40" class="mr-3">
                        <v-icon size="20" color="white">mdi-account</v-icon>
                      </v-avatar>
                      <div class="persona-name">
                        {{ (item as any)?.nombre }} {{ (item as any)?.apellido }}
                      </div>
                    </div>

                    <v-chip
                      :color="(item as any)?.conVehiculo ? 'success' : 'grey'"
                      size="small"
                      variant="flat"
                      class="badge-vehiculo"
                    >
                      <v-icon size="14" class="mr-1">
                        {{ (item as any)?.conVehiculo ? 'mdi-car' : 'mdi-walk' }}
                      </v-icon>
                      {{ (item as any)?.conVehiculo ? 'Con vehículo' : 'A pie' }}
                    </v-chip>
                  </div>

                  <div class="persona-details">
                    <span class="detail-item">
                      <span class="detail-label">C.I:</span>
                      <span class="detail-value">{{ (item as any)?.cedula }}</span>
                    </span>
                    <span class="detail-separator">|</span>
                    <span class="detail-item">
                      <span class="detail-label">Destino:</span>
                      <span class="detail-value">{{ (item as any)?.destino }}</span>
                    </span>
                    <span class="detail-separator">|</span>
                    <span class="detail-item">
                      <span class="detail-label">Ingreso:</span>
                      <span class="detail-value">{{ formatearHoraCorta((item as any)?.ingresoTimestamp) }}</span>
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </template>
          </v-virtual-scroll>
        </template>

        <!-- Lista de vehículos con Virtual Scroll -->
        <template v-else-if="dataType === 'vehiculos'">
          <v-virtual-scroll
            :items="filteredData"
            :height="virtualScrollHeight"
            item-height="80"
          >
            <template v-slot:default="{ item }">
              <v-card
                variant="outlined"
                class="vehiculo-card mb-3"
                hover
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <v-avatar :color="getVehicleColor((item as any)?.tipo)" size="48" class="mr-3">
                      <v-icon size="24" color="white">{{ getVehicleIcon((item as any)?.tipo) }}</v-icon>
                    </v-avatar>

                    <div class="flex-grow-1">
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ (item as any)?.tipo }} - {{ (item as any)?.matricula }}
                      </div>

                      <div class="info-line-single text-caption">
                        <span class="info-item">👤 {{ (item as any)?.conductor }}</span>
                        <span class="info-separator">•</span>
                        <span class="info-item">⏱️ {{ formatearHoraCorta((item as any)?.ingresoTimestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </template>
          </v-virtual-scroll>
        </template>

        <!-- Estado vacío -->
        <template v-if="filteredData.length === 0">
          <div class="d-flex flex-column align-center justify-center py-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">{{ emptyIcon }}</v-icon>
            <h3 class="text-h6 text-grey-darken-1 mb-2">{{ emptyTitle }}</h3>
            <p class="text-body-2 text-grey">{{ emptySubtitle }}</p>
          </div>
        </template>
    </div>

    <!-- Footer con contador y botón -->
    <template #footer>
      <div class="footer-actions">
        <span class="counter-text">
          {{ searchQuery ? `${filteredData.length} de ${data.length}` : `Total: ${data.length}` }} {{ dataType === 'personas' ? 'personas' : 'vehículos' }}
        </span>
        <button class="btn-secondary" @click="closeModal">
          <i class="mdi mdi-close"></i>
          Cerrar
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullScreenModal from './FullScreenModal.vue'

// 🔧 INTERFACES ESPECÍFICAS PARA EVITAR 'any'
interface PersonaModalData {
  cedula: string
  nombre: string
  apellido: string
  destino: string
  ingresoTimestamp?: Date
  conVehiculo?: boolean
}

interface VehiculoModalData {
  id: string
  tipo: string
  matricula: string
  conductor: string
  ingresoTimestamp: Date
}

type ModalData = PersonaModalData | VehiculoModalData

interface Props {
  modelValue: boolean
  title: string
  subtitle?: string
  headerIcon: string
  headerColor?: string // Color dinámico del header
  data: unknown[] // Tipo seguro para datos genéricos
  dataType: 'personas' | 'vehiculos' // Tipo de datos para filtrado
  emptyTitle?: string
  emptySubtitle?: string
  emptyIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  headerColor: 'primary', // Default color
  emptyTitle: 'No hay datos disponibles',
  emptySubtitle: 'Actualmente no hay información para mostrar',
  emptyIcon: 'mdi-folder-open'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'item-click': [item: unknown]
}>()

// Estado para búsqueda
const searchQuery = ref('')

// Computadas para manejar el v-model
const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Datos filtrados por búsqueda
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.data
  }

  const query = searchQuery.value.toLowerCase().trim()

  return props.data.filter((item: unknown) => {
    const itemData = item as ModalData

    if (props.dataType === 'personas') {
      const personaData = itemData as PersonaModalData
      const nombre = `${personaData?.nombre || ''} ${personaData?.apellido || ''}`.toLowerCase()
      const cedula = (personaData?.cedula || '').toString().toLowerCase()
      const destino = (personaData?.destino || '').toLowerCase()

      return nombre.includes(query) ||
             cedula.includes(query) ||
             destino.includes(query)
    } else {
      // Para vehículos
      const vehiculoData = itemData as VehiculoModalData
      const tipo = (vehiculoData?.tipo || '').toLowerCase()
      const matricula = (vehiculoData?.matricula || '').toLowerCase()
      const conductor = (vehiculoData?.conductor || '').toLowerCase()

      return tipo.includes(query) ||
             matricula.includes(query) ||
             conductor.includes(query)
    }
  })
})
// Altura del virtual scroll (calculada)
const virtualScrollHeight = computed(() => {
  const dataLength = filteredData.value.length
  if (dataLength === 0) return 0

  const itemHeight = 88 // 80px item + 8px margin
  const minHeight = itemHeight * 4 // Mínimo 4 items visibles (352px)
  const maxHeight = 600 // Máximo para tablets (aprox 6-7 items)

  // Asegurar que siempre se muestren al menos 4 items (si hay datos)
  const calculatedHeight = dataLength * itemHeight
  return Math.max(minHeight, Math.min(calculatedHeight, maxHeight))
})

function formatearHoraCorta(timestamp: Date): string {
  if (!timestamp) return 'N/A'
  const fecha = new Date(timestamp)
  return fecha.toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function getVehicleIcon(tipo: string): string {
  const iconos = {
    'Auto': 'mdi-car',
    'Moto': 'mdi-motorbike',
    'Camión': 'mdi-truck',
    'Camion': 'mdi-truck', // Sin tilde para compatibilidad
    'Bus': 'mdi-bus'
  }
  return iconos[tipo as keyof typeof iconos] || 'mdi-car'
}

function getVehicleColor(tipo: string): string {
  const colores = {
    'Auto': 'primary',
    'Moto': 'accent',
    'Camión': 'warning',
    'Camion': 'warning', // Sin tilde para compatibilidad
    'Bus': 'success'
  }
  return colores[tipo as keyof typeof colores] || 'primary'
}

function closeModal() {
  searchQuery.value = '' // Limpiar búsqueda al cerrar
  modelValue.value = false
}

function handleClose() {
  closeModal()
}
</script>

<style scoped>
/* ========================================
   🔍 BÚSQUEDA
   ======================================== */

.search-container {
  padding: 1rem 1.5rem 0.5rem;
}

/* ========================================
   📋 CONTENIDO
   ======================================== */

.content-container {
  padding: 0.5rem 1.5rem 1rem;
}

/* Cards de personas y vehículos */
.persona-card,
.vehiculo-card {
  transition: all 0.2s;
  border-color: rgba(0, 0, 0, 0.12);
}

.persona-card:hover,
.vehiculo-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Header de persona con badge */
.persona-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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
}

/* Detalles estructurados tipo tabla */
.persona-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-left: 52px;
}

.detail-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.detail-label {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.detail-value {
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.85);
}

.detail-separator {
  color: rgba(var(--v-theme-on-surface), 0.25);
  font-weight: 300;
}

/* Ajustes para virtual scroll */
:deep(.v-virtual-scroll) {
  padding: 0;
}

:deep(.v-virtual-scroll__container) {
  padding: 0;
}

/* ========================================
   🎨 FOOTER ACTIONS
   ======================================== */

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.counter-text {
  font-size: 0.875rem;
  color: #616161;
  font-weight: 500;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #424242;
  border: 1px solid #BDBDBD;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.btn-secondary:hover {
  background: #F5F5F5;
  border-color: #757575;
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary:active {
  transform: scale(0.98) translateZ(0);
}

.btn-secondary i {
  font-size: 1.125rem;
}

/* ========================================
   📱 RESPONSIVE
   ======================================== */

@media (max-width: 600px) {
  .footer-actions {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .counter-text {
    text-align: center;
  }

  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
