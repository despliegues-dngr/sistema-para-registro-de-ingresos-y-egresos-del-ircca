<template>
  <FullScreenModal
    v-model="modelValue"
    :title="headerTitle"
    subtitle="Sistema de Control de Accesos del IRCCA"
    :icon="headerIcon"
    header-color="primary"
    :persistent="loading"
    @close="handleClose"
  >
    <UserProfileForm
      ref="formRef"
      :mode="currentMode"
      :user-data="userData"
      :loading="loading"
      :message="message"
      @submit="onSubmit"
      @clear-message="clearMessage"
    />

    <!-- Footer con botones de acción dinámicos -->
    <template #footer>
      <div class="footer-actions">
        <button 
          class="btn-secondary" 
          @click="currentMode === 'edit' ? cancelEdit() : closeDialog()"
          :disabled="loading"
        >
          <i class="mdi mdi-close"></i>
          {{ currentMode === 'view' ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button 
          v-if="currentMode === 'view'"
          class="btn-primary" 
          @click="currentMode = 'edit'"
        >
          <i class="mdi mdi-pencil"></i>
          Editar
        </button>
        <button 
          v-if="currentMode === 'edit'"
          class="btn-primary" 
          @click="handleSubmit"
          :disabled="!isFormValid || loading"
        >
          <i class="mdi mdi-content-save"></i>
          Guardar Cambios
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ICONS, MESSAGES } from '@/config/constants'
import { useAuthStore } from '@/stores/auth'
import FullScreenModal from './FullScreenModal.vue'
import UserProfileForm from '@/components/forms/UserProfileForm.vue'

type ProfileMode = 'view' | 'edit'

interface UserData {
  cedula: string
  grado: string
  nombre: string
  apellido: string
  fechaRegistro?: string
}

interface Props {
  modelValue: boolean
  userData: UserData
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
const formRef = ref()
const currentMode = ref<ProfileMode>('view')

// Computed para validación del formulario
const isFormValid = computed(() => {
  return formRef.value?.isFormValid ?? false
})

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Computed properties para header dinámico
const headerIcon = computed(() => {
  switch (currentMode.value) {
    case 'view':
      return ICONS.NAVIGATION.PROFILE || 'mdi-account'
    case 'edit':
      return ICONS.NAVIGATION.EDIT || 'mdi-account-edit'
    default:
      return 'mdi-account'
  }
})

const headerTitle = computed(() => {
  switch (currentMode.value) {
    case 'view':
      return 'Perfil de Usuario'
    case 'edit':
      return 'Editar Perfil'
    default:
      return 'Perfil de Usuario'
  }
})

// Métodos
const onSubmit = async (updatedData: UserData) => {
  if (currentMode.value !== 'edit') return

  loading.value = true
  message.value = ''

  try {
    // Actualizar datos del usuario en el store
    await authStore.updateUserProfile(updatedData)

    const successMessage = `Perfil actualizado exitosamente.`
    emit('success', successMessage)
    currentMode.value = 'view' // Volver a modo vista
    message.value = successMessage

  } catch (error: unknown) {
    console.error('Error al actualizar perfil:', error)
    message.value = error instanceof Error ? error.message : MESSAGES.AUTH.CONNECTION_ERROR
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  if (formRef.value) {
    formRef.value.submit()
  }
}

const cancelEdit = () => {
  currentMode.value = 'view'
  message.value = ''
}

const clearMessage = () => {
  message.value = ''
}

const closeDialog = () => {
  // Limpiar estado al cerrar
  message.value = ''
  loading.value = false
  currentMode.value = 'view' // Resetear al modo vista
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
