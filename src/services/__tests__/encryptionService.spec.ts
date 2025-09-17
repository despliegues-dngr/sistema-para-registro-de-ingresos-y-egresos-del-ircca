import { describe, it, expect, beforeAll, vi } from 'vitest'
import { EncryptionService, encryptionService } from '../encryptionService'
import { subtle, getRandomValues } from 'uncrypto'

// Mock de TextEncoder/TextDecoder para entorno de testing
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Web Crypto API para el entorno de testing usando uncrypto
beforeAll(() => {
  // Usar uncrypto para API unificada Node.js/Browser
  const mockCrypto = {
    getRandomValues,
    subtle,
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  }

  // Asignar uncrypto al objeto global
  Object.defineProperty(global, 'crypto', {
    value: mockCrypto,
    writable: true,
  })

  // Asignar uncrypto a window también
  Object.defineProperty(window, 'crypto', {
    value: mockCrypto,
    writable: true,
  })
})

describe('EncryptionService', () => {
  describe('Singleton instance', () => {
    it('debe exportar una instancia singleton', () => {
      expect(encryptionService).toBeInstanceOf(EncryptionService)
    })

    it('debe mantener la misma instancia', () => {
      const instance1 = encryptionService
      const instance2 = encryptionService
      expect(instance1).toBe(instance2)
    })
  })

  describe('Cifrado y descifrado', () => {
    it('debe cifrar y descifrar datos correctamente', async () => {
      const originalData = 'Datos confidenciales del IRCCA'
      const password = 'password123'

      // Cifrar datos
      const encrypted = await encryptionService.encrypt(originalData, password)

      expect(encrypted.encrypted).toBeDefined()
      expect(encrypted.salt).toBeDefined()
      expect(encrypted.iv).toBeDefined()
      expect(typeof encrypted.encrypted).toBe('string')
      expect(typeof encrypted.salt).toBe('string')
      expect(typeof encrypted.iv).toBe('string')

      // Descifrar datos
      const decrypted = await encryptionService.decrypt(
        encrypted.encrypted,
        password,
        encrypted.salt,
        encrypted.iv
      )

      expect(decrypted).toBe(originalData)
    })

    it('debe generar diferentes salt e IV para cada cifrado', async () => {
      const data = 'mismo dato'
      const password = 'misma_contraseña'

      const encrypted1 = await encryptionService.encrypt(data, password)
      const encrypted2 = await encryptionService.encrypt(data, password)

      // Mismos datos, pero diferentes salt e IV
      expect(encrypted1.salt).not.toBe(encrypted2.salt)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted)

      // Ambos deben descifrar al mismo valor original
      const decrypted1 = await encryptionService.decrypt(
        encrypted1.encrypted,
        password,
        encrypted1.salt,
        encrypted1.iv
      )
      const decrypted2 = await encryptionService.decrypt(
        encrypted2.encrypted,
        password,
        encrypted2.salt,
        encrypted2.iv
      )

      expect(decrypted1).toBe(data)
      expect(decrypted2).toBe(data)
    })

    it('debe fallar al descifrar con contraseña incorrecta', async () => {
      const originalData = 'Datos secretos'
      const correctPassword = 'password123'
      const wrongPassword = 'password456'

      const encrypted = await encryptionService.encrypt(originalData, correctPassword)

      // El descifrado con contraseña incorrecta debe fallar
      try {
        const result = await encryptionService.decrypt(
          encrypted.encrypted,
          wrongPassword,
          encrypted.salt,
          encrypted.iv
        )
        // Si llegamos aquí, el test debería fallar
        expect(result).not.toBe(originalData)
      } catch (error) {
        // Este es el comportamiento esperado
        expect(error).toBeDefined()
      }
    })

    it('debe fallar al descifrar con salt o IV incorrectos', async () => {
      const originalData = 'Datos secretos'
      const password = 'password123'

      const encrypted = await encryptionService.encrypt(originalData, password)
      const wrongSalt = 'c2FsdCBpbmNvcnJlY3Rv' // salt base64 incorrecto
      const wrongIV = 'aXYgaW5jb3JyZWN0bw==' // IV base64 incorrecto

      // Salt incorrecto
      try {
        const result1 = await encryptionService.decrypt(
          encrypted.encrypted,
          password,
          wrongSalt,
          encrypted.iv
        )
        expect(result1).not.toBe(originalData)
      } catch (error) {
        expect(error).toBeDefined()
      }

      // IV incorrecto  
      try {
        const result2 = await encryptionService.decrypt(
          encrypted.encrypted,
          password,
          encrypted.salt,
          wrongIV
        )
        expect(result2).not.toBe(originalData)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Hash de contraseñas', () => {
    it('debe generar hash y salt para contraseña', async () => {
      const password = 'mi_contraseña_segura'

      const result = await encryptionService.hashPassword(password)

      expect(result.hash).toBeDefined()
      expect(result.salt).toBeDefined()
      expect(typeof result.hash).toBe('string')
      expect(typeof result.salt).toBe('string')
      expect(result.hash.length).toBeGreaterThan(0)
      expect(result.salt.length).toBeGreaterThan(0)
    })

    it('debe generar diferentes hashes para la misma contraseña', async () => {
      const password = 'misma_contraseña'

      const result1 = await encryptionService.hashPassword(password)
      const result2 = await encryptionService.hashPassword(password)

      // Diferentes salt generan diferentes hashes
      expect(result1.salt).not.toBe(result2.salt)
      expect(result1.hash).not.toBe(result2.hash)
    })

    it('debe verificar contraseña correcta', async () => {
      const password = 'contraseña_correcta'

      const { hash, salt } = await encryptionService.hashPassword(password)
      const isValid = await encryptionService.verifyPassword(password, hash, salt)

      expect(isValid).toBe(true)
    })

    it('debe rechazar contraseña incorrecta', async () => {
      const correctPassword = 'contraseña_correcta'
      const wrongPassword = 'contraseña_incorrecta'

      const { hash, salt } = await encryptionService.hashPassword(correctPassword)
      const isValid = await encryptionService.verifyPassword(wrongPassword, hash, salt)

      expect(isValid).toBe(false)
    })

    it('debe rechazar hash o salt inválidos', async () => {
      const password = 'contraseña_test'
      const invalidHash = 'hash_invalido'
      const invalidSalt = 'salt_invalido'

      // Hash inválido
      const result1 = await encryptionService.verifyPassword(password, invalidHash, 'c2FsdF92YWxpZG8=')
      expect(result1).toBe(false)

      // Salt inválido  
      const result2 = await encryptionService.verifyPassword(password, 'aGFzaF92YWxpZG8=', invalidSalt)
      expect(result2).toBe(false)
    })
  })

  describe('Generación de IDs seguros', () => {
    it('debe generar ID único', () => {
      const id = encryptionService.generateSecureId()

      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
      // ID debe ser base64url (sin +, /, =)
      expect(id).not.toMatch(/[+/=]/)
    })

    it('debe generar IDs únicos en múltiples llamadas', () => {
      const ids = new Set()
      const numGenerations = 100

      for (let i = 0; i < numGenerations; i++) {
        const id = encryptionService.generateSecureId()
        ids.add(id)
      }

      // Todos los IDs deben ser únicos
      expect(ids.size).toBe(numGenerations)
    })

    it('debe generar IDs con formato base64url correcto', () => {
      const id = encryptionService.generateSecureId()

      // Verificar que es base64url válido (caracteres permitidos)
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/)
      // Verificar longitud aproximada (16 bytes -> ~22-43 caracteres en base64url dependiendo del UUID)
      expect(id.length).toBeGreaterThanOrEqual(20)
      expect(id.length).toBeLessThanOrEqual(45)
    })
  })

  describe('Casos de error', () => {
    it('debe manejar errores de cifrado con datos inválidos', async () => {
      const service = new EncryptionService()
      
      // Test con password vacío
      await expect(
        service.encrypt('datos', '')
      ).rejects.toThrow()
    })

    it('debe manejar errores de descifrado con datos corruptos', async () => {
      const service = new EncryptionService()
      const password = 'password123'
      
      // Datos cifrados corruptos
      const corruptedData = 'ZGF0b3NfY29ycnVwdG9z' // datos base64 inválidos para descifrado
      const validSalt = 'c2FsdF92YWxpZG8xMjM='
      const validIV = 'aXZfdmFsaWRvMTIz'
      
      await expect(
        service.decrypt(corruptedData, password, validSalt, validIV)
      ).rejects.toThrow()
    })
  })
})
