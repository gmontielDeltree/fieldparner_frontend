/**
 * ========================================
 * 🗄️ HELPERS DE POUCHDB PARA TESTS
 * ========================================
 *
 * Utilidades para crear y limpiar bases de datos reales durante los tests
 */

import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBMemory from 'pouchdb-adapter-memory'
import { TEST_CONFIG } from './config'

// Plugins
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBMemory)

/**
 * Registro de todas las DBs creadas durante los tests
 * Para poder eliminarlas al final
 */
const createdDatabases: PouchDB.Database[] = []

/**
 * Crea una base de datos de testing
 */
export function createTestDatabase<T>(name: string): PouchDB.Database<T> {
  const dbName = `${TEST_CONFIG.TEST_DB_PREFIX}${name}`

  const db = new PouchDB<T>(dbName, {
    adapter: TEST_CONFIG.TEST_DB_ADAPTER,
  })

  createdDatabases.push(db as PouchDB.Database)

  return db
}

/**
 * Context de bases de datos para testing
 * Replica la estructura de dbContext de producción
 */
export interface TestDbContext {
  stock: PouchDB.Database<any>
  deposits: PouchDB.Database<any>
  supplies: PouchDB.Database<any>
  crops: PouchDB.Database<any>
  cropDeposits: PouchDB.Database<any>
  cropStockControl: PouchDB.Database<any>
  cropMovements: PouchDB.Database<any>
}

/**
 * Crea un contexto completo de bases de datos para testing
 */
export async function createTestDbContext(): Promise<TestDbContext> {
  const context: TestDbContext = {
    stock: createTestDatabase('stock'),
    deposits: createTestDatabase('deposits'),
    supplies: createTestDatabase('supplies'),
    crops: createTestDatabase('crops'),
    cropDeposits: createTestDatabase('cropDeposits'),
    cropStockControl: createTestDatabase('cropStockControl'),
    cropMovements: createTestDatabase('cropMovements'),
  }

  // Crear índices necesarios para las queries
  await setupIndexes(context)

  return context
}

/**
 * Configura los índices necesarios en las bases de datos
 */
async function setupIndexes(context: TestDbContext): Promise<void> {
  // Índice para stock por accountId
  await context.stock.createIndex({
    index: {
      fields: ['accountId'],
    },
  })

  // Índice para deposits por accountId
  await context.deposits.createIndex({
    index: {
      fields: ['accountId'],
    },
  })

  // Índice para supplies por accountId
  await context.supplies.createIndex({
    index: {
      fields: ['accountId'],
    },
  })

  // Índice para cropDeposits (el más importante para el bug)
  await context.cropDeposits.createIndex({
    index: {
      fields: ['accountId', 'cropId', 'depositId', 'campaignId', 'zafra'],
    },
  })

  // Índice para cropStockControl
  await context.cropStockControl.createIndex({
    index: {
      fields: ['accountId', 'cropId', 'campaignId', 'zafra'],
    },
  })
}

/**
 * Limpia TODAS las bases de datos de testing
 * Debe llamarse después de cada test
 */
export async function cleanupTestDatabases(): Promise<void> {
  for (const db of createdDatabases) {
    try {
      await db.destroy()
    } catch (error) {
      console.warn('Error al limpiar DB de testing:', error)
    }
  }

  // Limpiar el registro
  createdDatabases.length = 0
}

/**
 * Popula una base de datos con datos de prueba
 */
export async function populateDatabase<T>(
  db: PouchDB.Database<T>,
  docs: T[]
): Promise<void> {
  if (docs.length === 0) return

  await db.bulkDocs(docs as any)
}

/**
 * Helper para tests: setup completo
 */
export async function setupTestEnvironment(data: {
  deposits?: any[]
  supplies?: any[]
  crops?: any[]
  stock?: any[]
  cropDeposits?: any[]
  cropStockControl?: any[]
}): Promise<TestDbContext> {
  const context = await createTestDbContext()

  // Poblar con datos de prueba
  if (data.deposits) await populateDatabase(context.deposits, data.deposits)
  if (data.supplies) await populateDatabase(context.supplies, data.supplies)
  if (data.crops) await populateDatabase(context.crops, data.crops)
  if (data.stock) await populateDatabase(context.stock, data.stock)
  if (data.cropDeposits) await populateDatabase(context.cropDeposits, data.cropDeposits)
  if (data.cropStockControl)
    await populateDatabase(context.cropStockControl, data.cropStockControl)

  return context
}

/**
 * Verifica que una query funcione correctamente
 * Útil para debuggear problemas de índices
 */
export async function debugQuery(
  db: PouchDB.Database,
  selector: any
): Promise<void> {
  console.log('🔍 Debug Query:')
  console.log('Selector:', JSON.stringify(selector, null, 2))

  try {
    const result = await db.find({ selector })
    console.log('✅ Query exitosa, docs encontrados:', result.docs.length)
    console.log('Docs:', result.docs)
  } catch (error) {
    console.error('❌ Query falló:', error)
  }

  // Mostrar índices actuales
  const indexes = await db.getIndexes()
  console.log('📊 Índices disponibles:', indexes)
}
