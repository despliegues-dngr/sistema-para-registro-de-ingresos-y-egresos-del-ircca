import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { 
  useRegistrosOperations, 
  useRegistrosSearch, 
  useRegistrosStats,
  useRegistrosCompatibility,
  useRegistrosHelpers
} from '@/composables/useRegistros'

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
    
    // 🔍 DEBUG: Log de datos de entrada
    console.log('🚀 [STORE DEBUG] === REGISTRANDO INGRESO ===')
    console.log('🚀 [STORE DEBUG] Datos completos recibidos:', JSON.stringify(datos, null, 2))
    console.log('🚀 [STORE DEBUG] ¿Tiene vehículo?', !!datos.datosVehiculo)
    if (datos.datosVehiculo) {
      console.log('🚀 [STORE DEBUG] Tipo de vehículo:', datos.datosVehiculo.tipo)
      console.log('🚀 [STORE DEBUG] Matrícula:', datos.datosVehiculo.matricula)
    }
    console.log('🚀 [STORE DEBUG] ==========================================')
    
    try {
      const result = await operations.registrarIngreso(datos, operadorId)
      
      if (result.success && result.registro) {
        // Actualizar estado local solo si BD fue exitosa
        registrosRaw.value.unshift(result.registro)
        
        // 🔍 DEBUG: Log de registro guardado
        console.log('✅ [STORE DEBUG] === REGISTRO GUARDADO EXITOSO ===')
        console.log('✅ [STORE DEBUG] Registro completo guardado:', JSON.stringify(result.registro, null, 2))
        const registroIngreso = result.registro as RegistroIngreso
        if (registroIngreso.datosVehiculo) {
          console.log('✅ [STORE DEBUG] Vehículo guardado - Tipo:', registroIngreso.datosVehiculo.tipo)
          console.log('✅ [STORE DEBUG] Vehículo guardado - Matrícula:', registroIngreso.datosVehiculo.matricula)
        }
        console.log('✅ [STORE DEBUG] =======================================')
        
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
        
        return result.registro
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
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
        
        return result.registro
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
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
      console.log('🔍 [DEBUG] Cargando registros reales de IndexedDB...')
      loading.value = true
      
      // ✅ VERIFICAR AUTENTICACIÓN ANTES DE INTENTAR CARGAR DATOS
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated || !authStore.user) {
        console.log('🔍 [DEBUG] Usuario no autenticado, no se cargan datos')
        return
      }
      
      // ✅ INICIALIZAR DATABASESERVICE CON CLAVE DE SESIÓN
      const databaseModule = await import('@/services/databaseService')
      console.log('🔍 [DEBUG] Inicializando DatabaseService con usuario:', authStore.user.username)
      
      await databaseModule.databaseService.initializeWithSessionKey(authStore.user.username)
      console.log('✅ [DEBUG] DatabaseService inicializado correctamente')
      
      // Obtener registros descifrados
      const registrosDescifrados = await databaseModule.databaseService.getRegistrosDescifrados()
      
      console.log('✅ [DEBUG] Registros descifrados obtenidos:', registrosDescifrados.length)
      
      // Actualizar store con datos reales
      registrosRaw.value = registrosDescifrados
      
      // Reconstruir personasDentro desde registros reales
      rebuildPersonasDentro()
      
      lastSync.value = new Date()
      console.log('✅ [DEBUG] Store actualizado con datos reales')
      
    } catch (error) {
      console.error('❌ [DEBUG] Error cargando datos reales:', error)
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
      console.log('🚀 [STORE] Inicializando con datos reales...')
      await loadRegistrosFromDB()
    } catch (error) {
      console.warn('⚠️ [STORE] No se pudieron cargar datos iniciales (normal si es primera vez):', error)
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
