<template>
  <v-dialog 
    v-model="modelValue" 
    max-width="500" 
    persistent
    transition="dialog-bottom-transition"
    :scrim="true"
    :overlay-class="'help-dialog-overlay'"
  >
    <!-- Overlay personalizado con efecto telón -->
    <template #activator="{ props }">
      <slot name="activator" v-bind="props" />
    </template>

    <v-card elevation="8" class="help-dialog-card">
      <!-- Header institucional -->
      <v-card-title class="help-header pa-4">
        <div class="d-flex align-center">
          <v-avatar size="40" class="help-icon mr-3">
            <v-icon size="24" color="white">{{ ICONS.NAVIGATION.HELP }}</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h6 text-white mb-0">Centro de Ayuda</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">{{ SYSTEM_INFO.NAME }}</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Información para operadores -->
        <div class="mb-4">
          <h4 class="text-subtitle-2 font-weight-medium mb-2">{{ SYSTEM_INFO.NAME }} - Control de Acceso</h4>
          <p class="text-body-2 mb-3">
            Si es la primera vez que ingresa y aún no tiene usuario, por favor ingrese a 
            <strong>"REGISTRARSE COMO NUEVO USUARIO"</strong> para hacer su registro.
          </p>
          <p class="text-body-2 text-warning">
            <strong>Importante:</strong> Recuerde que su usuario es único y es su responsabilidad.
          </p>
        </div>

        <!-- Contacto de soporte -->
        <div class="mb-4">
          <h4 class="text-subtitle-2 font-weight-medium mb-2">Contacto de soporte técnico:</h4>
          
          <!-- Email -->
          <v-chip
            variant="outlined"
            color="primary"
            size="small"
            class="mb-2 mr-2"
            prepend-icon="mdi-email"
            @click="copyToClipboard(supportEmail)"
          >
            {{ supportEmail }}
          </v-chip>

          <!-- WhatsApp -->
          <v-chip
            variant="outlined"
            color="green"
            size="small"
            class="mb-2"
            prepend-icon="mdi-whatsapp"
            @click="openWhatsApp"
          >
            WhatsApp: {{ whatsappNumber }}
          </v-chip>
        </div>

        <!-- Responsabilidad institucional -->
        <v-alert
          type="info"
          density="compact"
          variant="tonal"
          class="mb-0"
          border="start"
        >
          <template #prepend>
            <v-icon size="20">{{ ICONS.STATUS.INFO }}</v-icon>
          </template>
          <div class="text-caption">
            <strong>Responsabilidad:</strong> Ante cualquier inconveniente es responsabilidad 
            del efectivo y oficial de control informar a través de los medios de contacto mencionados.
          </div>
        </v-alert>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn 
          color="primary" 
          variant="flat"
          :prepend-icon="ICONS.STATUS.SUCCESS"
          @click="closeDialog"
        >
          Entendido
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SYSTEM_INFO, ICONS } from '@/config/constants'

interface Props {
  modelValue: boolean
  supportEmail?: string
  whatsappNumber?: string
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  supportEmail: 'gr-depto.infoygc@minterior.gub.uy',
  whatsappNumber: '099 505 227'
})

const emit = defineEmits<Emits>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('close')
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // TODO: Mostrar toast de confirmación
  } catch (error) {
    console.error('Error al copiar:', error)
  }
}

const openWhatsApp = () => {
  const cleanNumber = props.whatsappNumber.replace(/\s/g, '')
  const message = encodeURIComponent(`Hola, necesito ayuda con el ${SYSTEM_INFO.NAME}.`)
  window.open(`https://wa.me/598${cleanNumber}?text=${message}`, '_blank')
}
</script>

<style>
/* Estilos para el efecto telón - Mejorado para contraste */
.help-dialog-overlay .v-overlay__scrim {
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

<style scoped>
.help-dialog-card {
  border-top: 4px solid #1565C0;
}

.help-header {
  background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
}

.help-icon {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.v-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
