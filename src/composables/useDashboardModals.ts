import { ref, computed } from 'vue'

export function useDashboardModals() {
  // Estado para controlar modales de registro
  const showRegistroIngreso = ref(false)
  const showRegistroSalida = ref(false)

  // Estado para controlar modales de datos detallados
  const showPersonasDentroModal = ref(false)
  const showIngresosHoyModal = ref(false)
  const showSalidasHoyModal = ref(false)
  const showVehiculosModal = ref(false)
  const selectedVehicleType = ref<string>('')

  // Handlers para los botones de acción principales
  const handleRegistroIngreso = () => {
    showRegistroIngreso.value = true
  }

  const handleRegistroSalida = () => {
    showRegistroSalida.value = true
  }

  // Handlers para clicks en estadísticas de personas
  const handlePersonasDentroClick = () => {
    showPersonasDentroModal.value = true
  }

  const handleIngresosHoyClick = () => {
    showIngresosHoyModal.value = true
  }

  const handleSalidasHoyClick = () => {
    showSalidasHoyModal.value = true
  }

  // Handler para clicks en vehículos
  const handleVehicleClick = (tipoVehiculo: string) => {
    selectedVehicleType.value = tipoVehiculo
    showVehiculosModal.value = true
  }

  // Handler para cerrar modales de registro
  const handleDialogClose = () => {
    showRegistroIngreso.value = false
    showRegistroSalida.value = false
  }

  // --- Propiedades computadas para el modal de vehículos ---

  const vehicleModalTitle = computed(() => {
    if (!selectedVehicleType.value) return 'Vehículos en el Predio'
    const plurales: { [key: string]: string } = {
      Auto: 'Autos',
      Moto: 'Motos',
      Camión: 'Camiones',
      Camion: 'Camiones',
      Bus: 'Buses'
    }
    return `${plurales[selectedVehicleType.value] || selectedVehicleType.value} en el Predio`
  })

  const vehicleModalIcon = computed(() => {
    if (!selectedVehicleType.value) return 'mdi mdi-car-multiple'
    const iconos: { [key: string]: string } = {
      Auto: 'mdi mdi-car',
      Moto: 'mdi mdi-motorbike',
      Camión: 'mdi mdi-truck',
      Camion: 'mdi mdi-truck',
      Bus: 'mdi mdi-bus'
    }
    return iconos[selectedVehicleType.value] || 'mdi mdi-car'
  })

  const vehicleModalEmptySubtitle = computed(() => {
    if (!selectedVehicleType.value) return 'No hay vehículos en el predio'
    const tipos: { [key: string]: string } = {
      Auto: 'autos',
      Moto: 'motos',
      Camión: 'camiones',
      Camion: 'camiones',
      Bus: 'buses'
    }
    const tipoLower = tipos[selectedVehicleType.value] || selectedVehicleType.value.toLowerCase()
    return `No hay ${tipoLower} en el predio`
  })

  const vehicleModalEmptyIcon = computed(() => {
    if (!selectedVehicleType.value) return 'mdi-car-off'
    const iconos: { [key: string]: string } = {
      Auto: 'mdi-car-off',
      Moto: 'mdi-motorbike',
      Camión: 'mdi-truck',
      Camion: 'mdi-truck',
      Bus: 'mdi-bus'
    }
    return iconos[selectedVehicleType.value] || 'mdi-car-off'
  })

  const vehicleModalHeaderColor = computed(() => {
    if (!selectedVehicleType.value) return 'primary'
    const colores: { [key: string]: string } = {
      Auto: 'primary',
      Moto: 'accent',
      Camión: 'warning',
      Camion: 'warning',
      Bus: 'success'
    }
    return colores[selectedVehicleType.value] || 'primary'
  })

  return {
    // Estado de visibilidad
    showRegistroIngreso,
    showRegistroSalida,
    showPersonasDentroModal,
    showIngresosHoyModal,
    showSalidasHoyModal,
    showVehiculosModal,
    selectedVehicleType,
    // Handlers
    handleRegistroIngreso,
    handleRegistroSalida,
    handlePersonasDentroClick,
    handleIngresosHoyClick,
    handleSalidasHoyClick,
    handleVehicleClick,
    handleDialogClose,
    // Props computadas para el modal de vehículo
    vehicleModalTitle,
    vehicleModalIcon,
    vehicleModalEmptySubtitle,
    vehicleModalEmptyIcon,
    vehicleModalHeaderColor
  }
}
