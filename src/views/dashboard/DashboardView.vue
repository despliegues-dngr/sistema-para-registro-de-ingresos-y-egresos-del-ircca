<template>
  <v-container fluid class="pa-6">
    <!-- Header de bienvenida con tiempo real -->
    <WelcomeHeader
      @view-profile="handleViewProfile"
      @edit-profile="handleEditProfile"
      @change-password="handleChangePassword"
      @logout="handleLogout"
    />

    <!-- Estadísticas principales -->
    <v-row class="mb-8">
      <!-- Card de Personas y Actividad - Primera -->
      <v-col cols="12" lg="4" class="mb-4 mb-lg-0">
        <PeopleStatsCard 
          :people-data="peopleData" 
          @personas-dentro-click="handlePersonasDentroClick"
          @ingresos-hoy-click="handleIngresosHoyClick"
          @salidas-hoy-click="handleSalidasHoyClick"
        />
      </v-col>

      <!-- Card de Vehículos Detallada - Segunda -->
      <v-col cols="12" lg="8">
        <VehicleStatsCard 
          :vehicle-data="vehicleData" 
          @vehicle-click="handleVehicleClick"
        />
      </v-col>
    </v-row>

    <!-- Botones de Acción Rápida -->
    <ActionButtons
      @registro-ingreso="handleRegistroIngreso"
      @registro-salida="handleRegistroSalida"
    />

    <!-- Modales de Registro -->
    <RegistroIngresoDialog
      v-model="showRegistroIngreso"
      @success="handleRegistroIngresoSuccess"
      @close="handleDialogClose"
    />

    <RegistroSalidaDialog
      v-model="showRegistroSalida"
      @success="handleRegistroSalidaSuccess"
      @close="handleDialogClose"
    />

    <!-- Diálogo de timeout de sesión -->
    <SessionTimeoutDialog
      v-model="showTimeoutWarning"
      :remaining-time="timeoutRemainingTime"
      @extend="handleExtendSession"
      @logout="handleSessionTimeout"
    />

    <!-- Modales para mostrar datos detallados -->
    <DataListModal
      v-model="showPersonasDentroModal"
      title="Personas Dentro del Predio"
      header-icon="mdi-account-multiple"
      data-type="personas"
      :data="personasDentroData"
      empty-title="No hay personas dentro"
      empty-subtitle="Actualmente no hay personas registradas en el predio"
      empty-icon="mdi-account-off"
    />

    <DataListModal
      v-model="showIngresosHoyModal"
      title="Ingresos de Hoy"
      header-icon="mdi-login"
      header-color="success"
      data-type="personas"
      :data="ingresosHoyData"
      empty-title="Sin ingresos hoy"
      empty-subtitle="No se han registrado ingresos el día de hoy"
      empty-icon="mdi-login-variant"
    />

    <DataListModal
      v-model="showSalidasHoyModal"
      title="Salidas de Hoy"
      header-icon="mdi-logout"
      header-color="warning"
      data-type="personas"
      :data="salidasHoyData"
      empty-title="Sin salidas hoy"
      empty-subtitle="No se han registrado salidas el día de hoy"
      empty-icon="mdi-logout-variant"
    />

    <DataListModal
      v-model="showVehiculosModal"
      :title="vehicleModalTitle"
      :header-icon="vehicleModalIcon"
      :header-color="vehicleModalHeaderColor"
      data-type="vehiculos"
      :data="vehiculosData"
      empty-title="Sin vehículos"
      :empty-subtitle="vehicleModalEmptySubtitle"
      :empty-icon="vehicleModalEmptyIcon"
    />

    <!-- Pie de página gubernamental -->
    <DashboardFooter />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRegistroStore, type RegistroIngreso } from '@/stores/registro'
import { useSessionTimeout } from '@/composables/useSessionTimeout'

