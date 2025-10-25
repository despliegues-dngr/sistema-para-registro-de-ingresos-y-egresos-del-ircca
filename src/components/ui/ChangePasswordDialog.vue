<template>
  <FullScreenModal
    v-model="modelValue"
    title="Cambiar Contraseña"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-lock-reset"
    header-color="primary"
    :persistent="loading"
    @close="handleClose"
  >
    <ChangePasswordForm
      :loading="loading"
      :message="message"
      @submit="onSubmit"
      @clear-message="clearMessage"
    />

    <!-- Footer con botón de acción -->
    <template #footer>
      <div class="footer-actions">
        <button 
          class="btn-secondary" 
          @click="closeDialog"
          :disabled="loading"
        >
          <i class="mdi mdi-close"></i>
          {{ isSuccess ? 'Cerrar' : 'Cancelar' }}
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
import ChangePasswordForm from '@/components/forms/ChangePasswordForm.vue'

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
const isSuccess = ref(false)

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Métodos
const onSubmit = async (passwordData: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) => {
  loading.value = true
  message.value = ''

  try {
    // Validar que las contraseñas nuevas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      message.value = 'Las contraseñas nuevas no coinciden'
      return
    }

    // Validar contraseña actual y cambiar
    await authStore.changePassword(passwordData.currentPassword, passwordData.newPassword)

    const successMessage = 'Contraseña cambiada exitosamente.'
    emit('success', successMessage)
    message.value = successMessage // ✅ MOSTRAR mensaje igual que perfil
    isSuccess.value = true // ✅ Marcar como exitoso para cambiar botones
    // ✅ NO cerrar modal para que usuario vea el mensaje

  } catch (error: unknown) {
    console.error('Error al cambiar contraseña:', error)
    message.value = error instanceof Error ? error.message : MESSAGES.AUTH.CONNECTION_ERROR
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
  isSuccess.value = false // ✅ Resetear estado de éxito
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
}

/* ========================================
   🎨 BOTONES
   ======================================== */

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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

/* ========================================
   📱 RESPONSIVE
   ======================================== */

@media (max-width: 600px) {
  .footer-actions {
    justify-content: stretch;
  }
  
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
