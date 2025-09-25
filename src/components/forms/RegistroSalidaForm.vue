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

    <!-- Sección de Búsqueda y Selección Integrada -->
    <div class="form-section">
      <div class="section-header mb-4">
        <v-icon size="20" color="primary" class="mr-2">mdi-account-search</v-icon>
        <h4 class="text-h6 mb-0">Buscar Persona por Cédula o Matrícula</h4>
        <v-chip 
          color="info" 
          variant="tonal" 
          size="small" 
          class="ml-2"
        >
          {{ registroStore.personasDentro.length }} en el predio
        </v-chip>
      </div>

      <!-- Buscador con opciones integradas -->
      <v-autocomplete
        v-model="personaSeleccionadaItem"
        :items="personasFiltradas"
        item-title="displayText"
        item-value="persona"
        return-object
        label="Buscar por Cédula o Matrícula"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        clearable
        autofocus
        hide-details="auto"
        :rules="personaRules"
        placeholder="Escriba cédula o matrícula del vehículo..."
        :search="terminoBusqueda"
        @update:search="terminoBusqueda = $event"
        :custom-filter="() => true"
        no-filter
      >
        <!-- Slot personalizado para cada item -->
        <template #item="{ props: itemProps, item }">
          <v-list-item
            v-bind="itemProps"
            class="persona-autocomplete-item pa-4"
            lines="two"
          >
            <!-- Avatar más sutil -->
            <template #prepend>
              <v-avatar color="grey-lighten-2" size="32" class="avatar-sutil">
                <v-icon color="grey-darken-1" size="16">mdi-account</v-icon>
              </v-avatar>
            </template>

            <!-- Contenido en dos columnas -->
            <div class="d-flex justify-space-between align-start w-100">
              
              <!-- Columna izquierda: Datos personales -->
              <div class="datos-personales flex-grow-1 pr-4">
                <!-- Nombre completo -->
                <v-list-item-title class="text-subtitle-1 font-weight-bold mb-2">
                  {{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}
                </v-list-item-title>
                
                <!-- Cédula -->
                <div class="d-flex align-center mb-2">
                  <v-icon size="12" color="primary" class="mr-1">mdi-card-account-details</v-icon>
                  <span class="text-body-2 text-medium-emphasis">{{ item.raw.persona.cedula }}</span>
                </div>

                <!-- Información de visita -->
                <div class="d-flex flex-wrap gap-1">
                  <v-chip 
                    :color="getTipoVisitanteColor(item.raw.persona.tipoVisitante)" 
                    variant="tonal" 
                    size="x-small"
                    :prepend-icon="getTipoVisitanteIcon(item.raw.persona.tipoVisitante)"
                  >
                    {{ item.raw.persona.tipoVisitante }}
                  </v-chip>
                  
                  <v-chip 
                    color="info" 
                    variant="tonal" 
                    size="x-small"
                    prepend-icon="mdi-domain"
                  >
                    {{ item.raw.persona.areaVisitar }}
                  </v-chip>
                </div>
              </div>

              <!-- Columna derecha: Vehículo y tiempo -->
              <div class="datos-vehiculo-tiempo d-flex flex-column align-end">
                <!-- Tiempo en el predio -->
                <v-chip
                  color="info"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-timer"
                  class="mb-2"
                >
                  {{ calcularTiempoEstadia(item.raw.persona.ingresoTimestamp) }}
                </v-chip>

                <!-- Información del vehículo o grupo -->
                <div class="vehiculo-grupo-info">
                  <!-- Persona con vehículo propio -->
                  <div v-if="item.raw.persona.conVehiculo && getVehiculoInfo(item.raw.persona.cedula)" class="vehiculo-info">
                    <div class="d-flex align-center mb-1">
                      <v-icon 
                        :icon="getVehiculoIcon(getVehiculoInfo(item.raw.persona.cedula)?.tipo)"
                        size="16" 
                        color="primary" 
                        class="mr-1"
                      ></v-icon>
                      <span class="text-body-2 font-weight-medium text-primary">
                        {{ getVehiculoInfo(item.raw.persona.cedula)?.tipo }}
                      </span>
                    </div>
                    <div class="text-body-2 text-medium-emphasis text-right">
                      {{ getVehiculoInfo(item.raw.persona.cedula)?.matricula }}
                    </div>
                    <!-- Indicador si tiene acompañantes -->
                    <div v-if="getAcompanantesCount(item.raw.persona.cedula) > 0" class="text-body-2 text-warning text-right mt-1">
                      <v-icon size="12" class="mr-1">mdi-account-multiple</v-icon>
                      +{{ getAcompanantesCount(item.raw.persona.cedula) }} acompañantes
                    </div>
                  </div>

                  <!-- Acompañante (llegó en vehículo de otro) -->
                  <div v-else-if="getVehiculoTitular(item.raw.persona.cedula)" class="acompanante-info">
                    <div class="text-body-2 text-medium-emphasis text-right mb-1">
                      <v-icon size="14" class="mr-1">mdi-account-arrow-right</v-icon>
                      Acompañante
                    </div>
                    <div class="d-flex align-center justify-end mb-1">
                      <v-icon 
                        :icon="getVehiculoIcon(getVehiculoTitular(item.raw.persona.cedula)?.tipo)"
                        size="14" 
                        color="info" 
                        class="mr-1"
                      ></v-icon>
                      <span class="text-body-2 text-info">
                        {{ getVehiculoTitular(item.raw.persona.cedula)?.matricula }}
                      </span>
                    </div>
                    <div class="text-body-2 text-medium-emphasis text-right">
                      Titular: {{ getNombreTitular(item.raw.persona.cedula) }}
                    </div>
                  </div>

                  <!-- Persona sin vehículo -->
                  <div v-else class="sin-vehiculo text-body-2 text-medium-emphasis text-right">
                    <v-icon size="14" class="mr-1">mdi-walk</v-icon>
                    A pie
                  </div>
                </div>
              </div>
              
            </div>
          </v-list-item>
        </template>

        <!-- Slot cuando no hay resultados -->
        <template #no-data>
          <div class="text-center pa-4">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-account-search</v-icon>
            <p class="text-body-2 text-medium-emphasis mb-0">
              No se encontraron personas que coincidan
            </p>
          </div>
        </template>
      </v-autocomplete>
    </div>

    <!-- Card consolidada con toda la información -->
    <div v-if="personaSeleccionada" class="form-section mt-6">
      <v-card variant="outlined">
        <!-- Header de la card -->
        <v-card-title class="bg-warning text-white pa-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon size="24" class="mr-3">mdi-account-check</v-icon>
              <div>
                <h3 class="text-h6 mb-0">{{ personaSeleccionada.nombre }} {{ personaSeleccionada.apellido }}</h3>
                <p class="text-caption mb-0">C.I: {{ personaSeleccionada.cedula }} • {{ calcularTiempoEstadia(personaSeleccionada.ingresoTimestamp) }} en el predio</p>
              </div>
            </div>
            
            <!-- Botones según el modo -->
            <div v-if="!mostrarEdicionSalida">
              <v-btn
                color="white"
                variant="tonal"
                size="small"
                prepend-icon="mdi-pencil"
                @click="activarModoEdicion"
              >
                Editar Salida
              </v-btn>
            </div>
            
            <div v-else class="d-flex gap-2">
              <v-btn
                color="white"
                variant="tonal"
                size="small"
                prepend-icon="mdi-check"
                @click="guardarEdicion"
              >
                Guardar
              </v-btn>
              <v-btn
                color="white"
                variant="text"
                size="small"
                prepend-icon="mdi-close"
                @click="cancelarEdicion"
              >
                Cancelar
              </v-btn>
            </div>
          </div>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Columna izquierda: Datos de visita -->
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 mb-3 d-flex align-center">
                <v-icon size="16" class="mr-2">mdi-briefcase</v-icon>
                Información de Visita
              </h4>
              
              <div class="mb-3">
                <v-chip 
                  :color="getTipoVisitanteColor(personaSeleccionada.tipoVisitante)" 
                  variant="tonal" 
                  size="small"
                  :prepend-icon="getTipoVisitanteIcon(personaSeleccionada.tipoVisitante)"
                  class="mr-2 mb-2"
                >
                  {{ personaSeleccionada.tipoVisitante }}
                </v-chip>
                
                <v-chip 
                  color="info" 
                  variant="tonal" 
                  size="small"
                  prepend-icon="mdi-domain"
                  class="mb-2"
                >
                  {{ personaSeleccionada.areaVisitar }}
                </v-chip>
              </div>

            </v-col>

            <!-- Columna derecha: Vehículo y acompañantes -->
            <v-col cols="12" md="6">
              <!-- Información de vehículo -->
              <div class="mb-4">
                <h4 class="text-subtitle-2 mb-3 d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-car</v-icon>
                  Vehículo {{ mostrarEdicionSalida ? 'de Salida' : '' }}
                </h4>
                
                <!-- Modo Vista -->
                <div v-if="!mostrarEdicionSalida">
                  <div v-if="personaSeleccionada.conVehiculo && getVehiculoInfo(personaSeleccionada.cedula)">
                    <div class="d-flex align-center mb-2">
                      <v-icon 
                        :icon="getVehiculoIcon(getVehiculoInfo(personaSeleccionada.cedula)?.tipo)"
                        size="20" 
                        color="primary" 
                        class="mr-2"
                      ></v-icon>
                      <span class="text-body-1 font-weight-medium">
                        {{ getVehiculoInfo(personaSeleccionada.cedula)?.tipo }} - {{ getVehiculoInfo(personaSeleccionada.cedula)?.matricula }}
                      </span>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-0">Titular del vehículo</p>
                  </div>

                  <div v-else-if="getVehiculoTitular(personaSeleccionada.cedula)">
                    <div class="d-flex align-center mb-2">
                      <v-icon 
                        :icon="getVehiculoIcon(getVehiculoTitular(personaSeleccionada.cedula)?.tipo)"
                        size="20" 
                        color="info" 
                        class="mr-2"
                      ></v-icon>
                      <span class="text-body-1">
                        {{ getVehiculoTitular(personaSeleccionada.cedula)?.matricula }}
                      </span>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      Acompañante de: {{ getNombreTitular(personaSeleccionada.cedula) }}
                    </p>
                  </div>

                  <div v-else>
                    <div class="d-flex align-center mb-2">
                      <v-icon size="20" color="grey" class="mr-2">mdi-walk</v-icon>
                      <span class="text-body-1 text-medium-emphasis">A pie</span>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-0">Sin vehículo</p>
                  </div>
                </div>

                <!-- Modo Edición -->
                <div v-else>
                  <v-row>
                    <!-- Sale con vehículo? -->
                    <v-col cols="12">
                      <v-switch
                        v-model="datosSalida.conVehiculo"
                        label="Sale con vehículo"
                        color="primary"
                        inset
                        @update:model-value="onCambioVehiculo"
                      />
                    </v-col>

                    <!-- Tipo de vehículo (si sale con vehículo) -->
                    <v-col v-if="datosSalida.conVehiculo" cols="12">
                      <v-select
                        v-model="datosSalida.tipoVehiculo"
                        label="Tipo de Vehículo"
                        :items="tiposVehiculo"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-car"
                      />
                    </v-col>

                    <!-- Matrícula (si sale con vehículo) -->
                    <v-col v-if="datosSalida.conVehiculo" cols="12">
                      <v-text-field
                        v-model="datosSalida.matricula"
                        label="Matrícula del Vehículo"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-card-text"
                        hint="Formato: ABC1234"
                        persistent-hint
                      />
                    </v-col>

                  </v-row>
                </div>
              </div>

              <!-- Acompañantes (si es titular) -->
              <div v-if="getAcompanantesData(personaSeleccionada.cedula).length > 0">
                <h4 class="text-subtitle-2 mb-3 d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-account-multiple</v-icon>
                  Acompañantes {{ mostrarEdicionSalida ? '- Seleccionar quiénes salen' : `(${getAcompanantesData(personaSeleccionada.cedula).length})` }}
                </h4>
                
                <!-- Modo Vista -->
                <div v-if="!mostrarEdicionSalida">
                  <div v-for="acompanante in getAcompanantesData(personaSeleccionada.cedula)" :key="acompanante.cedula" class="acompanante-info mb-3">
                    <div class="d-flex align-center mb-1">
                      <v-icon size="14" color="info" class="mr-2">mdi-account</v-icon>
                      <span class="text-body-2 font-weight-medium">{{ acompanante.nombre }} {{ acompanante.apellido }}</span>
                    </div>
                    <div class="text-body-2 text-medium-emphasis ml-4">
                      C.I: {{ acompanante.cedula }}
                    </div>
                    <div class="d-flex align-center ml-4 mt-1">
                      <v-chip 
                        :color="getTipoVisitanteColor(acompanante.tipoVisitante)" 
                        variant="tonal" 
                        size="x-small"
                        :prepend-icon="getTipoVisitanteIcon(acompanante.tipoVisitante)"
                        class="mr-1"
                      >
                        {{ acompanante.tipoVisitante }}
                      </v-chip>
                      <v-chip 
                        color="info" 
                        variant="tonal" 
                        size="x-small"
                        prepend-icon="mdi-domain"
                      >
                        {{ acompanante.areaVisitar }}
                      </v-chip>
                    </div>
                  </div>
                </div>

                <!-- Modo Edición -->
                <div v-else>
                  <v-alert
                    color="info"
                    variant="tonal"
                    density="compact"
                    class="mb-3"
                  >
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-2">mdi-information</v-icon>
                      <span class="text-body-2">Seleccione quiénes salen junto con {{ personaSeleccionada.nombre }}</span>
                    </div>
                  </v-alert>

                  <div v-for="acompanante in getAcompanantesData(personaSeleccionada.cedula)" :key="acompanante.cedula" class="mb-3">
                    <v-card variant="outlined" density="compact">
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center justify-space-between">
                          <div class="flex-grow-1">
                            <div class="d-flex align-center mb-1">
                              <v-icon size="14" color="info" class="mr-2">mdi-account</v-icon>
                              <span class="text-body-2 font-weight-medium">{{ acompanante.nombre }} {{ acompanante.apellido }}</span>
                            </div>
                            <div class="text-body-2 text-medium-emphasis">
                              C.I: {{ acompanante.cedula }}
                            </div>
                          </div>
                          
                          <v-checkbox
                            v-model="datosSalida.acompanantesSalen"
                            :value="acompanante.cedula"
                            color="primary"
                            density="compact"
                            hide-details
                          />
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>

                  <div class="mt-3">
                    <v-chip
                      v-if="datosSalida.acompanantesSalen.length === 0"
                      color="info"
                      variant="tonal"
                      size="small"
                      prepend-icon="mdi-account-minus"
                    >
                      Sale solo
                    </v-chip>
                    <v-chip
                      v-else
                      color="success"
                      variant="tonal"
                      size="small"
                      prepend-icon="mdi-account-multiple-check"
                    >
                      Salen {{ datosSalida.acompanantesSalen.length + 1 }} personas
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>


    <!-- Observaciones (solo se muestra después de seleccionar persona Y no estar en modo edición) -->
    <div v-if="personaSeleccionada && !mostrarEdicionSalida" class="form-section mt-6">
      <v-textarea
        v-model="observaciones"
        label="Observaciones sobre la Salida (Opcional)"
        prepend-inner-icon="mdi-note-text"
        variant="outlined"
        density="comfortable"
        rows="2"
        counter="200"
        hint="Información adicional relevante sobre la salida"
        persistent-hint
      />
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRegistroStore, type PersonaDentro } from '@/stores/registro'