// Componentes del Dashboard - Todos necesarios y en uso
import WelcomeHeader from '@/components/dashboard/WelcomeHeader.vue' // Header con avatar y menú
import VehicleStatsCard from '@/components/dashboard/VehicleStatsCard.vue' // Para estadísticas detalladas de vehículos
import PeopleStatsCard from '@/components/dashboard/PeopleStatsCard.vue' // Para control de personas y actividad
import ActionButtons from '@/components/dashboard/ActionButtons.vue' // Botones principales de registro
import RegistroIngresoDialog from '@/components/ui/RegistroIngresoDialog.vue' // Modal de registro de ingreso
import RegistroSalidaDialog from '@/components/ui/RegistroSalidaDialog.vue' // Modal de registro de salida
import SessionTimeoutDialog from '@/components/ui/SessionTimeoutDialog.vue' // Diálogo de timeout de sesión
import DataListModal from '@/components/ui/DataListModal.vue' // Modal reutilizable para mostrar listas de datos
import DashboardFooter from '@/components/layout/DashboardFooter.vue' // Pie de página institucional

const router = useRouter()
const authStore = useAuthStore()
const registroStore = useRegistroStore()

// Sistema de timeout de sesión
const {
  showWarningDialog: showTimeoutWarning,
  remainingTime: timeoutRemainingTime,
  extendSession,
  initializeTimeout,
  cleanup: cleanupTimeout,
  resetTimer
} = useSessionTimeout()

// Estado para controlar modales
const isLoggingOut = ref(false)
const showRegistroIngreso = ref(false)
const showRegistroSalida = ref(false)

// Estado para controlar modales de datos detallados
const showPersonasDentroModal = ref(false)
const showIngresosHoyModal = ref(false)
const showSalidasHoyModal = ref(false)
const showVehiculosModal = ref(false)
const selectedVehicleType = ref<string>('')

// ========== DATOS CONECTADOS CON STORES ==========

// Estadísticas en tiempo real desde el store de registro
const peopleData = computed(() => ({
  personasDentro: registroStore.personasDentro.length,
  ingresosHoy: registroStore.ingresosHoy.length,
  salidasHoy: registroStore.salidasHoy.length,
}))

// Estadísticas detalladas de vehículos por categoría - Usadas por VehicleStatsCard  
const vehicleData = computed(() => {
  // REVERTIR: Usar personasDentro como fuente principal (incluye vehículos de días anteriores)
  const personasConVehiculo = registroStore.personasDentro.filter(p => p.conVehiculo)
  
  // Para obtener el tipo real de vehículo, buscar el registro de ingreso correspondiente
  const contadores = {
    autos: 0,
    motos: 0,
    camiones: 0,
    buses: 0
  }
  
  console.log('🚗 [DASHBOARD DEBUG] === INICIANDO CLASIFICACIÓN DE VEHÍCULOS ===')
  console.log('🚗 [DASHBOARD DEBUG] Total personas con vehículo:', personasConVehiculo.length)
  console.log('🚗 [DASHBOARD DEBUG] Total registros disponibles:', registroStore.registros.length)
  console.log('🚗 [DASHBOARD DEBUG] 🔧 USANDO registrosRaw expuesto directamente...')
  
  // 🔧 CORREGIDO: Usar registrosRaw expuesto directamente desde el store
  const registrosRaw = registroStore.registrosRaw
  console.log('🚗 [DASHBOARD DEBUG] Total registros RAW disponibles:', registrosRaw.length)
  
  personasConVehiculo.forEach(persona => {
    console.log(`🚗 [DASHBOARD DEBUG] --- Procesando persona: ${persona.nombre} ${persona.apellido} (${persona.cedula}) ---`)
    
    // 🔧 CORREGIDO: Buscar en registrosRaw expuesto con tipado correcto
    const registroIngreso = registrosRaw.find((r) => 
      r.tipo === 'ingreso' && 
      (r as RegistroIngreso).datosPersonales?.cedula === persona.cedula
    ) as RegistroIngreso | undefined
    
    console.log('🚗 [DASHBOARD DEBUG] Registro encontrado:', !!registroIngreso)
    if (registroIngreso) {
      console.log('🚗 [DASHBOARD DEBUG] ID del registro:', registroIngreso.id)
      console.log('🚗 [DASHBOARD DEBUG] Registro completo:', JSON.stringify(registroIngreso, null, 2))
    }
    
    if (registroIngreso?.datosVehiculo?.tipo) {
      const tipoOriginal = registroIngreso.datosVehiculo.tipo
      const tipo = tipoOriginal.toLowerCase().trim()
      
      // 🔍 DEBUG: Log para diagnosticar problemas de clasificación
      console.log(`🚗 [DEBUG] Clasificando vehículo - Original: "${tipoOriginal}", Normalizado: "${tipo}", Persona: ${persona.nombre} ${persona.apellido}`)
      
      switch(tipo) {
        case 'auto':
          contadores.autos++
          console.log(`✅ [DEBUG] Clasificado como AUTO`)
          break
        case 'moto':
          contadores.motos++
          console.log(`✅ [DEBUG] Clasificado como MOTO`)
          break
        case 'camión':
        case 'camion':
          contadores.camiones++
          console.log(`✅ [DEBUG] Clasificado como CAMIÓN`)
          break
        case 'bus':
          contadores.buses++
          console.log(`✅ [DEBUG] Clasificado como BUS`)
          break
        default:
          // ❌ MEJORADO: Log de warning cuando no se reconoce el tipo
          console.warn(`⚠️ [DEBUG] Tipo de vehículo no reconocido: "${tipoOriginal}" (normalizado: "${tipo}") - Clasificado como AUTO por defecto`)
          contadores.autos++
      }
    } else {
      // ❌ MEJORADO: Log cuando no se encuentra el tipo de vehículo
      console.warn(`⚠️ [DEBUG] No se encontró tipo de vehículo para ${persona.nombre} ${persona.apellido} - Clasificado como AUTO por defecto`)
      contadores.autos++
    }
  })
  
  // 🔍 DEBUG: Resumen final de clasificación
  console.log('🚗 [DASHBOARD DEBUG] === RESUMEN FINAL DE CLASIFICACIÓN ===')
  console.log('🚗 [DASHBOARD DEBUG] Contadores finales:', contadores)
  console.log('🚗 [DASHBOARD DEBUG] Total autos:', contadores.autos)
  console.log('🚗 [DASHBOARD DEBUG] Total motos:', contadores.motos)  
  console.log('🚗 [DASHBOARD DEBUG] Total camiones:', contadores.camiones)
  console.log('🚗 [DASHBOARD DEBUG] Total buses:', contadores.buses)
  console.log('🚗 [DASHBOARD DEBUG] =============================================')
  
  return contadores
})

