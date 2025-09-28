<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <!-- Mensaje de feedback -->
    <v-alert
      v-if="message"
      :type="messageType"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="$emit('clear-message')"
    >
      {{ message }}
    </v-alert>

    <!-- Sección de Búsqueda y Selección Integrada -->
    <search-bar
      v-model="personaSeleccionadaItem"
      v-model:search="terminoBusqueda"
      :items="personasFiltradas"
      :rules="personaRules"
      :total-personas="registroStore.personasDentro.length"
    />

    <details-card :persona-seleccionada="personaSeleccionada" />


    <!-- Observaciones (solo se muestra después de seleccionar persona Y no estar en modo edición) -->
    <div v-if="personaSeleccionada && !mostrarEdicionSalida" class="form-section mt-6">
      <v-textarea
        v-model="observaciones"
        label="Observaciones sobre la Salida (Opcional)"
        prepend-inner-icon="mdi-note-text"
        variant="outlined"
        density="comfortable"
        rows="2"
        counter="200"
        hint="Información adicional relevante sobre la salida"
        persistent-hint
      />
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRegistroStore, type PersonaDentro, type RegistroIngreso } from '@/stores/registro'
import SearchBar from './RegistroSalida/SearchBar.vue'
import DetailsCard from './RegistroSalida/Details.vue'

// Interface para SearchItem (copiada de SearchBar para compatibilidad)
interface SearchItem {
  displayText: string;
  persona: PersonaDentro;
  searchText: string;
}

interface RegistroSalidaData {
  cedulaBuscada: string
  tiempoEstadia: number
  observaciones?: string
}

interface Props {
  loading?: boolean
  message?: string
}

interface Emits {
  (e: 'submit', data: RegistroSalidaData): void
  (e: 'clear-message'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const registroStore = useRegistroStore()
const terminoBusqueda = ref('')
const personaSeleccionadaItem = ref<SearchItem | null>(null)
const personaSeleccionada = ref<PersonaDentro | null>(null)
const mostrarEdicionSalida = ref(false)
const observaciones = ref('')
const formRef = ref()

const messageType = computed(() => {
  const message = props.message
  if (!message) return 'info'
  if (message.includes('error') || message.includes('Error')) return 'error'
  if (message.includes('exitosamente') || message.includes('éxito')) return 'success'
  return 'info'
})

const personasParaSelect = computed(() => {
  return registroStore.personasDentro.map((persona) => {
    const vehiculoInfo = getVehiculoInfo(persona.cedula)
    const matricula = vehiculoInfo ? vehiculoInfo.matricula : ''
    
    return {
      displayText: `${persona.nombre} ${persona.apellido}`,
      persona: persona,
      searchText: `${persona.cedula} ${matricula}`.toLowerCase()
    }
  })
})

const personasFiltradas = computed(() => {
  if (!terminoBusqueda.value) {
    return personasParaSelect.value
  }
  
  const termino = terminoBusqueda.value.toLowerCase().trim()
  
  return personasParaSelect.value.filter(item => {
    const persona = item.persona
    const coincideCedula = persona.cedula.includes(termino)
    if (coincideCedula) {
      return true
    }
    const vehiculoInfo = getVehiculoInfo(persona.cedula)
    const matricula = vehiculoInfo?.matricula?.toLowerCase() || ''
    const coincideMatricula = matricula.includes(termino)
    if (vehiculoInfo && coincideMatricula) {
      return true
    }
    return false
  })
})

const isFormValid = computed(() => {
  return !!personaSeleccionada.value
})

const personaRules = [
  (v: SearchItem | null) => !!v?.persona || 'Debe seleccionar una persona para registrar la salida'
]

watch(personaSeleccionadaItem, (newItem) => {
  if (newItem && newItem.persona) {
    personaSeleccionada.value = newItem.persona
  } else {
    personaSeleccionada.value = null
  }
})

const calcularTiempoEstadiaEnMinutos = (ingresoTimestamp: Date): number => {
  const ahora = new Date()
  const ingreso = new Date(ingresoTimestamp)
  return Math.floor((ahora.getTime() - ingreso.getTime()) / (1000 * 60))
}

const getVehiculoInfo = (cedula: string) => {
  const registro = registroStore.registrosRaw.find(r => 
    r.tipo === 'ingreso' && 
    (r as RegistroIngreso).datosPersonales?.cedula === cedula
  ) as RegistroIngreso | undefined
  
  return registro?.datosVehiculo || null
}

const handleSubmit = async () => {
  if (!personaSeleccionada.value) {
    return
  }

  const submitData: RegistroSalidaData = {
    cedulaBuscada: personaSeleccionada.value.cedula,
    tiempoEstadia: calcularTiempoEstadiaEnMinutos(personaSeleccionada.value.ingresoTimestamp),
    observaciones: observaciones.value || undefined,
  }

  emit('submit', submitData)
}

const resetForm = () => {
  personaSeleccionada.value = null
  personaSeleccionadaItem.value = null
  observaciones.value = ''
  terminoBusqueda.value = ''
  formRef.value?.resetValidation()
}

defineExpose({
  submit: handleSubmit,
  resetForm,
  isFormValid,
})
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