interface RegistroSalidaData {
  cedulaBuscada: string
  tiempoEstadia: number
  observaciones?: string
}

interface Props {
  loading?: boolean
  message?: string
}

interface Emits {
  submit: [data: RegistroSalidaData]
  'clear-message': []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  message: '',
})

const emit = defineEmits<Emits>()

const registroStore = useRegistroStore()

// Referencias
const formRef = ref()

// Estado del formulario
const personaSeleccionada = ref<PersonaDentro | null>(null)
const personaSeleccionadaItem = ref<{ displayText: string; persona: PersonaDentro; searchText: string } | null>(null)
const observaciones = ref('')
const terminoBusqueda = ref('')
const mostrarEdicionSalida = ref(false)

// Estado para datos de salida editables
const datosSalida = reactive({
  conVehiculo: false,
  tipoVehiculo: '',
  matricula: '',
  acompanantesSalen: [] as string[] // Array de cédulas de acompañantes que salen
})

// Tipos de vehículo disponibles
const tiposVehiculo = [
  'Auto',
  'Moto',
  'Camión',
  'Bus'
]

// Interfaz para alertas (removida por no estar en uso)

// Computed properties
const messageType = computed(() => {
  if (!props.message) return 'info'
  if (props.message.includes('Error') || props.message.includes('error')) return 'error'
  if (props.message.includes('exitosamente') || props.message.includes('éxito')) return 'success'
  return 'info'
})

