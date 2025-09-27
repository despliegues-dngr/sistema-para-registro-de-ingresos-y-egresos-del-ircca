<template>
  <v-dialog 
    v-model="modelValue" 
    max-width="900" 
    persistent 
    transition="dialog-bottom-transition"
    scrollable
  >
    <v-card class="data-list-dialog-card">
      <!-- Header institucional estándar -->
      <v-card-title :class="`bg-${headerColor} pa-4`">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">{{ headerIcon }}</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">{{ title }}</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">Sistema para registros del IRCCA</p>
          </div>
        </div>
      </v-card-title>

      <!-- Búsqueda rápida -->
      <v-card-text class="pa-4 pb-0" v-if="data.length > 0">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Buscar..."
          :placeholder="dataType === 'personas' ? 'Buscar por nombre, cédula o área...' : 'Buscar por tipo, matrícula o conductor...'"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </v-card-text>

      <v-card-text class="pa-0">
        <!-- Lista de personas -->
        <template v-if="dataType === 'personas'">
          <v-list class="py-0">
            <template v-for="(persona, index) in filteredData" :key="(persona as PersonaModalData)?.cedula || index">
              <v-list-item 
                class="py-3 px-6" 
                :class="{ 'bg-grey-lighten-5': index % 2 === 1 }"
              >
                <template #prepend>
                  <v-avatar color="primary" class="text-white mr-4">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-h6 mb-1">
                  {{ (persona as any)?.nombre }} {{ (persona as any)?.apellido }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  <div class="d-flex flex-column gap-1">
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-2">mdi-card-account-details</v-icon>
                      <span>C.I: {{ (persona as any)?.cedula }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-2">mdi-clock</v-icon>
                      <span>Ingreso: {{ formatearHora((persona as any)?.ingresoTimestamp) }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-2">mdi-domain</v-icon>
                      <span>Destino: {{ (persona as any)?.destino }}</span>
                    </div>
                  </div>
                </v-list-item-subtitle>

                <template #append>
                  <div class="text-center">
                    <v-chip 
                      :color="(persona as any)?.conVehiculo ? 'success' : 'default'" 
                      size="small"
                      variant="tonal"
                    >
                      <v-icon 
                        size="16" 
                        :icon="(persona as any)?.conVehiculo ? 'mdi-car' : 'mdi-walk'"
                        class="mr-1"
                      />
                      {{ (persona as any)?.conVehiculo ? 'Con vehículo' : 'Sin vehículo' }}
                    </v-chip>
                  </div>
                </template>
              </v-list-item>
              
              <v-divider v-if="index < filteredData.length - 1" />
            </template>
          </v-list>
        </template>

        <!-- Lista de vehículos -->
        <template v-else-if="dataType === 'vehiculos'">
          <v-list class="py-0">
            <template v-for="(vehiculo, index) in filteredData" :key="(vehiculo as any)?.id || index">
              <v-list-item 
                class="py-3 px-6" 
                :class="{ 'bg-grey-lighten-5': index % 2 === 1 }"
              >
                <template #prepend>
                  <v-avatar :color="getVehicleColor((vehiculo as any)?.tipo)" class="text-white mr-4">
                    <v-icon>{{ getVehicleIcon((vehiculo as any)?.tipo) }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-h6 mb-1">
                  {{ (vehiculo as any)?.tipo }} - {{ (vehiculo as any)?.matricula }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  <div class="d-flex flex-column gap-1">
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-2">mdi-clock</v-icon>
                      <span>Ingreso: {{ formatearHora((vehiculo as any)?.ingresoTimestamp) }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-2">mdi-account</v-icon>
                      <span>Conductor: {{ (vehiculo as any)?.conductor }}</span>
                    </div>
                  </div>
                </v-list-item-subtitle>

                <template #append>
                  <v-chip 
                    :color="getVehicleColor((vehiculo as any)?.tipo)" 
                    size="small"
                    variant="tonal"
                  >
                    <v-icon 
                      size="16" 
                      :icon="getVehicleIcon((vehiculo as any)?.tipo)"
                      class="mr-1"
                    />
                    {{ (vehiculo as any)?.tipo }}
                  </v-chip>
                </template>
              </v-list-item>
              
              <v-divider v-if="index < filteredData.length - 1" />
            </template>
          </v-list>
        </template>

        <!-- Estado vacío -->
        <template v-if="filteredData.length === 0">
          <div class="d-flex flex-column align-center justify-center py-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">{{ emptyIcon }}</v-icon>
            <h3 class="text-h6 text-grey-darken-1 mb-2">{{ emptyTitle }}</h3>
            <p class="text-body-2 text-grey">{{ emptySubtitle }}</p>
          </div>
        </template>
      </v-card-text>

      <!-- Actions estándar -->
      <v-card-actions class="pa-4 pt-2">
        <span class="text-body-2 text-grey-darken-1">
          {{ searchQuery ? `${filteredData.length} de ${data.length}` : `Total: ${data.length}` }} {{ dataType === 'personas' ? 'personas' : 'vehículos' }}
        </span>
        <v-spacer />
        <v-btn 
          color="secondary" 
          variant="text" 
          @click="closeModal"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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
function formatearHora(timestamp: Date): string {
  if (!timestamp) return 'N/A'
  const fecha = new Date(timestamp)
  return fecha.toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

// Emitir eventos globales para controlar blur del fondo
watch(modelValue, (newVal: boolean) => {
  if (newVal) {
    window.dispatchEvent(new CustomEvent('dialog-opened'))
  } else {
    window.dispatchEvent(new CustomEvent('dialog-closed'))
  }
})
</script>

<style scoped>
/* Estilo estándar del proyecto para modales */
.data-list-dialog-card {
  border-top: 3px solid rgb(var(--v-theme-primary));
}
</style>
