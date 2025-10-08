import { computed } from 'vue'
import { useMultipleCounters } from './useCounterAnimation'
import type { RegistroIngreso, RegistroSalida, PersonaDentro, RegistroEntry } from '@/stores/registro'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDashboardStats(registroStore: any) {
  // ⭐ REFACTORIZADO: Usar composable genérico para contadores de personas
  const { createCounter, startAll: startPeopleAnimations } = useMultipleCounters({
    duration: 2000,
    autoWatch: true // Auto-reactividad activada
  })

  // Crear contadores animados con auto-watch
  const personasDentroCounter = createCounter(() => registroStore.personasDentro.length)
  const ingresosHoyCounter = createCounter(() => registroStore.ingresosHoy.length)
  const salidasHoyCounter = createCounter(() => registroStore.salidasHoy.length)

  // ⭐ Datos finales con animación para las cards
  const peopleData = computed(() => ({
    personasDentro: personasDentroCounter.animatedValue.value,
    ingresosHoy: ingresosHoyCounter.animatedValue.value,
    salidasHoy: salidasHoyCounter.animatedValue.value
  }))

  // Estadísticas detalladas de vehículos por categoría (con animación)
  const vehicleDataSource = computed(() => {
    const personasConVehiculo = registroStore.personasDentro.filter((p: PersonaDentro) => p.conVehiculo)
    const contadores = { autos: 0, motos: 0, camiones: 0, buses: 0 }
    const registrosRaw = registroStore.registrosRaw

    personasConVehiculo.forEach((persona: PersonaDentro) => {
      const registroIngreso = registrosRaw.find(
        (r: RegistroEntry) => r.tipo === 'ingreso' && (r as RegistroIngreso).datosPersonales?.cedula === persona.cedula
      ) as RegistroIngreso | undefined

      if (registroIngreso?.datosVehiculo?.tipo) {
        const tipoOriginal = registroIngreso.datosVehiculo.tipo
        const tipo = tipoOriginal.toLowerCase().trim()

        switch (tipo) {
          case 'auto':
            contadores.autos++
            break
          case 'moto':
            contadores.motos++
            break
          case 'camión':
          case 'camion':
            contadores.camiones++
            break
          case 'bus':
            contadores.buses++
            break
          default:
            contadores.autos++
        }
      } else {
        contadores.autos++
      }
    })
    return contadores
  })

  // ⭐ REFACTORIZADO: Usar composable genérico para contadores de vehículos
  const { createCounter: createVehicleCounter, startAll: startVehicleAnimations } = useMultipleCounters({
    duration: 2000,
    autoWatch: false // Control manual para vehículos (computed complejo)
  })

  const autosCounter = createVehicleCounter(() => vehicleDataSource.value.autos, { autoWatch: true })
  const motosCounter = createVehicleCounter(() => vehicleDataSource.value.motos, { autoWatch: true })
  const camionesCounter = createVehicleCounter(() => vehicleDataSource.value.camiones, { autoWatch: true })
  const busesCounter = createVehicleCounter(() => vehicleDataSource.value.buses, { autoWatch: true })

  // ⭐ Datos finales con animación para vehículos
  const vehicleData = computed(() => ({
    autos: autosCounter.animatedValue.value,
    motos: motosCounter.animatedValue.value,
    camiones: camionesCounter.animatedValue.value,
    buses: busesCounter.animatedValue.value
  }))

  // Datos para modal de personas dentro
  const personasDentroData = computed(() => {
    return registroStore.personasDentro
  })

  // Datos para modal de ingresos de hoy
  const ingresosHoyData = computed(() => {
    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000 - 1)

    return registroStore.ingresosHoy
      .filter((ingreso: RegistroIngreso) => {
        const fechaIngreso = new Date(ingreso.timestamp)
        return fechaIngreso >= inicioHoy && fechaIngreso <= finHoy
      })
      .map((ingreso: RegistroIngreso) => ({
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
    const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000 - 1)

    return registroStore.salidasHoy
      .filter((salida: RegistroSalida) => {
        const fechaSalida = new Date(salida.timestamp)
        return fechaSalida >= inicioHoy && fechaSalida <= finHoy
      })
      .map((salida: RegistroSalida) => {
        const ingresoCorrespondiente = registroStore.ingresosHoy.find(
          (ingreso: RegistroIngreso) => ingreso.datosPersonales.cedula === salida.cedulaBuscada
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

  // Datos para modal de vehículos
  const vehiculosData = (selectedVehicleType: string) => computed(() => {
    const personasConVehiculo = registroStore.personasDentro.filter((p: PersonaDentro) => p.conVehiculo)
    const registrosRaw = registroStore.registrosRaw

    const vehiculos = personasConVehiculo.map((persona: PersonaDentro) => {
      const registroIngreso = registrosRaw.find(
        (r: RegistroEntry) => r.tipo === 'ingreso' && (r as RegistroIngreso).datosPersonales?.cedula === persona.cedula
      ) as RegistroIngreso | undefined

      return {
        id: registroIngreso?.id || persona.cedula,
        tipo: registroIngreso?.datosVehiculo?.tipo || 'Auto',
        matricula: registroIngreso?.datosVehiculo?.matricula || 'N/A',
        ingresoTimestamp: persona.ingresoTimestamp,
        conductor: `${persona.nombre} ${persona.apellido}`
      }
    })

    return selectedVehicleType
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? vehiculos.filter((vehiculo: any) => vehiculo.tipo === selectedVehicleType)
      : vehiculos
  })

  // ⭐ Función unificada para iniciar todas las animaciones
  const startAnimation = () => {
    startPeopleAnimations()
    startVehicleAnimations()
  }

  return {
    peopleData,
    vehicleData,
    personasDentroData,
    ingresosHoyData,
    salidasHoyData,
    vehiculosData,
    startAnimation,
    // Mantener compatibilidad con código existente
    updateVehicleAnimation: startVehicleAnimations
  }
}
