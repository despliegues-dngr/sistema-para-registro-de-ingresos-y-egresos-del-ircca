/**
 * Database Service - Re-export desde módulo refactorizado
 *
 * ✅ REFACTORIZADO (570 → 280 líneas):
 * El código ha sido modularizado en src/services/database/
 * Este archivo mantiene compatibilidad con imports existentes
 */

// ✅ Re-exportar desde módulo refactorizado
export { DatabaseService, databaseService } from './database/databaseService'
export { backupService } from './database/backupService'
export type { BackupData } from './database/types'
