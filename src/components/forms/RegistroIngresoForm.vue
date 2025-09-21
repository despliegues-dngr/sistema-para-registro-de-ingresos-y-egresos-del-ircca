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

    <!-- Sección 1: Datos Personales -->
    <FormSection
      title="Datos Personales"
      icon="mdi-account"
      chip-label="Obligatorio"
      chip-color="error"
      v-model:expanded="personalExpanded"
    >
      <v-row>
        <!-- Cédula -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.datosPersonales.cedula"
            label="Cédula de Identidad"
            prepend-inner-icon="mdi-card-account-details"
            :rules="cedulaRules"
            variant="outlined"
            density="comfortable"
            hint="8 dígitos sin puntos ni guiones"
            persistent-hint
            required
            autofocus
          />
        </v-col>

        <!-- Nombre -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.datosPersonales.nombre"
            label="Nombre"
            prepend-inner-icon="mdi-account"
            :rules="nombreRules"
            variant="outlined"
            density="comfortable"
            required
          />
        </v-col>

        <!-- Apellido -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.datosPersonales.apellido"
            label="Apellido"
            prepend-inner-icon="mdi-account"
            :rules="apellidoRules"
            variant="outlined"
            density="comfortable"
            required
          />
        </v-col>

        <!-- Tipo de Visitante -->
        <v-col cols="12" md="6">
          <v-select
            v-model="formData.datosVisita.tipoVisitante"
            label="Tipo de Visitante"
            prepend-inner-icon="mdi-account-group"
            :items="tiposVisitante"
            :rules="requiredRules"
            variant="outlined"
            density="comfortable"
            required
          />
        </v-col>

        <!-- Área a Visitar -->
        <v-col cols="12">
          <v-select
            v-model="formData.datosVisita.areaVisitar"
            label="Área a Visitar"
            prepend-inner-icon="mdi-domain"
            :items="areasVisitar"
            :rules="requiredRules"
            variant="outlined"
            density="comfortable"
            required
          />
        </v-col>
      </v-row>
    </FormSection>

    <v-divider class="my-6" />

    <!-- Sección 2: Datos de Vehículo -->
    <FormSection
      title="Datos de Vehículo"
      icon="mdi-car"
      chip-label="Opcional"
      chip-color="info"
      v-model:expanded="vehiculoExpanded"
    >
      <v-row>
        <!-- Tipo de Vehículo -->
        <v-col cols="12" md="6">
          <v-select
            v-model="formData.datosVehiculo.tipo"
            label="Tipo de Vehículo"
            prepend-inner-icon="mdi-car"
            :items="tiposVehiculo"
            :rules="vehiculoFieldRules"
            variant="outlined"
            density="comfortable"
            @update:model-value="onVehiculoChange"
          />
        </v-col>

        <!-- Matrícula -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.datosVehiculo.matricula"
            label="Matrícula"
            prepend-inner-icon="mdi-card-text"
            :rules="matriculaRules"
            variant="outlined"
            density="comfortable"
            hint="Formato: ABC1234"
            persistent-hint
            @input="onVehiculoChange"
          />
        </v-col>
      </v-row>
    </FormSection>

    <v-divider class="my-6" />

    <!-- Sección 3: Acompañantes -->
    <FormSection
      title="Acompañantes"
      icon="mdi-account-multiple"
      chip-label="Opcional"
      chip-color="info"
      v-model:expanded="acompanantesExpanded"
    >
      <!-- Información explicativa -->
      <v-alert
        color="info"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        <div class="d-flex align-center">
          <v-icon size="16" class="mr-2">mdi-information</v-icon>
          <span class="text-body-2">
            Agregue personas que ingresan junto al titular (mismo vehículo)
          </span>
        </div>
      </v-alert>

      <!-- Lista de acompañantes -->
      <div v-for="(acompanante, index) in formData.acompanantes" :key="index" class="acompanante-card mb-4">
        <v-card variant="outlined" class="pa-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <h4 class="text-subtitle-1">
              <v-icon size="16" class="mr-2">mdi-account</v-icon>
              Acompañante {{ index + 1 }}
            </h4>
            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              color="error"
              @click="removeAcompanante(index)"
            />
          </div>
          
          <v-row>
            <!-- Cédula del acompañante -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="acompanante.cedula"
                label="Cédula"
                prepend-inner-icon="mdi-card-account-details"
                :rules="cedulaRules"
                variant="outlined"
                density="comfortable"
                hint="8 dígitos"
                persistent-hint
                required
              />
            </v-col>

            <!-- Nombre -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="acompanante.nombre"
                label="Nombre"
                prepend-inner-icon="mdi-account"
                :rules="nombreRules"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <!-- Apellido -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="acompanante.apellido"
                label="Apellido"
                prepend-inner-icon="mdi-account"
                :rules="apellidoRules"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <!-- Tipo de Visitante del acompañante -->
            <v-col cols="12" md="6">
              <v-select
                v-model="acompanante.tipoVisitante"
                label="Tipo de Visitante"
                prepend-inner-icon="mdi-account-group"
                :items="tiposVisitante"
                :rules="requiredRules"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <!-- Área a Visitar del acompañante -->
            <v-col cols="12">
              <v-select
                v-model="acompanante.areaVisitar"
                label="Área a Visitar"
                prepend-inner-icon="mdi-domain"
                :items="areasVisitar"
                :rules="requiredRules"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>
          </v-row>
        </v-card>
      </div>

      <!-- Botón para agregar acompañante -->
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-account-plus"
        @click="addAcompanante"
        :disabled="formData.acompanantes.length >= 5"
        class="mb-2"
      >
        Agregar Acompañante
      </v-btn>
      
      <div v-if="formData.acompanantes.length >= 5" class="text-body-2 text-warning ml-2">
        Máximo 5 acompañantes por registro
      </div>
    </FormSection>

    <v-divider class="my-6" />

    <!-- Observaciones adicionales -->
    <div class="form-section mt-6">
      <v-textarea
        v-model="formData.observaciones"
        label="Observaciones Adicionales (Opcional)"
        prepend-inner-icon="mdi-note-text"
        variant="outlined"
        density="comfortable"
        rows="2"
        counter="300"
        hint="Información adicional relevante para el registro"
        persistent-hint
      />
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { type RegistroIngresoData, type DatosPersonales, type DatosVisita, type DatosVehiculo, type DatosAcompanante } from '@/stores/registro'
import FormSection from '@/components/forms/FormSection.vue'


