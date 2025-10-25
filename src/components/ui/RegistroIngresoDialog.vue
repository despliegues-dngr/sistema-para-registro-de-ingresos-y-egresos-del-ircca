<template>
  <FullScreenModal
    v-model="modelValue"
    title="Registrar Ingreso"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-account-plus"
    header-color="primary"
    :persistent="loading"
    @close="handleClose"
  >
    <!-- ⚡ LAZY LOADING: Solo renderizar formulario cuando modal está abierto -->
    <RegistroIngresoForm
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
          class="btn-primary" 
          @click="handleSubmit"
          :disabled="!isFormValid || loading"
        >
          <i class="mdi mdi-content-save"></i>
          Registrar Ingreso
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRegistroStore, type RegistroIngresoData } from '@/stores/registro'
import FullScreenModal from './FullScreenModal.vue'
import RegistroIngresoForm from '@/components/forms/RegistroIngresoForm.vue'

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

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Métodos
const onSubmit = async (registroData: RegistroIngresoData) => {
  loading.value = true
  message.value = ''

  try {
    // Obtener ID del operador actual
    const operadorId = authStore.user?.id || 'unknown'

    // Registrar ingreso en el store
    registroStore.registrarIngreso({
      datosPersonales: registroData.datosPersonales,
      datosVisita: registroData.datosVisita,
      datosVehiculo: registroData.datosVehiculo,
      acompanantes: registroData.acompanantes, // ✅ INCLUIR ACOMPAÑANTES
      observaciones: registroData.observaciones,
    }, operadorId)

    const successMessage = `Ingreso registrado exitosamente para ${registroData.datosPersonales.nombre} ${registroData.datosPersonales.apellido}.`
    emit('success', successMessage)
    message.value = successMessage

    // Cerrar modal después de un breve delay para mostrar el mensaje
    setTimeout(() => {
      closeDialog()
    }, 1500)

  } catch (error: unknown) {
    message.value = error instanceof Error ? error.message : 'Error al registrar el ingreso'
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
.btn-primary {
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

.btn-primary {
  background: #1565C0;
  color: white;
  border: 1px solid #1565C0;
}

.btn-primary:hover:not(:disabled) {
  background: #0D47A1;
  border-color: #0D47A1;
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98) translateZ(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary i,
.btn-primary i {
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
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
