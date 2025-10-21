/**
 * Fixtures de usuarios de prueba para tests E2E
 * NOTA: Estos usuarios deben existir en la base de datos de desarrollo
 */

export interface TestUser {
  username: string
  password: string
  role: 'admin' | 'supervisor' | 'operador'
  nombre: string
  apellido: string
  grado?: string
}

/**
 * Usuarios de prueba por rol
 * ✅ IMPORTANTE: Estos usuarios coinciden con los creados automáticamente en src/utils/initializeAdmin.ts
 * La app crea estos usuarios por defecto en el primer inicio
 */
export const testUsers: Record<'admin' | 'supervisor' | 'operador', TestUser> = {
  admin: {
    username: '55226350',      // DEFAULT_ADMIN.cedula
    password: '2025.Ircca',    // DEFAULT_ADMIN.password
    role: 'admin',
    nombre: 'Mario',
    apellido: 'Berni',
    grado: 'Guardia Republicano'
  },
  
  supervisor: {
    username: '12345678',           // DEFAULT_SUPERVISOR.cedula
    password: '2025.Supervisor',    // DEFAULT_SUPERVISOR.password
    role: 'supervisor',
    nombre: 'Carlos',
    apellido: 'Torres',
    grado: 'Encargado'
  },
  
  // NOTA: No hay operador por defecto en el sistema
  // Este usuario NO existe - tests que lo usen fallarán hasta que se cree
  operador: {
    username: 'operador1',
    password: '1234',
    role: 'operador',
    nombre: 'Operador',
    apellido: 'Prueba',
    grado: 'Cabo'
  }
}

/**
 * Credenciales inválidas para tests de error
 */
export const invalidCredentials = {
  nonExistentUser: {
    username: '99999999',      // Cédula que no existe
    password: 'password123'
  },
  
  wrongPassword: {
    username: '12345678',      // Supervisor con password incorrecta
    password: 'wrongpassword'
  },
  
  emptyUsername: {
    username: '',
    password: '2025.Ircca'
  },
  
  emptyPassword: {
    username: '55226350',      // Admin sin password
    password: ''
  },
  
  shortUsername: {
    username: 'ab',
    password: '2025.Ircca'
  },
  
  shortPassword: {
    username: '55226350',
    password: '123'
  }
}

/**
 * Datos de test para bloqueo de cuenta
 */
export const lockoutTest = {
  maxAttempts: 3,
  lockoutDurationMinutes: 15
}
