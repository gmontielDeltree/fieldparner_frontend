/**
 * ========================================
 * 🗄️ HELPERS PARA COUCHDB REAL (Docker)
 * ========================================
 *
 * Utilidades para conectarse a CouchDB real corriendo en Docker
 * y crear/limpiar bases de datos durante los tests
 */

import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBHttp from 'pouchdb-adapter-http'

// Plugins
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBHttp)

/**
 * Configuración de CouchDB para tests
 */
export const COUCHDB_TEST_CONFIG = {
  url: 'http://localhost:5984',
  username: 'admin',
  password: 'testpassword',
  dbPrefix: 'test_',
}

/**
 * Registro de todas las DBs creadas durante los tests
 * Para poder eliminarlas al final
 */
const createdDatabases: string[] = []

/**
 * Crea una conexión autenticada a CouchDB
 */
function getAuthenticatedUrl(dbName: string): string {
  const { url, username, password, dbPrefix } = COUCHDB_TEST_CONFIG
  const fullDbName = `${dbPrefix}${dbName}`
  return `${url.replace('//', `//${username}:${password}@`)}/${fullDbName}`
}

/**
 * Crea una base de datos de testing en CouchDB real
 */
export function createRealTestDatabase<T>(name: string): PouchDB.Database<T> {
  // CouchDB requiere nombres en minúsculas
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9_$()+-/]/g, '_')
  const dbName = `${COUCHDB_TEST_CONFIG.dbPrefix}${normalizedName}_${Date.now()}`
  const dbUrl = getAuthenticatedUrl(dbName)

  const db = new PouchDB<T>(dbUrl, {
    adapter: 'http',
    skip_setup: false,
  })

  createdDatabases.push(dbName)

  return db
}

/**
 * Context de bases de datos para testing con CouchDB real
 */
export interface RealTestDbContext {
  stock: PouchDB.Database<any>
  deposits: PouchDB.Database<any>
  supplies: PouchDB.Database<any>
  crops: PouchDB.Database<any>
  cropDeposits: PouchDB.Database<any>
  cropStockControl: PouchDB.Database<any>
  cropMovements: PouchDB.Database<any>
  campaigns: PouchDB.Database<any>
  fields: PouchDB.Database<any>
  stockMovements: PouchDB.Database<any>
}

/**
 * Crea un contexto completo de bases de datos para testing en CouchDB real
 */
export async function createRealTestDbContext(): Promise<RealTestDbContext> {
  const context: RealTestDbContext = {
    stock: createRealTestDatabase('stock'),
    deposits: createRealTestDatabase('deposits'),
    supplies: createRealTestDatabase('supplies'),
    crops: createRealTestDatabase('crops'),
    cropDeposits: createRealTestDatabase('cropDeposits'),
    cropStockControl: createRealTestDatabase('cropStockControl'),
    cropMovements: createRealTestDatabase('cropMovements'),
    campaigns: createRealTestDatabase('campaigns'),
    fields: createRealTestDatabase('fields'),
    stockMovements: createRealTestDatabase('stockMovements'),
  }

  // Crear índices necesarios para las queries
  await setupRealIndexes(context)

  return context
}

/**
 * Configura los índices necesarios en las bases de datos REALES
 */
async function setupRealIndexes(context: RealTestDbContext): Promise<void> {
  try {
    // Índice para stock por accountId
    await context.stock.createIndex({
      index: {
        fields: ['accountId', 'id', 'depositId', 'nroLot', 'location'],
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
        fields: ['accountId', 'type', 'name'],
      },
    })

    // Índice para supplies default
    await context.supplies.createIndex({
      index: {
        fields: ['isDefault'],
      },
    })

    // Índice para cropDeposits (el más importante para el bug de cosechas)
    await context.cropDeposits.createIndex({
      index: {
        fields: ['accountId', 'cropId', 'depositId', 'campaignId', 'zafra'],
      },
    })

    // Índice para cropStockControl
    await context.cropStockControl.createIndex({
      index: {
        fields: ['accountId', 'cropId', 'campaignId', 'zafra', 'licenceId'],
      },
    })

    // Índice para stockMovements
    await context.stockMovements.createIndex({
      index: {
        fields: ['accountId', 'supplyId', 'depositId'],
      },
    })

    console.log('✅ Índices creados exitosamente en CouchDB real')
  } catch (error) {
    console.error('❌ Error creando índices en CouchDB:', error)
    throw error
  }
}

/**
 * Limpia TODAS las bases de datos de testing en CouchDB real
 * Debe llamarse después de cada test
 */
export async function cleanupRealTestDatabases(): Promise<void> {
  const { url, username, password } = COUCHDB_TEST_CONFIG

  for (const dbName of createdDatabases) {
    try {
      const authUrl = `${url.replace('//', `//${username}:${password}@`)}/${dbName}`
      const db = new PouchDB(authUrl, { adapter: 'http' })
      await db.destroy()
      console.log(`🗑️  Database eliminada: ${dbName}`)
    } catch (error) {
      console.warn(`⚠️  Error al limpiar DB ${dbName}:`, error)
    }
  }

  // Limpiar el registro
  createdDatabases.length = 0
  console.log('✅ Limpieza de bases de datos completada')
}

/**
 * Popula una base de datos con datos de prueba
 */
export async function populateRealDatabase<T>(
  db: PouchDB.Database<T>,
  docs: T[]
): Promise<void> {
  if (docs.length === 0) return

  try {
    const result = await db.bulkDocs(docs as any)
    console.log(`📝 ${result.length} documentos insertados en CouchDB`)
  } catch (error) {
    console.error('❌ Error insertando datos:', error)
    throw error
  }
}

/**
 * Helper para tests: setup completo con CouchDB real
 */
export async function setupRealTestEnvironment(data: {
  deposits?: any[]
  supplies?: any[]
  crops?: any[]
  stock?: any[]
  cropDeposits?: any[]
  cropStockControl?: any[]
  campaigns?: any[]
  fields?: any[]
  stockMovements?: any[]
}): Promise<RealTestDbContext> {
  console.log('🚀 Iniciando setup de ambiente de testing con CouchDB REAL...')

  const context = await createRealTestDbContext()

  // Poblar con datos de prueba
  if (data.deposits) await populateRealDatabase(context.deposits, data.deposits)
  if (data.supplies) await populateRealDatabase(context.supplies, data.supplies)
  if (data.crops) await populateRealDatabase(context.crops, data.crops)
  if (data.stock) await populateRealDatabase(context.stock, data.stock)
  if (data.cropDeposits) await populateRealDatabase(context.cropDeposits, data.cropDeposits)
  if (data.cropStockControl)
    await populateRealDatabase(context.cropStockControl, data.cropStockControl)
  if (data.campaigns) await populateRealDatabase(context.campaigns, data.campaigns)
  if (data.fields) await populateRealDatabase(context.fields, data.fields)
  if (data.stockMovements)
    await populateRealDatabase(context.stockMovements, data.stockMovements)

  console.log('✅ Ambiente de testing configurado exitosamente')

  return context
}

/**
 * Verifica que CouchDB esté disponible
 */
export async function verifyCouchDBConnection(): Promise<boolean> {
  try {
    const { url, username, password } = COUCHDB_TEST_CONFIG
    const authUrl = url.replace('//', `//${username}:${password}@`)
    const db = new PouchDB(authUrl, { adapter: 'http', skip_setup: true })

    await db.info()
    console.log('✅ Conexión a CouchDB verificada')
    return true
  } catch (error) {
    console.error('❌ No se pudo conectar a CouchDB:', error)
    return false
  }
}
