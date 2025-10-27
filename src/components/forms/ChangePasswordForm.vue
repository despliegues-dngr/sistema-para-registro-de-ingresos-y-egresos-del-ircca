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

    <!-- Información de seguridad -->
    <v-card variant="tonal" color="warning" class="mb-4" density="compact">
      <v-card-text class="pa-4">
        <div class="d-flex align-center mb-2">
          <v-icon size="20" color="warning" class="mr-2">mdi-shield-check</v-icon>
          <strong class="text-body-2">Seguridad</strong>
        </div>
        <ul class="text-body-2 mb-0 pl-4">
          <li>Use una contraseña segura y única</li>
          <li>No comparta sus credenciales con otros</li>
          <li>Mínimo {{ PASSWORD_MIN_LENGTH }} caracteres</li>
        </ul>
      </v-card-text>
    </v-card>

    <!-- Campos del formulario -->
    <v-row>
      <!-- Contraseña actual -->
      <v-col cols="12">
        <v-text-field
          v-model="formData.currentPassword"
          label="Contraseña Actual"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showCurrentPassword ? 'text' : 'password'"
          :rules="currentPasswordRules"
          variant="outlined"
          density="comfortable"
          autocomplete="current-password"
          @click:append-inner="showCurrentPassword = !showCurrentPassword"
          :disabled="loading"
          validate-on="blur"
        />
      </v-col>

      <!-- Nueva contraseña -->
      <v-col cols="12">
        <v-text-field
          v-model="formData.newPassword"
          label="Nueva Contraseña"
          prepend-inner-icon="mdi-lock-plus"
          :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showNewPassword ? 'text' : 'password'"
          :rules="newPasswordRules"
          variant="outlined"
          density="comfortable"
          autocomplete="new-password"
          @click:append-inner="showNewPassword = !showNewPassword"
          :disabled="loading"
          validate-on="blur"
        />
      </v-col>

      <!-- Confirmar nueva contraseña -->
      <v-col cols="12">
        <v-text-field
          v-model="formData.confirmPassword"
          label="Confirmar Nueva Contraseña"
          prepend-inner-icon="mdi-lock-check"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showConfirmPassword ? 'text' : 'password'"
          :rules="confirmPasswordRules"
          variant="outlined"
          density="comfortable"
          autocomplete="new-password"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
          :disabled="loading"
          :color="passwordMatchColor"
          :hint="passwordMatchHint"
          :persistent-hint="formData.confirmPassword.length > 0"
          validate-on="blur"
        >
          <template #append v-if="passwordMatchIcon">
            <v-icon :color="passwordMatchColor" size="small" class="mr-2">
              {{ passwordMatchIcon }}
            </v-icon>
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <!-- Botón de envío -->
    <div class="d-flex justify-end mt-4">
      <v-btn
        type="submit"
        color="primary"
        variant="flat"
        prepend-icon="mdi-check"
        :loading="loading"
        :disabled="!isFormValid"
        size="large"
      >
        Cambiar Contraseña
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AUTH_CONFIG } from '@/config/constants'

interface Props {
  loading?: boolean
  message?: string
}

interface Emits {
  submit: [data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }]
  'clear-message': []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  message: '',
})

const emit = defineEmits<Emits>()

// Referencias
const formRef = ref()

// Estado del formulario
const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Estado de visibilidad de contraseñas
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Computed para validación visual en tiempo real de contraseñas
const passwordsMatch = computed(() => {
  if (!formData.value.confirmPassword) return null
  return formData.value.newPassword === formData.value.confirmPassword
})

const passwordMatchColor = computed(() => {
  if (passwordsMatch.value === null) return 'primary'
  return passwordsMatch.value ? 'success' : 'error'
})

const passwordMatchIcon = computed(() => {
  if (passwordsMatch.value === null) return ''
  return passwordsMatch.value ? 'mdi-check-circle' : 'mdi-alert-circle'
})

const passwordMatchHint = computed(() => {
  if (passwordsMatch.value === null) return ''
  return passwordsMatch.value ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'
})

// Constantes
const PASSWORD_MIN_LENGTH = AUTH_CONFIG.PASSWORD_MIN_LENGTH

// Computed properties
const messageType = computed(() => {
  if (!props.message) return 'info'
  if (props.message.includes('Error') || props.message.includes('error') || props.message.includes('incorrecta')) return 'error'
  if (props.message.includes('exitosamente') || props.message.includes('éxito')) return 'success'
  return 'info'
})

const isFormValid = computed(() => {
  return formData.value.currentPassword.length >= PASSWORD_MIN_LENGTH &&
         formData.value.newPassword.length >= PASSWORD_MIN_LENGTH &&
         formData.value.confirmPassword.length >= PASSWORD_MIN_LENGTH &&
         formData.value.newPassword === formData.value.confirmPassword &&
         formData.value.currentPassword !== formData.value.newPassword
})

// Reglas de validación
const currentPasswordRules = [
  (v: string) => !!v || 'La contraseña actual es requerida',
  (v: string) => v.length >= PASSWORD_MIN_LENGTH || `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
]

const newPasswordRules = [
  (v: string) => !!v || 'La nueva contraseña es requerida',
  (v: string) => v.length >= PASSWORD_MIN_LENGTH || `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
  (v: string) => v !== formData.value.currentPassword || 'La nueva contraseña debe ser diferente a la actual',
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Debe confirmar la nueva contraseña',
  (v: string) => v === formData.value.newPassword || 'Las contraseñas no coinciden',
]

// Métodos
const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) {
    emit('submit', {
      currentPassword: formData.value.currentPassword,
      newPassword: formData.value.newPassword,
      confirmPassword: formData.value.confirmPassword,
    })
  }
}

// Limpiar formulario
const resetForm = () => {
  formData.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// Exponer métodos para el componente padre
defineExpose({
  resetForm
})
</script>

<style scoped>
/* Estilos específicos para el formulario de cambio de contraseña */
.v-text-field :deep(.v-field__input) {
  font-family: monospace;
}
</style>
