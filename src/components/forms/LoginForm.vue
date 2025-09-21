<template>
  <v-form 
    ref="loginForm" 
    v-model="formValid" 
    @submit.prevent="handleSubmit" 
    class="login-form"
    autocomplete="off"
    novalidate
  >
    <!-- Alert de Estado -->
    <v-alert
      v-if="message"
      :type="message.includes('exitosamente') ? 'success' : 'error'"
      density="compact"
      variant="tonal"
      class="mb-6"
      closable
      border="start"
      @click:close="$emit('clearMessage')"
    >
      {{ message }}
    </v-alert>

    <!-- Título del formulario -->
    <h3 class="text-subtitle-1 font-weight-medium text-grey-darken-3 mb-4">Acceso al sistema</h3>

    <!-- Campo Usuario -->
    <v-text-field
      v-model="credentials.username"
      label="Usuario"
      :prepend-inner-icon="ICONS.AUTH.USER"
      variant="outlined"
      class="mb-4"
      bg-color="grey-lighten-5"
      :rules="usernameRules"
      :disabled="loading"
      autocomplete="off"
      autofocus
      hide-details="auto"
      spellcheck="false"
      :readonly="false"
      @focus="clearFormOnFocus"
    />

    <!-- Campo Contraseña -->
    <v-text-field
      v-model="credentials.password"
      :type="showPassword ? 'text' : 'password'"
      label="Contraseña"
      :prepend-inner-icon="ICONS.AUTH.PASSWORD"
      :append-inner-icon="showPassword ? ICONS.AUTH.HIDE_PASSWORD : ICONS.AUTH.SHOW_PASSWORD"
      variant="outlined"
      bg-color="grey-lighten-5"
      class="mb-6"
      :rules="passwordRules"
      :disabled="loading"
      autocomplete="new-password"
      @click:append-inner="showPassword = !showPassword"
      hide-details="auto"
      spellcheck="false"
      :readonly="false"
      @focus="clearFormOnFocus"
    />

    <!-- Botón de Login -->
    <v-btn
      type="submit"
      color="primary"
      size="large"
      block
      :loading="loading"
      :disabled="!formValid"
      class="mt-4 mb-4 py-6"
      variant="flat"
      :prepend-icon="ICONS.AUTH.LOGIN"
      elevation="1"
    >
      INGRESAR
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MESSAGES, AUTH_CONFIG, ICONS, VALIDATION_PATTERNS } from '@/config/constants'
import { useKioskSecurity } from '@/composables/useKioskSecurity'

interface Props {
  loading?: boolean
  message?: string
}

interface Emits {
  submit: [credentials: { username: string; password: string }]
  clearMessage: []
}

withDefaults(defineProps<Props>(), {
  loading: false,
  message: '',
})

const emit = defineEmits<Emits>()

// Composable de seguridad para modo kiosko
const { isKioskMode, clearSensitiveData } = useKioskSecurity()

// Estado reactivo
const formValid = ref(false)
const showPassword = ref(false)

const credentials = ref({
  username: '',
  password: '',
})

// Reglas de validación usando constantes centralizadas
const usernameRules = [
  (v: string) => !!v || MESSAGES.VALIDATION.REQUIRED_FIELD,
  (v: string) => v.length >= AUTH_CONFIG.USERNAME_MIN_LENGTH || MESSAGES.VALIDATION.USERNAME_MIN,
  (v: string) => VALIDATION_PATTERNS.USERNAME.test(v) || MESSAGES.VALIDATION.USERNAME_FORMAT,
]

const passwordRules = [
  (v: string) => !!v || MESSAGES.VALIDATION.REQUIRED_FIELD,
  (v: string) => v.length >= AUTH_CONFIG.PASSWORD_MIN_LENGTH || MESSAGES.VALIDATION.PASSWORD_MIN,
]

// Función para limpiar formulario en focus (seguridad en modo kiosko)
const clearFormOnFocus = () => {
  if (isKioskMode) {
    // En modo kiosko, limpiar cualquier dato residual al hacer focus
    clearSensitiveData()
    console.log('Modo kiosko: datos sensibles limpiados en focus')
  }
}

// Función para limpiar completamente el formulario
const clearForm = () => {
  credentials.value.username = ''
  credentials.value.password = ''
  showPassword.value = false
}

// Métodos
const handleSubmit = () => {
  if (formValid.value) {
    emit('submit', { ...credentials.value })
    // Limpiar inmediatamente después del submit por seguridad
    setTimeout(clearForm, 1000)
  }
}

// Inicialización
onMounted(() => {
  if (isKioskMode) {
    console.log('🔒 Modo KIOSKO activado - Medidas de seguridad aplicadas:')
    console.log('  ✅ Autocompletado deshabilitado')
    console.log('  ✅ Guardado de contraseñas bloqueado')
    console.log('  ✅ Limpieza automática de datos sensibles')
    console.log('  ✅ Eventos de seguridad configurados')
  } else {
    console.log('🏠 Modo NORMAL - Seguridad estándar aplicada')
  }
})
</script>

<!-- Sin estilos custom, usando estilos nativos de Vuetify -->
