/**
 * IRCCA System Constants - Configuración centralizada
 * Versión: 1.0.0
 * Siguiendo arquitectura documentada - evitando valores hardcodeados
 */

// Sistema de información institucional
export const SYSTEM_INFO = {
  NAME: 'Sistema para registros del IRCCA',
  FULL_NAME: 'Instituto de Regulación y Control del Cannabis',
  GOVERNMENT: '@2025, Dirección Nacional Guardia Republicana',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
} as const

// Configuración de autenticación
export const AUTH_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 3,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos en milliseconds
  PASSWORD_MIN_LENGTH: 4,
  USERNAME_MIN_LENGTH: 3,
  PIN_LENGTH: 4,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
} as const

// Configuración de la UI
export const UI_CONFIG = {
  LOGIN_CARD_MAX_WIDTH: 480,
  ANIMATION_DURATION: 300,
  NOTIFICATION_TIMEOUT: 5000,
  REFRESH_INTERVAL: 30000, // 30 segundos para stats en tiempo real
  RESPONSIVE_BREAKPOINT: 'md',
  // Configuración del fondo institucional con formas distribuidas
  BACKGROUND: {
    GRADIENT_PRIMARY: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #1976D2 100%)',
    GRADIENT_OVERLAY:
      'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
    // Formas geométricas - colores institucionales (más visibles)
    SHAPE_FILL_PRIMARY: 'rgba(255, 255, 255, 0.06)',
    SHAPE_FILL_SECONDARY: 'rgba(255, 255, 255, 0.08)',
    SHAPE_BORDER_PRIMARY: 'rgba(255, 255, 255, 0.12)',
    SHAPE_BORDER_SECONDARY: 'rgba(255, 255, 255, 0.15)',
    SHAPE_ACCENT: 'rgba(25, 118, 210, 0.20)',
    SHAPE_LIGHT: 'rgba(255, 255, 255, 0.06)',
  },
} as const

// Mensajes del sistema centralizados
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Acceso autorizado. Bienvenido al sistema.',
    LOGIN_ERROR: 'Credenciales incorrectas. Verifique usuario y contraseña.',
    CONNECTION_ERROR: 'Error de conexión. Intente nuevamente.',
    ACCOUNT_LOCKED: 'Cuenta bloqueada por múltiples intentos fallidos.',
    SESSION_EXPIRED: 'Su sesión ha expirado. Debe iniciar sesión nuevamente.',
    LOGOUT_SUCCESS: 'Sesión cerrada correctamente.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo es requerido',
    USERNAME_MIN: `El usuario debe tener al menos ${AUTH_CONFIG.USERNAME_MIN_LENGTH} caracteres`,
    USERNAME_FORMAT: 'Solo letras, números, puntos, guiones y guiones bajos',
    PASSWORD_MIN: `La contraseña debe tener al menos ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} caracteres`,
    PIN_FORMAT: `El PIN debe tener exactamente ${AUTH_CONFIG.PIN_LENGTH} dígitos`,
    CEDULA_FORMAT: 'La cédula debe tener 8 dígitos',
    PHONE_FORMAT: 'Formato: 09X XXX XXX',
    PLATE_FORMAT: 'Formato: ABC1234',
  },
  SYSTEM: {
    LOADING: 'Cargando...',
    DASHBOARD_DEVELOPMENT: 'Dashboard en desarrollo...',
    REGISTER_DEVELOPMENT: 'Funcionalidad de registro en desarrollo...',
  },
} as const

// Iconos Material Design utilizados en el sistema
export const ICONS = {
  AUTH: {
    SECURITY: 'mdi-shield-account',
    USER: 'mdi-account',
    PASSWORD: 'mdi-lock',
    LOGIN: 'mdi-login',
    LOGOUT: 'mdi-logout',
    SHOW_PASSWORD: 'mdi-eye',
    HIDE_PASSWORD: 'mdi-eye-off',
  },
  NAVIGATION: {
    DASHBOARD: 'mdi-view-dashboard',
    REGISTER: 'mdi-account-plus',
    EXIT: 'mdi-account-minus',
    SEARCH: 'mdi-magnify',
    HELP: 'mdi-help-circle',
    SETTINGS: 'mdi-cog',
    PROFILE: 'mdi-account',
    EDIT: 'mdi-account-edit',
  },
  ACTIONS: {
    SAVE: 'mdi-content-save',
    CANCEL: 'mdi-cancel',
    EDIT: 'mdi-pencil',
    DELETE: 'mdi-delete',
    REFRESH: 'mdi-refresh',
  },
  USER: {
    PROFILE: 'mdi-card-account-details',
    RANK: 'mdi-medal',
    PERSON: 'mdi-account',
    ADD: 'mdi-account-plus',
  },
  STATUS: {
    SUCCESS: 'mdi-check-circle',
    ERROR: 'mdi-alert-circle',
    WARNING: 'mdi-alert',
    INFO: 'mdi-information',
  },
} as const

// Rutas del sistema
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  REGISTER: '/registro',
  REGISTER_ENTRY: '/registro/ingreso',
  REGISTER_EXIT: '/registro/egreso',
  CONSULTATIONS: '/consultas',
  ADMIN: '/admin',
  NOT_FOUND: '/:pathMatch(.*)*',
} as const

// Roles y permisos
export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operador',
  SUPERVISOR: 'supervisor',
} as const

// Configuración de la base de datos IndexedDB
export const DATABASE_CONFIG = {
  NAME: 'ircca_system_db',
  VERSION: 2,
  STORES: {
    REGISTROS: 'registros',
    AUDITORIA: 'auditoria',
    RESPALDOS: 'respaldos_automaticos',
    FEEDBACK: 'feedback_usuarios',
    USUARIOS: 'usuarios',
    PERSONAS_DENTRO: 'personas_dentro',
  },
} as const

// Configuración PWA
export const PWA_CONFIG = {
  CACHE_NAMES: {
    STATIC: 'ircca-static-v1',
    DYNAMIC: 'ircca-dynamic-v1',
    IMAGES: 'ircca-images-v1',
  },
  OFFLINE_PAGE: '/offline.html',
} as const

// Configuración de validaciones (expresiones regulares)
export const VALIDATION_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9._-]+$/,
  CEDULA: /^\d{8}$/,
  PHONE: /^09[0-9]\s?\d{3}\s?\d{3}$/,
  VEHICLE_PLATE: /^[A-Z]{3}\d{4}$/,
  PIN: /^\d{4}$/,
} as const

// Configuración de respaldo (estrategia 3-2-1)
export const BACKUP_CONFIG = {
  DAILY_RETENTION: 7, // días
  WEEKLY_RETENTION: 4, // semanas
  MONTHLY_RETENTION: 12, // meses
  AUTO_BACKUP_HOUR: 2, // 2:00 AM
  EXPORT_FORMAT: 'json',
} as const
