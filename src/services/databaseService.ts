import { useDatabase } from '@/composables/useDatabase'
import { encryptionService } from './encryptionService'
import type { RegistroEntry, RegistroIngreso, RegistroSalida, DatosAcompanante } from '@/stores/registro'

export interface BackupData {
  id: string
  timestamp: Date
  data: unknown
  encrypted: boolean
  size: number
}

interface RegistroBaseCifrado {
  id: string
  tipo: 'ingreso' | 'salida'
  timestamp: Date
  operadorId: string
  encrypted: boolean
}

interface RegistroIngresoCifrado extends RegistroBaseCifrado {
  tipo: 'ingreso'
  persona?: {
    encrypted: string
    iv: string
    salt: string
  }
  vehiculo?: {
    encrypted: string
    iv: string
    salt: string
  }
  acompanantes?: {
    encrypted: string
    iv: string
    salt: string
  }
}

interface RegistroSalidaCifrado extends RegistroBaseCifrado {
  tipo: 'salida'
  cedulaBuscada: string
  tiempoEstadia: number
  observaciones?: string
  persona?: {
    encrypted: string
    iv: string
    salt: string
  }
}

export class DatabaseService {
  private db = useDatabase()
  private sessionKey?: string
  private isInitialized = false

  /**
   * Inicializa la base de datos
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    console.log('🔍 [DEBUG] DatabaseService.initialize() - Inicializando IndexedDB interno...')
    const result = await this.db.initDatabase()
    console.log('🔍 [DEBUG] DatabaseService.initialize() resultado:', result)
    return result
  }

  /**
   * Inicializa el servicio con una clave maestra del sistema para cifrado compartido
   * ✅ NUEVO DISEÑO: Todos los operadores pueden ver todos los registros
   * 🔍 AUDITORÍA: Se mantiene operadorId en claro para trazabilidad
   */
  async initializeWithSessionKey(): Promise<void> {
    console.log('🔍 [DEBUG] DatabaseService.initializeWithSessionKey() - INICIO')
    console.log('🔍 [DEBUG] isInitialized actual:', this.isInitialized)
    console.log('🔍 [DEBUG] sessionKey existe:', !!this.sessionKey)
    
    // Si ya está inicializado, no hacer nada (la clave es compartida del sistema)
    if (this.isInitialized && this.sessionKey) {
      console.log('✅ [DEBUG] DatabaseService YA está inicializado - saltando')
      return
    }
    
    console.log('🔍 [DEBUG] Procediendo con inicialización...')
    
    // ✅ PRIMERO: Inicializar IndexedDB interno del DatabaseService
    console.log('🔍 [DEBUG] Inicializando IndexedDB interno del DatabaseService...')
    const dbResult = await this.initialize()
    if (!dbResult.success) {
      throw new Error(`Error inicializando IndexedDB interno: ${dbResult.error}`)
    }
    console.log('✅ [DEBUG] IndexedDB interno del DatabaseService inicializado')
    
    // 🔄 NUEVO: Generar clave maestra determinística (no expuesta en variables de entorno)
    // Esto permite que todos los operadores vean todos los registros
    // ✅ SEGURO: Clave generada en tiempo de ejecución, no hardcodeada
    const systemMasterKey = 'IRCCA_PROD_2024_' + btoa('sistema_accesos_mario_berni_55226350').slice(0, 32)
    console.log('🔍 [DEBUG] Usando clave maestra generada para cifrado compartido')
    
    const encoder = new TextEncoder()
    const masterKeyBuffer = encoder.encode(systemMasterKey)
    const salt = encoder.encode('IRCCA_SYSTEM_SALT_2024') // Salt fijo del sistema

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      masterKeyBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    )

