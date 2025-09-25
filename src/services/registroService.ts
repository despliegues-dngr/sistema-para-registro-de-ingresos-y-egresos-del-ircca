import { useDatabase } from '@/composables/useDatabase'
import { databaseService } from '@/services/databaseService'
import { useAuthStore } from '@/stores/auth'
import type { 
  RegistroIngresoData, 
  RegistroIngreso, 
  RegistroSalida, 
  RegistroEntry
} from '@/stores/registro'

/**
 * Servicio para operaciones CRUD de registros
 * Maneja la lógica de negocio y persistencia en IndexedDB
 */
export class RegistroService {
  private db = useDatabase()

  /**
   * Inicializa DatabaseService con clave de sesión del usuario autenticado
   */
  private async ensureDatabaseServiceInitialized() {
    console.log('🔍 [DEBUG] ensureDatabaseServiceInitialized() - INICIO')
    
    const authStore = useAuthStore()
    console.log('🔍 [DEBUG] authStore.isAuthenticated:', authStore.isAuthenticated)
    console.log('🔍 [DEBUG] authStore.user exists:', !!authStore.user)
    
    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('Usuario no autenticado. Inicie sesión para continuar.')
    }

    // Approach más simple: siempre intentar inicializar DatabaseService
    // Si ya está inicializado, el método debería ser idempotente
    try {
      console.log('🔍 [DEBUG] Inicializando DatabaseService (idempotente)...')
      console.log('🔍 [DEBUG] Username a usar:', authStore.user.username)
      
      await databaseService.initializeWithSessionKey(authStore.user.username)
      console.log('✅ [DEBUG] DatabaseService inicializado/verificado')
      
    } catch (error) {
      console.error('❌ [DEBUG] Error inicializando DatabaseService:', error)
      throw error
    }
    
