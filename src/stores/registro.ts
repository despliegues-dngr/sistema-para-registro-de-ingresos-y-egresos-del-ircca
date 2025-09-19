import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Tipos según especificación del modal de ingreso
export interface DatosPersonales {
  cedula: string // 8 dígitos (campo obligatorio)
  nombre: string // Campo obligatorio
  apellido: string // Campo obligatorio  
}

export interface DatosAcompanante extends DatosPersonales {
  tipoVisitante: string // Cada acompañante tiene su propio tipo
  areaVisitar: string // Cada acompañante puede visitar diferente área
}

export interface DatosVisita {
  tipoVisitante: string // Selector - Campo obligatorio
  areaVisitar: string // Selector - Campo obligatorio
}

export interface DatosVehiculo {
  tipo: string // Auto, Moto, Camión, Bus
  matricula: string // Formato ABC1234
}

// Interfaz para los datos del formulario (sin id, timestamp, operadorId)
export interface RegistroIngresoData {
  datosPersonales: DatosPersonales
  datosVisita: DatosVisita
  datosVehiculo?: DatosVehiculo
  acompanantes?: DatosAcompanante[]
  observaciones?: string
}

export interface RegistroIngreso {
  id: string
  tipo: 'ingreso'
  timestamp: Date
  datosPersonales: DatosPersonales
  datosVisita: DatosVisita
  datosVehiculo?: DatosVehiculo // Sección expandible opcional
  acompanantes?: DatosAcompanante[] // Acompañantes opcionales
  operadorId: string
  observaciones?: string
}

export interface RegistroSalida {
  id: string
  tipo: 'salida'
  timestamp: Date
  cedulaBuscada: string // Cédula de la persona que sale
  tiempoEstadia: number // Tiempo en minutos desde el ingreso
  observaciones?: string // Campo opcional
  operadorId: string
}

export interface PersonaDentro {
  cedula: string
  nombre: string
  apellido: string
  ingresoTimestamp: Date
  tipoVisitante: string
  areaVisitar: string
  conVehiculo: boolean
}

export type RegistroEntry = RegistroIngreso | RegistroSalida

