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

    <!-- Detalles de la persona seleccionada -->
    <details-card ref="detailsCardRef" :persona-seleccionada="personaSeleccionadaObj" />


    <!-- Observaciones (solo se muestra después de seleccionar persona Y no estar en modo edición) -->
    <div v-if="personaSeleccionadaObj && !mostrarEdicionSalida" class="form-section mt-6">
      <v-textarea
        v-model="observaciones"
        label="Observaciones sobre la Salida (Opcional)"
        prepend-inner-icon="mdi-note-text"
        variant="outlined"
        density="comfortable"
        rows="2"
        counter="100"
        maxlength="100"
        hint="Información adicional relevante sobre la salida"
        persistent-hint
        validate-on="blur"
      />
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRegistroStore } from '@/stores/registro'
import type { PersonaDentro, DatosVehiculo } from '@/stores/registro'
import DetailsCard from './RegistroSalida/Details.vue'

interface RegistroSalidaData {
  cedulaBuscada: string
  tiempoEstadia: number
  observaciones?: string
  datosVehiculoSalida?: DatosVehiculo
  acompanantesSalida?: string[]
}

interface Props {
  loading?: boolean
  message?: string
  personaPreseleccionada?: PersonaDentro
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
const personaSeleccionada = ref<string>(props.personaPreseleccionada?.cedula || '') // Cédula seleccionada
const mostrarEdicionSalida = ref(false)
const observaciones = ref('')
const formRef = ref()
const detailsCardRef = ref<InstanceType<typeof DetailsCard>>()

// Computed: Obtener persona completa desde cédula
const personaSeleccionadaObj = computed(() => {
  if (!personaSeleccionada.value) return null
  return registroStore.personasDentro.find(p => p.cedula === personaSeleccionada.value) || null
})

const messageType = computed(() => {
  const message = props.message
  if (!message) return 'info'
  if (message.includes('error') || message.includes('Error')) return 'error'
  if (message.includes('exitosamente') || message.includes('éxito')) return 'success'
  return 'info'
})

const isFormValid = computed(() => {
  return !!personaSeleccionada.value
})

const calcularTiempoEstadiaEnMinutos = (ingresoTimestamp: Date): number => {
  const ahora = new Date()
  const ingreso = new Date(ingresoTimestamp)
  return Math.floor((ahora.getTime() - ingreso.getTime()) / (1000 * 60))
}

const handleSubmit = async () => {
  if (!personaSeleccionadaObj.value) return

  const datosEditados = detailsCardRef.value?.getDatosEditados()

  const submitData: RegistroSalidaData = {
    cedulaBuscada: personaSeleccionadaObj.value.cedula,
    tiempoEstadia: calcularTiempoEstadiaEnMinutos(personaSeleccionadaObj.value.ingresoTimestamp),
    observaciones: observaciones.value || undefined,
    ...(datosEditados?.datosVehiculoSalida && { datosVehiculoSalida: datosEditados.datosVehiculoSalida }),
    ...(datosEditados?.acompanantesSalida && datosEditados.acompanantesSalida.length > 0 && { acompanantesSalida: datosEditados.acompanantesSalida })
  }

  emit('submit', submitData)
}

const resetForm = () => {
  personaSeleccionada.value = ''
  observaciones.value = ''
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
  margin-bottom: 1.5rem;
}
</style>
