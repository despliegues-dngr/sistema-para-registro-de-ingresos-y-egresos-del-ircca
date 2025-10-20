import { ref, computed } from 'vue'
import { useRegistrosSearch } from '@/composables/useRegistros'
import { databaseService } from '@/services/databaseService'
import type { RegistroIngreso, RegistroSalida } from '@/stores/registro'

/**
 * Interface para registro combinado (ingreso o salida)
 */
export interface RegistroHistorial {
  id: string
  tipo: 'ingreso' | 'salida'
  timestamp: Date
  fecha: string
  hora: string
  destino?: string
  operadorId: string
  vehiculo?: {
    matricula?: string
    marca?: string
    modelo?: string
  }
}

/**
 * Interface para datos de la persona en el historial
 */
export interface DatosPersonaHistorial {
  cedula: string
  nombre: string
  apellido: string
}

/**
 * Interface para el resumen estadístico
 */
export interface ResumenHistorial {
  totalRegistros: number
  totalIngresos: number
  totalSalidas: number
  frecuenciaPromedio: number // visitas por día
  periodoDesde: string
  periodoHasta: string
}

/**
 * Interface para el historial completo
 */
export interface HistorialCompleto {
  persona: DatosPersonaHistorial
  registros: RegistroHistorial[]
  resumen: ResumenHistorial
}

/**
 * Composable para consultar historial de personas
 * Reutilizable entre componentes de Admin y Supervisor
 */
// Interface para info de operador
interface OperadorInfo {
  id: string
  nombre: string
  apellido: string
  grado: string
}

