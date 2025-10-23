<template>
  <v-form ref="registrationForm" v-model="formValid" @submit.prevent="handleSubmit" class="registration-form">
    <!-- Alert de Estado -->
    <v-alert
      v-if="message"
      :type="message.includes('exitoso') ? 'success' : 'error'"
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
    <h2 class="text-subtitle-1 font-weight-medium text-grey-darken-4 mb-4">Datos del nuevo operador</h2>

    <!-- Campo Cédula -->
    <v-text-field
      v-model="userData.cedula"
      label="Cédula de Identidad"
      :prepend-inner-icon="ICONS.USER.PROFILE"
      variant="outlined"
      class="mb-4"
      bg-color="grey-lighten-5"
      :rules="cedulaRules"
      :disabled="loading"
      placeholder="12345678"
      hint="8 dígitos sin puntos ni guiones"
      persistent-hint
      hide-details="auto"
      validate-on="blur"
    />

    <!-- Campo Grado -->
    <v-select
      v-model="userData.grado"
      label="Grado"
      :prepend-inner-icon="'mdi-police-badge'"
      variant="outlined"
      class="mb-4"
      bg-color="grey-lighten-5"
      :items="gradoOptions"
      :rules="gradoRules"
      :disabled="loading"
      hide-details="auto"
      validate-on="blur"
      :menu-props="{ maxHeight: 300 }"
    />

    <!-- Campo Nombre -->
    <v-text-field
      v-model="userData.nombre"
      label="Nombre"
      :prepend-inner-icon="ICONS.USER.PERSON"
      variant="outlined"
      class="mb-4"
      bg-color="grey-lighten-5"
      :rules="nombreRules"
      :disabled="loading"
      hide-details="auto"
      validate-on="blur"
    />

    <!-- Campo Apellido -->
    <v-text-field
      v-model="userData.apellido"
      label="Apellido"
      :prepend-inner-icon="ICONS.USER.PERSON"
      variant="outlined"
      class="mb-4"
      bg-color="grey-lighten-5"
      :rules="apellidoRules"
      :disabled="loading"
      hide-details="auto"
      validate-on="blur"
    />

    <!-- Campo Contraseña -->
    <v-text-field
      v-model="userData.password"
      :type="showPassword ? 'text' : 'password'"
      label="Contraseña"
      :prepend-inner-icon="ICONS.AUTH.PASSWORD"
      :append-inner-icon="showPassword ? ICONS.AUTH.HIDE_PASSWORD : ICONS.AUTH.SHOW_PASSWORD"
      variant="outlined"
      bg-color="grey-lighten-5"
      class="mb-4"
      :rules="passwordRules"
      :disabled="loading"
      hint="Mínimo 6 caracteres"
      persistent-hint
      @click:append-inner="showPassword = !showPassword"
      hide-details="auto"
      validate-on="blur"
    />

    <!-- Campo Confirmar Contraseña -->
    <v-text-field
      v-model="userData.confirmPassword"
      :type="showConfirmPassword ? 'text' : 'password'"
      label="Confirmar Contraseña"
      :prepend-inner-icon="ICONS.AUTH.PASSWORD"
      :append-inner-icon="showConfirmPassword ? ICONS.AUTH.HIDE_PASSWORD : ICONS.AUTH.SHOW_PASSWORD"
      variant="outlined"
      bg-color="grey-lighten-5"
      class="mb-4"
      :rules="confirmPasswordRules"
      :disabled="loading"
      @click:append-inner="showConfirmPassword = !showConfirmPassword"
      hide-details="auto"
      validate-on="blur"
    />

    <!-- Términos y Condiciones -->
    <div class="terms-section mb-6">
      <v-checkbox
        v-model="userData.terminosCondiciones"
        :rules="terminosRules"
        :disabled="loading"
        color="primary"
        hide-details="auto"
        class="mb-2"
      >
        <template #label>
          <span class="text-body-2">
            He leído y acepto los 
            <v-btn
              variant="text"
              color="primary"
              size="small"
              class="pa-0"
              style="text-decoration: underline; vertical-align: baseline; min-width: auto; height: auto;"
              @click.stop="showTermsDialog = true"
            >
              Términos y Condiciones
            </v-btn>
            del sistema
          </span>
        </template>
      </v-checkbox>
      
      <p class="text-caption text-grey-darken-1 ml-8 mt-2">
        <v-icon size="14" class="mr-1">mdi-shield-check</v-icon>
        Al aceptar, confirma el cumplimiento de la Ley N° 18.331 de Protección de Datos Personales
      </p>
    </div>

    <!-- Botón de Registro -->
    <v-btn
      type="submit"
      color="primary"
      size="large"
      block
      :loading="loading"
      :disabled="!formValid"
      class="mt-4 mb-4 py-6"
      variant="flat"
      :prepend-icon="ICONS.USER.ADD"
      elevation="1"
    >
      {{ loading ? 'Registrando...' : 'REGISTRAR OPERADOR' }}
    </v-btn>

    <!-- Modal de Términos y Condiciones -->
    <TermsAndConditionsDialog
      v-model="showTermsDialog"
      @close="showTermsDialog = false"
    />
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ICONS, MESSAGES, VALIDATION_PATTERNS } from '@/config/constants'
import TermsAndConditionsDialog from '@/components/ui/TermsAndConditionsDialog.vue'

