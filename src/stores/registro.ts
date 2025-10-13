import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  useRegistrosOperations, 
  useRegistrosSearch, 
  useRegistrosStats,
  useRegistrosCompatibility,
  useRegistrosHelpers
} from '@/composables/useRegistros'
import { useAuditStore } from './audit'
import { useAuthStore } from './auth'

// Tipos según especificación del modal de ingreso
export interface DatosPersonales {
  cedula: string // 8 dígitos (campo obligatorio)
  nombre: string // Campo obligatorio
  apellido: string // Campo obligatorio  
}

export interface DatosAcompanante extends DatosPersonales {
  destino: string // Cada acompañante puede tener diferente destino
}

// ✅ NUEVA INTERFAZ: Para tracking avanzado de acompañantes
export interface AcompananteConMetadata extends DatosAcompanante {
  posicionEnGrupo: number // Orden en el grupo (1, 2, 3...)
  registroGrupalId: string // ID del registro principal
  fechaIngreso: Date // Cuándo ingresó
  estado: 'dentro' | 'salida_parcial' | 'salida_completa' // Estado actual
  fechaSalida?: Date // Cuándo salió (si aplica)
  salidaIndividual?: boolean // Si salió separado del grupo
}

export interface DatosVisita {
  destino: string // Selector - Campo obligatorio
}

