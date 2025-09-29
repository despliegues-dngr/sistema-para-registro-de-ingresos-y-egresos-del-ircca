import { computed } from 'vue'
import type { RegistroIngreso, RegistroSalida, PersonaDentro, RegistroEntry } from '@/stores/registro'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDashboardStats(registroStore: any) {
  // Estadísticas en tiempo real desde el store de registro
  const peopleData = computed(() => ({
    personasDentro: registroStore.personasDentro.length,
    ingresosHoy: registroStore.ingresosHoy.length,
    salidasHoy: registroStore.salidasHoy.length
  }))

  // Estadísticas detalladas de vehículos por categoría
  const vehicleData = computed(() => {
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

  return {
    peopleData,
    vehicleData,
    personasDentroData,
    ingresosHoyData,
    salidasHoyData,
    vehiculosData
  }
}
