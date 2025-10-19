import { useDatabase } from '@/composables/useDatabase'
import { databaseService } from '@/services/databaseService'
import { autocompleteService } from '@/services/autocompleteService'
import { useAuthStore } from '@/stores/auth'
import type { 
  RegistroIngresoData, 
  RegistroIngreso, 
  RegistroSalida, 
  RegistroEntry,
  DatosVehiculo
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
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('Usuario no autenticado. Inicie sesión para continuar.')
    }

    // Approach más simple: siempre intentar inicializar DatabaseService
    // Si ya está inicializado, el método debería ser idempotente
    try {
      await databaseService.initializeWithSessionKey()
    } catch (error) {
      throw error
    }
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
        throw new Error(result.error || 'Error al guardar registro de ingreso en base de datos')
      }
      
      // ✅ ACTUALIZAR PERSONAS CONOCIDAS (para autocompletado futuro)
      try {
        await autocompleteService.actualizarPersonaConocida({
          cedula: datos.datosPersonales.cedula,
          nombre: datos.datosPersonales.nombre,
          apellido: datos.datosPersonales.apellido,
          destino: datos.datosVisita.destino,
          vehiculo: datos.datosVehiculo
        })
        
        // También actualizar acompañantes
        if (datos.acompanantes && datos.acompanantes.length > 0) {
          for (const acomp of datos.acompanantes) {
            await autocompleteService.actualizarPersonaConocida({
              cedula: acomp.cedula,
              nombre: acomp.nombre,
              apellido: acomp.apellido,
              destino: acomp.destino
            })
          }
        }
      } catch {
        // No bloquear registro si falla autocompletado
      }
      
      return nuevoRegistro
      
    } catch (error) {
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
    datosVehiculoSalida?: DatosVehiculo
    acompanantesSalida?: string[]
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
      
      return nuevoRegistro
      
    } catch (error) {
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
        return registrosFromDB
      }
      return []
      
    } catch (error) {
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
    } catch {
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
    } catch {
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
      return { success: false, error: String(error) }
    }
  }

  /**
   * Limpia datos antiguos según política de retención
   */
  async cleanOldData(daysToKeep: number = 365): Promise<{ success: boolean; cleaned: number }> {
    try {
      return await databaseService.cleanOldData(daysToKeep)
    } catch {
      return { success: false, cleaned: 0 }
    }
  }
}

// Instancia singleton
export const registroService = new RegistroService()