// Computed para el autocomplete
const personasParaSelect = computed(() => {
  console.log('🔍 DEBUG personasParaSelect - Procesando personas:', registroStore.personasDentro.length)
  
  return registroStore.personasDentro.map(persona => {
    const vehiculoInfo = getVehiculoInfo(persona.cedula)
    const matricula = vehiculoInfo ? vehiculoInfo.matricula : ''
    
    console.log(`🔍 DEBUG personasParaSelect - Persona: ${persona.nombre}, Cédula: ${persona.cedula}, Matrícula: "${matricula}"`)
    
    return {
      displayText: `${persona.nombre} ${persona.apellido} - C.I: ${persona.cedula}`,
      persona: persona,
      searchText: `${persona.cedula} ${matricula}`.toLowerCase()
    }
  })
})

// Computed para filtrar personas basado en el término de búsqueda
const personasFiltradas = computed(() => {
  if (!terminoBusqueda.value) {
    return personasParaSelect.value
  }
  
  const termino = terminoBusqueda.value.toLowerCase().trim()
  console.log('🔍 DEBUG personasFiltradas - Término de búsqueda:', `"${termino}"`)
  
  return personasParaSelect.value.filter(item => {
    const persona = item.persona
    
    // Buscar por cédula (exacta o parcial)
    const coincideCedula = persona.cedula.includes(termino)
    console.log(`🔍 DEBUG personasFiltradas - ${persona.nombre} - Cédula "${persona.cedula}" coincide con "${termino}":`, coincideCedula)
    
    if (coincideCedula) {
      return true
    }
    
    // Buscar por matrícula del vehículo (si tiene vehículo)
    const vehiculoInfo = getVehiculoInfo(persona.cedula)
    const matricula = vehiculoInfo?.matricula?.toLowerCase() || ''
    const coincideMatricula = matricula.includes(termino)
    
    console.log(`🔍 DEBUG personasFiltradas - ${persona.nombre} - Matrícula "${matricula}" coincide con "${termino}":`, coincideMatricula)
    
    if (vehiculoInfo && coincideMatricula) {
      return true
    }
    
    return false
  })
})

