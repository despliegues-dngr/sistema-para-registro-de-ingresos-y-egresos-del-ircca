import { Page } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { testUsers } from '../fixtures/usuarios'

/**
 * Helper para autenticación en tests E2E
 * Proporciona funciones reutilizables para login/logout
 */

/**
 * Realiza login como un rol específico
 * @param page - Instancia de Page de Playwright
 * @param role - Rol del usuario (admin, supervisor, operador)
 */
export async function loginAs(page: Page, role: 'admin' | 'supervisor' | 'operador') {
  const credentials = testUsers[role]
  
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(credentials.username, credentials.password)
  
  // Esperar navegación al dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 })
}

/**
 * Limpia la base de datos IndexedDB antes de cada test
 * IMPORTANTE: Esto resetea el estado para tests independientes
 * @param page - Instancia de Page de Playwright
 */
export async function cleanDatabase(page: Page) {
  // CRÍTICO: Navegar primero para establecer contexto de seguridad
  // IndexedDB requiere un origen válido (http://localhost)
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  
  // Ahora podemos limpiar IndexedDB de forma segura
  await page.evaluate(() => {
    return indexedDB.deleteDatabase('ircca-db')
  })
  
  // Esperar mínimo para asegurar eliminación
  await page.waitForTimeout(100)
  
  // ✅ CRÍTICO: Recargar la página para que la app inicialice usuarios por defecto
  await page.reload()
  await page.waitForLoadState('networkidle')
  
  // Esperar a que la inicialización de usuarios se complete
  // La app crea automáticamente admin y supervisor en el primer arranque
  // El hasheo de passwords es asíncrono y toma tiempo (~1-2 segundos)
  // CRÍTICO: Debe ser suficiente para que ambos usuarios se creen
  await page.waitForTimeout(2000)
}

/**
 * Inicializa la base de datos con usuarios de prueba
 * @param page - Instancia de Page de Playwright
 */
export async function seedTestUsers(page: Page) {
  // Navegar a la app para que se inicialice IndexedDB
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  
  // Los usuarios de prueba se crean automáticamente en el primer arranque
  // Este helper está disponible para futura expansión de seeding
}

/**
 * Realiza logout del sistema
 * @param page - Instancia de Page de Playwright
 */
export async function logout(page: Page) {
  // Buscar botón de logout (puede estar en menú o visible)
  const logoutButton = page.getByRole('button', { name: /cerrar sesión|logout/i })
  
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click()
  } else {
    // Intentar abrir menú de usuario primero
    const userMenu = page.locator('[data-testid="user-menu"]').or(
      page.getByRole('button', { name: /menú|perfil/i })
    )
    
    if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userMenu.click()
      await logoutButton.click()
    }
  }
  
  // Esperar redirección a login
  await page.waitForURL('**/', { timeout: 5000 })
}

/**
 * Verifica si el usuario está autenticado
 * @param page - Instancia de Page de Playwright
 * @returns true si está en dashboard, false si está en login
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url()
  return url.includes('/dashboard')
}

/**
 * Espera a que se complete una operación con timeout
 * Útil para operaciones asíncronas que pueden tardar
 * @param page - Instancia de Page de Playwright
 * @param timeoutMs - Timeout en milisegundos (default: 3000)
 */
export async function waitForOperation(page: Page, timeoutMs: number = 3000) {
  await page.waitForTimeout(timeoutMs)
}
