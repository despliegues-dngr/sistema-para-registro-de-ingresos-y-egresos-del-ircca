<template>
  <v-dialog v-model="modelValue" max-width="500" transition="dialog-bottom-transition">
    <template #activator="{ props }">
      <slot name="activator" v-bind="props" />
    </template>

    <v-card class="change-password-dialog-card">
      <!-- Header institucional -->
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">mdi-lock-reset</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Cambiar Contraseña</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">Sistema de Control de Accesos del IRCCA</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <ChangePasswordForm
          :loading="loading"
          :message="message"
          @submit="onSubmit"
          @clear-message="clearMessage"
        />
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn
          color="secondary"
          variant="text"
          @click="closeDialog"
          :disabled="loading"
        >
          {{ isSuccess ? 'Cerrar' : 'Cancelar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MESSAGES } from '@/config/constants'
import { useAuthStore } from '@/stores/auth'
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
.change-password-dialog-card {
  border-top: 3px solid rgb(var(--v-theme-primary));
}
</style>
