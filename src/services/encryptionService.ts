/**
 * Servicio de Cifrado AES-256 con PBKDF2
 * Cumplimiento Ley No. 18.331 Uruguay - Protección de Datos Personales
 */

export interface EncryptionConfig {
  algorithm: string
  keyLength: number
  iterations: number
  saltLength: number
}

export class EncryptionService {
  private config: EncryptionConfig = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    iterations: 100000, // NIST recomendado
    saltLength: 16,
  }

  /**
   * Genera una clave de cifrado usando PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    )

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.config.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: this.config.algorithm,
        length: this.config.keyLength,
      },
      false,
      ['encrypt', 'decrypt'],
    )
  }

  /**
   * Cifra datos usando AES-256-GCM
   */
  async encrypt(
    data: string,
    password: string,
  ): Promise<{ encrypted: string; salt: string; iv: string }> {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      // Generar salt e IV aleatorios
      const salt = window.crypto.getRandomValues(new Uint8Array(this.config.saltLength))
      const iv = window.crypto.getRandomValues(new Uint8Array(12)) // GCM recomienda 12 bytes

      // Derivar clave
      const key = await this.deriveKey(password, salt)

      // Cifrar datos
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv,
        },
        key,
        dataBuffer,
      )

      // Convertir a Base64 para almacenamiento
      const encrypted = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
      const saltB64 = btoa(String.fromCharCode(...salt))
      const ivB64 = btoa(String.fromCharCode(...iv))

      return { encrypted, salt: saltB64, iv: ivB64 }
    } catch (error) {
      throw new Error(`Error de cifrado: ${error}`)
    }
  }

  /**
   * Descifra datos usando AES-256-GCM
   */
  async decrypt(
    encryptedData: string,
    password: string,
    salt: string,
    iv: string,
  ): Promise<string> {
    try {
      // Convertir desde Base64
      const encryptedBuffer = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map((c) => c.charCodeAt(0)),
      )
      const saltBuffer = new Uint8Array(
        atob(salt)
          .split('')
          .map((c) => c.charCodeAt(0)),
      )
      const ivBuffer = new Uint8Array(
        atob(iv)
          .split('')
          .map((c) => c.charCodeAt(0)),
      )

      // Derivar clave
      const key = await this.deriveKey(password, saltBuffer)

      // Descifrar datos
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.config.algorithm,
          iv: ivBuffer,
        },
        key,
        encryptedBuffer,
      )

      // Convertir a string
      const decoder = new TextDecoder()
      return decoder.decode(decryptedBuffer)
    } catch (error) {
      throw new Error(`Error de descifrado: ${error}`)
    }
  }

  /**
   * Genera hash seguro para contraseñas
   */
  async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = window.crypto.getRandomValues(new Uint8Array(this.config.saltLength))
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    )

    const hashKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.config.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: 'HMAC',
        hash: 'SHA-256',
        length: 256,
      },
      true,
      ['sign'],
    )

    const hashBuffer = await window.crypto.subtle.exportKey('raw', hashKey)
    const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    const saltB64 = btoa(String.fromCharCode(...salt))

    return { hash, salt: saltB64 }
  }

  /**
   * Verifica hash de contraseña usando el salt original
   */
  async verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
    try {
      const encoder = new TextEncoder()
      const passwordBuffer = encoder.encode(password)
      const saltBuffer = new Uint8Array(
        atob(salt)
          .split('')
          .map((c) => c.charCodeAt(0)),
      )

      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
      )

      const hashKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: this.config.iterations,
          hash: 'SHA-256',
        },
        keyMaterial,
        {
          name: 'HMAC',
          hash: 'SHA-256',
          length: 256,
        },
        true,
        ['sign'],
      )

      const hashBuffer = await window.crypto.subtle.exportKey('raw', hashKey)
      const computedHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
      
      return computedHash === storedHash
    } catch {
      return false
    }
  }

  /**
   * Genera ID único criptográficamente seguro
   */
  generateSecureId(): string {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
}

// Singleton para uso en la aplicación
export const encryptionService = new EncryptionService()
