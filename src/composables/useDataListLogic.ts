// Interfaces para tipos de datos
export interface PersonaModalData {
  cedula: string
  nombre: string
  apellido: string
  destino: string
  ingresoTimestamp?: Date
  conVehiculo?: boolean
  tipoVehiculo?: string // 'Auto' | 'Moto' | 'Camión' | 'Bus'
  esAcompanante?: boolean
}

export interface VehiculoModalData {
  id: string
  tipo: string
  matricula: string
  conductor: string
  ingresoTimestamp: Date
}

export type ModalData = PersonaModalData | VehiculoModalData

/**
 * Composable con lógica reutilizable para DataListModal y sus componentes
 */
export function useDataListLogic() {
  
  /**
   * Formatea timestamp a formato corto uruguayo
   */
  function formatearHoraCorta(timestamp?: Date): string {
    if (!timestamp) return 'N/A'
    const fecha = new Date(timestamp)
    return fecha.toLocaleString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  /**
   * Obtiene el icono Material Design para tipo de vehículo
   */
  function getVehicleIcon(tipo: string): string {
    const iconos = {
      'Auto': 'mdi-car',
      'Moto': 'mdi-motorbike',
      'Camión': 'mdi-truck',
      'Camion': 'mdi-truck', // Sin tilde para compatibilidad
      'Bus': 'mdi-bus'
    }
    return iconos[tipo as keyof typeof iconos] || 'mdi-car'
  }

  /**
   * Obtiene el color Vuetify para tipo de vehículo
   */
  function getVehicleColor(tipo: string): string {
    const colores = {
      'Auto': 'primary',
      'Moto': 'accent',
      'Camión': 'warning',
      'Camion': 'warning', // Sin tilde para compatibilidad
      'Bus': 'success'
    }
    return colores[tipo as keyof typeof colores] || 'primary'
  }

  /**
   * Obtiene el color del chip según el contexto de la persona
   */
  function getChipColor(persona: PersonaModalData): string {
    if (persona.esAcompanante) {
      return 'info' // Azul para acompañantes
    }
    return persona.conVehiculo ? 'success' : 'grey'
  }

  /**
   * Obtiene el icono del chip según el tipo de transporte
   */
  function getChipIcon(persona: PersonaModalData): string {
    // Si es acompañante con vehículo, mostrar icono del vehículo
    if (persona.esAcompanante && persona.conVehiculo && persona.tipoVehiculo) {
      return getVehicleIcon(persona.tipoVehiculo)
    }
    
    // Si es titular con vehículo, mostrar icono del vehículo
    if (persona.conVehiculo && persona.tipoVehiculo) {
      return getVehicleIcon(persona.tipoVehiculo)
    }
    
    // A pie
    return 'mdi-walk'
  }

  /**
   * Obtiene el texto del chip según el contexto
   */
  function getChipText(persona: PersonaModalData): string {
    // Acompañante
    if (persona.esAcompanante) {
      if (persona.conVehiculo && persona.tipoVehiculo) {
        return `Acompañante (${persona.tipoVehiculo})`
      }
      return 'Acompañante'
    }
    
    // Titular con vehículo
    if (persona.conVehiculo && persona.tipoVehiculo) {
      const tipoMap: Record<string, string> = {
        'Auto': 'En auto',
        'Moto': 'En moto',
        'Camión': 'En camión',
        'Camion': 'En camión',
        'Bus': 'En bus'
      }
      return tipoMap[persona.tipoVehiculo] || 'Con vehículo'
    }
    
    // A pie
    return 'A pie'
  }

  /**
   * Filtra datos según query de búsqueda
   */
  function filterData(data: unknown[], query: string, dataType: 'personas' | 'vehiculos'): unknown[] {
    if (!query.trim()) {
      return data
    }

    const searchQuery = query.toLowerCase().trim()

    return data.filter((item: unknown) => {
      const itemData = item as ModalData

      if (dataType === 'personas') {
        const personaData = itemData as PersonaModalData
        const nombre = `${personaData?.nombre || ''} ${personaData?.apellido || ''}`.toLowerCase()
        const cedula = (personaData?.cedula || '').toString().toLowerCase()
        const destino = (personaData?.destino || '').toLowerCase()

        return nombre.includes(searchQuery) ||
               cedula.includes(searchQuery) ||
               destino.includes(searchQuery)
      } else {
        // Para vehículos
        const vehiculoData = itemData as VehiculoModalData
        const tipo = (vehiculoData?.tipo || '').toLowerCase()
        const matricula = (vehiculoData?.matricula || '').toLowerCase()
        const conductor = (vehiculoData?.conductor || '').toLowerCase()

        return tipo.includes(searchQuery) ||
               matricula.includes(searchQuery) ||
               conductor.includes(searchQuery)
      }
    })
  }

  return {
    formatearHoraCorta,
    getVehicleIcon,
    getVehicleColor,
    getChipColor,
    getChipIcon,
    getChipText,
    filterData
  }
}
