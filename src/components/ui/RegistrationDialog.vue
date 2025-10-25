<template>
  <FullScreenModal
    v-model="modelValue"
    title="Registro de Nuevo Operador"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-account-plus"
    header-color="primary"
    :persistent="loading"
    @close="handleClose"
  >
    <!-- ⚡ LAZY LOADING: Solo renderizar formulario cuando modal está abierto -->
    <RegistrationForm
      v-if="modelValue"
      :loading="loading"
      :message="message"
      @submit="onSubmit"
      @clear-message="clearMessage"
    />

    <!-- Footer con botón cancelar -->
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
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MESSAGES } from '@/config/constants'
import { useAuthStore } from '@/stores/auth'
import FullScreenModal from './FullScreenModal.vue'
import RegistrationForm from '@/components/forms/RegistrationForm.vue'

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

// Estado reactivo
const loading = ref(false)
const message = ref('')

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Métodos
const onSubmit = async (userData: {
  cedula: string
  grado: string
  nombre: string
  apellido: string
  password: string
  confirmPassword: string
  terminosCondiciones: boolean
}) => {
  loading.value = true
  message.value = ''

  try {
    // Validar que las contraseñas coincidan
    if (userData.password !== userData.confirmPassword) {
      message.value = 'Las contraseñas no coinciden'
      return
    }

    // Intentar registrar el usuario
    await authStore.registerUser({
      cedula: userData.cedula,
      grado: userData.grado,
      nombre: userData.nombre,
      apellido: userData.apellido,
      password: userData.password,
      terminosCondiciones: userData.terminosCondiciones,
    })

    // Si llegamos aquí, el registro fue exitoso
    const successMessage = `Usuario ${userData.nombre} ${userData.apellido} registrado exitosamente.`
    emit('success', successMessage)
    closeDialog()

  } catch (error: unknown) {
    console.error('Error durante el registro:', error)
    message.value = (error instanceof Error ? error.message : MESSAGES.AUTH.CONNECTION_ERROR)
  } finally {
    loading.value = false
  }
}

const clearMessage = () => {
  message.value = ''
}

const closeDialog = () => {
  // Limpiar estado al cerrar
  message.value = ''
  loading.value = false
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

.btn-secondary:hover:not(:disabled) {
  background: #F5F5F5;
  border-color: #757575;
  transform: translateY(-2px) translateZ(0);
}

.btn-secondary:active:not(:disabled) {
  transform: scale(0.98) translateZ(0);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary i {
  font-size: 1.125rem;
}
</style>