const isFormValid = computed(() => {
  return !!personaSeleccionada.value
})

// Reglas de validación
const personaRules = [
  (v: PersonaDentro) => !!v || 'Debe seleccionar una persona para registrar la salida'
]

// La card es puramente informativa - sin detección automática de "descoordinaciones"
// El usuario decide si algo cambió y usa el botón "Editar Salida" cuando sea necesario

// Watcher para sincronizar la selección del autocomplete
watch(personaSeleccionadaItem, (newItem) => {
  if (newItem && newItem.persona) {
    personaSeleccionada.value = newItem.persona
  } else {
    personaSeleccionada.value = null
  }
})

// Métodos

const calcularTiempoEstadia = (ingresoTimestamp: Date): string => {
  const ahora = new Date()
  const ingreso = new Date(ingresoTimestamp)
  const diferenciaMs = ahora.getTime() - ingreso.getTime()
  
  const horas = Math.floor(diferenciaMs / (1000 * 60 * 60))
  const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (horas > 0) {
    return `${horas}h ${minutos}m`
  } else {
    return `${minutos}m`
  }
}

const calcularTiempoEstadiaEnMinutos = (ingresoTimestamp: Date): number => {
  const ahora = new Date()
  const ingreso = new Date(ingresoTimestamp)
  return Math.floor((ahora.getTime() - ingreso.getTime()) / (1000 * 60))
}