interface Props {
  loading?: boolean
  message?: string
}

interface Emits {
  submit: [data: RegistroIngresoData]
  'clear-message': []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  message: '',
})

const emit = defineEmits<Emits>()

// Referencias
const formRef = ref()
const personalExpanded = ref(0) // Auto-expandido por defecto (sección obligatoria)
const vehiculoExpanded = ref() // Sin expandir por defecto (sección opcional)
const acompanantesExpanded = ref() // Sin expandir por defecto (sección opcional)

// Estado del formulario
const formData = reactive({
  datosPersonales: {
    cedula: '',
    nombre: '',
    apellido: '',
  } as DatosPersonales,
  datosVisita: {
    tipoVisitante: '',
    areaVisitar: '',
  } as DatosVisita,
  datosVehiculo: {
    tipo: '',
    matricula: '',
  } as DatosVehiculo,
  acompanantes: [] as DatosAcompanante[],
  observaciones: ''
})

// Opciones para selectores
const tiposVisitante = [
  'Funcionario Público',
  'Proveedor/Contratista',
  'Visitante Oficial',
  'Personal Externo',
  'Otro'
]

const areasVisitar = [
  'Dirección General',
  'Administración',
  'Seguridad',
  'Talleres',
  'Cocina/Comedor',
  'Enfermería',
  'Biblioteca',
  'Patio de Visitas',
  'Depósito',
  'Mantenimiento',
]

const tiposVehiculo = [
  'Auto',
  'Moto',
  'Camión',
  'Bus'
]

// Computed properties
const messageType = computed(() => {
  if (!props.message) return 'info'
  if (props.message.includes('Error') || props.message.includes('error')) return 'error'
  if (props.message.includes('exitosamente') || props.message.includes('éxito')) return 'success'
  return 'info'
})

const hasVehiculoData = computed(() => {
  return !!(formData.datosVehiculo.matricula || formData.datosVehiculo.tipo)
})