// ========== DATOS PARA MODALES DETALLADOS ==========

// Datos para modal de personas dentro
const personasDentroData = computed(() => {
  return registroStore.personasDentro
})

// Datos para modal de ingresos de hoy
const ingresosHoyData = computed(() => {
  const hoy = new Date()
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const finHoy = new Date(inicioHoy.getTime() + 24*60*60*1000 - 1)
  
  return registroStore.ingresosHoy
    .filter(ingreso => {
      const fechaIngreso = new Date(ingreso.timestamp)
      return fechaIngreso >= inicioHoy && fechaIngreso <= finHoy
    })
    .map(ingreso => ({
      cedula: ingreso.datosPersonales.cedula,
      nombre: ingreso.datosPersonales.nombre,
      apellido: ingreso.datosPersonales.apellido,
      ingresoTimestamp: ingreso.timestamp,
      destino: ingreso.datosVisita.destino,
      conVehiculo: !!ingreso.datosVehiculo
    }))
})

// Datos para modal de salidas de hoy
const salidasHoyData = computed(() => {
  const hoy = new Date()
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const finHoy = new Date(inicioHoy.getTime() + 24*60*60*1000 - 1)
  
  return registroStore.salidasHoy
    .filter(salida => {
      const fechaSalida = new Date(salida.timestamp)
      return fechaSalida >= inicioHoy && fechaSalida <= finHoy
    })
    .map(salida => {
      // Buscar el registro de ingreso correspondiente para obtener datos completos
      const ingresoCorrespondiente = registroStore.ingresosHoy.find(ingreso => 
        ingreso.datosPersonales.cedula === salida.cedulaBuscada
      )
      
      return {
        cedula: salida.cedulaBuscada,
        nombre: ingresoCorrespondiente?.datosPersonales.nombre || 'N/A',
        apellido: ingresoCorrespondiente?.datosPersonales.apellido || '',
        ingresoTimestamp: salida.timestamp,
        destino: ingresoCorrespondiente?.datosVisita.destino || 'N/A',
        conVehiculo: !!ingresoCorrespondiente?.datosVehiculo
      }
    })
})