// formatearHoraIngreso removido por no estar en uso

const getTipoVisitanteColor = (tipo: string): string => {
  const colores: Record<string, string> = {
    'Funcionario Público': 'primary',
    'Proveedor/Contratista': 'orange',
    'Visitante Oficial': 'purple',
    'Técnico/Mantenimiento': 'green',
    'Abogado/Representante Legal': 'blue',
    'Familiar de Interno': 'pink',
    'Organización Civil': 'teal',
    'Otro': 'grey'
  }
  return colores[tipo] || 'grey'
}

const getTipoVisitanteIcon = (tipo: string): string => {
  const iconos: Record<string, string> = {
    'Funcionario Público': 'mdi-account-tie',
    'Proveedor/Contratista': 'mdi-hammer-wrench',
    'Visitante Oficial': 'mdi-account-star',
    'Técnico/Mantenimiento': 'mdi-tools',
    'Abogado/Representante Legal': 'mdi-scale-balance',
    'Familiar de Interno': 'mdi-account-heart',
    'Organización Civil': 'mdi-account-group',
    'Personal Externo': 'mdi-account-plus',
    'Otro': 'mdi-account-question'
  }
  return iconos[tipo] || 'mdi-account'
}

const getVehiculoInfo = (cedula: string) => {
  console.log('🔍 DEBUG getVehiculoInfo - Buscando vehículo para cédula:', cedula)
  console.log('🔍 DEBUG getVehiculoInfo - Total registros:', registroStore.registros.length)
  
  // Buscar el registro de ingreso que corresponde a esta cédula
  const registro = registroStore.registros.find(r => 
    r.tipo === 'ingreso' && r.persona.documento === cedula
  )
  
  console.log('🔍 DEBUG getVehiculoInfo - Registro encontrado:', registro)
  console.log('🔍 DEBUG getVehiculoInfo - Vehículo info:', registro?.vehiculo)
  
  // Type narrowing para asegurar que es un registro de ingreso
  if (registro && registro.tipo === 'ingreso') {
    return registro.vehiculo || null
  }
  return null
}

