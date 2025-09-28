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
        <template #item="{ props: itemProps, item, index }">
          <v-list-item
            v-bind="itemProps"
            :class="[
              'persona-autocomplete-item pa-4',
              index % 2 === 0 ? 'bg-grey-lighten-5' : 'bg-white'
            ]"
          >
            <!-- Avatar más sutil -->
            <template #prepend>
              <v-avatar color="grey-lighten-2" size="32" class="avatar-sutil">
                <v-icon color="grey-darken-1" size="16">mdi-account</v-icon>
              </v-avatar>
            </template>

            <!-- Título personalizado -->
            <template #title>
              <div class="d-flex justify-space-between align-start w-100">
                
                <!-- Columna izquierda: Datos personales -->
                <div class="datos-personales flex-grow-1 pr-4">
                  <!-- Nombre completo con cédula -->
                  <div class="text-subtitle-1 font-weight-bold mb-2">
                    {{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}
                    <span class="text-body-2 text-medium-emphasis font-weight-normal ml-2">
                      (C.I: {{ item.raw.persona.cedula }})
                    </span>
                  </div>

                <!-- Destino -->
                <div class="d-flex flex-wrap gap-1">
                  <v-chip 
                    color="info" 
                    variant="tonal" 
                    size="x-small"
                    prepend-icon="mdi-domain"
                  >
                    {{ item.raw.persona.destino }}
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
            </template>
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
import { useRegistroStore, type PersonaDentro, type RegistroIngreso, type DatosAcompanante } from '@/stores/registro'

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
const personaSeleccionadaItem = ref<{persona: PersonaDentro; displayText: string; searchText: string} | null>(null)
const observaciones = ref('')
const terminoBusqueda = ref('')
const mostrarEdicionSalida = ref(false)
const datosEditados = ref(false) // Indica si se han hecho ediciones

// ✅ NUEVO: Contexto completo del grupo
const grupoCompleto = ref<PersonaDentro[]>([])
const esGrupoVehiculo = ref(false)
const infoVehiculoGrupo = ref<{tipo: string; matricula: string} | null>(null)

// Estado de datos de salida editables
const datosSalida = reactive({
  conVehiculo: false,
  tipoVehiculo: '',
  matricula: '',
  acompanantesSalen: [] as string[],
  acompanantesAdicionales: [] as string[] // Nuevos acompañantes agregados manualmente
}) // Array de cédulas de acompañantes que salen

// Estado para búsqueda de acompañantes adicionales
const busquedaAcompanante = ref('')
const acompananteSeleccionado = ref<PersonaDentro | null>(null)

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

// ✅ CORREGIDO: Computed para el autocomplete con datos correctos
const personasParaSelect = computed(() => {
  return registroStore.personasDentro.map((persona) => {
    const vehiculoInfo = getVehiculoInfo(persona.cedula)
    const matricula = vehiculoInfo ? vehiculoInfo.matricula : ''
    
    return {
      displayText: `${persona.nombre} ${persona.apellido}`,
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
  
  return personasParaSelect.value.filter(item => {
    const persona = item.persona
    
    // Buscar por cédula (exacta o parcial)
    const coincideCedula = persona.cedula.includes(termino)
    
    if (coincideCedula) {
      return true
    }
    
    // Buscar por matrícula del vehículo (si tiene vehículo)
    const vehiculoInfo = getVehiculoInfo(persona.cedula)
    const matricula = vehiculoInfo?.matricula?.toLowerCase() || ''
    const coincideMatricula = matricula.includes(termino)
    
    if (vehiculoInfo && coincideMatricula) {
      return true
    }
    
    return false
  })
})

const isFormValid = computed(() => {
  return !!personaSeleccionada.value
})

// ✅ NUEVO: Datos computados que consideran las ediciones
const infoVehiculoActualizada = computed(() => {
  if (!datosEditados.value) {
    return infoVehiculoGrupo.value
  }
  
  // Si se editó y NO sale con vehículo, no mostrar info de vehículo
  if (!datosSalida.conVehiculo) {
    return null
  }
  
  // Si se editó Y sale con vehículo, mostrar datos editados
  return {
    tipo: datosSalida.tipoVehiculo || infoVehiculoGrupo.value?.tipo || '',
    matricula: datosSalida.matricula || infoVehiculoGrupo.value?.matricula || ''
  }
})

const acompanantesActualizados = computed(() => {
  if (!datosEditados.value) {
    return grupoCompleto.value.filter(p => p.cedula !== personaSeleccionada.value?.cedula)
  }
  
  // Acompañantes originales seleccionados
  const acompanantesOriginales = grupoCompleto.value.filter(p => 
    p.cedula !== personaSeleccionada.value?.cedula && 
    datosSalida.acompanantesSalen.includes(p.cedula)
  )
  
  // Acompañantes adicionales agregados manualmente
  const acompanantesExtras = registroStore.personasDentro.filter(p =>
    datosSalida.acompanantesAdicionales.includes(p.cedula)
  )
  
  // Combinar ambos grupos
  return [...acompanantesOriginales, ...acompanantesExtras]
})

const esGrupoVehiculoActualizado = computed(() => {
  if (!datosEditados.value) {
    return esGrupoVehiculo.value
  }
  
  return datosSalida.conVehiculo
})

// ✅ NUEVO: Personas disponibles para agregar como acompañantes adicionales
const personasDisponibles = computed(() => {
  if (!personaSeleccionada.value) return []
  
  return registroStore.personasDentro.filter(persona => {
    // Excluir la persona seleccionada
    if (persona.cedula === personaSeleccionada.value?.cedula) return false
    
    // Excluir personas que ya están en el grupo original
    const yaEstaEnGrupo = grupoCompleto.value.some(p => p.cedula === persona.cedula)
    if (yaEstaEnGrupo) return false
    
    // Excluir personas ya agregadas como acompañantes adicionales
    if (datosSalida.acompanantesAdicionales.includes(persona.cedula)) return false
    
    return true
  })
})

// NOTA: Código de filtrado de personas eliminado por no estar en uso

// Reglas de validación
const personaRules = [
  (v: PersonaDentro) => !!v || 'Debe seleccionar una persona para registrar la salida'
]

// La card es puramente informativa - sin detección automática de "descoordinaciones"
// El usuario decide si algo cambió y usa el botón "Editar Salida" cuando sea necesario

// Watcher para sincronizar la selección del autocomplete y cargar contexto del grupo
watch(personaSeleccionadaItem, (newItem) => {
  if (newItem && newItem.persona) {
    personaSeleccionada.value = newItem.persona
    
    // ✅ Resetear estado de edición al cambiar de persona
    datosEditados.value = false
    
    // ✅ NUEVO: Cargar automáticamente el contexto completo del grupo
    cargarContextoGrupoCompleto(newItem.persona.cedula)
  } else {
    personaSeleccionada.value = null
    grupoCompleto.value = []
    datosEditados.value = false
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

const getVehiculoInfo = (cedula: string) => {
  // ✅ CORREGIDO: Usar registrosRaw con estructura correcta
  const registro = registroStore.registrosRaw.find(r => 
    r.tipo === 'ingreso' && 
    (r as import('@/stores/registro').RegistroIngreso).datosPersonales?.cedula === cedula
  ) as import('@/stores/registro').RegistroIngreso | undefined
  
  // ✅ CORREGIDO: Acceder a datosVehiculo en lugar de vehiculo
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

// ✅ CORREGIDO: Funciones para manejo de grupos y relaciones con estructura actualizada
const getAcompanantesCount = (cedulaTitular: string): number => {
  // ✅ MEJORADO: Usar método del store que ya maneja acompañantes correctamente
  const acompanantesData = registroStore.getAcompanantesData(cedulaTitular)
  return acompanantesData ? acompanantesData.length : 0
}

// ✅ NUEVO: Cargar contexto completo del grupo automáticamente
const cargarContextoGrupoCompleto = (cedulaSeleccionada: string) => {
  const personasEnPredio = registroStore.personasDentro
  
  // Encontrar si la persona seleccionada tiene vehículo (es titular)
  const vehiculoTitular = getVehiculoInfo(cedulaSeleccionada)
  
  if (vehiculoTitular) {
    // Es titular de vehículo - mostrar grupo completo
    const acompanantes = getAcompanantesData(cedulaSeleccionada)
    const personaSeleccionadaObj = personasEnPredio.find(p => p.cedula === cedulaSeleccionada)
    
    if (personaSeleccionadaObj) {
      grupoCompleto.value = [personaSeleccionadaObj, ...acompanantes]
      infoVehiculoGrupo.value = vehiculoTitular
      esGrupoVehiculo.value = true
    }
  } else {
    // Verificar si es acompañante de algún vehículo
    const titularInfo = getVehiculoTitular(cedulaSeleccionada)
    
    if (titularInfo) {
      // Es acompañante - mostrar grupo del titular
      const titularCompleto = personasEnPredio.find(p => 
        getVehiculoInfo(p.cedula)?.matricula === titularInfo.matricula
      )
      
      if (titularCompleto) {
        const otrosAcompanantes = getAcompanantesData(titularCompleto.cedula)
        const personaSeleccionadaObj = personasEnPredio.find(p => p.cedula === cedulaSeleccionada)
        
        if (personaSeleccionadaObj) {
          // Reorganizar para mostrar el seleccionado primero, luego titular, luego otros acompañantes
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
      // Persona sola (sin vehículo)
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
  // ✅ CORREGIDO: Buscar directamente en registrosRaw el registro de ingreso del titular
  const registroTitular = registroStore.registrosRaw.find(r => 
    r.tipo === 'ingreso' && 
    (r as RegistroIngreso).datosPersonales?.cedula === cedulaTitular
  ) as RegistroIngreso | undefined
  
  if (!registroTitular || !registroTitular.acompanantes) {
    return []
  }
  
  // Convertir acompañantes del registro a formato PersonaDentro
  return registroTitular.acompanantes.map((acomp: DatosAcompanante) => ({
    cedula: acomp.cedula,
    nombre: acomp.nombre,
    apellido: acomp.apellido,
    destino: acomp.destino,
    ingresoTimestamp: new Date(registroTitular.timestamp), // Mismo timestamp del titular
    conVehiculo: false // Acompañantes no manejan vehículo
  }))
}

const getVehiculoTitular = (cedulaAcompanante: string) => {
  // Buscar el registro de la persona acompañante para saber cuándo ingresó
  const personaAcompanante = registroStore.personasDentro.find(p => 
    p.cedula === cedulaAcompanante
  )
  
  if (!personaAcompanante) return null
  
  // ✅ CORREGIDO: Buscar registros de ingreso del mismo momento (con vehículo) usando estructura correcta
  const registrosConVehiculo = registroStore.registrosRaw.filter(r => 
    r.tipo === 'ingreso' && 
    (r as import('@/stores/registro').RegistroIngreso).datosVehiculo &&
    Math.abs(r.timestamp.getTime() - personaAcompanante.ingresoTimestamp.getTime()) < 60000
  ) as import('@/stores/registro').RegistroIngreso[]
  
  return registrosConVehiculo[0]?.datosVehiculo || null
}

const getNombreTitular = (cedulaAcompanante: string): string => {
  // Buscar el registro de la persona acompañante
  const personaAcompanante = registroStore.personasDentro.find(p => 
    p.cedula === cedulaAcompanante
  )
  
  if (!personaAcompanante) return 'Desconocido'
  
  // ✅ CORREGIDO: Buscar el registro principal del mismo momento usando estructura correcta
  const registroTitular = registroStore.registrosRaw.find(r => 
    r.tipo === 'ingreso' && 
    Math.abs(r.timestamp.getTime() - personaAcompanante.ingresoTimestamp.getTime()) < 60000 &&
    (r as import('@/stores/registro').RegistroIngreso).datosPersonales?.cedula !== cedulaAcompanante
  ) as import('@/stores/registro').RegistroIngreso | undefined
  
  if (registroTitular) {
    return `${registroTitular.datosPersonales.nombre} ${registroTitular.datosPersonales.apellido}`
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
    datosSalida.acompanantesSalen = acompanantes.map((acomp: PersonaDentro) => acomp.cedula)
  }
}

const guardarEdicion = () => {
  // Validación básica
  if (datosSalida.conVehiculo && (!datosSalida.tipoVehiculo || !datosSalida.matricula)) {
    // Mostrar error si dice que sale con vehículo pero no especifica los datos
    return
  }
  
  // ✅ Marcar como editado para activar las propiedades computadas
  datosEditados.value = true
  
  // Salir del modo edición
  mostrarEdicionSalida.value = false
  
  // Los datos se actualizan automáticamente a través de las propiedades computadas
  // infoVehiculoActualizada, acompanantesActualizados, etc.
}

const cancelarEdicion = () => {
  mostrarEdicionSalida.value = false
  
  // ✅ Resetear flag de edición para volver a mostrar datos originales
  datosEditados.value = false
  
  // Resetear a los valores originales
  datosSalida.conVehiculo = false
  datosSalida.tipoVehiculo = ''
  datosSalida.matricula = ''
  datosSalida.acompanantesSalen = []
  datosSalida.acompanantesAdicionales = []
  
  // Limpiar búsqueda
  busquedaAcompanante.value = ''
  acompananteSeleccionado.value = null
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

// ✅ NUEVO: Funciones para manejo de acompañantes adicionales
const agregarAcompanante = (persona: PersonaDentro) => {
  if (!datosSalida.acompanantesAdicionales.includes(persona.cedula)) {
    datosSalida.acompanantesAdicionales.push(persona.cedula)
    datosEditados.value = true
    
    // Limpiar búsqueda
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

// NOTA: Función de selección de persona eliminada por no estar en uso

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
