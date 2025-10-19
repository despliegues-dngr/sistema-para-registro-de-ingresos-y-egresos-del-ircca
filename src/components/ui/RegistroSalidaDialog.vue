<template>
  <v-dialog
    v-model="modelValue"
    max-width="700"
    transition="dialog-bottom-transition"
    scrollable
  >
    <template #activator="{ props }">
      <slot name="activator" v-bind="props" />
    </template>

    <v-card class="registro-salida-dialog-card">
      <!-- Header institucional -->
      <v-card-title class="bg-warning pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">mdi-account-minus</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Registrar Salida</h3>
            <p class="text-caption text-orange-lighten-4 mb-0">Sistema de Control de Accesos del IRCCA</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <RegistroSalidaForm
          ref="formRef"
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
          @click="closeDialog()"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          v-if="!isEditingMode"
          color="warning"
          variant="flat"
          prepend-icon="mdi-logout"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Registrar Salida
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRegistroStore } from '@/stores/registro'
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
.registro-salida-dialog-card {
  border-top: 3px solid rgb(var(--v-theme-warning));
}
</style>
