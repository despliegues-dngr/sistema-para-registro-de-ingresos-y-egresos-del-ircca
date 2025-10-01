import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    // TODO: Crear estas vistas gradualmente según TASK_1.2.3
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    // {
    //   path: '/registro',
    //   name: 'Registro',
    //   component: () => import('@/views/registro/RegistroView.vue'),
    //   meta: { requiresAuth: true },
    //   children: [
    //     {
    //       path: 'ingreso',
    //       name: 'RegistroIngreso',
    //       component: () => import('@/views/registro/IngresoView.vue')
    //     },
    //     {
    //       path: 'egreso',
    //       name: 'RegistroEgreso',
    //       component: () => import('@/views/registro/EgresoView.vue')
    //     }
    //   ]
    // },
    // {
    //   path: '/consultas',
    //   name: 'Consultas',
    //   component: () => import('@/views/consulta/ConsultasView.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/admin',
    //   name: 'Admin',
    //   component: () => import('@/views/admin/AdminView.vue'),
    //   meta: { requiresAuth: true, requiresAdmin: true }
    // },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/login',
    },
  ],
})

// Guards de autenticación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Si el usuario está autenticado y intenta ir a login, redirigir al dashboard
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  // Si la ruta no requiere autenticación, permitir acceso
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    next({ 
      name: 'Login',
      query: { redirect: to.fullPath } // Guardar la ruta de destino
    })
    return
  }

  // Verificar permisos de administrador si es requerido
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Redirigir al dashboard con mensaje de error
    next({ 
      name: 'Dashboard',
      query: { error: 'insufficient_permissions' }
    })
    return
  }

  // Verificar permisos específicos de supervisor si es requerido
  if (to.meta.requiresSupervisor && !authStore.isAdmin && authStore.user?.role !== 'supervisor') {
    next({ 
      name: 'Dashboard',
      query: { error: 'insufficient_permissions' }
    })
    return
  }

  // Si llegamos aquí, el usuario tiene permisos para acceder
  next()
})

export default router
