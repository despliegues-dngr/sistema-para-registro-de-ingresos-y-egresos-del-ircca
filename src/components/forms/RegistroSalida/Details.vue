<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="personaSeleccionada" class="form-section mt-6">
    <v-card variant="outlined">
      <!-- Botones de acción flotantes -->
      <div class="action-buttons">
        <div v-if="!mostrarEdicionSalida">
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            prepend-icon="mdi-pencil"
            @click="activarModoEdicion"
          >
            Editar
          </v-btn>
        </div>

        <div v-else class="d-flex gap-2">
          <v-btn
            color="success"
            variant="tonal"
            size="small"
            prepend-icon="mdi-check"
            @click="guardarEdicion"
          >
            Guardar
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            size="small"
            prepend-icon="mdi-close"
            @click="cancelarEdicion"
          >
            Cancelar
          </v-btn>
        </div>
      </div>

      <v-card-text class="pa-4 pt-5">
        <!-- Información principal de la persona -->
        <persona-info-card :persona="personaSeleccionada" />

        <!-- Sección de Vehículo -->
        <vehiculo-section
          :modo-edicion="mostrarEdicionSalida"
          :info-vehiculo="infoVehiculoActualizada"
          :info-vehiculo-original="infoVehiculoGrupo"
          v-model:con-vehiculo="datosSalida.conVehiculo"
          v-model:tipo-vehiculo="datosSalida.tipoVehiculo"
          v-model:matricula="datosSalida.matricula"
        />

        <!-- Sección de Acompañantes -->
        <acompanantes-section
          :modo-edicion="mostrarEdicionSalida"
          :acompanantes="acompanantesActualizados"
          :acompanantes-originales="getAcompanantesDataArray(personaSeleccionada.cedula)"
          v-model:acompanantes-salen="datosSalida.acompanantesSalen"
          :acompanantes-adicionales="datosSalida.acompanantesAdicionales"
          :personas-disponibles="personasDisponiblesComputed"
          v-model:busqueda="busquedaAcompanante"
          @agregar-acompanante="agregarAcompanante"
          @remover-acompanante="removerAcompanante"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRegistroStore, type PersonaDentro, type RegistroIngreso, type DatosAcompanante } from '@/stores/registro'
import PersonaInfoCard from './PersonaInfoCard.vue'
import VehiculoSection from './VehiculoSection.vue'
import AcompanantesSection from './AcompanantesSection.vue'

const props = defineProps<{
  personaSeleccionada: PersonaDentro | null
}>()

const registroStore = useRegistroStore()

// Estado principal
const mostrarEdicionSalida = ref(false)
const datosEditados = ref(false)

// Contexto del grupo completo
const grupoCompleto = ref<PersonaDentro[]>([])
const esGrupoVehiculo = ref(false)
const infoVehiculoGrupo = ref<{tipo: string; matricula: string} | null>(null)

// Datos de edición
const datosSalida = reactive({
  conVehiculo: false,
  tipoVehiculo: '',
  matricula: '',
  acompanantesSalen: [] as string[],
  acompanantesAdicionales: [] as string[]
})

// Búsqueda de acompañantes
const busquedaAcompanante = ref('')

// Computados
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

const personasDisponiblesComputed = computed(() => {
  if (!props.personaSeleccionada) return []

  return registroStore.personasDentro.filter(persona => {
    if (persona.cedula === props.personaSeleccionada?.cedula) return false
    const yaEstaEnGrupo = grupoCompleto.value.some(p => p.cedula === persona.cedula)
    if (yaEstaEnGrupo) return false
    if (datosSalida.acompanantesAdicionales.includes(persona.cedula)) return false
    return true
  })
})

// Watchers
watch(() => props.personaSeleccionada, (newPersona) => {
  if (newPersona) {
    datosEditados.value = false
    cargarContextoGrupoCompleto(newPersona.cedula)
  } else {
    grupoCompleto.value = []
    datosEditados.value = false
  }
})

// Helper methods
const getVehiculoInfo = (cedula: string) => {
  const registro = registroStore.registrosRaw.find(r =>
    r.tipo === 'ingreso' &&
    (r as RegistroIngreso).datosPersonales?.cedula === cedula
  ) as RegistroIngreso | undefined
  return registro?.datosVehiculo || null
}

const getAcompanantesData = (cedulaTitular: string): PersonaDentro[] => {
  const registroTitular = registroStore.registrosRaw.find(r =>
    r.tipo === 'ingreso' &&
    (r as RegistroIngreso).datosPersonales?.cedula === cedulaTitular
  ) as RegistroIngreso | undefined

  if (!registroTitular || !registroTitular.acompanantes) {
    return []
  }

  return registroTitular.acompanantes.map((acomp: DatosAcompanante): PersonaDentro => ({
    cedula: acomp.cedula,
    nombre: acomp.nombre,
    apellido: acomp.apellido,
    destino: acomp.destino,
    ingresoTimestamp: new Date(registroTitular.timestamp),
    conVehiculo: !!registroTitular.datosVehiculo,
    tipoVehiculo: registroTitular.datosVehiculo?.tipo,
    esAcompanante: true
  }))
}

const getAcompanantesDataArray = (cedula: string): PersonaDentro[] => {
  return getAcompanantesData(cedula)
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

// Acciones de edición
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
}

const agregarAcompanante = (persona: PersonaDentro) => {
  if (!datosSalida.acompanantesAdicionales.includes(persona.cedula)) {
    datosSalida.acompanantesAdicionales.push(persona.cedula)
    datosEditados.value = true
    busquedaAcompanante.value = ''
  }
}

const removerAcompanante = (cedula: string) => {
  const index = datosSalida.acompanantesAdicionales.indexOf(cedula)
  if (index > -1) {
    datosSalida.acompanantesAdicionales.splice(index, 1)
    datosEditados.value = true
  }
}

// Método expuesto al componente padre
const getDatosEditados = () => {
  if (!datosEditados.value) {
    return null
  }

  return {
    datosVehiculoSalida: datosSalida.conVehiculo ? {
      tipo: datosSalida.tipoVehiculo,
      matricula: datosSalida.matricula
    } : undefined,
    acompanantesSalida: [
      ...datosSalida.acompanantesSalen,
      ...datosSalida.acompanantesAdicionales
    ]
  }
}

defineExpose({
  getDatosEditados,
  datosEditados
})
</script>

<style scoped>
.form-section {
  margin-bottom: 1rem;
  position: relative;
}

.action-buttons {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}
</style>
