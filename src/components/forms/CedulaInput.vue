<template>
  <v-text-field
    :model-value="displayValue"
    @update:model-value="handleInput"
    @blur="handleBlur"
    label="Cédula de Identidad"
    placeholder="1.234.567-8"
    variant="outlined"
    density="comfortable"
    maxlength="10"
    :error="hasError"
    :error-messages="errorMessage"
    prepend-inner-icon="mdi-card-account-details"
    hint="Formato: X.XXX.XXX-X"
    persistent-hint
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCedulaFormat } from '@/composables/useCedulaFormat'

interface Props {
  modelValue: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { formatCedulaInput, cleanCedula, isValidCedula } = useCedulaFormat()

// Estado interno para mostrar el valor formateado
const displayValue = ref('')
const hasError = ref(false)
const errorMessage = ref('')

// Inicializar con el valor del prop
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    displayValue.value = formatCedulaInput(newValue)
  } else {
    displayValue.value = ''
  }
}, { immediate: true })

/**
 * Maneja la entrada del usuario con formateo en tiempo real
 */
function handleInput(value: string) {
  // Formatear el valor mientras escribe
  displayValue.value = formatCedulaInput(value)
  
  // Emitir solo los números limpios
  const cleanValue = cleanCedula(value)
  emit('update:modelValue', cleanValue)
  
  // Limpiar errores mientras escribe
  if (hasError.value) {
    hasError.value = false
    errorMessage.value = ''
  }
}

/**
 * Validar cuando pierde el foco
 */
function handleBlur() {
  const cleanValue = cleanCedula(displayValue.value)
  
  if (props.required && !cleanValue) {
    hasError.value = true
    errorMessage.value = 'La cédula es requerida'
    return
  }
  
  if (cleanValue && !isValidCedula(cleanValue)) {
    hasError.value = true
    errorMessage.value = 'La cédula debe tener 8 dígitos'
    return
  }
  
  hasError.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
/* Componente sin estilos específicos, usa clases de Vuetify */
</style>