export function usePersonHistory() {
  const { searchByCedula } = useRegistrosSearch()
  
  // Estado
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const historial = ref<HistorialCompleto | null>(null)
  const operadores = ref<OperadorInfo[]>([])

  /**
   * Busca todos los registros (ingresos y salidas) de una persona
   * por su cédula, opcionalmente filtrados por rango de fechas
   */
  async function buscarHistorial(
    cedula: string,
    fechaDesde?: Date,
    fechaHasta?: Date
  ): Promise<HistorialCompleto | null> {
    if (!cedula || cedula.length !== 8) {
      error.value = 'Cédula debe tener 8 dígitos'
      return null
    }

    try {
      isLoading.value = true
      error.value = null

      // Cargar operadores de la base de datos
      const usuarios = await databaseService.getUsuarios()
      operadores.value = usuarios.map(u => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        grado: u.grado
      }))

      // Usar searchByCedula que descifra automáticamente los datos
      const todosLosRegistros = await searchByCedula(cedula)

      // Separar ingresos y salidas (ya vienen filtrados por cédula)
      const ingresos = todosLosRegistros.filter(r => r.tipo === 'ingreso') as RegistroIngreso[]
      const salidas = todosLosRegistros.filter(r => r.tipo === 'salida') as RegistroSalida[]

      // Combinar y transformar registros
      const registrosCombinados: RegistroHistorial[] = []

      // Procesar ingresos
      ingresos.forEach(ing => {
        const fecha = new Date(ing.timestamp)
        // Formato 24h: HH:MM
        const hora = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`
        // Buscar operador en la lista cargada
        const operador = operadores.value.find(op => op.id === ing.operadorId)
        const nombreOperador = operador 
          ? `${operador.grado} ${operador.nombre} ${operador.apellido}`.trim()
          : 'Sistema'
        
        registrosCombinados.push({
          id: ing.id,
          tipo: 'ingreso',
          timestamp: fecha,
          fecha: fecha.toLocaleDateString('es-UY'),
          hora,
          destino: ing.datosVisita?.destino || 'No especificado',
          operadorId: nombreOperador,
          vehiculo: ing.datosVehiculo
        })
      })

      // Procesar salidas
      salidas.forEach(sal => {
        const fecha = new Date(sal.timestamp)
        // Formato 24h: HH:MM
        const hora = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`
        // Buscar operador en la lista cargada
        const operador = operadores.value.find(op => op.id === sal.operadorId)
        const nombreOperador = operador 
          ? `${operador.grado} ${operador.nombre} ${operador.apellido}`.trim()
          : 'Sistema'
        
        registrosCombinados.push({
          id: sal.id,
          tipo: 'salida',
          timestamp: fecha,
          fecha: fecha.toLocaleDateString('es-UY'),
          hora,
          operadorId: nombreOperador
        })
      })

      // Ordenar por fecha descendente (más reciente primero)
      registrosCombinados.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      // Filtrar por rango de fechas si se especifica
      let registrosFiltrados = registrosCombinados
      if (fechaDesde || fechaHasta) {
        registrosFiltrados = registrosCombinados.filter(reg => {
          if (fechaDesde && reg.timestamp < fechaDesde) return false
          if (fechaHasta && reg.timestamp > fechaHasta) return false
          return true
        })
      }

      // Si no hay registros
      if (registrosFiltrados.length === 0) {
        error.value = 'No se encontraron registros para esta cédula'
        historial.value = null
        return null
      }

      // Obtener datos de la persona del primer registro
      const primerRegistro = ingresos[0] || salidas[0]
      const persona: DatosPersonaHistorial = {
        cedula: cedula,
        nombre: primerRegistro?.datosPersonales?.nombre || 'No disponible',
        apellido: primerRegistro?.datosPersonales?.apellido || 'No disponible'
      }

      // Calcular resumen estadístico
      const totalIngresos = registrosFiltrados.filter(r => r.tipo === 'ingreso').length
      const totalSalidas = registrosFiltrados.filter(r => r.tipo === 'salida').length

      // Calcular frecuencia promedio (visitas por día)
      let frecuenciaPromedio = 0
      if (registrosFiltrados.length > 0) {
        const fechaMasAntigua = registrosFiltrados[registrosFiltrados.length - 1].timestamp
        const fechaMasReciente = registrosFiltrados[0].timestamp
        const diasTranscurridos = Math.ceil(
          (fechaMasReciente.getTime() - fechaMasAntigua.getTime()) / (1000 * 60 * 60 * 24)
        )
        frecuenciaPromedio = diasTranscurridos > 0 ? totalIngresos / diasTranscurridos : totalIngresos
      }

      const resumen: ResumenHistorial = {
        totalRegistros: registrosFiltrados.length,
        totalIngresos,
        totalSalidas,
        frecuenciaPromedio: Math.round(frecuenciaPromedio * 10) / 10, // Redondear a 1 decimal
        periodoDesde: registrosFiltrados[registrosFiltrados.length - 1]?.fecha || '-',
        periodoHasta: registrosFiltrados[0]?.fecha || '-'
      }

      // Construir historial completo
      const historialCompleto: HistorialCompleto = {
        persona,
        registros: registrosFiltrados,
        resumen
      }

      historial.value = historialCompleto
      return historialCompleto

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al buscar historial'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Exporta el historial a formato CSV
   */
  function exportarCSV(historialData: HistorialCompleto): void {
    if (!historialData || historialData.registros.length === 0) {
      return
    }

    const { persona, registros } = historialData

    // Headers del CSV
    const headers = ['Fecha', 'Hora', 'Tipo', 'Destino', 'Vehículo', 'Operador']

    // Construir filas con comillas para compatibilidad Excel
    const rows = registros.map(reg => {
      // Formato de vehículo: "Matrícula (Marca Modelo)" o "-"
      const vehiculoInfo = reg.vehiculo?.matricula
        ? `${reg.vehiculo.matricula} (${reg.vehiculo.marca || ''} ${reg.vehiculo.modelo || ''})`.trim()
        : '-'

      return [
        reg.fecha,
        reg.hora,
        reg.tipo.toUpperCase(),
        reg.destino || '-',
        vehiculoInfo,
        reg.operadorId
      ]
    })

    // Formato fecha generación en 24h
    const now = new Date()
    const fechaGen = `${now.toLocaleDateString('es-UY')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    
    // Construir CSV con formato profesional (similar a ARCO)
    const csvContent = [
      `"Historial de Registros - IRCCA"`,
      `"Cédula: ${persona.cedula}"`,
      `"Nombre: ${persona.nombre} ${persona.apellido}"`,
      `"Total registros: ${registros.length}"`,
      `"Fecha generación: ${fechaGen}"`,
      '',
      headers.join(','),
      ...rows.map(fila => fila.map(celda => `"${celda}"`).join(','))
    ].join('\n')

    // Agregar BOM para UTF-8 (compatibilidad Excel)
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `historial_${persona.cedula}_${Date.now()}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Limpia el estado actual
   */
  function limpiar() {
    historial.value = null
    error.value = null
  }

  // Computed properties
  const tieneRegistros = computed(() => 
    historial.value !== null && historial.value.registros.length > 0
  )

  return {
    // Estado
    isLoading,
    error,
    historial,
    tieneRegistros,

    // Métodos
    buscarHistorial,
    exportarCSV,
    limpiar
  }
}