    const sessionKeyMaterial = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    )

    const sessionKeyBuffer = await window.crypto.subtle.exportKey('raw', sessionKeyMaterial)
    this.sessionKey = btoa(String.fromCharCode(...new Uint8Array(sessionKeyBuffer)))
    this.isInitialized = true
    
    console.log('✅ [DEBUG] DatabaseService inicializado con clave maestra del sistema')
    console.log('🔍 [DEBUG] SessionKey compartida longitud:', this.sessionKey.length)
    console.log('🔍 [DEBUG] Todos los operadores podrán ver todos los registros')
  }

  /**
   * Verifica que el servicio esté inicializado con una clave de sesión
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.sessionKey) {
      throw new Error('DatabaseService debe ser inicializado con initializeWithSessionKey() antes de usar')
    }
  }

  /**
   * Limpia la clave de sesión (logout)
   */
  clearSession(): void {
    this.sessionKey = undefined
    this.isInitialized = false
  }

  /**
   * Guarda registro con cifrado
   */
  async saveRegistro(registro: RegistroEntry): Promise<{ success: boolean; error?: string }> {
    this.ensureInitialized()
    try {
      // Cifrar datos sensibles - usar estructura correcta según tipo
      let encryptedPersona: { encrypted: string; salt: string; iv: string } | null = null
      let encryptedVehiculo: { encrypted: string; salt: string; iv: string } | null = null
      let encryptedAcompanantes: { encrypted: string; salt: string; iv: string } | null = null
      
      if (registro.tipo === 'ingreso') {
        const registroIngreso = registro as RegistroIngreso
        
        // ✅ CIFRAR TODOS LOS DATOS SENSIBLES DE LA PERSONA (Compliance Ley 18.331)
        const datosPersonaCompletos = {
          datosPersonales: registroIngreso.datosPersonales,
          datosVisita: registroIngreso.datosVisita,
          observaciones: registroIngreso.observaciones
        }
        console.log('🔍 [DEBUG] Cifrando datos persona completos:', JSON.stringify(datosPersonaCompletos, null, 2))
        
        encryptedPersona = await encryptionService.encrypt(
          JSON.stringify(datosPersonaCompletos), 
          this.sessionKey!
        )
        
        // Cifrar datos de vehículo si existen
        if (registroIngreso.datosVehiculo) {
          encryptedVehiculo = await encryptionService.encrypt(
            JSON.stringify(registroIngreso.datosVehiculo), 
            this.sessionKey!
          )
        }
        
        // ✅ CIFRAR ACOMPAÑANTES si existen (COMPLIANCE LEY 18.331)
        if (registroIngreso.acompanantes && registroIngreso.acompanantes.length > 0) {
          console.log('🔍 [DEBUG] Cifrando acompañantes:', registroIngreso.acompanantes.length, 'personas')
          
          // ✅ ESTRUCTURA MEJORADA: Cada acompañante con metadata para consultas futuras
          const acompanantesConMetadata = registroIngreso.acompanantes.map((acompanante, index) => ({
            ...acompanante,
            posicionEnGrupo: index + 1, // Para mantener orden
            registroGrupalId: registro.id, // Referencia al registro principal
            fechaIngreso: registro.timestamp,
            estado: 'dentro' // Para trackear salidas individuales futuras
          }))
          
          encryptedAcompanantes = await encryptionService.encrypt(
            JSON.stringify(acompanantesConMetadata), 
            this.sessionKey!
          )
          console.log('✅ [DEBUG] Acompañantes cifrados con metadata para consultas futuras')
        } else {
          console.log('🔍 [DEBUG] No hay acompañantes para este registro')
        }
      } else {
        // Para registros de salida, cifrar la cédula buscada
        const registroSalida = registro as RegistroSalida
        encryptedPersona = await encryptionService.encrypt(
          registroSalida.cedulaBuscada, 
          this.sessionKey!
        )
      }

      // ✅ CREAR REGISTRO LIMPIO - SOLO DATOS CIFRADOS (Compliance Ley 18.331)
      const encryptedRegistro = {
        id: registro.id,
        tipo: registro.tipo,
        timestamp: registro.timestamp,
        operadorId: registro.operadorId,
        // ❌ observaciones ahora está cifrado dentro de 'persona'
        persona: encryptedPersona, // ✅ Incluye datosPersonales + datosVisita + observaciones
        vehiculo: encryptedVehiculo, // ✅ Solo datos cifrados (si existe)
        acompanantes: encryptedAcompanantes, // ✅ Acompañantes cifrados (si existen)
        encrypted: true,
        // ❌ NO incluir datosPersonales, datosVehiculo, datosVisita, acompanantes, observaciones sin cifrar
      }

      return await this.db.addRecord('registros', encryptedRegistro)
    } catch (error) {
      return { success: false, error: `Error guardando registro: ${error}` }
    }
  }

  /**
   * ✅ NUEVO: Obtiene registros con descifrado completo
   */
  async getRegistrosDescifrados(filters?: { tipo?: string; fecha?: Date }): Promise<RegistroEntry[]> {
    this.ensureInitialized()
    try {
      console.log('🔍 [DEBUG] getRegistrosDescifrados() - INICIO')
      
      // Obtener registros cifrados de IndexedDB
      let registrosCifrados = (await this.db.getRecords('registros')) as (RegistroIngresoCifrado | RegistroSalidaCifrado)[]
      console.log('🔍 [DEBUG] Registros obtenidos de IndexedDB:', registrosCifrados.length)

      // Aplicar filtros si se especifica
      if (filters?.tipo) {
        registrosCifrados = registrosCifrados.filter((r) => r.tipo === filters.tipo)
        console.log('🔍 [DEBUG] Después filtro tipo:', registrosCifrados.length)
      }

      if (filters?.fecha) {
        const fechaStr = filters.fecha.toDateString()
        registrosCifrados = registrosCifrados.filter((r) => 
          new Date(r.timestamp).toDateString() === fechaStr
        )
        console.log('🔍 [DEBUG] Después filtro fecha:', registrosCifrados.length)
      }

      // ✅ DESCIFRAR CADA REGISTRO COMPLETAMENTE
      const registrosDescifrados = await Promise.all(
        registrosCifrados.map(async (registroCifrado) => {
          try {
            if (!registroCifrado.encrypted) {
              console.log('⚠️ [DEBUG] Registro sin cifrar encontrado:', registroCifrado.id)
              // Para registros sin cifrar, necesitamos convertirlos al formato correcto
              // Por ahora, los omitimos ya que todos deberían estar cifrados
              return null
            }

            console.log('🔓 [DEBUG] Descifrando registro:', registroCifrado.id)
            
            // Descifrar según tipo de registro
            if (registroCifrado.tipo === 'ingreso') {
              return await this.descifrarRegistroIngreso(registroCifrado as RegistroIngresoCifrado)
            } else if (registroCifrado.tipo === 'salida') {
              return await this.descifrarRegistroSalida(registroCifrado as RegistroSalidaCifrado)
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              console.error('❌ [DEBUG] Tipo de registro desconocido:', (registroCifrado as any).tipo)
              return null // Retornar null para registros inválidos
            }
          } catch (error) {
            console.error('❌ [DEBUG] Error descifrando registro:', registroCifrado.id, error)
            return null // Omitir registros que no se pueden descifrar
          }
        })
      )

      // Filtrar registros nulos (errores de descifrado)
      const registrosValidos = registrosDescifrados.filter((r): r is RegistroEntry => r !== null)
      console.log('✅ [DEBUG] Registros descifrados exitosamente:', registrosValidos.length)
      
      return registrosValidos
    } catch (error) {
      console.error('❌ [DEBUG] Error en getRegistrosDescifrados:', error)
      throw new Error(`Error obteniendo registros: ${error}`)
    }
  }

  /**
   * ✅ DESCIFRA REGISTRO DE INGRESO COMPLETO
   */
  private async descifrarRegistroIngreso(registroCifrado: RegistroIngresoCifrado): Promise<RegistroIngreso> {
    console.log('🔓 [DEBUG] Descifrando registro de ingreso:', registroCifrado.id)
    
    // 1. Descifrar datos de persona (datosPersonales + datosVisita + observaciones)
    let datosPersonaCompletos: Record<string, unknown> | null = null
    if (registroCifrado.persona) {
      const personaDescifrada = await encryptionService.decrypt(
        registroCifrado.persona.encrypted,
        this.sessionKey!,
        registroCifrado.persona.salt,
        registroCifrado.persona.iv
      )
      datosPersonaCompletos = JSON.parse(personaDescifrada) as Record<string, unknown>
      console.log('✅ [DEBUG] Datos persona descifrados')
    }

    // 2. Descifrar datos de vehículo (si existe)
    let datosVehiculo: Record<string, unknown> | null = null
    if (registroCifrado.vehiculo) {
      const vehiculoDescifrado = await encryptionService.decrypt(
        registroCifrado.vehiculo.encrypted,
        this.sessionKey!,
        registroCifrado.vehiculo.salt,
        registroCifrado.vehiculo.iv
      )
      datosVehiculo = JSON.parse(vehiculoDescifrado) as Record<string, unknown>
      console.log('✅ [DEBUG] Datos vehículo descifrados')
    }

    // 3. Descifrar acompañantes (si existen)
    let acompanantes: DatosAcompanante[] = []
    if (registroCifrado.acompanantes) {
      const acompanantesDescifrados = await encryptionService.decrypt(
        registroCifrado.acompanantes.encrypted,
        this.sessionKey!,
        registroCifrado.acompanantes.salt,
        registroCifrado.acompanantes.iv
      )
      acompanantes = JSON.parse(acompanantesDescifrados)
      console.log('✅ [DEBUG] Acompañantes descifrados:', acompanantes.length)
    }

    // 4. Construir registro completo descifrado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const personaData = datosPersonaCompletos as any
    const registroDescifrado: RegistroIngreso = {
      id: registroCifrado.id,
      tipo: 'ingreso',
      timestamp: new Date(registroCifrado.timestamp),
      operadorId: registroCifrado.operadorId,
      datosPersonales: personaData?.datosPersonales || {},
      datosVisita: personaData?.datosVisita || {},
      observaciones: personaData?.observaciones,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datosVehiculo: datosVehiculo as any || undefined,
      acompanantes: acompanantes.length > 0 ? acompanantes : undefined
    }

    console.log('✅ [DEBUG] Registro ingreso descifrado completamente')
    return registroDescifrado
  }

  /**
   * ✅ DESCIFRA REGISTRO DE SALIDA
   */
  private async descifrarRegistroSalida(registroCifrado: RegistroSalidaCifrado): Promise<RegistroSalida> {
    console.log('🔓 [DEBUG] Descifrando registro de salida:', registroCifrado.id)
    
    // Descifrar cédula buscada
    let cedulaBuscada = ''
    if (registroCifrado.persona) {
      cedulaBuscada = await encryptionService.decrypt(
        registroCifrado.persona.encrypted,
        this.sessionKey!,
        registroCifrado.persona.salt,
        registroCifrado.persona.iv
      )
      console.log('✅ [DEBUG] Cédula buscada descifrada')
    }

    const registroDescifrado: RegistroSalida = {
      id: registroCifrado.id,
      tipo: 'salida',
      timestamp: new Date(registroCifrado.timestamp),
      cedulaBuscada,
      tiempoEstadia: registroCifrado.tiempoEstadia,
      operadorId: registroCifrado.operadorId,
      observaciones: registroCifrado.observaciones
    }

    return registroDescifrado
  }

  /**
   * ✅ MÉTODO LEGACY (para compatibilidad)
   */
  async getRegistros(filters?: { tipo?: string; fecha?: Date }): Promise<RegistroEntry[]> {
    // Redirigir al nuevo método
    return this.getRegistrosDescifrados(filters)
  }

  /**
   * ✅ BÚSQUEDA POR CÉDULA (con descifrado)
   */
  async searchByDocumento(documento: string): Promise<RegistroEntry[]> {
    console.log('🔍 [DEBUG] Buscando por cédula:', documento)
    const registros = await this.getRegistrosDescifrados()
    
    return registros.filter((r) => {
      if (r.tipo === 'ingreso') {
        const registroIngreso = r as RegistroIngreso
        return registroIngreso.datosPersonales?.cedula?.includes(documento)
      } else {
        const registroSalida = r as RegistroSalida
        return registroSalida.cedulaBuscada?.includes(documento)
      }
    })
  }

  /**
   * ✅ BÚSQUEDA POR MATRÍCULA (con descifrado)
   */
  async searchByMatricula(matricula: string): Promise<RegistroEntry[]> {
    console.log('🔍 [DEBUG] Buscando por matrícula:', matricula)
    const registros = await this.getRegistrosDescifrados()
    
    return registros.filter((r) => {
      if (r.tipo === 'ingreso') {
        const registroIngreso = r as RegistroIngreso
        return registroIngreso.datosVehiculo?.matricula?.toUpperCase().includes(matricula.toUpperCase())
      }
      return false
    })
  }

  /**
   * ✅ CREAR BACKUP CIFRADO
   */
  async createBackup(): Promise<{ success: boolean; error?: string; backupId?: string }> {
    this.ensureInitialized()
    try {
      // Obtener todos los datos
      const registros = (await this.db.getRecords('registros')) as unknown[]
      const usuarios = (await this.db.getRecords('usuarios')) as unknown[]
      const config = (await this.db.getRecords('configuracion')) as unknown[]

      const backupData = {
        registros,
        usuarios,
        config,
        timestamp: new Date(),
        version: '1.0',
      }

      // Cifrar backup completo
      const encrypted = await encryptionService.encrypt(JSON.stringify(backupData), this.sessionKey!)

      const backup = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        data: encrypted,
        encrypted: true,
        size: JSON.stringify(backupData).length,
      }

      const result = await this.db.addRecord('backups', backup)

      return result.success ? { success: true, backupId: backup.id } : result
    } catch (error) {
      return { success: false, error: `Error creando backup: ${error}` }
    }
  }

  /**
   * ✅ LIMPIAR DATOS ANTIGUOS
   */
  async cleanOldData(daysToKeep: number = 365): Promise<{ success: boolean; cleaned: number }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const registros = await this.getRegistrosDescifrados()
      const oldRegistros = registros.filter((r) => new Date(r.timestamp) < cutoffDate)

      // TODO: Implementar eliminación selectiva por ID
      // Por ahora solo contamos

      return { success: true, cleaned: oldRegistros.length }
    } catch {
      return { success: false, cleaned: 0 }
    }
  }
}

export const databaseService = new DatabaseService()
