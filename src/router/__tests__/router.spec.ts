import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory, type RouteRecordRaw } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock del useAuthStore
const mockAuthStore = {
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  login: vi.fn((userData) => {
    mockAuthStore.user = userData
    mockAuthStore.isAuthenticated = true
    mockAuthStore.isAdmin = userData.role === 'admin'
  }),
  logout: vi.fn(() => {
    mockAuthStore.user = null
    mockAuthStore.isAuthenticated = false
    mockAuthStore.isAdmin = false
  })
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

// Recrear las rutas del router para testing
const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: { template: '<div>Login</div>' }, // Componente mock
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: { template: '<div>Dashboard</div>' }, // Componente mock
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login',
  },
]

describe('Router Navigation Guards', () => {
  let router: any
  let authStore: any

  beforeEach(() => {
    // Resetear estado del mock authStore
    mockAuthStore.isAuthenticated = false
    mockAuthStore.isAdmin = false
    mockAuthStore.user = null
    
    // Configurar Pinia
    setActivePinia(createPinia())

    // Configurar router
    router = createRouter({
      history: createMemoryHistory(),
      routes: routes
    })

    // Configurar authStore
    authStore = useAuthStore()

    // Aplicar el mismo navigation guard que el router real
    // SOLUCIÓN: Obtener estado fresco en cada navegación (no capturar por closure)
    router.beforeEach((to: any, from: any, next: any) => {
      // DEBUG: Estado del guard en tiempo real
      const currentAuthStore = useAuthStore() // Obtener referencia fresca
      const isAuth = currentAuthStore.isAuthenticated
      const isAdminRole = currentAuthStore.isAdmin
      
      console.log('🛡️ DEBUG Guard - Estado fresco:', {
        isAuthenticated: isAuth,
        isAdmin: isAdminRole,
        targetRoute: to.name,
        requiresAuth: to.meta.requiresAuth,
        requiresGuest: to.meta.requiresGuest
      })

      // Verificar si la ruta requiere autenticación
      if (to.meta.requiresAuth && !isAuth) {
        console.log('🛡️ Guard: Redirigiendo a Login (sin auth)')
        next({ name: 'Login' })
        return
      }

      // Verificar si la ruta requiere permisos de admin
      if (to.meta.requiresAdmin && !isAdminRole) {
        console.log('🛡️ Guard: Redirigiendo a Dashboard (sin admin)')
        next({ name: 'Dashboard' })
        return
      }

      // Redirigir usuarios autenticados lejos del login
      if (to.meta.requiresGuest && isAuth) {
        console.log('🛡️ Guard: Redirigiendo a Dashboard (ya autenticado)')
        next({ name: 'Dashboard' })
        return
      }

      console.log('🛡️ Guard: Permitiendo navegación a', to.name)
      next()
    })

    // Router listo para testing
  })

  describe('Guards de autenticación', () => {
    it('debe redirigir usuario no autenticado a /login cuando intenta acceder a /dashboard', async () => {
      // DEBUG: Estado inicial
      console.log('🔍 DEBUG Router - Estado inicial:')
      console.log('   authStore.isAuthenticated:', authStore.isAuthenticated)
      console.log('   mockAuthStore.isAuthenticated:', mockAuthStore.isAuthenticated)
      console.log('   router.currentRoute.value:', router.currentRoute.value.path)

      // Asegurar que el usuario no está autenticado
      expect(authStore.isAuthenticated).toBe(false)

      // Intentar navegar a dashboard
      console.log('🚀 DEBUG Router - Navegando a /dashboard...')
      await router.push('/dashboard')
      await router.isReady()

      console.log('📍 DEBUG Router - Después de la navegación:')
      console.log('   Ruta actual:', router.currentRoute.value.path)
      console.log('   Nombre actual:', router.currentRoute.value.name)
      console.log('   Meta de la ruta:', router.currentRoute.value.meta)
      console.log('   Estado auth durante navegación:', authStore.isAuthenticated)

      // Verificar que fue redirigido a login
      expect(router.currentRoute.value.name).toBe('Login')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('debe permitir acceso a /dashboard cuando el usuario está autenticado', async () => {
      // Autenticar usuario
      authStore.login({
        id: '1',
        username: 'testuser',
        role: 'operador'
      })

      expect(authStore.isAuthenticated).toBe(true)

      // Navegar a dashboard
      await router.push('/dashboard')

      // Verificar que puede acceder al dashboard
      expect(router.currentRoute.value.name).toBe('Dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('debe redirigir usuario autenticado a /dashboard si intenta acceder a /login', async () => {
      // Autenticar usuario
      authStore.login({
        id: '1',
        username: 'testuser',
        role: 'operador'
      })

      expect(authStore.isAuthenticated).toBe(true)

      // Intentar navegar a login
      await router.push('/login')

      // Verificar que fue redirigido a dashboard
      expect(router.currentRoute.value.name).toBe('Dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('debe permitir acceso a /login cuando el usuario no está autenticado', async () => {
      // Asegurar que el usuario no está autenticado
      expect(authStore.isAuthenticated).toBe(false)

      // Navegar a login
      await router.push('/login')

      // Verificar que puede acceder al login
      expect(router.currentRoute.value.name).toBe('Login')
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Guards de administrador', () => {
    it('debe redirigir operador a /dashboard si intenta acceder a ruta de admin', async () => {
      // Agregar ruta de admin para testing
      router.addRoute({
        path: '/admin',
        name: 'Admin',
        component: { template: '<div>Admin</div>' },
        meta: { requiresAuth: true, requiresAdmin: true }
      })

      // Autenticar como operador
      authStore.login({
        id: '1',
        username: 'operador1',
        role: 'operador'
      })

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isAdmin).toBe(false)

      // Intentar navegar a admin
      await router.push('/admin')

      // Verificar que fue redirigido a dashboard
      expect(router.currentRoute.value.name).toBe('Dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('debe permitir acceso a admin cuando el usuario es administrador', async () => {
      // Agregar ruta de admin para testing
      router.addRoute({
        path: '/admin',
        name: 'Admin',
        component: { template: '<div>Admin</div>' },
        meta: { requiresAuth: true, requiresAdmin: true }
      })

      // Autenticar como admin
      authStore.login({
        id: '1',
        username: 'admin',
        role: 'admin'
      })

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isAdmin).toBe(true)

      // Navegar a admin
      await router.push('/admin')

      // Verificar que puede acceder a admin
      expect(router.currentRoute.value.name).toBe('Admin')
      expect(router.currentRoute.value.path).toBe('/admin')
    })
  })

  describe('Rutas por defecto', () => {
    it('debe redirigir la ruta raíz / a /login', async () => {
      await router.push('/')
      
      expect(router.currentRoute.value.name).toBe('Login')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('debe redirigir rutas no encontradas a /login', async () => {
      await router.push('/ruta-inexistente')
      
      expect(router.currentRoute.value.name).toBe('Login')
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Cambios de estado de autenticación', () => {
    it('debe respetar cambios dinámicos de autenticación', async () => {
      // Iniciar sin autenticación
      console.log('🔄 DEBUG Reactividad - Fase 1: Sin autenticación')
      console.log('   authStore.isAuthenticated:', authStore.isAuthenticated)
      console.log('   mockAuthStore.isAuthenticated:', mockAuthStore.isAuthenticated)
      expect(authStore.isAuthenticated).toBe(false)

      // Intentar ir a dashboard - debe redirigir a login
      await router.push('/dashboard')
      await router.isReady()
      expect(router.currentRoute.value.name).toBe('Login')

      // Autenticar usuario
      console.log('🔄 DEBUG Reactividad - Fase 2: Después del login')
      authStore.login({
        id: '1',
        username: 'testuser',
        role: 'operador'
      })
      console.log('   authStore.isAuthenticated:', authStore.isAuthenticated)
      console.log('   mockAuthStore.isAuthenticated:', mockAuthStore.isAuthenticated)

      // Esperar un tick para que la reactividad se propague
      await new Promise(resolve => setTimeout(resolve, 0))

      // Ahora debe poder acceder a dashboard
      await router.push('/dashboard')
      await router.isReady()
      expect(router.currentRoute.value.name).toBe('Dashboard')

      // Hacer logout
      console.log('🔄 DEBUG Reactividad - Fase 3: Después del logout')
      authStore.logout()
      console.log('   authStore.isAuthenticated:', authStore.isAuthenticated)
      console.log('   mockAuthStore.isAuthenticated:', mockAuthStore.isAuthenticated)
      console.log('   ¿Son el mismo objeto?:', authStore === mockAuthStore)

      // Esperar un tick para que la reactividad se propague
      await new Promise(resolve => setTimeout(resolve, 0))

      // DEBUG: Estado justo antes de la navegación problemática
      console.log('🚨 DEBUG Reactividad - Justo antes del fallo:')
      console.log('   authStore.isAuthenticated:', authStore.isAuthenticated)
      console.log('   Ruta actual antes de navegar:', router.currentRoute.value.name)

      // SOLUCIÓN: Navegar a otra ruta primero para forzar la ejecución del guard
      await router.push('/login')
      await router.isReady()
      console.log('   Navegado a login, ahora intentando dashboard...')

      // Ahora intentar ir a dashboard - debe redirigir a login por falta de auth
      await router.push('/dashboard')
      await router.isReady()
      
      console.log('🚨 DEBUG Reactividad - Después de la navegación:')
      console.log('   Ruta actual:', router.currentRoute.value.name)
      console.log('   Esperada: Login, Recibida:', router.currentRoute.value.name)

      expect(router.currentRoute.value.name).toBe('Login')
    })

    it('debe manejar cambios de rol dinámicamente', async () => {
      // Agregar ruta de admin
      router.addRoute({
        path: '/admin',
        name: 'Admin',
        component: { template: '<div>Admin</div>' },
        meta: { requiresAuth: true, requiresAdmin: true }
      })

      // Autenticar como operador
      authStore.login({
        id: '1',
        username: 'operador1',
        role: 'operador'
      })

      // No debe poder acceder a admin
      await router.push('/admin')
      await router.isReady()
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(router.currentRoute.value.name).toBe('Dashboard')

      // Cambiar a admin (simular cambio de permisos)
      authStore.login({
        id: '1',
        username: 'admin',
        role: 'admin'
      })

      // Ahora sí debe poder acceder a admin
      await router.push('/admin')
      await router.isReady()
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(router.currentRoute.value.name).toBe('Admin')
    })
  })
})
