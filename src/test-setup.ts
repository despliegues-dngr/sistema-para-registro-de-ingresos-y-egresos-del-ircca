import { vi } from 'vitest'

// Mock CSS imports globales
vi.mock('*.css', () => ({}))

// Mock Vuetify CSS components específicos
vi.mock('vuetify/lib/components/VCode/VCode.css', () => ({}))
vi.mock('vuetify/lib/components/VKbd/VKbd.css', () => ({}))
vi.mock('vuetify/lib/components/VTextarea/VTextarea.css', () => ({}))
vi.mock('vuetify/lib/components/VBtn/VBtn.css', () => ({}))
vi.mock('vuetify/lib/components/VCard/VCard.css', () => ({}))

// ResizeObserver polyfill para Vuetify (oficial)
import ResizeObserverPolyfill from 'resize-observer-polyfill'
global.ResizeObserver = ResizeObserverPolyfill

// Global mocks para browser APIs con funcionalidad realista
let mockCounter = 0
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'mock-uuid-' + (++mockCounter).toString().padStart(8, '0')),
  subtle: {
    importKey: vi.fn(() => Promise.resolve({ type: 'secret' })),
    deriveKey: vi.fn(() => Promise.resolve({ type: 'secret' })),
    exportKey: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
    encrypt: vi.fn((algorithm, key, data) => {
      // Mock realista: simular cifrado con variación única
      const input = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
      const seed = ++mockCounter // Semilla única para cada cifrado
      const encrypted = new ArrayBuffer(input.length + 16)
      const view = new Uint8Array(encrypted)
      for (let i = 0; i < input.length; i++) {
        view[i] = input[i] ^ (0x42 + (seed % 256)) // XOR con semilla única
      }
      // Rellenar padding con valores únicos
      for (let i = input.length; i < view.length; i++) {
        view[i] = (seed + i) % 256
      }
      return Promise.resolve(encrypted)
    }),
    decrypt: vi.fn((algorithm, key, data) => {
      // Mock que puede fallar con parámetros incorrectos
      if (!algorithm || !key || !data) {
        return Promise.reject(new Error('Invalid parameters'))
      }
      const input = new Uint8Array(data)
      if (input.length < 16) {
        return Promise.reject(new Error('Invalid encrypted data'))
      }
      // Simular fallo con datos corruptos o incorrectos
      if (input.every(byte => byte === 0)) {
        return Promise.reject(new Error('Corrupted encrypted data'))
      }
      const decrypted = new ArrayBuffer(Math.max(0, input.length - 16))
      const view = new Uint8Array(decrypted)
      const seed = input[input.length - 1] - ((input.length - 1) % 256) // Extraer semilla
      for (let i = 0; i < view.length; i++) {
        view[i] = input[i] ^ (0x42 + (seed % 256))
      }
      return Promise.resolve(decrypted)
    }),
    generateKey: vi.fn(() => Promise.resolve({ type: 'secret' })),
  },
  getRandomValues: vi.fn((array) => {
    const seed = ++mockCounter
    for (let i = 0; i < array.length; i++) {
      array[i] = (seed * 31 + i * 17) % 256 // Valores únicos pero deterministas
    }
    return array
  })
})

vi.stubGlobal('indexedDB', {
  open: vi.fn(() => {
    const mockDB = {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(() => ({
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn((event, callback) => {
              if (event === 'success') setTimeout(() => callback({ target: { result: 'mock-key' } }), 0)
            })
          })),
          get: vi.fn(() => ({
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn((event, callback) => {
              if (event === 'success') setTimeout(() => callback({ target: { result: { id: 1, data: 'mock' } } }), 0)
            })
          })),
          getAll: vi.fn(() => ({
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn((event, callback) => {
              if (event === 'success') setTimeout(() => callback({ target: { result: [] } }), 0)
            })
          })),
          put: vi.fn(() => ({
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn((event, callback) => {
              if (event === 'success') setTimeout(() => callback({ target: { result: 'mock-key' } }), 0)
            })
          })),
          delete: vi.fn(() => ({
            onsuccess: null,
            onerror: null,
            addEventListener: vi.fn((event, callback) => {
              if (event === 'success') setTimeout(() => callback({ target: { result: [] } }), 0)
            })
          })),
          index: vi.fn(() => ({
            getAll: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
              addEventListener: vi.fn((event, callback) => {
                if (event === 'success') setTimeout(() => callback({ target: { result: [] } }), 0)
              })
            }))
          }))
        })),
        complete: true,
        addEventListener: vi.fn()
      })),
      createObjectStore: vi.fn(() => ({ createIndex: vi.fn() })),
      version: 1,
      close: vi.fn()
    }

    const request = {
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: mockDB,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'success') {
          setTimeout(() => callback({ target: { result: mockDB } }), 0)
        }
      })
    }

    // Simular éxito inmediato
    setTimeout(() => {
      if (request.onsuccess && typeof request.onsuccess === 'function') {
        const event = { target: { result: mockDB } };
        (request.onsuccess as (event: { target: { result: unknown } }) => void)(event)
      }
    }, 0)
    
    return request
  }),
  deleteDatabase: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    addEventListener: vi.fn((event, callback) => {
      if (event === 'success') setTimeout(() => callback({ target: { result: undefined } }), 0)
    })
  })),
  databases: vi.fn(() => Promise.resolve([])),
  cmp: vi.fn()
})

// Mock TextEncoder/TextDecoder
vi.stubGlobal('TextEncoder', class {
  encode(str: string) { 
    return new Uint8Array(str.split('').map(c => c.charCodeAt(0))) 
  }
})

vi.stubGlobal('TextDecoder', class {
  decode(buffer: ArrayBuffer | Uint8Array) { 
    const bytes = new Uint8Array(buffer)
    return String.fromCharCode(...bytes)
  }
})

// Mock btoa/atob
vi.stubGlobal('btoa', vi.fn((str: string) => Buffer.from(str).toString('base64')))
vi.stubGlobal('atob', vi.fn((str: string) => Buffer.from(str, 'base64').toString()))

// Configuración oficial de Vuetify para tests
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Crear instancia de Vuetify siguiendo documentación oficial
const vuetify = createVuetify({
  components,
  directives,
})

// Helper global para mount siguiendo documentación oficial
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

vi.stubGlobal('mountWithVuetify', (component: unknown, options: Record<string, unknown> = {}) => {
  const pinia = createPinia()
  const plugins = [vuetify, pinia]
  
  // Si se proporciona router, agregarlo a los plugins
  if (options.router) {
    plugins.push(options.router as typeof vuetify)
    delete options.router // Removerlo de options para evitar conflictos
  }
  
  return mount(component, {
    global: {
      plugins,
      stubs: {
        'router-link': true,
        'router-view': true
      },
      ...(options.global || {})
    },
    ...options
  })
})

// También hacer Vuetify disponible globalmente
vi.stubGlobal('vuetifyInstance', vuetify)
