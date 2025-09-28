<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="personaSeleccionada" class="form-section mt-6">
    <v-card variant="outlined">
      <!-- Header de la card -->
      <v-card-title class="bg-warning text-white pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon size="24" class="mr-3">mdi-exit-to-app</v-icon>
            <div>
              <h3 class="text-h6 mb-0">Registro de Salida</h3>
              <p class="text-caption mb-0">Confirmar información y proceder con el registro</p>
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
        
        <!-- ✅ NUEVO: Información principal reorganizada -->
        <div class="persona-principal-info mb-4">
          <v-card color="primary" variant="tonal" class="mb-3">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-2">
                    <v-icon size="20" color="primary" class="mr-2">mdi-account-circle</v-icon>
                    <span class="text-h6 font-weight-bold text-primary">
                      {{ personaSeleccionada.nombre }} {{ personaSeleccionada.apellido }}
                    </span>
                  </div>
                  
                  <div class="d-flex align-center gap-3 mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="14" color="primary" class="mr-1">mdi-card-account-details</v-icon>
                      <span class="text-body-2">{{ personaSeleccionada.cedula }}</span>
                    </div>
                    
                    <div class="d-flex align-center">
                      <v-icon size="14" color="primary" class="mr-1">mdi-domain</v-icon>
                      <span class="text-body-2">{{ personaSeleccionada.destino }}</span>
                    </div>
                    
                    <div class="d-flex align-center">
                      <v-icon size="14" color="primary" class="mr-1">mdi-timer</v-icon>
                      <span class="text-body-2">{{ calcularTiempoEstadia(personaSeleccionada.ingresoTimestamp) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- ✅ Información del vehículo (solo en vista previa, no en edición) -->
        <div v-if="!mostrarEdicionSalida && esGrupoVehiculoActualizado && infoVehiculoActualizada" class="vehiculo-info mb-4">
          <v-card color="warning" variant="tonal" density="compact">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon size="18" color="warning" class="mr-2">{{ getVehiculoIcon(infoVehiculoActualizada.tipo) }}</v-icon>
                  <span class="text-subtitle-2 font-weight-medium">
                    {{ infoVehiculoActualizada.tipo }} - {{ infoVehiculoActualizada.matricula }}
                  </span>
                </div>
                
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- ✅ NUEVO: Sección de Edición de Salida (reemplaza todo cuando se está editando) -->
        <div v-if="mostrarEdicionSalida" class="seccion-edicion">

          <!-- Sección del Vehículo -->
          <div v-if="infoVehiculoGrupo" class="mb-4">
            <h4 class="text-subtitle-2 mb-3 d-flex align-center">
              <v-icon size="16" class="mr-2">mdi-car</v-icon>
              <span>Vehículo</span>
            </h4>
            
            <v-card variant="outlined" density="compact" class="mb-3">
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div class="flex-grow-1">
                    <div class="d-flex align-center">
                      <v-icon size="14" color="warning" class="mr-2">
                        {{ getVehiculoIcon(infoVehiculoGrupo.tipo) }}
                      </v-icon>
                      <span class="text-body-2 font-weight-medium">
                        {{ infoVehiculoGrupo.tipo }} - {{ infoVehiculoGrupo.matricula }}
                      </span>
                    </div>
                  </div>
                  
                  <v-checkbox
                    v-model="datosSalida.conVehiculo"
                    color="primary"
                    density="compact"
                    hide-details
                    @update:model-value="onCambioVehiculo"
                  />
                </div>
              </v-card-text>
            </v-card>
            
            <!-- Campos editables del vehículo -->
            <div v-if="datosSalida.conVehiculo" class="mt-5">
              <v-row>
                <v-col cols="6">
                  <v-select
                    v-model="datosSalida.tipoVehiculo"
                    label="Tipo de Vehículo"
                    :items="tiposVehiculo"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-car"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="datosSalida.matricula"
                    label="Matrícula"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-card-text"
                    hint="ABC1234"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- Sección de Acompañantes -->
          <div v-if="grupoCompleto.length > 1" class="mb-4">
            <h4 class="text-subtitle-2 mb-3 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon size="16" class="mr-2">mdi-account-multiple</v-icon>
                <span>Acompañantes</span>
              </div>
              <v-chip size="x-small" color="warning" variant="tonal">
                Seleccione quiénes salen junto con {{ personaSeleccionada?.nombre }}
              </v-chip>
            </h4>
            
            <!-- Lista de acompañantes del grupo para seleccionar -->
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

            <!-- Acompañantes adicionales agregados manualmente (mismo formato) -->
            <div v-for="cedula in datosSalida.acompanantesAdicionales" :key="`adicional-${cedula}`" class="mb-3">
              <v-card variant="outlined" density="compact" color="success">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="flex-grow-1">
                      <div class="d-flex align-center mb-1">
                        <v-icon size="14" color="success" class="mr-2">mdi-account-plus</v-icon>
                        <span class="text-body-2 font-weight-medium">
                          {{ registroStore.personasDentro.find(p => p.cedula === cedula)?.nombre }} 
                          {{ registroStore.personasDentro.find(p => p.cedula === cedula)?.apellido }}
                        </span>
                        <v-chip size="x-small" color="success" variant="outlined" class="ml-2">
                          Agregado
                        </v-chip>
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        C.I: {{ cedula }}
                      </div>
                    </div>
                    
                    <v-btn
                      icon="mdi-close"
                      size="x-small"
                      color="error"
                      variant="text"
                      @click="removerAcompanante(cedula)"
                    />
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Buscador para agregar acompañantes adicionales -->
            <div class="mt-4">
                <h4 class="text-subtitle-2 mb-3 d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-account-plus</v-icon>
                  <span>Agregar Acompañantes Adicionales</span>
                </h4>
                
                <!-- Buscador de personas -->
                <v-autocomplete
                  v-model="acompananteSeleccionado"
                  v-model:search="busquedaAcompanante"
                  :items="personasDisponibles"
                  item-title="nombre"
                  item-value="cedula"
                  label="Buscar persona por nombre, apellido o cédula"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                  :custom-filter="() => true"
                  no-filter
                >
                  <template #item="{ props: itemProps, item, index }">
                    <v-list-item
                      v-bind="itemProps"
                      :class="[
                        'pa-2',
                        index % 2 === 0 ? 'bg-grey-lighten-5' : 'bg-white'
                      ]"
                      @click="agregarAcompanante(item.raw)"
                    >
                      <template #prepend>
                        <v-avatar color="success" size="24">
                          <v-icon color="white" size="12">mdi-account-plus</v-icon>
                        </v-avatar>
                      </template>
                      
                      <template #title>
                        <span class="text-body-2 font-weight-medium">
                          {{ item.raw.nombre }} {{ item.raw.apellido }}
                        </span>
                      </template>
                      
                      <template #subtitle>
                        <span class="text-body-2 text-medium-emphasis">
                          C.I: {{ item.raw.cedula }} • {{ item.raw.destino }}
                        </span>
                      </template>
                    </v-list-item>
                  </template>
                  
                  <template #no-data>
                    <div class="pa-4 text-center text-medium-emphasis">
                      <v-icon class="mb-2">mdi-account-search</v-icon>
                      <div class="text-body-2">
                        {{ busquedaAcompanante ? 'No se encontraron personas' : 'Escriba para buscar personas disponibles' }}
                      </div>
                    </div>
                  </template>
                </v-autocomplete>
                
                <!-- Lista de acompañantes adicionales agregados -->
                <div v-if="datosSalida.acompanantesAdicionales.length > 0" class="mt-3">
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    Acompañantes adicionales agregados:
                  </div>
                  <div v-for="cedula in datosSalida.acompanantesAdicionales" :key="cedula" class="mb-2">
                    <v-card variant="outlined" density="compact" color="success">
                      <v-card-text class="pa-2 d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon size="14" color="success" class="mr-2">mdi-account-plus</v-icon>
                          <span class="text-body-2 font-weight-medium">
                            {{ registroStore.personasDentro.find(p => p.cedula === cedula)?.nombre }} 
                            {{ registroStore.personasDentro.find(p => p.cedula === cedula)?.apellido }}
                          </span>
                          <span class="text-body-2 text-medium-emphasis ml-2">
                            ({{ cedula }})
                          </span>
                        </div>
                        
                        <v-btn
                          icon="mdi-close"
                          size="x-small"
                          color="error"
                          variant="text"
                          @click="removerAcompanante(cedula)"
                        />
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
            </div>

            <!-- Chip de resumen -->
            <div class="mt-4">
              <v-chip
                v-if="datosSalida.acompanantesSalen.length === 0 && datosSalida.acompanantesAdicionales.length === 0"
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
                Salen {{ datosSalida.acompanantesSalen.length + datosSalida.acompanantesAdicionales.length + 1 }} personas
              </v-chip>
            </div>
          </div>
        </div>

        <!-- ✅ Sección de Vista Previa (solo cuando NO se está editando) -->
        <div v-else>
          <!-- Acompañantes (solo si existen) -->
          <div v-if="acompanantesActualizados.length > 0">
            <h4 class="text-subtitle-2 mb-3 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon size="16" class="mr-2">mdi-account-multiple</v-icon>
                <span>Acompañantes</span>
              </div>
              <v-chip size="x-small" color="success" variant="tonal">
                {{ acompanantesActualizados.length }} {{ acompanantesActualizados.length === 1 ? 'persona' : 'personas' }}
              </v-chip>
            </h4>
            
            <div v-for="persona in acompanantesActualizados" :key="persona.cedula" class="acompanante-info mb-3">
              <v-card variant="outlined" density="compact" color="success">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="flex-grow-1">
                      <div class="d-flex align-center mb-1">
                        <v-icon size="14" color="success" class="mr-2">mdi-account</v-icon>
                        <span class="text-body-2 font-weight-medium">
                          {{ persona.nombre }} {{ persona.apellido }}
                        </span>
                      </div>
                      
                      <div class="d-flex align-center gap-3 ml-4">
                        <div class="d-flex align-center">
                          <v-icon size="12" color="grey" class="mr-1">mdi-card-account-details</v-icon>
                          <span class="text-body-2 text-medium-emphasis">{{ persona.cedula }}</span>
                        </div>
                        
                        <div class="d-flex align-center">
                          <v-icon size="12" color="grey" class="mr-1">mdi-domain</v-icon>
                          <span class="text-body-2 text-medium-emphasis">{{ persona.destino }}</span>
                        </div>
                        
                        <div class="d-flex align-center">
                          <v-icon size="12" color="grey" class="mr-1">mdi-timer</v-icon>
                          <span class="text-body-2 text-medium-emphasis">{{ calcularTiempoEstadia(persona.ingresoTimestamp) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// Component: RegistroSalidaDetails (renombrado para cumplir regla multi-word)
import { ref, computed, reactive, watch } from 'vue'
import { useRegistroStore, type PersonaDentro, type RegistroIngreso, type DatosAcompanante } from '@/stores/registro'

const props = defineProps<{
  personaSeleccionada: PersonaDentro | null
}>()

const registroStore = useRegistroStore()

const mostrarEdicionSalida = ref(false)
const datosEditados = ref(false)

const grupoCompleto = ref<PersonaDentro[]>([])
const esGrupoVehiculo = ref(false)
const infoVehiculoGrupo = ref<{tipo: string; matricula: string} | null>(null)

const datosSalida = reactive({
  conVehiculo: false,
  tipoVehiculo: '',
  matricula: '',
  acompanantesSalen: [] as string[],
  acompanantesAdicionales: [] as string[]
})

const busquedaAcompanante = ref('')
const acompananteSeleccionado = ref<PersonaDentro | null>(null)

const tiposVehiculo = ['Auto', 'Moto', 'Camión', 'Bus']

const infoVehiculoActualizada = computed(() => {
  if (!datosEditados.value) {
    return infoVehiculoGrupo.value
  }
  if (!datosSalida.conVehiculo) {
    return null
  }
  return {
    tipo: datosSalida.tipoVehiculo || infoVehiculoGrupo.value?.tipo || '',
    matricula: datosSalida.matricula || infoVehiculoGrupo.value?.matricula || ''
  }
})

const acompanantesActualizados = computed(() => {
  if (!datosEditados.value) {
    return grupoCompleto.value.filter(p => p.cedula !== props.personaSeleccionada?.cedula)
  }
  
  const acompanantesOriginales = grupoCompleto.value.filter(p => 
    p.cedula !== props.personaSeleccionada?.cedula && 
    datosSalida.acompanantesSalen.includes(p.cedula)
  )
  
  const acompanantesExtras = registroStore.personasDentro.filter(p =>
    datosSalida.acompanantesAdicionales.includes(p.cedula)
  )
  
  return [...acompanantesOriginales, ...acompanantesExtras]
})

const esGrupoVehiculoActualizado = computed(() => {
  if (!datosEditados.value) {
    return esGrupoVehiculo.value
  }
  return datosSalida.conVehiculo
})

const personasDisponibles = computed(() => {
  if (!props.personaSeleccionada) return []
  
  return registroStore.personasDentro.filter(persona => {
    if (persona.cedula === props.personaSeleccionada?.cedula) return false
    const yaEstaEnGrupo = grupoCompleto.value.some(p => p.cedula === persona.cedula)
    if (yaEstaEnGrupo) return false
    if (datosSalida.acompanantesAdicionales.includes(persona.cedula)) return false
    return true
  })
})

watch(() => props.personaSeleccionada, (newPersona) => {
  if (newPersona) {
    datosEditados.value = false
    cargarContextoGrupoCompleto(newPersona.cedula)
  } else {
    grupoCompleto.value = []
    datosEditados.value = false
  }
})

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

const getVehiculoInfo = (cedula: string) => {
  const registro = registroStore.registrosRaw.find(r => 
    r.tipo === 'ingreso' && 
    (r as RegistroIngreso).datosPersonales?.cedula === cedula
  ) as RegistroIngreso | undefined
  return registro?.datosVehiculo || null
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

const cargarContextoGrupoCompleto = (cedulaSeleccionada: string) => {
  const personasEnPredio = registroStore.personasDentro
  const vehiculoTitular = getVehiculoInfo(cedulaSeleccionada)
  
  if (vehiculoTitular) {
    const acompanantes = getAcompanantesData(cedulaSeleccionada)
    const personaSeleccionadaObj = personasEnPredio.find(p => p.cedula === cedulaSeleccionada)
    if (personaSeleccionadaObj) {
      grupoCompleto.value = [personaSeleccionadaObj, ...acompanantes]
      infoVehiculoGrupo.value = vehiculoTitular
      esGrupoVehiculo.value = true
    }
  } else {
    const titularInfo = getVehiculoTitular(cedulaSeleccionada)
    if (titularInfo) {
      const titularCompleto = personasEnPredio.find(p => 
        getVehiculoInfo(p.cedula)?.matricula === titularInfo.matricula
      )
      if (titularCompleto) {
        const otrosAcompanantes = getAcompanantesData(titularCompleto.cedula)
        const personaSeleccionadaObj = personasEnPredio.find(p => p.cedula === cedulaSeleccionada)
        if (personaSeleccionadaObj) {
          grupoCompleto.value = [
            personaSeleccionadaObj,
            titularCompleto,
            ...otrosAcompanantes.filter((a: PersonaDentro) => a.cedula !== cedulaSeleccionada)
          ]
          infoVehiculoGrupo.value = titularInfo
          esGrupoVehiculo.value = true
        }
      }
    } else {
      const personaSeleccionadaObj = personasEnPredio.find(p => p.cedula === cedulaSeleccionada)
      if (personaSeleccionadaObj) {
        grupoCompleto.value = [personaSeleccionadaObj]
        infoVehiculoGrupo.value = null
        esGrupoVehiculo.value = false
      }
    }
  }
}

const getAcompanantesData = (cedulaTitular: string) => {
  const registroTitular = registroStore.registrosRaw.find(r => 
    r.tipo === 'ingreso' && 
    (r as RegistroIngreso).datosPersonales?.cedula === cedulaTitular
  ) as RegistroIngreso | undefined
  
  if (!registroTitular || !registroTitular.acompanantes) {
    return []
  }
  
  return registroTitular.acompanantes.map((acomp: DatosAcompanante) => ({
    cedula: acomp.cedula,
    nombre: acomp.nombre,
    apellido: acomp.apellido,
    destino: acomp.destino,
    ingresoTimestamp: new Date(registroTitular.timestamp),
    conVehiculo: false
  }))
}

const getVehiculoTitular = (cedulaAcompanante: string) => {
  const personaAcompanante = registroStore.personasDentro.find(p => p.cedula === cedulaAcompanante)
  if (!personaAcompanante) return null
  const registrosConVehiculo = registroStore.registrosRaw.filter(r => 
    r.tipo === 'ingreso' && 
    (r as RegistroIngreso).datosVehiculo &&
    Math.abs(r.timestamp.getTime() - personaAcompanante.ingresoTimestamp.getTime()) < 60000
  ) as RegistroIngreso[]
  return registrosConVehiculo[0]?.datosVehiculo || null
}

const activarModoEdicion = () => {
  mostrarEdicionSalida.value = true
  if (props.personaSeleccionada?.conVehiculo) {
    const vehiculoIngreso = getVehiculoInfo(props.personaSeleccionada.cedula)
    if (vehiculoIngreso) {
      datosSalida.conVehiculo = true
      datosSalida.tipoVehiculo = vehiculoIngreso.tipo
      datosSalida.matricula = vehiculoIngreso.matricula
    }
  } else {
    datosSalida.conVehiculo = false
  }
  if (props.personaSeleccionada) {
    const acompanantes = getAcompanantesData(props.personaSeleccionada.cedula)
    datosSalida.acompanantesSalen = acompanantes.map((acomp: PersonaDentro) => acomp.cedula)
  }
}

const guardarEdicion = () => {
  if (datosSalida.conVehiculo && (!datosSalida.tipoVehiculo || !datosSalida.matricula)) {
    return
  }
  datosEditados.value = true
  mostrarEdicionSalida.value = false
}

const cancelarEdicion = () => {
  mostrarEdicionSalida.value = false
  datosEditados.value = false
  datosSalida.conVehiculo = false
  datosSalida.tipoVehiculo = ''
  datosSalida.matricula = ''
  datosSalida.acompanantesSalen = []
  datosSalida.acompanantesAdicionales = []
  busquedaAcompanante.value = ''
  acompananteSeleccionado.value = null
}

const onCambioVehiculo = () => {
  if (!datosSalida.conVehiculo) {
    datosSalida.tipoVehiculo = ''
    datosSalida.matricula = ''
  } else {
    if (props.personaSeleccionada?.conVehiculo) {
      const vehiculoOriginal = getVehiculoInfo(props.personaSeleccionada.cedula)
      if (vehiculoOriginal) {
        datosSalida.tipoVehiculo = vehiculoOriginal.tipo
        datosSalida.matricula = vehiculoOriginal.matricula
      }
    }
  }
}

const agregarAcompanante = (persona: PersonaDentro) => {
  if (!datosSalida.acompanantesAdicionales.includes(persona.cedula)) {
    datosSalida.acompanantesAdicionales.push(persona.cedula)
    datosEditados.value = true
    busquedaAcompanante.value = ''
    acompananteSeleccionado.value = null
  }
}

const removerAcompanante = (cedula: string) => {
  const index = datosSalida.acompanantesAdicionales.indexOf(cedula)
  if (index > -1) {
    datosSalida.acompanantesAdicionales.splice(index, 1)
    datosEditados.value = true
  }
}
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
</style>
