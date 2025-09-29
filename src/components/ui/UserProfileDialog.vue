<template>
  <v-dialog v-model="modelValue" max-width="600" persistent transition="dialog-bottom-transition">
    <template #activator="{ props }">
      <slot name="activator" v-bind="props" />
    </template>

    <v-card class="user-profile-dialog-card">
      <!-- Header institucional -->
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">{{ headerIcon }}</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">{{ headerTitle }}</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">Sistema de Control de Accesos del IRCCA</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <UserProfileForm
          ref="formRef"
          :mode="currentMode"
          :user-data="userData"
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
          @click="currentMode === 'edit' ? cancelEdit() : closeDialog()"
          :disabled="loading"
        >
          {{ currentMode === 'view' ? 'Cerrar' : 'Cancelar' }}
        </v-btn>
        <v-btn
          v-if="currentMode === 'view'"
          color="primary"
          variant="flat"
          prepend-icon="mdi-pencil"
          @click="currentMode = 'edit'"
        >
          Editar
        </v-btn>
        <v-btn
          v-if="currentMode === 'edit'"
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ICONS, MESSAGES } from '@/config/constants'
import { useAuthStore } from '@/stores/auth'
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
.user-profile-dialog-card {
  border-top: 3px solid rgb(var(--v-theme-primary));
}
</style>
