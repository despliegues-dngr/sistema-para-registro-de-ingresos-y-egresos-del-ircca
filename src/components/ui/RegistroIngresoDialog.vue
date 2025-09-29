<template>
  <v-dialog
    v-model="modelValue"
    max-width="800"
    persistent
    transition="dialog-bottom-transition"
    scrollable
  >
    <template #activator="{ props }">
      <slot name="activator" v-bind="props" />
    </template>

    <v-card class="registro-ingreso-dialog-card">
      <!-- Header institucional -->
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">mdi-account-plus</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Registrar Ingreso</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">Sistema de Control de Accesos del IRCCA</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <RegistroIngresoForm
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
          color="primary"
          variant="flat"
          prepend-icon="mdi-content-save"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Registrar Ingreso
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRegistroStore, type RegistroIngresoData } from '@/stores/registro'
import RegistroIngresoForm from '@/components/forms/RegistroIngresoForm.vue'

// ✅ Usar el tipo correcto del store que incluye acompanantes

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
    console.log('🔍 DEBUG RegistroIngresoDialog - Datos antes de enviar al store:', registroData)
    console.log('🔍 DEBUG RegistroIngresoDialog - ¿Tiene acompañantes?', !!registroData.acompanantes)
    console.log('🔍 DEBUG RegistroIngresoDialog - Cantidad acompañantes:', registroData.acompanantes?.length || 0)

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
    console.error('Error al registrar ingreso:', error)
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
.registro-ingreso-dialog-card {
  border-top: 3px solid rgb(var(--v-theme-primary));
}
</style>