interface Props {
  loading?: boolean
  message?: string
}

interface Emits {
  submit: [userData: {
    cedula: string
    grado: string
    nombre: string
    apellido: string
    password: string
    confirmPassword: string
    terminosCondiciones: boolean
  }]
  clearMessage: []
}

withDefaults(defineProps<Props>(), {
  loading: false,
  message: '',
})

const emit = defineEmits<Emits>()

// Estado reactivo
const formValid = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showTermsDialog = ref(false)

const userData = ref({
  cedula: '',
  grado: '',
  nombre: '',
  apellido: '',
  password: '',
  confirmPassword: '',
  terminosCondiciones: false,
})

// Opciones de grado para el select (orden jerárquico ascendente)
const gradoOptions = [
  { title: 'Guardia Republicano', value: 'guardia_republicano' },
  { title: 'Cabo', value: 'cabo' },
  { title: 'Sargento', value: 'sargento' },
  { title: 'Sub Oficial', value: 'sub_oficial' },
  { title: 'Alférez', value: 'alferez' },
  { title: 'Teniente', value: 'teniente' },
  { title: 'Tte. 1°', value: 'tte_primero' },
  { title: 'Capitán', value: 'capitan' },
  { title: 'Cte. Mayor', value: 'cte_mayor' },
  { title: 'Cte. General', value: 'cte_general' },
]

// Reglas de validación
const cedulaRules = [
  (v: string) => !!v || MESSAGES.VALIDATION.REQUIRED_FIELD,
  (v: string) => /^\d{8}$/.test(v) || 'La cédula debe tener exactamente 8 dígitos',
  (v: string) => VALIDATION_PATTERNS.CEDULA.test(v) || 'Formato de cédula inválido',
]

const gradoRules = [
  (v: string) => !!v || MESSAGES.VALIDATION.REQUIRED_FIELD,
]

const nombreRules = [
  (v: string) => !!v || MESSAGES.VALIDATION.REQUIRED_FIELD,
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
  (v: string) => v.length <= 50 || 'El nombre no puede exceder 50 caracteres',
  (v: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'Solo se permiten letras y espacios',
]

const apellidoRules = [
  (v: string) => !!v || MESSAGES.VALIDATION.REQUIRED_FIELD,
  (v: string) => v.length >= 2 || 'El apellido debe tener al menos 2 caracteres',
  (v: string) => v.length <= 50 || 'El apellido no puede exceder 50 caracteres',
  (v: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'Solo se permiten letras y espacios',
]

const passwordRules = [
  (v: string) => !!v || MESSAGES.VALIDATION.REQUIRED_FIELD,
  (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
  (v: string) => v.length <= 50 || 'La contraseña no puede exceder 50 caracteres',
]

// ⚡ OPTIMIZACIÓN: Array estático en lugar de computed para evitar re-cálculos
const confirmPasswordRules = [
  (v: string) => !!v || MESSAGES.VALIDATION.REQUIRED_FIELD,
  (v: string) => v === userData.value.password || 'Las contraseñas no coinciden',
]

const terminosRules = [
  (v: boolean) => !!v || 'Debe aceptar los términos y condiciones para continuar',
]

// Métodos
const handleSubmit = () => {
  if (formValid.value) {
    emit('submit', { ...userData.value })
  }
}
</script>

<!-- Sin estilos custom, usando estilos nativos de Vuetify -->
