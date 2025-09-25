import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

export interface DatabaseConfig {
  dbName: string
  version: number
  stores: string[]
}

export const useDatabase = () => {
  const appStore = useAppStore()
  const isConnected = ref(false)
  const db = ref<IDBDatabase | null>(null)

  // Función para solicitar almacenamiento persistente
  const requestPersistentStorage = async (): Promise<boolean> => {
    try {
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const isPersistent = await navigator.storage.persist()
        
        if (isPersistent) {
          appStore.addNotification('Almacenamiento persistente activado', 'info')
        }
        
        return isPersistent
      } else {
        console.warn('Storage API de persistencia no soportada')
        return false
      }
    } catch (error) {
      console.error('Error al solicitar persistencia:', error)
      return false
    }
  }

  // Función para monitorear uso de almacenamiento
  const getStorageQuota = async (): Promise<{usage: number, quota: number, available: number}> => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const available = quota - usage
        
        console.log(`📊 Almacenamiento: ${(usage / 1024 / 1024).toFixed(2)} MB usados de ${(quota / 1024 / 1024).toFixed(2)} MB disponibles`)
        
        // Alertar si queda poco espacio (menos del 10%)
        if (available < quota * 0.1) {
          appStore.addNotification('Espacio de almacenamiento bajo', 'warning')
        }
        
        return { usage, quota, available }
      }
    } catch (error) {
      console.error('Error al obtener información de cuota:', error)
    }
    
    return { usage: 0, quota: 0, available: 0 }
  }

  const config: DatabaseConfig = {
    dbName: 'IRCCA_Sistema_DB',
    version: 1,
    stores: ['registros', 'usuarios', 'configuracion', 'backups'],
  }

  const initDatabase = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Solicitar persistencia antes de abrir la base de datos
      await requestPersistentStorage()
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(config.dbName, config.version)

        request.onerror = () => {
          const error = 'Error al abrir la base de datos'
          appStore.addNotification(error, 'error')
          reject({ success: false, error })
        }

        request.onsuccess = (event) => {
          db.value = (event.target as IDBOpenDBRequest).result
          isConnected.value = true
          appStore.addNotification('Base de datos inicializada correctamente', 'info')
          resolve({ success: true })
        }

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result

          // Crear store de registros
          if (!database.objectStoreNames.contains('registros')) {
            const registrosStore = database.createObjectStore('registros', { keyPath: 'id' })
            registrosStore.createIndex('timestamp', 'timestamp', { unique: false })
            registrosStore.createIndex('tipo', 'tipo', { unique: false })
            registrosStore.createIndex('operador', 'operadorId', { unique: false })
            // Nota: No creamos índice por cédula ya que está cifrada por seguridad
          }

          // Crear store de usuarios
          if (!database.objectStoreNames.contains('usuarios')) {
            const usuariosStore = database.createObjectStore('usuarios', { keyPath: 'id' })
            usuariosStore.createIndex('username', 'username', { unique: true })
          }

          // Crear store de configuración
          if (!database.objectStoreNames.contains('configuracion')) {
            database.createObjectStore('configuracion', { keyPath: 'key' })
          }

          // Crear store de backups
          if (!database.objectStoreNames.contains('backups')) {
            const backupsStore = database.createObjectStore('backups', { keyPath: 'id' })
            backupsStore.createIndex('timestamp', 'timestamp', { unique: false })
          }
        }
      })
    } catch {
      const errorMessage = 'Error fatal inicializando base de datos'
      appStore.addNotification(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const addRecord = async (
    storeName: string,
    data: Record<string, unknown>,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!db.value) {
      return { success: false, error: 'Base de datos no inicializada' }
    }

    try {
      return new Promise((resolve, reject) => {
        const transaction = db.value!.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.add(data)

        request.onsuccess = () => resolve({ success: true })
        request.onerror = () => reject({ success: false, error: 'Error al guardar registro' })
      })
    } catch {
      return { success: false, error: 'Error en transacción de base de datos' }
    }
  }

  const getRecords = async (
    storeName: string,
    indexName?: string,
    key?: IDBValidKey,
  ): Promise<unknown[]> => {
    if (!db.value) return []

    try {
      return new Promise((resolve, reject) => {
        const transaction = db.value!.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)

        let request: IDBRequest
        if (indexName && key) {
          const index = store.index(indexName)
          request = index.getAll(key)
        } else {
          request = store.getAll()
        }

        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject([])
      })
    } catch {
      return []
    }
  }

  const updateRecord = async (
    storeName: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!db.value) {
      return { success: false, error: 'Base de datos no inicializada' }
    }

    try {
      return new Promise((resolve, reject) => {
        const transaction = db.value!.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        
        // Primero obtener el registro existente
        const getRequest = store.get(id)
        
        getRequest.onsuccess = () => {
          const existingRecord = getRequest.result
          if (!existingRecord) {
            reject({ success: false, error: 'Registro no encontrado' })
            return
          }
          
          // Combinar datos existentes con los nuevos
          const updatedRecord = { ...existingRecord, ...data }
          
          // Actualizar el registro
          const putRequest = store.put(updatedRecord)
          
          putRequest.onsuccess = () => resolve({ success: true })
          putRequest.onerror = () => reject({ success: false, error: 'Error al actualizar registro' })
        }
        
        getRequest.onerror = () => reject({ success: false, error: 'Error al obtener registro' })
      })
    } catch {
      return { success: false, error: 'Error en transacción de actualización' }
    }
  }

  const clearStore = async (storeName: string): Promise<{ success: boolean; error?: string }> => {
    if (!db.value) {
      return { success: false, error: 'Base de datos no inicializada' }
    }

    try {
      return new Promise((resolve, reject) => {
        const transaction = db.value!.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => resolve({ success: true })
        request.onerror = () => reject({ success: false, error: 'Error al limpiar store' })
      })
    } catch {
      return { success: false, error: 'Error en operación de limpieza' }
    }
  }

  return {
    // State
    isConnected,
    config,
    // Methods
    initDatabase,
    addRecord,
    updateRecord,
    getRecords,
    clearStore,
    // Storage Management
    requestPersistentStorage,
    getStorageQuota,
  }
}
