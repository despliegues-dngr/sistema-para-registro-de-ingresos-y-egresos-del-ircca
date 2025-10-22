import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { testUsers, invalidCredentials } from '../fixtures/usuarios'
import { cleanDatabase } from '../helpers/auth'

test.describe('Epic 1: Autenticación y Seguridad', () => {
  
  test.beforeEach(async ({ page }) => {
    // Limpiar IndexedDB antes de cada test (ya navega internamente)
    await cleanDatabase(page)
  })

  test.describe('Login Exitoso', () => {
    
    test('debe permitir login exitoso como Admin', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)
      
      await loginPage.expectFormVisible()
      await loginPage.login(testUsers.admin.username, testUsers.admin.password)
      await dashboardPage.expectToBeDashboard()
      // Verificar que está en la URL correcta
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('debe permitir login exitoso como Supervisor', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)
      
      await loginPage.login(testUsers.supervisor.username, testUsers.supervisor.password)
      await dashboardPage.expectToBeDashboard()
      await expect(page).toHaveURL(/\/dashboard/)
    })

    // TODO: Habilitar cuando exista usuario operador en seeding
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('debe permitir login exitoso como Operador', async ({ page }) => {
      // SKIP: No hay usuario operador por defecto en el sistema
      // Necesita ser creado manualmente o vía seeding
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)
      
      await loginPage.login(testUsers.operador.username, testUsers.operador.password)
      await dashboardPage.expectToBeDashboard()
      await expect(page).toHaveURL(/\/dashboard/)
    })
  })

  test.describe('Login Fallido', () => {
    
    test('debe mostrar error con usuario inexistente', async ({ page }) => {
      const loginPage = new LoginPage(page)
      
      await loginPage.login(
        invalidCredentials.nonExistentUser.username,
        invalidCredentials.nonExistentUser.password
      )
      
      await loginPage.expectErrorMessage('Usuario no encontrado')
      await expect(page).not.toHaveURL(/\/dashboard/)
    })

    test('debe mostrar error con contraseña incorrecta', async ({ page }) => {
      const loginPage = new LoginPage(page)
      
      await loginPage.login(
        invalidCredentials.wrongPassword.username,
        invalidCredentials.wrongPassword.password
      )
      
      await loginPage.expectErrorMessage('Contraseña incorrecta')
      await expect(page).not.toHaveURL(/\/dashboard/)
    })

    test('debe validar campos vacíos', async ({ page }) => {
      const loginPage = new LoginPage(page)
      
      // Usuario vacío
      await loginPage.fillPassword(testUsers.operador.password)
      await loginPage.expectSubmitDisabled()
      // Verificar que el botón está realmente deshabilitado
      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeDisabled()
    })
  })

  test.describe('Logout', () => {
    
    test('debe permitir logout exitoso', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)
      
      // Usar admin en lugar de operador
      await loginPage.login(testUsers.admin.username, testUsers.admin.password)
      await dashboardPage.expectToBeDashboard()
      
      await dashboardPage.logout()
      
      // Debe redirigir a login (no necesariamente a /)
      await expect(page).toHaveURL(/\/login/)
      await loginPage.expectFormVisible()
    })

    test('debe limpiar sesión al hacer logout', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)
      
      // Usar admin en lugar de operador
      await loginPage.login(testUsers.admin.username, testUsers.admin.password)
      await dashboardPage.expectToBeDashboard()
      await dashboardPage.logout()
      
      // Esperar a que la navegación esté completa
      await page.waitForLoadState('domcontentloaded')
      
      await page.goto('/dashboard')
      // El guard redirige a /login
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('RBAC - Guards de Navegación', () => {
    
    test('debe redirigir a login si no está autenticado', async ({ page }) => {
      await page.goto('/dashboard')
      // El guard redirige a /login con parámetro redirect
      await expect(page).toHaveURL(/\/login/)
    })

    test('debe permitir acceso al dashboard después de login', async ({ page }) => {
      const loginPage = new LoginPage(page)
      const dashboardPage = new DashboardPage(page)
      
      // Usar supervisor en lugar de operador (que no existe por defecto)
      await loginPage.login(testUsers.supervisor.username, testUsers.supervisor.password)
      await dashboardPage.expectToBeDashboard()
      
      await page.goto('/dashboard')
      await dashboardPage.expectToBeDashboard()
      await expect(page).toHaveURL(/\/dashboard/)
    })
  })
})
