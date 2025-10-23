import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createRealTestDbContext,
  cleanupRealTestDatabases,
  verifyCouchDBConnection,
  RealTestDbContext,
} from '../couchdb-real-helpers'

/**
 * ========================================
 * 🧪 TEST DE CONEXIÓN A COUCHDB REAL
 * ========================================
 *
 * Test simple para verificar que podemos conectarnos a CouchDB real
 * y realizar operaciones básicas.
 *
 * Para ejecutar:
 * 1. npm run test:couchdb:up
 * 2. npm test -- src/test/__tests__/couchdb-connection.test.ts
 */

describe('🗄️ CouchDB Real - Conexión y operaciones básicas', () => {
  let db: RealTestDbContext

  beforeAll(async () => {
    console.log('📝 Verificando conexión a CouchDB...')

    const isConnected = await verifyCouchDBConnection()

    if (!isConnected) {
      throw new Error(
        '❌ CouchDB no está disponible.\n' +
          'Ejecuta: npm run test:couchdb:up\n' +
          'O manualmente: docker-compose -f docker-compose.test.yml up -d'
      )
    }

    console.log('✅ CouchDB disponible, creando bases de datos de testing...')
    db = await createRealTestDbContext()
    console.log('✅ Bases de datos creadas')
  }, 30000)

  afterAll(async () => {
    console.log('🗑️  Limpiando bases de datos de testing...')
    await cleanupRealTestDatabases()
    console.log('✅ Limpieza completada')
  }, 30000)

  it('✅ debe conectarse a CouchDB', async () => {
    const info = await db.crops.info()
    expect(info.db_name).toContain('test_')
    console.log('📊 Info de DB:', info)
  })

  it('✅ debe insertar un documento', async () => {
    const doc = {
      _id: 'crop-test-1',
      descriptionES: 'Soja',
      cropType: 'Oleaginosa',
    }

    const result = await db.crops.put(doc)

    expect(result.ok).toBe(true)
    expect(result.id).toBe('crop-test-1')
    console.log('📝 Documento insertado:', result)
  })

  it('✅ debe consultar un documento', async () => {
    // Insertar primero
    await db.crops.put({
      _id: 'crop-test-2',
      descriptionES: 'Maíz',
      cropType: 'Cereal',
    })

    // Consultar
    const doc = await db.crops.get('crop-test-2')

    expect(doc._id).toBe('crop-test-2')
    expect(doc.descriptionES).toBe('Maíz')
    console.log('📄 Documento consultado:', doc)
  })

  it('✅ debe usar índices para queries', async () => {
    // Insertar múltiples documentos
    await db.crops.bulkDocs([
      { _id: 'crop-a', descriptionES: 'Trigo', accountId: 'account-1' },
      { _id: 'crop-b', descriptionES: 'Cebada', accountId: 'account-1' },
      { _id: 'crop-c', descriptionES: 'Avena', accountId: 'account-2' },
    ] as any)

    const startTime = Date.now()

    // Query con selector (usa índice)
    const result = await db.crops.find({
      selector: {
        accountId: 'account-1',
      },
    })

    const queryTime = Date.now() - startTime

    expect(result.docs).toHaveLength(2)
    expect(result.docs[0].descriptionES).toMatch(/Trigo|Cebada/)

    console.log(`⚡ Query ejecutado en ${queryTime}ms`)
    console.log(`📊 Documentos encontrados: ${result.docs.length}`)
  })

  it('✅ debe actualizar un documento', async () => {
    // Insertar
    const insertResult = await db.supplies.put({
      _id: 'supply-1',
      name: 'Fertilizante NPK',
      currentStock: 100,
    } as any)

    // Actualizar
    const updateResult = await db.supplies.put({
      _id: 'supply-1',
      _rev: insertResult.rev,
      name: 'Fertilizante NPK 20-20-20',
      currentStock: 150,
    } as any)

    expect(updateResult.ok).toBe(true)

    // Verificar
    const doc = await db.supplies.get('supply-1')
    expect(doc.name).toBe('Fertilizante NPK 20-20-20')
    expect(doc.currentStock).toBe(150)

    console.log('✏️  Documento actualizado:', doc)
  })

  it('✅ debe eliminar un documento', async () => {
    // Insertar
    const insertResult = await db.deposits.put({
      _id: 'deposit-1',
      description: 'Almacén Principal',
    } as any)

    // Eliminar
    const deleteResult = await db.deposits.remove('deposit-1', insertResult.rev)
    expect(deleteResult.ok).toBe(true)

    // Verificar que no existe
    try {
      await db.deposits.get('deposit-1')
      throw new Error('El documento debería haber sido eliminado')
    } catch (error: any) {
      expect(error.status).toBe(404)
      console.log('🗑️  Documento eliminado correctamente')
    }
  })

  it('✅ debe manejar queries complejas con múltiples campos', async () => {
    // Insertar datos de prueba
    await db.cropDeposits.bulkDocs([
      {
        _id: 'cd-1',
        accountId: 'account-1',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        campaignId: 'campaign-2024',
        zafra: '2024/2025',
        currentStockKg: 50000,
        reservedStockKg: 5000,
      },
      {
        _id: 'cd-2',
        accountId: 'account-1',
        cropId: 'crop-maiz',
        depositId: 'silobolsa-2',
        campaignId: 'campaign-2024',
        zafra: '2024/2025',
        currentStockKg: 30000,
        reservedStockKg: 0,
      },
      {
        _id: 'cd-3',
        accountId: 'account-2',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        campaignId: 'campaign-2024',
        zafra: '2024/2025',
        currentStockKg: 20000,
        reservedStockKg: 2000,
      },
    ] as any)

    // Query compleja
    const result = await db.cropDeposits.find({
      selector: {
        accountId: 'account-1',
        cropId: 'crop-soja',
        campaignId: 'campaign-2024',
      },
    })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0].currentStockKg).toBe(50000)

    console.log('🔍 Query compleja ejecutada exitosamente')
    console.log('📄 Resultado:', result.docs[0])
  })
})
