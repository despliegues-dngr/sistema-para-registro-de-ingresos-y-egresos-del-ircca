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

    <!-- Información del usuario -->
    <div class="user-info-section">
      <div class="d-flex align-center mb-4">
        <v-avatar size="64" color="primary" class="text-white mr-4">
          <span class="text-h5">{{ userInitials }}</span>
        </v-avatar>
        <div>
          <h4 class="text-h6 mb-1">{{ fullName }}</h4>
          <p class="text-body-2 text-medium-emphasis mb-0">{{ gradeDisplay }}</p>
          <p
            v-if="userData.fechaRegistro && mode === 'view'"
            class="text-caption text-medium-emphasis"
          >
            Registrado: {{ formatDate(userData.fechaRegistro) }}
          </p>
        </div>
      </div>
    </div>

    <v-divider class="mb-6" />

    <!-- Campos del formulario - Solo en modo edición -->
    <v-row v-if="mode === 'edit'">
      <!-- Cédula -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.cedula"
          label="Cédula de Identidad"
          prepend-inner-icon="mdi-card-account-details"
          :rules="cedulaRules"
          variant="outlined"
          density="comfortable"
          class="institutional-field"
          hint="8 dígitos sin puntos ni guiones"
          persistent-hint
        />
        <v-alert
          v-if="formData.cedula !== userData.cedula && formData.cedula.length >= 7"
          variant="tonal"
          color="info"
          density="compact"
          class="mt-2"
        >
          <v-icon size="16" class="mr-1">mdi-information</v-icon>
          <span class="text-caption">
            Nueva cédula será su usuario para próximos ingresos:
            <strong>{{ formData.cedula }}</strong>
          </span>
        </v-alert>
      </v-col>

      <!-- Grado -->
      <v-col cols="12" md="6">
        <v-select
          v-model="formData.grado"
          label="Grado"
          prepend-inner-icon="mdi-police-badge"
          :items="gradoOptions"
          :rules="gradoRules"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Nombre -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.nombre"
          label="Nombre"
          prepend-inner-icon="mdi-account"
          :rules="nombreRules"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <!-- Apellido -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.apellido"
          label="Apellido"
          prepend-inner-icon="mdi-account"
          :rules="apellidoRules"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
    </v-row>

    <!-- Información del usuario completa solo para vista -->
    <v-card v-if="mode === 'view'" variant="tonal" color="info" class="mt-4" density="compact">
      <v-card-text class="pa-4">
        <div class="d-flex align-center mb-3">
          <v-icon size="20" color="info" class="mr-2">mdi-information</v-icon>
          <strong class="text-body-2">Información del Usuario</strong>
        </div>

        <!-- Cédula -->
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">
            <v-icon size="16" class="mr-1">mdi-card-account-details</v-icon>
            Cédula:
          </span>
          <span class="text-body-2 font-weight-medium">{{ formData.cedula || '—' }}</span>
        </div>

        <!-- Grado/Rol -->
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">
            <v-icon size="16" class="mr-1">mdi-police-badge</v-icon>
            Grado:
          </span>
          <v-chip color="primary" variant="tonal" size="small">{{ gradeDisplay }}</v-chip>
        </div>

        <!-- Nombre completo -->
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">
            <v-icon size="16" class="mr-1">mdi-account</v-icon>
            Nombre:
          </span>
          <span class="text-body-2 font-weight-medium">{{ formData.nombre || '—' }}</span>
        </div>

        <!-- Apellido -->
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">
            <v-icon size="16" class="mr-1">mdi-account</v-icon>
            Apellido:
          </span>
          <span class="text-body-2 font-weight-medium">{{ formData.apellido || '—' }}</span>
        </div>

        <!-- Estado del sistema -->
        <v-divider class="my-3" />
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">
            <v-icon size="16" class="mr-1">mdi-shield-check</v-icon>
            Estado:
          </span>
          <v-chip color="success" variant="tonal" size="small">
            <v-icon size="14" class="mr-1">mdi-check-circle</v-icon>
            Activo
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type ProfileMode = 'view' | 'edit'

interface UserData {
  cedula: string
  grado: string
  nombre: string
  apellido: string
  fechaRegistro?: string
}

interface Props {
  mode: ProfileMode
  userData: UserData
  loading?: boolean
  message?: string
}

