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
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }

  // Verificar si la ruta requiere permisos de admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Dashboard' })
    return
  }

  // Redirigir usuarios autenticados lejos del login
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router