const isFormValid = computed(() => {
  // Validar datos personales obligatorios
  const personalValid = formData.datosPersonales.cedula.length >= 7 &&
                        formData.datosPersonales.nombre.length >= 2 &&
                        formData.datosPersonales.apellido.length >= 2

  // Validar datos de visita obligatorios
  const visitaValid = formData.datosVisita.tipoVisitante.length > 0 &&
                      formData.datosVisita.areaVisitar.length > 0

  // Si hay datos de vehículo, validar que estén completos
  let vehiculoValid = true
  if (hasVehiculoData.value) {
    vehiculoValid = formData.datosVehiculo.matricula.length >= 6 &&
                    formData.datosVehiculo.tipo.length >= 2
  }

  // Validar acompañantes si existen
  let acompanantesValid = true
  if (formData.acompanantes.length > 0) {
    acompanantesValid = formData.acompanantes.every(acomp => 
      acomp.cedula.length >= 7 &&
      acomp.nombre.length >= 2 &&
      acomp.apellido.length >= 2 &&
      acomp.tipoVisitante.length > 0 &&
      acomp.areaVisitar.length > 0
    )
  }

  return personalValid && visitaValid && vehiculoValid && acompanantesValid
})

// Reglas de validación
const cedulaRules = [
  (v: string) => !!v || 'La cédula es requerida',
  (v: string) => /^\d{7,8}$/.test(v) || 'La cédula debe tener 7 u 8 dígitos',
]

const nombreRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
]

const apellidoRules = [
  (v: string) => !!v || 'El apellido es requerido',
  (v: string) => v.length >= 2 || 'El apellido debe tener al menos 2 caracteres',
]

const requiredRules = [
  (v: string) => !!v || 'Este campo es requerido',
]


const matriculaRules = [
  (v: string) => !v || /^[A-Z]{3}\d{4}$/.test(v.toUpperCase()) || 'Formato inválido (ej: ABC1234)',
]

const vehiculoFieldRules = [
  (v: string) => {
    const { tipo, matricula } = formData.datosVehiculo
    const hasAnyVehiculo = tipo || matricula
    if (hasAnyVehiculo && !v) {
      return 'Si ingresa datos de vehículo, complete todos los campos'
    }
    return true
  }
]

// Métodos
const onVehiculoChange = () => {
  const { tipo, matricula } = formData.datosVehiculo
  const hasAnyData = tipo || matricula
  
  if (hasAnyData && vehiculoExpanded.value === undefined) {
    vehiculoExpanded.value = 0 // Auto-expandir si se empieza a llenar
  }
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) {
    const submitData: RegistroIngresoData = {
      datosPersonales: { ...formData.datosPersonales },
      datosVisita: { ...formData.datosVisita },
      observaciones: formData.observaciones || undefined,
    }

    // Solo incluir datos de vehículo si hay información
    if (hasVehiculoData.value) {
      submitData.datosVehiculo = { ...formData.datosVehiculo }
    }

    emit('submit', submitData)
  }
}

// Métodos para manejar acompañantes
const addAcompanante = () => {
  if (formData.acompanantes.length < 5) {
    formData.acompanantes.push({
      cedula: '',
      nombre: '',
      apellido: '',
      tipoVisitante: '',
      areaVisitar: ''
    })
    // Auto-expandir sección si se agrega el primer acompañante
    if (formData.acompanantes.length === 1) {
      acompanantesExpanded.value = 0
    }
  }
}

const removeAcompanante = (index: number) => {
  formData.acompanantes.splice(index, 1)
  // Colapsar sección si no quedan acompañantes
  if (formData.acompanantes.length === 0) {
    acompanantesExpanded.value = undefined
  }
}

const resetForm = () => {
  formData.datosPersonales = { cedula: '', nombre: '', apellido: '' }
  formData.datosVisita = { tipoVisitante: '', areaVisitar: '' }
  formData.datosVehiculo = { tipo: '', matricula: '' }
  formData.acompanantes = []
  formData.observaciones = ''
  
  // Resetear acordeones - sección principal expandida, resto colapsado
  personalExpanded.value = 0
  vehiculoExpanded.value = undefined
  acompanantesExpanded.value = undefined
  
  formRef.value?.resetValidation()
}

// Exponer métodos y propiedades para el componente padre
defineExpose({
  submit: handleSubmit,
  resetForm,
  isFormValid
})
</script>

<style scoped>
/* Estilos específicos del formulario - Los estilos de acordeones están en FormSection.vue */
.form-section {
  margin-bottom: 1.5rem;
}

/* Estilos para acompañantes */
.acompanante-card {
  transition: all 0.2s ease;
}

.acompanante-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.acompanante-card .v-card {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.3);
}
</style>