interface Emits {
  submit: [data: UserData]
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
const formData = ref<UserData>({
  cedula: '',
  grado: '',
  nombre: '',
  apellido: '',
  fechaRegistro: '',
})

// Computed properties
const userInitials = computed(() => {
  const nombre = formData.value.nombre || props.userData.nombre || ''
  const apellido = formData.value.apellido || props.userData.apellido || ''
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
})

const fullName = computed(() => {
  const nombre = formData.value.nombre || props.userData.nombre || ''
  const apellido = formData.value.apellido || props.userData.apellido || ''
  return `${nombre} ${apellido}`.trim()
})

const gradeDisplay = computed(() => {
  const grado = formData.value.grado || props.userData.grado || ''
  
  // Si no hay grado, mostrar mensaje por defecto
  if (!grado) return 'Sin grado asignado'
  
  // Buscar el título completo en las opciones (coincidencia exacta)
  const gradoOption = gradoOptions.find((option) => option.value === grado)
  if (gradoOption) return gradoOption.title
  
  // Buscar por título (para retrocompatibilidad)
  const gradoByTitle = gradoOptions.find((option) => option.title === grado)
  if (gradoByTitle) return gradoByTitle.title
  
  // Si no se encuentra en las opciones, mostrar el valor actual
  // (importante para mantener el valor cuando se está editando)
  return grado
})

// Computed para mostrar el ROL del sistema (admin/supervisor/operador)
// Removido temporalmente hasta que se necesite en el template
// const roleDisplay = computed(() => {
//   // Si necesitáramos mostrar el rol del sistema:
//   // import { useAuthStore } from '@/stores/auth'
//   // const authStore = useAuthStore()
//   // return authStore.user?.role || 'operador'
//   return 'Operador'
// })

// Opciones de grado (mismo que RegistrationForm.vue)
const gradoOptions = [
  { title: 'Guardia Republicano', value: 'guardia_republicano' },
  { title: 'Cabo', value: 'cabo' },
  { title: 'Sargento', value: 'sargento' },
  { title: 'Sub Oficial', value: 'sub_oficial' },
  { title: 'Alférez', value: 'alferez' },
  { title: 'Teniente', value: 'teniente' },
  { title: 'Tte. 1°', value: 'teniente_primero' },
  { title: 'Capitán', value: 'capitan' },
  { title: 'Cte. Mayor', value: 'comandante_mayor' },
  { title: 'Cte. General', value: 'comandante_general' },
]

const messageType = computed(() => {
  if (!props.message) return 'info'
  if (props.message.includes('Error') || props.message.includes('error')) return 'error'
  if (props.message.includes('exitosamente') || props.message.includes('éxito')) return 'success'
  return 'info'
})

// Validación del formulario
const isFormValid = computed(() => {
  if (props.mode !== 'edit') return true

  return (
    formData.value.grado.length >= 2 &&
    formData.value.nombre.length >= 2 &&
    formData.value.apellido.length >= 2
  )
})

// Reglas de validación
const cedulaRules = [
  (v: string) => !!v || 'La cédula es requerida',
  (v: string) => /^\d{7,8}$/.test(v) || 'La cédula debe tener 7 u 8 dígitos',
]

const gradoRules = [
  (v: string) => !!v || 'El grado es requerido',
  (v: string) => v.length >= 2 || 'El grado debe tener al menos 2 caracteres',
]

const nombreRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
]

const apellidoRules = [
  (v: string) => !!v || 'El apellido es requerido',
  (v: string) => v.length >= 2 || 'El apellido debe tener al menos 2 caracteres',
]

// Métodos
const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid && props.mode === 'edit') {
    emit('submit', formData.value)
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

// Exponer métodos y propiedades para el componente padre
defineExpose({
  submit: handleSubmit,
  isFormValid,
})

// Watchers
watch(
  () => props.userData,
  (newData) => {
    console.log('🔍 DEBUG UserProfileForm - Datos recibidos:', newData)
    console.log('🔍 DEBUG UserProfileForm - Grado en datos:', newData.grado)
    formData.value = { ...newData }
    console.log('🔍 DEBUG UserProfileForm - formData actualizado:', formData.value)
  },
  { immediate: true, deep: true },
)

// Debug adicional para el v-select del grado
watch(
  () => formData.value.grado,
  (newGrado) => {
    console.log('🔍 DEBUG UserProfileForm - Grado cambiado a:', newGrado)
    const option = gradoOptions.find(opt => opt.value === newGrado)
    console.log('🔍 DEBUG UserProfileForm - Opción encontrada:', option)
    console.log('🔍 DEBUG UserProfileForm - gradeDisplay actual:', gradeDisplay.value)
  },
  { immediate: true }
)
</script>

<style scoped>
.user-info-section {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.institutional-field :deep(.v-field--disabled) {
  opacity: 0.7;
}

/* Mejoras para la card de información del usuario */
.v-card .v-icon {
  opacity: 0.7;
}
</style>
