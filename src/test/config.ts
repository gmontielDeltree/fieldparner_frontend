/**
 * ========================================
 * 🔧 CONFIGURACIÓN DE TESTS
 * ========================================
 *
 * Flag para controlar el comportamiento de los tests
 */

import path from 'path'
import { tmpdir } from 'os'

export const TEST_CONFIG = {
  /**
   * 🎯 USE_REAL_DATABASE
   *
   * true  = Tests usan PouchDB REAL (más lento, 100% realidad)
   * false = Tests usan mocks (más rápido, solo lógica)
   *
   * Default: false (mocks funcionan bien, DB real requiere más configuración)
   *
   * TODO: Implementar DB real correctamente
   * - Problema actual: dbContext tiene propiedades readonly
   * - Solución futura: Crear un factory pattern para dbContext en producción
   *
   * Cambiar a true cuando:
   * - Se implemente el factory pattern para dbContext
   * - Se necesite validar queries e índices reales
   */
  USE_REAL_DATABASE: false,

  /**
   * Prefijo para las bases de datos de testing
   * Todas las DBs con este prefijo se eliminan al final de los tests
   */
  TEST_DB_PREFIX: 'test-',

  /**
   * Directorio base para las bases de datos de testing
   * Usa el directorio temporal del sistema para evitar ensuciar el root del proyecto
   */
  TEST_DB_BASE_PATH: path.join(tmpdir(), 'fieldpartner-test-dbs'),

  /**
   * Adaptador de PouchDB para tests
   * 'memory' = En RAM (muy rápido, se pierde al cerrar, NO crea archivos)
   * 'idb'    = IndexedDB (más lento, persiste)
   *
   * IMPORTANTE: Usar 'memory' para evitar crear archivos LevelDB en el disco
   * que ensucien el repositorio. El adaptador memory es suficiente para la
   * mayoría de los tests y es mucho más rápido.
   */
  TEST_DB_ADAPTER: 'memory' as 'memory' | 'idb',
}
