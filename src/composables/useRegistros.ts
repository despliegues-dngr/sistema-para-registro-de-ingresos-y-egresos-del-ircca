import { ref, computed } from 'vue'
import type { 
  RegistroEntry, 
  RegistroIngreso, 
  RegistroSalida, 
  PersonaDentro,
  RegistroIngresoData 
} from '@/stores/registro'
import { registroService } from '@/services/registroService'
import { 
  createRegistroWrapper, 
  buscarPersonasDentro,
  getVehiculoInfo,
  getAcompanantesData
} from '@/utils/registroHelpers'

/**
 * Composable para operaciones de registros
 * Lógica reactiva reutilizable
 */
export const useRegistrosOperations = () => {
  const loading = ref(false)

  /**
   * Registra un nuevo ingreso
   */
  const registrarIngreso = async (
    datos: RegistroIngresoData, 
    operadorId: string = 'op-001'
  ) => {
    loading.value = true
    try {
      const registro = await registroService.registrarIngreso(datos, operadorId)
      return { success: true, registro }
    } catch (error) {
      return { success: false, error: String(error) }
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra una nueva salida
   */
  const registrarSalida = async (datos: {
    cedulaBuscada: string
    tiempoEstadia: number
    operadorId: string
    observaciones?: string
  }) => {
    loading.value = true
    try {
      const registro = await registroService.registrarSalida(datos)
      return { success: true, registro }
    } catch (error) {
      return { success: false, error: String(error) }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sincroniza datos desde IndexedDB
   */
  const syncData = async () => {
    loading.value = true
    try {
      const registros = await registroService.syncData()
      return { success: true, registros }
    } catch (error) {
      return { success: false, error: String(error) }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    registrarIngreso,
    registrarSalida,
    syncData
  }
}

/**
 * Composable para búsquedas y consultas
 */
export const useRegistrosSearch = () => {
  /**
   * Busca registros por cédula
   */
  const searchByCedula = async (cedula: string) => {
    try {
      return await registroService.getRegistrosByCedula(cedula)
    } catch (error) {
      console.error('Error buscando por cédula:', error)
      return []
    }
  }

  /**
   * Busca registros por matrícula
   */
  const searchByMatricula = async (matricula: string) => {
    try {
      return await registroService.getRegistrosByMatricula(matricula)
    } catch (error) {
      console.error('Error buscando por matrícula:', error)
      return []
    }
  }

  /**
   * Busca personas dentro del predio
   */
  const searchPersonasDentro = (personas: PersonaDentro[], termino: string) => {
    return buscarPersonasDentro(personas, termino)
  }

  return {
    searchByCedula,
    searchByMatricula,
    searchPersonasDentro
  }
}

/**
 * Composable para estadísticas y computadas
 */
export const useRegistrosStats = (registros: RegistroEntry[]) => {
  const totalRegistros = computed(() => registros.length)
  
  const registrosHoy = computed(() => {
    const hoy = new Date().toDateString()
    return registros
      .filter(r => new Date(r.timestamp).toDateString() === hoy)
      .map(createRegistroWrapper)
  })

  const ingresosHoy = computed(() => 
    registros.filter(r => 
      r.tipo === 'ingreso' && 
      new Date(r.timestamp).toDateString() === new Date().toDateString()
    ) as RegistroIngreso[]
  )

  const salidasHoy = computed(() => 
    registros.filter(r => 
      r.tipo === 'salida' && 
      new Date(r.timestamp).toDateString() === new Date().toDateString()
    ) as RegistroSalida[]
  )

  const estadisticasHoy = computed(() => ({
    totalRegistros: totalRegistros.value,
    ingresosHoy: ingresosHoy.value.length,
    salidasHoy: salidasHoy.value.length
  }))

  // Getter para tests: ingresos sin egreso correspondiente
  const ingresosPendientes = computed(() => {
    const ingresos = registros.filter(r => r.tipo === 'ingreso') as RegistroIngreso[]
    
    const pendientes = ingresos.filter(ingreso => {
      // Buscar si hay un egreso posterior para la misma cédula
      const tieneEgresoDestroyed = registros.some(r => 
        r.tipo === 'salida' && 
        (r as RegistroSalida).cedulaBuscada === ingreso.datosPersonales.cedula &&
        r.timestamp > ingreso.timestamp
      )
      
      return !tieneEgresoDestroyed
    })
    
    // Mapear a estructura compatible con tests
    return pendientes.map(createRegistroWrapper)
  })

  return {
    totalRegistros,
    registrosHoy,
    ingresosHoy,
    salidasHoy,
    estadisticasHoy,
    ingresosPendientes
  }
}

/**
 * Composable para compatibilidad con tests
 */
export const useRegistrosCompatibility = (registros: RegistroEntry[]) => {
  // Computed que siempre devuelve wrappers para compatibilidad con tests
  const registrosWrapped = computed(() => {
    return registros.map(createRegistroWrapper)
  })

  /**
   * Métodos para compatibilidad con tests
   */
  const addRegistro = (registro: RegistroEntry) => {
    // Esta lógica se implementará en el store principal
    console.log('📝 DEBUG ADD REGISTRO - Tipo:', registro.tipo)
    console.log('📝 DEBUG ADD REGISTRO - ID:', registro.id)
  }

  const getRegistrosByDocumento = (documento: string) => {
    const filtered = registros.filter((r) => {
      if (r.tipo === 'ingreso') {
        return (r as RegistroIngreso).datosPersonales.cedula === documento
      } else {
        return (r as RegistroSalida).cedulaBuscada === documento
      }
    })
    return filtered.map(createRegistroWrapper)
  }

  const getRegistrosByMatriculaTest = (matricula: string) => {
    const filtered = registros.filter((r) => 
      r.tipo === 'ingreso' && (r as RegistroIngreso).datosVehiculo?.matricula === matricula
    )
    return filtered.map(createRegistroWrapper)
  }

  return {
    registrosWrapped,
    addRegistro,
    getRegistrosByDocumento,
    getRegistrosByMatriculaTest
  }
}

/**
 * Composable para helpers de vehículos y acompañantes
 */
export const useRegistrosHelpers = (
  registros: RegistroEntry[], 
  personasDentro: PersonaDentro[]
) => {
  /**
   * Obtiene información del vehículo de una persona
   */
  const getVehiculoInfoHelper = (cedula: string) => {
    return getVehiculoInfo(cedula, registros)
  }

  /**
   * Obtiene datos de acompañantes
   */
  const getAcompanantesDataHelper = (cedula: string) => {
    return getAcompanantesData(cedula, personasDentro)
  }

  return {
    getVehiculoInfo: getVehiculoInfoHelper,
    getAcompanantesData: getAcompanantesDataHelper
  }
}