export interface DatosVehiculo {
  tipo: string // Auto, Moto, Camión, Bus
  matricula: string // Formato ABC1234
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

export type RegistroEntry = RegistroIngreso | RegistroSalida

// Interfaz para los datos del formulario (sin id, timestamp, operadorId)
export interface RegistroIngresoData {
  datosPersonales: DatosPersonales
  datosVisita: DatosVisita
  datosVehiculo?: DatosVehiculo
  acompanantes?: DatosAcompanante[]
  observaciones?: string
}

export interface PersonaDentro {
  cedula: string
  nombre: string
  apellido: string
  ingresoTimestamp: Date
  destino: string
  conVehiculo: boolean
}

// Interfaces para compatibilidad con tests (estructura simplificada)
export interface PersonaTest {
  documento: string
  nombre: string
  apellido: string
  motivo: string
}

export interface VehiculoTest {
  tipo: string
  matricula: string
  marca: string
  modelo: string
  conductor: string
}

export interface RegistroTest {
  id?: string
  tipo: 'ingreso' | 'egreso'
  persona: PersonaTest
  vehiculo?: VehiculoTest
  operadorId: string
  timestamp?: Date
  observaciones?: string
}

/**
 * Store de Registros - SOLO ESTADO PURO
 * Refactorizado para separar responsabilidades según arquitectura oficial
 */
export const useRegistroStore = defineStore('registro', () => {
  // ========================================
  // 📊 ESTADO REACTIVO PURO
  // ========================================
  
  // ✅ INICIALIZAR CON DATOS VACÍOS (los datos reales se cargan desde IndexedDB)
  const registrosRaw = ref<RegistroEntry[]>([])
  const personasDentro = ref<PersonaDentro[]>([])
  const loading = ref(false)
  const lastSync = ref<Date | null>(null)

  // ========================================
  // 🔧 COMPOSABLES - LÓGICA REUTILIZABLE
  // ========================================
  
  const operations = useRegistrosOperations()
  const search = useRegistrosSearch()
  const stats = useRegistrosStats(registrosRaw)
  const compatibility = useRegistrosCompatibility(registrosRaw)
  const helpers = useRegistrosHelpers(registrosRaw, personasDentro)

  // ========================================
  // 📈 GETTERS COMPUTADOS BÁSICOS
  // ========================================

  // Computed que siempre devuelve wrappers para compatibilidad con tests
  const registros = computed(() => {
    return compatibility.registrosWrapped.value
  })

  // ========================================
  // 🎯 ACTIONS - DELEGADAS A COMPOSABLES
  // ========================================

  /**
   * Registra un nuevo ingreso
   */
  async function registrarIngreso(datos: RegistroIngresoData, operadorId: string = 'op-001') {
    loading.value = true
    const auditStore = useAuditStore()
    const authStore = useAuthStore()
    
    try {
      const result = await operations.registrarIngreso(datos, operadorId)
      
      if (result.success && result.registro) {
        // Actualizar estado local solo si BD fue exitosa
        registrosRaw.value.unshift(result.registro)
        
        // Agregar persona principal a personas dentro
        const nuevaPersona: PersonaDentro = {
          cedula: datos.datosPersonales.cedula,
          nombre: datos.datosPersonales.nombre,
          apellido: datos.datosPersonales.apellido,
          ingresoTimestamp: result.registro.timestamp,
          destino: datos.datosVisita.destino,
          conVehiculo: !!datos.datosVehiculo
        }
        personasDentro.value.push(nuevaPersona)
        
        // Agregar acompañantes si los hay
        if (datos.acompanantes) {
          for (const acompanante of datos.acompanantes) {
            const nuevoAcompanante: PersonaDentro = {
              cedula: acompanante.cedula,
              nombre: acompanante.nombre,
              apellido: acompanante.apellido,
              ingresoTimestamp: result.registro.timestamp,
              destino: acompanante.destino,
              conVehiculo: false
            }
            personasDentro.value.push(nuevoAcompanante)
          }
        }
        
        // ✅ AUTOCOMPLETE: Actualizar persona conocida en IndexedDB
        try {
          const autocompleteModule = await import('@/services/autocompleteService')
          
          // Actualizar titular (NO es acompañante)
          await autocompleteModule.autocompleteService.actualizarPersonaConocida({
            cedula: datos.datosPersonales.cedula,
            nombre: datos.datosPersonales.nombre,
            apellido: datos.datosPersonales.apellido,
            destino: datos.datosVisita.destino,
            vehiculo: datos.datosVehiculo,
            esAcompanante: false
          })
          
          // Actualizar acompañantes (SÍ son acompañantes)
          if (datos.acompanantes) {
            for (const acomp of datos.acompanantes) {
              await autocompleteModule.autocompleteService.actualizarPersonaConocida({
                cedula: acomp.cedula,
                nombre: acomp.nombre,
                apellido: acomp.apellido,
                destino: acomp.destino,
                esAcompanante: true
              })
            }
          }
        } catch {
          // Error no crítico en autocomplete
        }
        
        // ✅ AUDITORÍA: Log de registro creado (sin datos personales)
        if (authStore.user) {
          await auditStore.logDataOperation(
            authStore.user.id,
            authStore.user.username,
            'registro.created',
            crypto.randomUUID(),
            {
              registroId: result.registro.id,
              tipo: 'ingreso',
              tieneVehiculo: !!datos.datosVehiculo,
              tipoVehiculo: datos.datosVehiculo?.tipo,
              cantidadAcompanantes: datos.acompanantes?.length || 0,
              timestamp: result.registro.timestamp
              // ℹ️ Destino NO se registra (dato sensible). Usar registroId para consultar detalles.
            }
          )
        }
        
        return result.registro
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      // ✅ AUDITORÍA: Log de error
      if (authStore.user) {
        await auditStore.logSystemError(
          authStore.user.id,
          authStore.user.username,
          'Error al crear registro de ingreso',
          crypto.randomUUID(),
          {
            error: error instanceof Error ? error.message : 'Error desconocido',
            operation: 'registrarIngreso'
          }
        )
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra una nueva salida
   */
  async function registrarSalida(datos: {
    cedulaBuscada: string
    tiempoEstadia: number
    operadorId: string
    observaciones?: string
  }) {
    loading.value = true
    const auditStore = useAuditStore()
    const authStore = useAuthStore()
    
    try {
      const result = await operations.registrarSalida(datos)
      
      if (result.success && result.registro) {
        // Actualizar estado local solo si BD fue exitosa
        registrosRaw.value.unshift(result.registro)
        
        // Remover de personas dentro
        const index = personasDentro.value.findIndex(p => p.cedula === datos.cedulaBuscada)
        if (index !== -1) {
          personasDentro.value.splice(index, 1)
        }
        
        // ✅ AUDITORÍA: Log de registro modificado (salida)
        if (authStore.user) {
          await auditStore.logDataOperation(
            authStore.user.id,
            authStore.user.username,
            'registro.modified',
            crypto.randomUUID(),
            {
              registroId: result.registro.id,
              tipo: 'salida',
              tiempoEstadia: datos.tiempoEstadia,
              tiempoEstadiaHoras: Math.floor(datos.tiempoEstadia / (1000 * 60 * 60)),
              observaciones: datos.observaciones || 'Sin observaciones',
              timestamp: result.registro.timestamp
            }
          )
        }
        
        return result.registro
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      // ✅ AUDITORÍA: Log de error
      if (authStore.user) {
        await auditStore.logSystemError(
          authStore.user.id,
          authStore.user.username,
          'Error al registrar salida',
          crypto.randomUUID(),
          {
            error: error instanceof Error ? error.message : 'Error desconocido',
            operation: 'registrarSalida',
            cedulaBuscada: datos.cedulaBuscada
          }
        )
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca personas dentro del predio
   */
  function buscarPersonasDentro(termino: string): PersonaDentro[] {
    return search.searchPersonasDentro(personasDentro.value, termino)
  }

  /**
   * Obtiene registros por cédula
   */
  function getRegistrosByCedula(cedula: string) {
    return registrosRaw.value.filter((r) => {
      if (r.tipo === 'ingreso') {
        return (r as RegistroIngreso).datosPersonales.cedula === cedula
      } else {
        return (r as RegistroSalida).cedulaBuscada === cedula
      }
    })
  }

  /**
   * Sincroniza datos desde IndexedDB
   */
  async function syncData() {
    loading.value = true
    try {
      const result = await operations.syncData()
      
      if (result.success && result.registros) {
        registrosRaw.value = result.registros
        lastSync.value = new Date()
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpia todos los datos
   */
  function clearData() {
    registrosRaw.value = []
    personasDentro.value = []
    lastSync.value = null
  }

  // ========================================
  // 🔗 MÉTODOS PARA COMPATIBILIDAD CON TESTS
  // ========================================

  function addRegistro(registro: RegistroTest) {
    // Para compatibilidad con tests, convertimos RegistroTest al formato esperado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return compatibility.addRegistro(registro as any)
  }

  function getRegistrosByDocumento(documento: string) {
    return compatibility.getRegistrosByDocumento(documento)
  }

  function getRegistrosByMatriculaTest(matricula: string) {
    return compatibility.getRegistrosByMatriculaTest(matricula)
  }

  // ========================================
  // 🛠️ HELPERS DELEGADOS
  // ========================================

  function getVehiculoInfo(cedula: string) {
    return helpers.getVehiculoInfo(cedula)
  }

  function getAcompanantesData(cedula: string) {
    return helpers.getAcompanantesData(cedula)
  }

  // ========================================
  // 🔄 SINCRONIZACIÓN CON INDEXEDDB
  // ========================================

  /**
   * ✅ CARGAR DATOS REALES DESDE INDEXEDDB
   */
  async function loadRegistrosFromDB() {
    try {
      loading.value = true
      
      // ✅ VERIFICAR AUTENTICACIÓN ANTES DE INTENTAR CARGAR DATOS
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated || !authStore.user) {
        return
      }
      
      // ✅ INICIALIZAR DATABASESERVICE CON CLAVE DE SESIÓN
      const databaseModule = await import('@/services/databaseService')
      
      await databaseModule.databaseService.initializeWithSessionKey()
      
      // Obtener registros descifrados
      const registrosDescifrados = await databaseModule.databaseService.getRegistrosDescifrados()
      
      // Actualizar store con datos reales
      registrosRaw.value = registrosDescifrados
      
      // Reconstruir personasDentro desde registros reales
      rebuildPersonasDentro()
      
      // ✅ SINCRONIZAR AUTOCOMPLETADO: Migrar registros existentes a personasConocidas
      try {
        const autocompleteModule = await import('@/services/autocompleteService')
        await autocompleteModule.autocompleteService.sincronizarDesdeRegistros(registrosDescifrados)
      } catch {
        // Error no crítico en sincronización
      }
      
      lastSync.value = new Date()
      
    } catch {
      // Error silencioso
    } finally {
      loading.value = false
    }
  }
  /**
   * ✅ RECONSTRUIR PERSONAS DENTRO DESDE DATOS REALES
   */
  function rebuildPersonasDentro() {
    personasDentro.value = []
    
    // Obtener solo ingresos sin salida correspondiente
    const ingresos = registrosRaw.value.filter(r => r.tipo === 'ingreso') as RegistroIngreso[]
    const salidas = registrosRaw.value.filter(r => r.tipo === 'salida') as RegistroSalida[]
    
    for (const ingreso of ingresos) {
      // Verificar si esta persona ya salió
      const tieneSalida = salidas.some(salida => 
        salida.cedulaBuscada === ingreso.datosPersonales.cedula &&
        salida.timestamp > ingreso.timestamp
      )
      
      if (!tieneSalida) {
        // Añadir persona principal
        const personaPrincipal = {
          cedula: ingreso.datosPersonales.cedula,
          nombre: ingreso.datosPersonales.nombre,
          apellido: ingreso.datosPersonales.apellido,
          ingresoTimestamp: ingreso.timestamp,
          destino: ingreso.datosVisita.destino,
          conVehiculo: !!ingreso.datosVehiculo
        }
        
        personasDentro.value.push(personaPrincipal)
        
        // Añadir acompañantes
        if (ingreso.acompanantes && ingreso.acompanantes.length > 0) {
          for (const acompanante of ingreso.acompanantes) {
            const acompanantePersona = {
              cedula: acompanante.cedula,
              nombre: acompanante.nombre,
              apellido: acompanante.apellido,
              ingresoTimestamp: ingreso.timestamp,
              destino: acompanante.destino,
              conVehiculo: false
            }
            
            personasDentro.value.push(acompanantePersona)
          }
        }
      }
    }
  }

  // ========================================
  // 🚀 INICIALIZACIÓN AUTOMÁTICA
  // ========================================

  /**
   * ✅ CARGAR DATOS REALES AL INICIALIZAR EL STORE (BAJO DEMANDA)
   */
  async function initializeStore() {
    try {
      await loadRegistrosFromDB()
    } catch {
      // En caso de error, mantener arrays vacíos
    }
  }

  /**
   * ✅ INICIALIZAR STORE MANUALMENTE (cuando el usuario esté autenticado)
   */
  async function initializeStoreWhenAuthenticated() {
    // Solo inicializar si aún no hay datos cargados
    if (registrosRaw.value.length === 0 && personasDentro.value.length === 0) {
      await initializeStore()
    }
  }

  // ========================================
  // 📤 EXPORTS - INTERFAZ PÚBLICA
  // ========================================

  return {
    // State
    registros,
    registrosRaw,  // 🔧 EXPONER registrosRaw directamente
    personasDentro,
    loading,
    lastSync,
    
    // Getters (computados desde composables)
    totalRegistros: stats.totalRegistros,
    registrosHoy: stats.registrosHoy,
    ingresosHoy: stats.ingresosHoy,
    salidasHoy: stats.salidasHoy,
    estadisticasHoy: stats.estadisticasHoy,
    ingresosPendientes: stats.ingresosPendientes,
    
    // Actions
    registrarIngreso,
    registrarSalida,
    buscarPersonasDentro,
    getRegistrosByCedula,
    syncData,
    clearData,
    loadRegistrosFromDB,
    initializeStoreWhenAuthenticated,
    
    // Helpers
    getVehiculoInfo,
    getAcompanantesData,
    
    // Métodos para compatibilidad con tests
    addRegistro,
    getRegistrosByDocumento,
    getRegistrosByMatricula: getRegistrosByMatriculaTest
  }
})
