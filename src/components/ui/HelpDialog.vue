<template>
  <v-dialog v-model="modelValue" max-width="480" persistent transition="dialog-bottom-transition">
    <template #activator="{ props }">
      <slot name="activator" v-bind="props" />
    </template>

    <v-card class="help-dialog-card">
      <!-- Header minimalista -->
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">{{ ICONS.NAVIGATION.HELP }}</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Centro de Ayuda</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">
              Sistema de Control de Accesos del IRCCA
            </p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Información de soporte técnico -->
        <div class="text-center mb-4">
          <v-icon size="48" color="primary" class="mb-2">mdi-headset</v-icon>
          <h4 class="text-h6 mb-2">Soporte Técnico</h4>
        </div>

        <!-- Contactos de soporte -->
        <div class="d-flex flex-column gap-2 mb-4">
          <v-btn
            variant="outlined"
            color="primary"
            prepend-icon="mdi-email"
            size="small"
            @click="copyToClipboard(supportEmail)"
          >
            {{ supportEmail }}
          </v-btn>

          <v-btn
            variant="outlined"
            color="green"
            prepend-icon="mdi-whatsapp"
            size="small"
            @click="openWhatsApp"
          >
            WhatsApp: {{ whatsappNumber }}
          </v-btn>
        </div>

        <!-- Card: Credenciales -->
        <v-card variant="tonal" color="info" class="mb-3" density="compact">
          <v-card-text class="pa-3">
            <div class="d-flex align-center mb-2">
              <v-icon size="20" color="info" class="mr-2">mdi-account-question</v-icon>
              <strong class="text-body-2">¿No tiene credenciales?</strong>
            </div>
            <p class="text-body-2 mb-2">
              Si es la primera vez que ingresa y aún no tiene usuario, seleccione
              <strong>"REGISTRARSE COMO NUEVO USUARIO"</strong>.
            </p>
            <p class="text-body-2 mb-0">Para otros casos, contacte al soporte técnico.</p>
          </v-card-text>
        </v-card>

        <!-- Card: Responsabilidad -->
        <v-card variant="tonal" color="warning" density="compact">
          <v-card-text class="pa-3">
            <div class="d-flex align-center mb-2">
              <v-icon size="20" color="warning" class="mr-2">mdi-shield-account</v-icon>
              <strong class="text-body-2">Responsabilidad</strong>
            </div>
            <p class="text-body-2 mb-0">Mantenga sus credenciales seguras y personales.</p>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn color="primary" variant="flat" prepend-icon="mdi-check" @click="closeDialog">
          Entendido
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ICONS } from '@/config/constants'

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
  whatsappNumber: '099 505 227',
})

const emit = defineEmits<Emits>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const closeDialog = () => {
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
  const message = encodeURIComponent(
    'Hola, necesito ayuda con el Sistema de Control de Accesos del IRCCAAccesos del IRCCA del IRCCA.',
  )
  window.open(`https://wa.me/598${cleanNumber}?text=${message}`, '_blank')
}
</script>

<style scoped>
.help-dialog-card {
  border-top: 3px solid rgb(var(--v-theme-primary));
}

.gap-2 {
  gap: 8px;
}
</style>
