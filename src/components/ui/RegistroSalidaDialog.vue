<template>
  <!-- Modal 1: Lista de personas para seleccionar -->
  <DataListModal
    v-model="showListaPersonas"
    title="Seleccionar Persona para Salida"
    header-icon="mdi mdi-logout"
    header-color="warning"
    data-type="personas"
    :data="personasDentroData"
    empty-title="No hay personas en el predio"
    empty-subtitle="Actualmente no hay personas registradas para registrar salida"
    empty-icon="mdi-account-off"
    @item-click="handlePersonaSeleccionada"
  />

  <!-- Modal 2: Confirmación y detalles de salida -->
  <FullScreenModal
    v-model="showConfirmacion"
    title="Confirmar Salida"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-account-minus"
    header-color="warning"
    :persistent="loading"
    @close="handleCloseConfirmacion"
  >
    <RegistroSalidaForm
      v-if="showConfirmacion && personaSeleccionada"
      ref="formRef"
      :loading="loading"
      :message="message"
      :persona-preseleccionada="personaSeleccionada"
      @submit="onSubmit"
      @clear-message="clearMessage"
    />

    <!-- Footer con botones de acción -->
    <template #footer>
      <div class="footer-actions">
        <button 
          class="btn-secondary" 
          @click="volverALista"
          :disabled="loading"
        >
          <i class="mdi mdi-arrow-left"></i>
          Volver
        </button>
        <button 
          class="btn-warning" 
          @click="handleSubmit"
          :disabled="!isFormValid || loading"
        >
          <i class="mdi mdi-logout"></i>
          Registrar Salida
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRegistroStore } from '@/stores/registro'
import FullScreenModal from './FullScreenModal.vue'
import DataListModal from './DataListModal.vue'
import RegistroSalidaForm from '@/components/forms/RegistroSalidaForm.vue'
import type { PersonaDentro } from '@/stores/registro'

interface RegistroSalidaData {
  cedulaBuscada: string
  tiempoEstadia: number
  observaciones?: string
  datosVehiculoSalida?: { tipo: string; matricula: string }
  acompanantesSalida?: string[]
}

interface Props {
  modelValue: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
  success: [message: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const registroStore = useRegistroStore()

// Estado reactivo
const loading = ref(false)
const message = ref('')
const formRef = ref()
const showListaPersonas = ref(false)
const showConfirmacion = ref(false)
const personaSeleccionada = ref<PersonaDentro | null>(null)

// Datos de personas dentro del predio
const personasDentroData = computed(() => {
  return registroStore.personasDentro.map(persona => ({
    cedula: persona.cedula,
    nombre: persona.nombre,
    apellido: persona.apellido,
    destino: persona.destino,
    ingresoTimestamp: persona.ingresoTimestamp,
    conVehiculo: persona.conVehiculo
  }))
})

// Watch para sincronizar modelValue con showListaPersonas
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    showListaPersonas.value = true
    showConfirmacion.value = false
    personaSeleccionada.value = null
  } else {
    showListaPersonas.value = false
    showConfirmacion.value = false
  }
})

watch(showListaPersonas, (newValue) => {
  if (!newValue && !showConfirmacion.value) {
    emit('update:modelValue', false)
  }
})

// Computed para validación del formulario
const isFormValid = computed(() => {
  return formRef.value?.isFormValid ?? false
})

// Computed eliminados - no se usan

// Métodos
const onSubmit = async (salidaData: RegistroSalidaData) => {
  loading.value = true
  message.value = ''

  try {
    // Obtener ID del operador actual
    const operadorId = authStore.user?.id || 'unknown'

    // Buscar datos de la persona que sale
    const personaSeleccionada = registroStore.personasDentro.find(
      p => p.cedula === salidaData.cedulaBuscada
    )

    if (!personaSeleccionada) {
      throw new Error('No se encontró a la persona seleccionada en el predio')
    }

    // Registrar salida en el store
    await registroStore.registrarSalida({
      cedulaBuscada: salidaData.cedulaBuscada,
      tiempoEstadia: salidaData.tiempoEstadia,
      operadorId,
      observaciones: salidaData.observaciones,
      datosVehiculoSalida: salidaData.datosVehiculoSalida,
      acompanantesSalida: salidaData.acompanantesSalida
    })

    const successMessage = `Salida registrada exitosamente para ${personaSeleccionada.nombre} ${personaSeleccionada.apellido}.`
    emit('success', successMessage)
    message.value = successMessage

    // Cerrar modal después de un breve delay para mostrar el mensaje
    setTimeout(() => {
      closeDialog()
    }, 1500)

  } catch (error: unknown) {
    console.error('Error al registrar salida:', error)
    message.value = error instanceof Error ? error.message : 'Error al registrar la salida'
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  if (formRef.value) {
    formRef.value.submit()
  }
}

const clearMessage = () => {
  message.value = ''
}

// Handler cuando se selecciona una persona de la lista
const handlePersonaSeleccionada = (item: unknown) => {
  const persona = item as PersonaDentro
  personaSeleccionada.value = registroStore.personasDentro.find(
    p => p.cedula === persona.cedula
  ) || null
  
  if (personaSeleccionada.value) {
    showListaPersonas.value = false
    showConfirmacion.value = true
  }
}

// Volver a la lista de personas
const volverALista = () => {
  showConfirmacion.value = false
  showListaPersonas.value = true
  personaSeleccionada.value = null
  message.value = ''
}

const closeDialog = () => {
  // Limpiar estado al cerrar
  message.value = ''
  loading.value = false
  personaSeleccionada.value = null
  showListaPersonas.value = false
  showConfirmacion.value = false
  if (formRef.value) {
    formRef.value.resetForm()
  }
  emit('update:modelValue', false)
  emit('close')
}

const handleCloseConfirmacion = () => {
  if (!loading.value) {
    volverALista()
  }
}
</script>

<style scoped>
/* ========================================
   🎨 FOOTER ACTIONS
   ======================================== */

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* ========================================
   🎨 BOTONES
   ======================================== */

.btn-secondary,
.btn-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.btn-secondary {
  background: transparent;
  color: #424242;
  border: 1px solid #BDBDBD;
}

.btn-secondary:hover:not(:disabled) {
  background: #F5F5F5;
  border-color: #757575;
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary:active:not(:disabled) {
  transform: scale(0.98) translateZ(0);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-warning {
  background: #F57C00;
  color: white;
  border: 1px solid #F57C00;
}

.btn-warning:hover:not(:disabled) {
  background: #E65100;
  border-color: #E65100;
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-warning:active:not(:disabled) {
  transform: scale(0.98) translateZ(0);
}

.btn-warning:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary i,
.btn-warning i {
  font-size: 1.125rem;
}

/* ========================================
   📱 RESPONSIVE
   ======================================== */

@media (max-width: 600px) {
  .footer-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-secondary,
  .btn-warning {
    width: 100%;
    justify-content: center;
  }
}
</style>
