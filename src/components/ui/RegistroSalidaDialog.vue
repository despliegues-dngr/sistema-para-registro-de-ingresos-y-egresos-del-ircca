<template>
  <FullScreenModal
    v-model="modelValue"
    title="Registrar Salida"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-account-minus"
    header-color="warning"
    :persistent="loading"
    @close="handleClose"
  >
    <!-- ⚡ LAZY LOADING: Solo renderizar formulario cuando modal está abierto -->
    <RegistroSalidaForm
      v-if="modelValue"
      ref="formRef"
      :loading="loading"
      :message="message"
      @submit="onSubmit"
      @clear-message="clearMessage"
    />

    <!-- Footer con botones de acción -->
    <template #footer>
      <div class="footer-actions">
        <button 
          class="btn-secondary" 
          @click="closeDialog"
          :disabled="loading"
        >
          <i class="mdi mdi-close"></i>
          Cancelar
        </button>
        <button 
          v-if="!isEditingMode"
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
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRegistroStore } from '@/stores/registro'
import FullScreenModal from './FullScreenModal.vue'
import RegistroSalidaForm from '@/components/forms/RegistroSalidaForm.vue'

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

// Computed para validación del formulario
const isFormValid = computed(() => {
  return formRef.value?.isFormValid ?? false
})

// Computed para verificar si está en modo edición
const isEditingMode = computed(() => {
  return formRef.value?.isEditingMode ?? false
})

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

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

const closeDialog = () => {
  // Limpiar estado al cerrar
  message.value = ''
  loading.value = false
  if (formRef.value) {
    formRef.value.resetForm()
  }
  emit('update:modelValue', false)
  emit('close')
}

const handleClose = () => {
  if (!loading.value) {
    closeDialog()
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