const getVehiculoIcon = (tipoVehiculo?: string): string => {
  const iconos: Record<string, string> = {
    'Auto': 'mdi-car',
    'Moto': 'mdi-motorbike',
    'Camión': 'mdi-truck',
    'Bus': 'mdi-bus'
  }
  return iconos[tipoVehiculo || ''] || 'mdi-car'
}

// Nuevas funciones para manejo de grupos y relaciones
const getAcompanantesCount = (cedulaTitular: string): number => {
  // Buscar personas en el predio que no son el titular
  const acompanantesEnPredio = registroStore.personasDentro.filter(p => 
    p.cedula !== cedulaTitular
  )
  
  // Verificar que ingresaron al mismo tiempo que el titular
  const registroTitular = registroStore.registros.find(r => 
    r.tipo === 'ingreso' && r.persona.documento === cedulaTitular
  )
  
  if (registroTitular) {
    return acompanantesEnPredio.filter(acomp => {
      // Buscar si esta persona ingresó aproximadamente al mismo tiempo
      return Math.abs(
        acomp.ingresoTimestamp.getTime() - registroTitular.timestamp.getTime()
      ) < 60000 // Menos de 1 minuto de diferencia
    }).length
  }
  
  return 0
}

const getAcompanantesData = (cedulaTitular: string) => {
  // Buscar personas en el predio que no son el titular
  const acompanantesEnPredio = registroStore.personasDentro.filter(p => 
    p.cedula !== cedulaTitular
  )
  
  // Verificar que ingresaron al mismo tiempo que el titular
  const registroTitular = registroStore.registros.find(r => 
    r.tipo === 'ingreso' && r.persona.documento === cedulaTitular
  )
  
  if (registroTitular) {
    return acompanantesEnPredio.filter(acomp => {
      // Buscar si esta persona ingresó aproximadamente al mismo tiempo
      return Math.abs(
        acomp.ingresoTimestamp.getTime() - registroTitular.timestamp.getTime()
      ) < 60000 // Menos de 1 minuto de diferencia
    }).map(acomp => ({
      cedula: acomp.cedula,
      nombre: acomp.nombre,
      apellido: acomp.apellido,
      tipoVisitante: acomp.tipoVisitante,
      areaVisitar: acomp.areaVisitar
    }))
  }
  return []
}

