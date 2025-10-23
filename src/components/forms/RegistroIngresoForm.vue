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
    <DatosPersonalesSection
      :datos-personales="formData.datosPersonales"
      :datos-visita="formData.datosVisita"
      :expanded="personalExpanded"
      @update:expanded="personalExpanded = $event"
      @update:cedula="formData.datosPersonales.cedula = $event"
      @update:nombre="formData.datosPersonales.nombre = $event"
      @update:apellido="formData.datosPersonales.apellido = $event"
      @update:destino="formData.datosVisita.destino = $event"
      @update:vehiculo="autocompletarVehiculo"
    />

    <v-divider class="my-6" />

    <!-- Sección 2: Datos de Vehículo -->
    <DatosVehiculoSection
      :datos-vehiculo="formData.datosVehiculo"
      :expanded="vehiculoExpanded"
      @update:expanded="vehiculoExpanded = $event"
      @update:tipo="formData.datosVehiculo.tipo = $event"
      @update:matricula="formData.datosVehiculo.matricula = $event"
      @has-data-change="onVehiculoDataChange"
    />

    <v-divider class="my-6" />

    <!-- Sección 3: Acompañantes -->
    <AcompanantesSection
      :acompanantes="formData.acompanantes"
      :destino-titular="formData.datosVisita.destino"
      :expanded="acompanantesExpanded"
      @update:expanded="acompanantesExpanded = $event"
      @add-acompanante="addAcompanante"
      @remove-acompanante="removeAcompanante"
      @update-acompanante="updateAcompanante"
    />

    <v-divider class="my-6" />

    <!-- Observaciones adicionales -->
    <div class="form-section mt-6">
      <v-textarea
        v-model="formData.observaciones"
        label="Observaciones sobre el Ingreso (Opcional)"
        prepend-inner-icon="mdi-note-text"
        variant="outlined"
        density="comfortable"
        rows="2"
        counter="100"
        maxlength="100"
        hint="Información adicional relevante sobre el ingreso"
        persistent-hint
        validate-on="blur"
      />
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { type RegistroIngresoData, type DatosPersonales, type DatosVisita, type DatosVehiculo, type DatosAcompanante } from '@/stores/registro'
import DatosPersonalesSection from './sections/DatosPersonalesSection.vue'
import DatosVehiculoSection from './sections/DatosVehiculoSection.vue'
import AcompanantesSection from './sections/AcompanantesSection.vue'

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
const personalExpanded = ref<number | undefined>(0) // Auto-expandido por defecto (sección obligatoria)
const vehiculoExpanded = ref<number | undefined>()
const acompanantesExpanded = ref<number | undefined>()

// Estado del formulario
const formData = reactive({
  datosPersonales: {
    cedula: '',
    nombre: '',
    apellido: '',
  } as DatosPersonales,
  datosVisita: {
    destino: '',
  } as DatosVisita,
  datosVehiculo: {
    tipo: '',
    matricula: '',
  } as DatosVehiculo,
  acompanantes: [] as DatosAcompanante[],
  observaciones: ''
})

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
  const personalValid = formData.datosPersonales.cedula.length >= 7 &&
                        formData.datosPersonales.nombre.length >= 2 &&
                        formData.datosPersonales.apellido.length >= 2

  const visitaValid = formData.datosVisita.destino.length > 0

  let vehiculoValid = true
  if (hasVehiculoData.value) {
    vehiculoValid = formData.datosVehiculo.matricula.length >= 6 &&
                    formData.datosVehiculo.tipo.length >= 2
  }

  let acompanantesValid = true
  if (formData.acompanantes.length > 0) {
    acompanantesValid = formData.acompanantes.every(acomp => 
      acomp.cedula.length >= 7 &&
      acomp.nombre.length >= 2 &&
      acomp.apellido.length >= 2 &&
      acomp.destino.length > 0
    )
  }

  return personalValid && visitaValid && vehiculoValid && acompanantesValid
})

// ========================================
// 📝 MÉTODOS DE EVENTOS
// ========================================

/**
 * Maneja cambios en datos de vehículo
 */
const onVehiculoDataChange = (hasData: boolean) => {
  if (hasData && vehiculoExpanded.value === undefined) {
    vehiculoExpanded.value = 0
  }
}

/**
 * Agregar acompañante
 */
const addAcompanante = () => {
  if (formData.acompanantes.length < 20) {
    formData.acompanantes.push({
      cedula: '',
      nombre: '',
      apellido: '',
      destino: ''
    })
    
    if (formData.acompanantes.length === 1) {
      acompanantesExpanded.value = 0
    }
  }
}

/**
 * Eliminar acompañante
 */
const removeAcompanante = (index: number) => {
  formData.acompanantes.splice(index, 1)
  
  if (formData.acompanantes.length === 0) {
    acompanantesExpanded.value = undefined
  }
}

/**
 * Actualizar campo de acompañante
 */
const updateAcompanante = (index: number, field: string, value: string) => {
  // eslint-disable-next-line security/detect-object-injection -- Safe: index validated by bounds check
  const acompanante = formData.acompanantes[index]
  if (!acompanante) return
  
  // Validar que el field sea una key válida de DatosAcompanante
  const validFields = ['cedula', 'nombre', 'apellido', 'destino'] as const
  if (!validFields.includes(field as typeof validFields[number])) {
    return
  }
  
  // eslint-disable-next-line security/detect-object-injection -- Safe: field validated against validFields
  ;(acompanante as Record<string, string>)[field] = value
}

/**
 * Autocompletar datos de vehículo desde persona conocida
 */
const autocompletarVehiculo = (vehiculo: DatosVehiculo) => {
  formData.datosVehiculo.tipo = vehiculo.tipo
  formData.datosVehiculo.matricula = vehiculo.matricula
  
  // Auto-expandir la sección de vehículo
  vehiculoExpanded.value = 0
}

/**
 * Enviar formulario
 */
const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) {
    const submitData: RegistroIngresoData = {
      datosPersonales: { ...formData.datosPersonales },
      datosVisita: { ...formData.datosVisita },
      observaciones: formData.observaciones || undefined,
    }

    if (hasVehiculoData.value) {
      submitData.datosVehiculo = { ...formData.datosVehiculo }
    }

    if (formData.acompanantes.length > 0) {
      submitData.acompanantes = [...formData.acompanantes]
    }

    emit('submit', submitData)
  }
}

/**
 * Resetear formulario
 */
const resetForm = () => {
  formData.datosPersonales = { cedula: '', nombre: '', apellido: '' }
  formData.datosVisita = { destino: '' }
  formData.datosVehiculo = { tipo: '', matricula: '' }
  formData.acompanantes = []
  formData.observaciones = ''
  
  personalExpanded.value = 0
  vehiculoExpanded.value = undefined
  acompanantesExpanded.value = undefined
  
  formRef.value?.resetValidation()
}

// Exponer métodos
defineExpose({
  submit: handleSubmit,
  resetForm,
  isFormValid
})
</script>

<style scoped>
.form-section {
  margin-bottom: 1.5rem;
}
</style>