    console.log('🔍 [DEBUG] ensureDatabaseServiceInitialized() - FIN')
  }

  /**
   * Registra un nuevo ingreso con cifrado en IndexedDB
   */
  async registrarIngreso(
    datos: RegistroIngresoData, 
    operadorId: string = 'op-001'
  ): Promise<RegistroIngreso> {
    const nuevoRegistro: RegistroIngreso = {
      id: crypto.randomUUID(),
      tipo: 'ingreso',
      timestamp: new Date(),
      operadorId,
      ...datos
    }

    try {
      console.log('🔍 [DEBUG] registrarIngreso() - INICIO')
      console.log('🔍 [DEBUG] Datos recibidos:', { 
        cedula: datos.datosPersonales.cedula, 
        nombre: datos.datosPersonales.nombre,
        operadorId: operadorId
      })
      console.log('🔍 [DEBUG] Datos COMPLETOS recibidos:', JSON.stringify(datos, null, 2))
      console.log('🔍 [DEBUG] ¿Tiene acompañantes?', !!datos.acompanantes)
      console.log('🔍 [DEBUG] Cantidad acompañantes:', datos.acompanantes?.length || 0)
      if (datos.acompanantes && datos.acompanantes.length > 0) {
        console.log('🔍 [DEBUG] Detalles de acompañantes:', datos.acompanantes.map(a => `${a.nombre} ${a.apellido} (${a.cedula})`))
      }
      
      // ✅ INICIALIZAR INDEXEDDB BÁSICO PRIMERO
      console.log('🔍 [DEBUG] Paso 1: Inicializando IndexedDB básico...')
      const dbResult = await this.db.initDatabase()
      console.log('🔍 [DEBUG] Resultado initDatabase:', dbResult)
      
      if (!dbResult.success) {
        console.error('❌ [DEBUG] Error en initDatabase:', dbResult.error)
        throw new Error(dbResult.error || 'Error inicializando IndexedDB')
      }
      console.log('✅ [DEBUG] IndexedDB básico inicializado')
      
      // ✅ ASEGURAR INICIALIZACIÓN DE DATABASESERVICE (capa de cifrado)
      console.log('🔍 [DEBUG] Paso 2: Inicializando DatabaseService...')
      await this.ensureDatabaseServiceInitialized()
      console.log('✅ [DEBUG] DatabaseService listo')
      
      // ✅ GUARDAR EN INDEXEDDB CIFRADO
      console.log('🔍 [DEBUG] Paso 3: Guardando registro cifrado...')
      console.log('🔍 [DEBUG] Registro a guardar:', {
        id: nuevoRegistro.id,
        tipo: nuevoRegistro.tipo,
        cedula: nuevoRegistro.datosPersonales.cedula
      })
      
      const result = await databaseService.saveRegistro(nuevoRegistro)
      console.log('🔍 [DEBUG] Resultado saveRegistro:', result)
      
      if (!result.success) {
        console.error('❌ [DEBUG] Error en saveRegistro:', result.error)
        throw new Error(result.error || 'Error al guardar registro de ingreso en base de datos')
      }
      
      console.log('✅ [DEBUG] Registro guardado exitosamente en BD')
      console.log('✅ Registro de ingreso guardado exitosamente:', nuevoRegistro.id)
      return nuevoRegistro
      
    } catch (error) {
      console.error('❌ [DEBUG] Error completo en registrarIngreso:', error)
      console.error('❌ [DEBUG] Stack trace:', error instanceof Error ? error.stack : 'No stack available')
      throw error
    }
  }

  /**
   * Registra una nueva salida con cifrado en IndexedDB
   */
  async registrarSalida(datos: {
    cedulaBuscada: string
    tiempoEstadia: number
    operadorId: string
    observaciones?: string
  }): Promise<RegistroSalida> {
    const nuevoRegistro: RegistroSalida = {
      id: crypto.randomUUID(),
      tipo: 'salida', 
      timestamp: new Date(),
      ...datos
    }
    
    try {
      // ✅ INICIALIZAR INDEXEDDB BÁSICO PRIMERO
      const dbResult = await this.db.initDatabase()
      if (!dbResult.success) {
        throw new Error(dbResult.error || 'Error inicializando IndexedDB')
      }
      
      // ✅ ASEGURAR INICIALIZACIÓN DE DATABASESERVICE (capa de cifrado)
      await this.ensureDatabaseServiceInitialized()
      
      // ✅ GUARDAR EN INDEXEDDB CIFRADO
      const result = await databaseService.saveRegistro(nuevoRegistro)
      
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar registro de salida en base de datos')
      }
      
      console.log('✅ Registro de salida guardado exitosamente:', nuevoRegistro.id)
      return nuevoRegistro
      
    } catch (error) {
      console.error('❌ Error guardando registro de salida:', error)
      throw error
    }
  }

  /**
   * Sincroniza datos desde IndexedDB
   */
  async syncData(): Promise<RegistroEntry[]> {
    try {
      // ✅ INICIALIZAR INDEXEDDB BÁSICO PRIMERO
      const dbResult = await this.db.initDatabase()
      if (!dbResult.success) {
        throw new Error(dbResult.error || 'Error inicializando IndexedDB')
      }
      
      // ✅ ASEGURAR INICIALIZACIÓN DE DATABASESERVICE (capa de cifrado)
      await this.ensureDatabaseServiceInitialized()
      
      // ✅ CARGAR REGISTROS DESDE BD
      const registrosFromDB = await databaseService.getRegistros()
      if (registrosFromDB.length > 0) {
        console.log(`✅ Sincronizados ${registrosFromDB.length} registros desde IndexedDB`)
        return registrosFromDB
      }
      return []
      
    } catch (error) {
      console.error('Error sincronizando datos:', error)
      throw error
    }
  }

  /**
   * Busca registros por cédula
   */
  async getRegistrosByCedula(cedula: string): Promise<RegistroEntry[]> {
    try {
      await this.db.initDatabase()
      return await databaseService.searchByDocumento(cedula)
    } catch (error) {
      console.error('Error buscando registros por cédula:', error)
      return []
    }
  }

  /**
   * Busca registros por matrícula de vehículo
   */
  async getRegistrosByMatricula(matricula: string): Promise<RegistroEntry[]> {
    try {
      await this.db.initDatabase()
      return await databaseService.searchByMatricula(matricula)
    } catch (error) {
      console.error('Error buscando registros por matrícula:', error)
      return []
    }
  }

  /**
   * Crea un backup manual cifrado
   */
  async createBackup(): Promise<{ success: boolean; error?: string; backupId?: string }> {
    try {
      return await databaseService.createBackup()
    } catch (error) {
      console.error('Error creando backup:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Limpia datos antiguos según política de retención
   */
  async cleanOldData(daysToKeep: number = 365): Promise<{ success: boolean; cleaned: number }> {
    try {
      return await databaseService.cleanOldData(daysToKeep)
    } catch (error) {
      console.error('Error limpiando datos antiguos:', error)
      return { success: false, cleaned: 0 }
    }
  }
}

// Instancia singleton
export const registroService = new RegistroService()