export const useRegistroStore = defineStore('registro', () => {
  // State - Incluye registros de prueba para desarrollo
  const registros = ref<RegistroEntry[]>([
    // Registro de ingreso para María (con vehículo y acompañantes)
    {
      id: 'ing-001',
      tipo: 'ingreso' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      datosPersonales: {
        cedula: '12345678',
        nombre: 'María',
        apellido: 'González'
      },
      datosVisita: {
        tipoVisitante: 'Funcionario Público',
        areaVisitar: 'Dirección General'
      },
      datosVehiculo: {
        tipo: 'Auto',
        matricula: 'SAA1234'
      },
      acompanantes: [
        {
          cedula: '22334455',
          nombre: 'Pedro',
          apellido: 'Martínez',
          tipoVisitante: 'Personal Externo',
          areaVisitar: 'Administración'
        }
      ],
      operadorId: 'op-001'
    },
    // Registro de ingreso para Ana (con vehículo)
    {
      id: 'ing-002',
      tipo: 'ingreso' as const,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      datosPersonales: {
        cedula: '11223344',
        nombre: 'Ana',
        apellido: 'Silva'
      },
      datosVisita: {
        tipoVisitante: 'Visitante Oficial',
        areaVisitar: 'Administración'
      },
      datosVehiculo: {
        tipo: 'Camión',
        matricula: 'SMO5678'
      },
      operadorId: 'op-001'
    },
    // Registro de ingreso para Carlos (sin vehículo)
    {
      id: 'ing-003',
      tipo: 'ingreso' as const,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      datosPersonales: {
        cedula: '87654321',
        nombre: 'Carlos',
        apellido: 'Rodríguez'
      },
      datosVisita: {
        tipoVisitante: 'Proveedor/Contratista',
        areaVisitar: 'Mantenimiento'
      },
      operadorId: 'op-001'
    }
  ])
  
  const personasDentro = ref<PersonaDentro[]>([
    // Datos de prueba para desarrollo
    {
      cedula: '12345678',
      nombre: 'María',
      apellido: 'González',
      ingresoTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      tipoVisitante: 'Funcionario Público',
      areaVisitar: 'Dirección General',
      conVehiculo: true
    },
    {
      cedula: '22334455',
      nombre: 'Pedro',
      apellido: 'Martínez',
      ingresoTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás (mismo ingreso que María)
      tipoVisitante: 'Personal Externo',
      areaVisitar: 'Administración',
      conVehiculo: false // Acompañante, no tiene vehículo propio
    },
    {
      cedula: '87654321',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      ingresoTimestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      tipoVisitante: 'Proveedor/Contratista',
      areaVisitar: 'Mantenimiento',
      conVehiculo: false
    },
    {
      cedula: '11223344',
      nombre: 'Ana',
      apellido: 'Silva',
      ingresoTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      tipoVisitante: 'Visitante Oficial',
      areaVisitar: 'Administración',
      conVehiculo: true
    }
  ])
  const loading = ref(false)
  const lastSync = ref<Date | null>(null)

  // Getters
  const totalRegistros = computed(() => registros.value.length)
  
  const registrosHoy = computed(() => {
    const hoy = new Date().toDateString()
    return registros.value.filter((r) => new Date(r.timestamp).toDateString() === hoy)
  })

  const ingresosHoy = computed(() => 
    registrosHoy.value.filter(r => r.tipo === 'ingreso') as RegistroIngreso[]
  )

  const salidasHoy = computed(() => 
    registrosHoy.value.filter(r => r.tipo === 'salida') as RegistroSalida[]
  )

  const estadisticasHoy = computed(() => ({
    personasDentro: personasDentro.value.length,
    vehiculosDentro: personasDentro.value.filter(p => p.conVehiculo).length,
    ingresosHoy: ingresosHoy.value.length,
    salidasHoy: salidasHoy.value.length
  }))

  // Actions
  function registrarIngreso(datos: RegistroIngresoData, operadorId: string = 'op-001') {
    const nuevoRegistro: RegistroIngreso = {
      id: crypto.randomUUID(),
      tipo: 'ingreso',
      timestamp: new Date(),
      operadorId,
      ...datos
    }
    
    registros.value.unshift(nuevoRegistro)
    
    // Agregar persona principal a personas dentro
    const nuevaPersona: PersonaDentro = {
      cedula: datos.datosPersonales.cedula,
      nombre: datos.datosPersonales.nombre,
      apellido: datos.datosPersonales.apellido,
      ingresoTimestamp: nuevoRegistro.timestamp,
      tipoVisitante: datos.datosVisita.tipoVisitante,
      areaVisitar: datos.datosVisita.areaVisitar,
      conVehiculo: !!datos.datosVehiculo
    }
    
    personasDentro.value.push(nuevaPersona)
    
    // Agregar acompañantes si existen
    if (datos.acompanantes && datos.acompanantes.length > 0) {
      for (const acompanante of datos.acompanantes) {
        const nuevoAcompanante: PersonaDentro = {
          cedula: acompanante.cedula,
          nombre: acompanante.nombre,
          apellido: acompanante.apellido,
          ingresoTimestamp: nuevoRegistro.timestamp,
          tipoVisitante: acompanante.tipoVisitante, // Su propio tipo
          areaVisitar: acompanante.areaVisitar, // Su propia área
          conVehiculo: false // Acompañantes no "tienen" vehículo individualmente
        }
        personasDentro.value.push(nuevoAcompanante)
      }
    }
    
    // TODO: Guardar en IndexedDB cifrado
    return nuevoRegistro
  }

  function registrarSalida(datos: {
    cedulaBuscada: string
    tiempoEstadia: number
    operadorId: string
    observaciones?: string
  }) {
    const nuevoRegistro: RegistroSalida = {
      id: crypto.randomUUID(),
      tipo: 'salida', 
      timestamp: new Date(),
      ...datos
    }
    
    registros.value.unshift(nuevoRegistro)
    
    // Remover de personas dentro
    const index = personasDentro.value.findIndex(p => p.cedula === datos.cedulaBuscada)
    if (index !== -1) {
      personasDentro.value.splice(index, 1)
    }
    
    // TODO: Guardar en IndexedDB cifrado
    return nuevoRegistro
  }

  function buscarPersonasDentro(termino: string): PersonaDentro[] {
    if (!termino) return personasDentro.value
    
    const terminoLower = termino.toLowerCase()
    return personasDentro.value.filter(persona => 
      persona.cedula.includes(termino) ||
      persona.nombre.toLowerCase().includes(terminoLower) ||
      persona.apellido.toLowerCase().includes(terminoLower)
    )
  }

  function getRegistrosByCedula(cedula: string) {
    return registros.value.filter((r) => {
      if (r.tipo === 'ingreso') {
        return r.datosPersonales.cedula === cedula
      } else {
        return r.cedulaBuscada === cedula
      }
    })
  }

  function getRegistrosByMatricula(matricula: string) {
    return registros.value.filter((r) => 
      r.tipo === 'ingreso' && r.datosVehiculo?.matricula === matricula
    )
  }

  async function syncData() {
    loading.value = true
    try {
      // TODO: Implementar sincronización con IndexedDB
      lastSync.value = new Date()
    } catch (error) {
      console.error('Error sincronizando datos:', error)
    } finally {
      loading.value = false
    }
  }

  function clearData() {
    registros.value = []
    personasDentro.value = []
    lastSync.value = null
  }

  return {
    // State
    registros,
    personasDentro,
    loading,
    lastSync,
    // Getters
    totalRegistros,
    registrosHoy,
    ingresosHoy,
    salidasHoy,
    estadisticasHoy,
    // Actions
    registrarIngreso,
    registrarSalida,
    buscarPersonasDentro,
    getRegistrosByCedula,
    getRegistrosByMatricula,
    syncData,
    clearData,
  }
})