// Datos para modal de vehículos (usando misma lógica que vehicleData)
const vehiculosData = computed(() => {
  // Obtener personas con vehículo que están dentro
  const personasConVehiculo = registroStore.personasDentro.filter(p => p.conVehiculo)
  
  // 🔧 CORREGIDO: Usar registrosRaw expuesto directamente
  const registrosRaw = registroStore.registrosRaw
  
  // Construir datos de vehículos buscando el registro original
  const vehiculos = personasConVehiculo.map(persona => {
    // 🔧 CORREGIDO: Buscar el registro de ingreso en registrosRaw expuesto
    const registroIngreso = registrosRaw.find((r) => 
      r.tipo === 'ingreso' && 
      (r as RegistroIngreso).datosPersonales?.cedula === persona.cedula
    ) as RegistroIngreso | undefined
    
    return {
      id: registroIngreso?.id || persona.cedula,
      tipo: registroIngreso?.datosVehiculo?.tipo || 'Auto',
      matricula: registroIngreso?.datosVehiculo?.matricula || 'N/A',
      ingresoTimestamp: persona.ingresoTimestamp,
      conductor: `${persona.nombre} ${persona.apellido}`
    }
  })
  
  // Si hay filtro por tipo de vehículo, aplicarlo
  const vehiculosFiltrados = selectedVehicleType.value 
    ? vehiculos.filter(vehiculo => vehiculo.tipo === selectedVehicleType.value)
    : vehiculos
  
  return vehiculosFiltrados
})

// ========== PROPIEDADES DINÁMICAS PARA MODAL DE VEHÍCULOS ==========

// Título dinámico del modal según tipo seleccionado
const vehicleModalTitle = computed(() => {
  if (!selectedVehicleType.value) {
    return 'Vehículos en el Predio'
  }
  
  const plurales = {
    'Auto': 'Autos',
    'Moto': 'Motos', 
    'Camión': 'Camiones',
    'Camion': 'Camiones',
    'Bus': 'Buses'
  }
  
  return `${plurales[selectedVehicleType.value as keyof typeof plurales] || selectedVehicleType.value} en el Predio`
})

// Ícono dinámico del modal según tipo seleccionado
const vehicleModalIcon = computed(() => {
  if (!selectedVehicleType.value) {
    return 'mdi-car-multiple' // Ícono genérico para todos los vehículos
  }
  
  const iconos = {
    'Auto': 'mdi-car',
    'Moto': 'mdi-motorbike',
    'Camión': 'mdi-truck',
    'Camion': 'mdi-truck', 
    'Bus': 'mdi-bus'
  }
  
  return iconos[selectedVehicleType.value as keyof typeof iconos] || 'mdi-car'
})

// Subtítulo dinámico del estado vacío
const vehicleModalEmptySubtitle = computed(() => {
  if (!selectedVehicleType.value) {
    return 'No hay vehículos en el predio'
  }
  
  const tipos = {
    'Auto': 'autos',
    'Moto': 'motos',
    'Camión': 'camiones', 
    'Camion': 'camiones',
    'Bus': 'buses'
  }
  
  const tipoLower = tipos[selectedVehicleType.value as keyof typeof tipos] || selectedVehicleType.value.toLowerCase()
  return `No hay ${tipoLower} en el predio`
})

// Ícono dinámico del estado vacío
const vehicleModalEmptyIcon = computed(() => {
  if (!selectedVehicleType.value) {
    return 'mdi-car-off'
  }
  
  const iconos = {
    'Auto': 'mdi-car-off',
    'Moto': 'mdi-motorbike', // No existe mdi-motorbike-off, usar normal
    'Camión': 'mdi-truck', // No existe mdi-truck-off, usar normal
    'Camion': 'mdi-truck', // No existe mdi-truck-off, usar normal
    'Bus': 'mdi-bus' // Usar ícono normal de bus
  }
  
  return iconos[selectedVehicleType.value as keyof typeof iconos] || 'mdi-car-off'
})

// Color dinámico del header del modal
const vehicleModalHeaderColor = computed(() => {
  if (!selectedVehicleType.value) {
    return 'primary' // Color genérico para todos los vehículos
  }
  
  const colores = {
    'Auto': 'primary',
    'Moto': 'accent',
    'Camión': 'warning',
    'Camion': 'warning',
    'Bus': 'success'
  }
  
  return colores[selectedVehicleType.value as keyof typeof colores] || 'primary'
})

