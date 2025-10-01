import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock del useAuthStore
const mockAuthStore = {
  isAuthenticated: false,
  isAdmin: false,
  user: null as { id: string; username: string; role: string } | null,
  login: vi.fn((userData: { id: string; username: string; role: string }) => {
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
  let router: ReturnType<typeof createRouter>
  let authStore: typeof mockAuthStore

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
    authStore = mockAuthStore

    // Aplicar el mismo navigation guard que el router real
    // SOLUCIÓN: Obtener estado fresco en cada navegación (no capturar por closure)
    router.beforeEach((to, from, next) => {
      const currentAuthStore = useAuthStore()
      const isAuth = currentAuthStore.isAuthenticated
      const isAdminRole = currentAuthStore.isAdmin

      // Verificar si la ruta requiere autenticación
      if (to.meta.requiresAuth && !isAuth) {
        next({ name: 'Login' })
        return
      }

      // Verificar si la ruta requiere permisos de admin
      if (to.meta.requiresAdmin && !isAdminRole) {
        next({ name: 'Dashboard' })
        return
      }

      // Redirigir usuarios autenticados lejos del login
      if (to.meta.requiresGuest && isAuth) {
        next({ name: 'Dashboard' })
        return
      }

      next()
    })

    // Router listo para testing
  })

  describe('Guards de autenticación', () => {
    it('debe redirigir usuario no autenticado a /login cuando intenta acceder a /dashboard', async () => {
      // Asegurar que el usuario no está autenticado
      expect(authStore.isAuthenticated).toBe(false)

      // Intentar navegar a dashboard
      await router.push('/dashboard')
      await router.isReady()

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
      expect(authStore.isAuthenticated).toBe(false)

      // Intentar ir a dashboard - debe redirigir a login
      await router.push('/dashboard')
      await router.isReady()
      expect(router.currentRoute.value.name).toBe('Login')

      // Autenticar usuario
      authStore.login({
        id: '1',
        username: 'testuser',
        role: 'operador'
      })

      // Esperar un tick para que la reactividad se propague
      await new Promise(resolve => setTimeout(resolve, 0))

      // Ahora debe poder acceder a dashboard
      await router.push('/dashboard')
      await router.isReady()
      expect(router.currentRoute.value.name).toBe('Dashboard')

      // Hacer logout
      authStore.logout()

      // Esperar un tick para que la reactividad se propague
      await new Promise(resolve => setTimeout(resolve, 0))

      // SOLUCIÓN: Navegar a otra ruta primero para forzar la ejecución del guard
      await router.push('/login')
      await router.isReady()

      // Ahora intentar ir a dashboard - debe redirigir a login por falta de auth
      await router.push('/dashboard')
      await router.isReady()

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