const getVehiculoTitular = (cedulaAcompanante: string) => {
  // Buscar el registro de la persona acompañante para saber cuándo ingresó
  const personaAcompanante = registroStore.personasDentro.find(p => 
    p.cedula === cedulaAcompanante
  )
  
  if (!personaAcompanante) return null
  
  // Buscar registros de ingreso del mismo momento (con vehículo)
  const registrosConVehiculo = registroStore.registros.filter(r => 
    r.tipo === 'ingreso' && 
    r.vehiculo &&
    Math.abs(r.timestamp.getTime() - personaAcompanante.ingresoTimestamp.getTime()) < 60000
  )
  
  return registrosConVehiculo[0]?.vehiculo || null
}

const getNombreTitular = (cedulaAcompanante: string): string => {
  // Buscar el registro de la persona acompañante
  const personaAcompanante = registroStore.personasDentro.find(p => 
    p.cedula === cedulaAcompanante
  )
  
  if (!personaAcompanante) return 'Desconocido'
  
  // Buscar el registro principal del mismo momento
  const registroTitular = registroStore.registros.find(r => 
    r.tipo === 'ingreso' && 
    Math.abs(r.timestamp.getTime() - personaAcompanante.ingresoTimestamp.getTime()) < 60000 &&
    r.persona.documento !== cedulaAcompanante
  )
  
  if (registroTitular) {
    return `${registroTitular.persona.nombre} ${registroTitular.persona.apellido}`
  }
  return 'Desconocido'
}

// Métodos para manejo del modo edición
const activarModoEdicion = () => {
  mostrarEdicionSalida.value = true
  
  // Pre-llenar con datos del ingreso para que el usuario vea el estado actual
  if (personaSeleccionada.value?.conVehiculo) {
    const vehiculoIngreso = getVehiculoInfo(personaSeleccionada.value.cedula)
    if (vehiculoIngreso) {
      datosSalida.conVehiculo = true
      datosSalida.tipoVehiculo = vehiculoIngreso.tipo
      datosSalida.matricula = vehiculoIngreso.matricula
    }
  } else {
    // Si entró a pie, por defecto también sale a pie (usuario puede cambiar)
    datosSalida.conVehiculo = false
  }
  
  // ✅ Pre-cargar acompañantes: si ingresaron juntos, probablemente salgan juntos
  if (personaSeleccionada.value) {
    const acompanantes = getAcompanantesData(personaSeleccionada.value.cedula)
    datosSalida.acompanantesSalen = acompanantes.map(acomp => acomp.cedula)
    console.log('🔍 DEBUG activarModoEdicion - Acompañantes pre-marcados:', datosSalida.acompanantesSalen)
  }
}