// Handlers para los botones de acción
const handleRegistroIngreso = () => {
  showRegistroIngreso.value = true
}

const handleRegistroSalida = () => {
  showRegistroSalida.value = true
}

// Handlers para modales de registro
const handleRegistroIngresoSuccess = (message: string) => {
  console.log('Registro de ingreso exitoso:', message)
  // TODO: Mostrar notificación de éxito global
}

const handleRegistroSalidaSuccess = (message: string) => {
  console.log('Registro de salida exitoso:', message)
  // TODO: Mostrar notificación de éxito global
}

const handleDialogClose = () => {
  showRegistroIngreso.value = false
  showRegistroSalida.value = false
}

// ========== HANDLERS PARA MODALES DE DATOS DETALLADOS ==========

// Handlers para clicks en estadísticas de personas
const handlePersonasDentroClick = () => {
  console.log('🔍 [DASHBOARD] Click en Personas Dentro - Abriendo modal')
  showPersonasDentroModal.value = true
}

const handleIngresosHoyClick = () => {
  console.log('🔍 [DASHBOARD] Click en Ingresos Hoy - Abriendo modal')
  showIngresosHoyModal.value = true
}

const handleSalidasHoyClick = () => {
  console.log('🔍 [DASHBOARD] Click en Salidas Hoy - Abriendo modal')
  showSalidasHoyModal.value = true
}

// Handler para clicks en vehículos
const handleVehicleClick = (tipoVehiculo: string) => {
  console.log(`🔍 [DASHBOARD] Click en vehículo tipo: ${tipoVehiculo} - Abriendo modal`)
  selectedVehicleType.value = tipoVehiculo
  showVehiculosModal.value = true
}

// Handlers para el menú de perfil
const handleViewProfile = () => {
  // TODO: Abrir modal de ver perfil
  console.log('Ver perfil del usuario')
}

const handleEditProfile = () => {
  // TODO: Abrir modal de editar perfil
  console.log('Editar perfil del usuario')
}

const handleChangePassword = () => {
  // TODO: Abrir modal de cambio de contraseña
  console.log('Cambiar contraseña')
}

const handleLogout = async () => {
  try {
    isLoggingOut.value = true

    // Limpiar timeout de sesión antes del logout
    cleanupTimeout()

    // Ejecutar el logout del store
    await authStore.logout()

    // Redirigir al login
    await router.push('/login')
  } catch (error) {
    console.error('Error durante el logout:', error)
  } finally {
    isLoggingOut.value = false
  }
}

// Handlers para el sistema de timeout de sesión
const handleExtendSession = () => {
  console.log('Usuario extendió la sesión desde el dashboard')
  extendSession()
  // Reset timer para actividad del usuario
  resetTimer()
}

const handleSessionTimeout = async () => {
  console.log('Sesión cerrada por timeout desde el dashboard')
  await handleLogout()
}

// Lifecycle hooks para el sistema de timeout
onMounted(async () => {
  console.log('Inicializando sistema de timeout en dashboard')
  initializeTimeout()
  
  // ✅ INICIALIZAR STORE DE REGISTROS CON DATOS REALES
  console.log('🚀 [DASHBOARD] Inicializando store de registros con usuario autenticado')
  await registroStore.initializeStoreWhenAuthenticated()
  console.log('✅ [DASHBOARD] Store de registros inicializado')
})

onUnmounted(() => {
  console.log('Limpiando sistema de timeout en dashboard')
  cleanupTimeout()
})
</script>

<style scoped>
/* Layout refinado para el Dashboard gubernamental */
.v-container {
  max-width: 1400px;
  padding: 1.5rem;
}

/* Mejorar espaciado en tablets y desktop */
@media (min-width: 960px) {
  .v-container {
    padding: 2rem;
  }
}

/* Espaciado óptimo en pantallas grandes */
@media (min-width: 1264px) {
  .v-container {
    padding: 2.5rem;
  }
}

/* Ajustes para móviles */
@media (max-width: 600px) {
  .v-container {
    padding: 1rem;
  }
}
</style>