const guardarEdicion = () => {
  // Aquí se podría agregar validación si es necesaria
  mostrarEdicionSalida.value = false
  
  // ✅ Actualizar la información mostrada en la card con los datos editados
  // Los datos están en datosSalida y se mostrarán actualizados en la vista de solo lectura
  // Esto proporciona feedback visual inmediato al usuario
  console.log('🔍 DEBUG guardarEdicion - Datos de salida actualizados:', {
    conVehiculo: datosSalida.conVehiculo,
    tipoVehiculo: datosSalida.tipoVehiculo, 
    matricula: datosSalida.matricula,
    acompanantesSalen: datosSalida.acompanantesSalen
  })
}

const cancelarEdicion = () => {
  mostrarEdicionSalida.value = false
  
  // Resetear a los valores originales
  datosSalida.conVehiculo = false
  datosSalida.tipoVehiculo = ''
  datosSalida.matricula = ''
  datosSalida.acompanantesSalen = []
}

const onCambioVehiculo = () => {
  if (!datosSalida.conVehiculo) {
    // Si desmarca "con vehículo", limpiar campos
    datosSalida.tipoVehiculo = ''
    datosSalida.matricula = ''
  } else {
    // Si vuelve a marcar "con vehículo", restaurar datos originales si existen
    if (personaSeleccionada.value?.conVehiculo) {
      const vehiculoOriginal = getVehiculoInfo(personaSeleccionada.value.cedula)
      if (vehiculoOriginal) {
        datosSalida.tipoVehiculo = vehiculoOriginal.tipo
        datosSalida.matricula = vehiculoOriginal.matricula
      }
    }
  }
}

const handleSubmit = async () => {
  if (!personaSeleccionada.value) {
    return
  }

  const submitData: RegistroSalidaData = {
    cedulaBuscada: personaSeleccionada.value.cedula,
    tiempoEstadia: calcularTiempoEstadiaEnMinutos(personaSeleccionada.value.ingresoTimestamp),
    observaciones: observaciones.value || undefined,
  }

  emit('submit', submitData)
}

const resetForm = () => {
  personaSeleccionada.value = null
  personaSeleccionadaItem.value = null
  observaciones.value = ''
  terminoBusqueda.value = ''
  mostrarEdicionSalida.value = false
  
  // Resetear datos de salida
  datosSalida.conVehiculo = false
  datosSalida.tipoVehiculo = ''
  datosSalida.matricula = ''
  datosSalida.acompanantesSalen = []
  
  formRef.value?.resetValidation()
}

// Exponer métodos y propiedades para el componente padre
defineExpose({
  submit: handleSubmit,
  resetForm,
  isFormValid,
  isEditingMode: computed(() => mostrarEdicionSalida.value)
})
</script>

<style scoped>
.form-section {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(var(--v-theme-warning), 0.2);
  padding-bottom: 0.5rem;
}

/* Estilos para el autocomplete personalizado */
.persona-autocomplete-item {
  border-bottom: 1px solid rgba(var(--v-theme-surface-variant), 0.2);
  transition: all 0.2s ease;
  min-height: 90px;
}

.persona-autocomplete-item:hover {
  background-color: rgba(var(--v-theme-warning), 0.06) !important;
  border-left: 3px solid rgb(var(--v-theme-warning));
}

.persona-autocomplete-item:last-child {
  border-bottom: none;
}

/* Avatar sutil */
.avatar-sutil {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.persona-autocomplete-item:hover .avatar-sutil {
  opacity: 1;
}

/* Layout de dos columnas */
.datos-personales {
  min-width: 0; /* Permite que flexbox maneje el texto largo */
}

.datos-vehiculo-tiempo {
  min-width: 120px;
  flex-shrink: 0;
}

/* Espaciado mejorado para chips */
.datos-personales .gap-1 {
  gap: 4px;
}

/* Estilos para información de vehículo */
.vehiculo-info {
  text-align: right;
}

.sin-vehiculo {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-style: italic;
}

/* Responsive para pantallas pequeñas */
@media (max-width: 600px) {
  .datos-vehiculo-tiempo {
    min-width: 100px;
  }
  
  .persona-autocomplete-item .pa-4 {
    padding: 12px !important;
  }
}
</style>
