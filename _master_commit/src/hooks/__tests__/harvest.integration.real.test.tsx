/**
 * ========================================
 * 🧪 TEST DE INTEGRACIÓN CON DB REAL
 * ========================================
 *
 * Bug: "Ejecute una cosecha en una Silobolsa, y en la consulta de stock no aparece"
 *
 * Este test usa PouchDB REAL cuando TEST_CONFIG.USE_REAL_DATABASE = true
 *
 * ✅ Ventajas:
 * - Valida queries reales
 * - Valida índices
 * - Valida selector syntax
 * - 100% de confianza
 *
 * ⚠️ Desventajas:
 * - Más lento (pero sigue siendo rápido con adapter 'memory')
 * - Requiere cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useStockMovement } from '../useStockMovement'
import { useSupply } from '../useSupply'
import { TipoStock } from '../../interfaces/stock'
import { TypeMovement } from '../../types'
import { TEST_CONFIG } from '../../test/config'
import {
  createTestDbContext,
  cleanupTestDatabases,
  type TestDbContext,
} from '../../test/pouchdb-helpers'

// Mock PouchDB cuando NO usamos DB real
vi.mock('../../services/pouchdbService', () => ({
  dbContext: {
    stock: { find: vi.fn(), bulkDocs: vi.fn() },
    deposits: { find: vi.fn(), bulkDocs: vi.fn() },
    supplies: { find: vi.fn(), bulkDocs: vi.fn() },
    crops: { allDocs: vi.fn(), bulkDocs: vi.fn() },
    cropDeposits: { find: vi.fn(), put: vi.fn(), post: vi.fn(), bulkDocs: vi.fn() },
    cropStockControl: { find: vi.fn(), put: vi.fn(), post: vi.fn(), bulkDocs: vi.fn() },
    cropMovements: { post: vi.fn() },
  },
}))

// Mock react-router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

import { dbContext } from '../../services/pouchdbService'

let testDbContext: TestDbContext | null = null

const createMockStore = () =>
  configureStore({
    reducer: {
      auth: () => ({
        user: {
          accountId: 'test-account-id',
          licenceId: 'test-licence-id',
          id: 'test-user-id',
          currency: 'ARS',
        },
      }),
      supply: () => ({
        supplyActive: null,
      }),
      deposit: () => ({
        depositActive: null,
      }),
    },
  })

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={createMockStore()}>{children}</Provider>
)

describe(`🧪 INTEGRATION REAL DB (${TEST_CONFIG.USE_REAL_DATABASE ? 'ENABLED' : 'DISABLED'})`, () => {
  beforeEach(async () => {
    if (TEST_CONFIG.USE_REAL_DATABASE) {
      // Crear DBs reales
      testDbContext = await createTestDbContext()

      // Reemplazar cada DB individualmente (Object.assign no funciona con readonly)
      ;(dbContext as any).stock = testDbContext.stock
      ;(dbContext as any).deposits = testDbContext.deposits
      ;(dbContext as any).supplies = testDbContext.supplies
      ;(dbContext as any).crops = testDbContext.crops
      ;(dbContext as any).cropDeposits = testDbContext.cropDeposits
      ;(dbContext as any).cropStockControl = testDbContext.cropStockControl
      ;(dbContext as any).cropMovements = testDbContext.cropMovements
    } else {
      vi.clearAllMocks()
    }
  })

  afterEach(async () => {
    if (TEST_CONFIG.USE_REAL_DATABASE) {
      // Limpiar todas las DBs de testing
      await cleanupTestDatabases()
      testDbContext = null
    }
  })

  it('✅ END-TO-END: Cosecha en Silobolsa debe aparecer en ambas vistas', async () => {
    /**
     * ESCENARIO REAL:
     * 1. Crear depositos, supplies, crops en DB real
     * 2. Ejecutar cosecha → updateCropStockTables() escribe en DB real
     * 3. Consultar stock → getStockData() lee de DB real
     * 4. Validar que la cosecha aparece
     */

    // ========================================
    // 📦 DATOS INICIALES
    // ========================================

    const mockDeposits = [
      {
        _id: 'warehouse-1',
        description: 'Almacén Principal',
        type: 'Almacén',
      },
      {
        _id: 'silobolsa-1',
        description: 'Silobolsa #1',
        type: 'Silobolsa',
      },
    ]

    const mockSupplies = [
      {
        _id: 'supply-fertilizer',
        name: 'Fertilizante NPK',
        type: 'Fertilizante',
        unitMeasurement: 'kg',
      },
    ]

    const mockCrops = [
      {
        _id: 'crop-soja',
        descriptionES: 'Soja',
        cropType: 'Oleaginosa',
      },
    ]

    const mockStockLegacy = [
      {
        _id: 'stock-1',
        id: 'supply-fertilizer',
        tipo: TipoStock.INSUMO,
        depositId: 'warehouse-1',
        currentStock: 500,
        reservedStock: 50,
        accountId: 'test-account-id',
      },
    ]

    if (TEST_CONFIG.USE_REAL_DATABASE) {
      // ✅ POBLAR DB REAL
      await dbContext.deposits.bulkDocs(mockDeposits)
      await dbContext.supplies.bulkDocs(mockSupplies)
      await dbContext.crops.bulkDocs(mockCrops)
      await dbContext.stock.bulkDocs(mockStockLegacy)
    } else {
      // ❌ USAR MOCKS
      vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)
      vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: mockSupplies } as any)
      vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
        rows: mockCrops.map((crop) => ({ doc: crop })),
      } as any)
      vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: [] } as any)
      vi.mocked(dbContext.cropStockControl.find).mockResolvedValue({ docs: [] } as any)
      vi.mocked(dbContext.cropDeposits.post).mockResolvedValue({ ok: true } as any)
      vi.mocked(dbContext.cropStockControl.post).mockResolvedValue({ ok: true } as any)
      vi.mocked(dbContext.cropMovements.post).mockResolvedValue({ ok: true } as any)
    }

    // ========================================
    // 🌾 PASO 1: EJECUTAR COSECHA (DB REAL)
    // ========================================

    const harvestMovement = {
      accountId: 'test-account-id',
      supplyId: 'crop-soja',
      userId: 'test-user-id',
      depositId: 'silobolsa-1',
      typeMovement: TypeMovement.Labores,
      isIncome: true,
      isCrop: true,
      detail: 'Harvest Entry - Soja',
      operationDate: new Date().toISOString(),
      amount: 50000, // 50 toneladas
      campaignId: 'campaign-2024',
      location: '',
      nroLot: '',
      creationDate: new Date().toISOString(),
      dueDate: '',
      voucher: '',
      currency: 'ARS',
      totalValue: 0,
      hours: '0',
      movement: 'Harvest Entry',
    }

    const mockCrop = {
      _id: 'crop-soja',
      descriptionES: 'Soja',
    }

    const mockDeposit = {
      _id: 'silobolsa-1',
      description: 'Silobolsa #1',
    }

    const mockExtras = {
      fieldId: 'field-001',
      lotId: 'lot-001',
      zafra: '2024/2025',
    }

    const { result: movementResult } = renderHook(() => useStockMovement(), { wrapper })

    await waitFor(async () => {
      await movementResult.current.updateCropStockTables(
        harvestMovement,
        mockCrop,
        mockDeposit,
        mockExtras
      )
    })

    if (TEST_CONFIG.USE_REAL_DATABASE) {
      // ✅ VERIFICAR QUE SE ESCRIBIÓ EN DB REAL
      const cropDepositsCreated = await dbContext.cropDeposits.find({
        selector: { accountId: 'test-account-id' },
      })

      expect(cropDepositsCreated.docs).toHaveLength(1)
      expect(cropDepositsCreated.docs[0]).toMatchObject({
        accountId: 'test-account-id',
        campaignId: 'campaign-2024',
        zafra: '2024/2025',
        depositId: 'silobolsa-1',
        cropId: 'crop-soja',
        currentStockKg: 50000,
        reservedStockKg: 0,
      })

      console.log('✅ cropDeposit creado en DB real:', cropDepositsCreated.docs[0])
    } else {
      // Verificar mock fue llamado
      expect(dbContext.cropDeposits.post).toHaveBeenCalled()
    }

    // ========================================
    // 📊 PASO 2: CONSULTAR STOCK TAB 0 (DB REAL)
    // ========================================

    if (!TEST_CONFIG.USE_REAL_DATABASE) {
      // Setup mocks para la query
      const mockCropDeposits = [
        {
          _id: 'crop-deposit-new',
          accountId: 'test-account-id',
          cropId: 'crop-soja',
          depositId: 'silobolsa-1',
          campaignId: 'campaign-2024',
          currentStockKg: 50000,
          reservedStockKg: 0,
        },
      ]
      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)
    }

    const { result: supplyResult } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await supplyResult.current.getStockData()
    })

    await waitFor(
      () => {
        expect(supplyResult.current.stockBySupplies).toHaveLength(2) // Fertilizante + Soja
      },
      { timeout: 5000 }
    )

    const stockBySupplies = supplyResult.current.stockBySupplies

    // Fertilizante del stock legacy
    const fertilizerStock = stockBySupplies.find((s) => s.id === 'supply-fertilizer')
    expect(fertilizerStock).toBeDefined()
    expect(fertilizerStock?.dataSupply?.name).toBe('Fertilizante NPK')
    expect(fertilizerStock?.currentStock).toBe(500)

    // ✅ CRÍTICO: Soja de la cosecha DEBE aparecer
    const sojaStock = stockBySupplies.find((s) => s.id === 'crop-soja')
    expect(sojaStock).toBeDefined()
    expect(sojaStock?.dataCrop?.descriptionES).toBe('Soja')
    expect(sojaStock?.currentStock).toBe(50000)
    expect(sojaStock?.reservedStock).toBe(0)
    expect(sojaStock?.tipo).toBe(TipoStock.CULTIVO)

    if (TEST_CONFIG.USE_REAL_DATABASE) {
      console.log('✅ Stock consultado de DB real - Tab 0:', stockBySupplies)
    }

    // ========================================
    // 📊 PASO 3: CONSULTAR STOCK TAB 1 (DB REAL)
    // ========================================

    await waitFor(async () => {
      await supplyResult.current.getStockByDeposits()
    })

    await waitFor(
      () => {
        expect(supplyResult.current.stockByDeposits).toHaveLength(2)
      },
      { timeout: 5000 }
    )

    const stockByDeposits = supplyResult.current.stockByDeposits

    // Fertilizante en almacén
    const fertilizerInWarehouse = stockByDeposits.find(
      (s) => s.id === 'supply-fertilizer' && s.depositId === 'warehouse-1'
    )
    expect(fertilizerInWarehouse).toBeDefined()
    expect(fertilizerInWarehouse?.currentStock).toBe(500)

    // ✅ CRÍTICO: Soja en Silobolsa DEBE aparecer
    const sojaInSilobolsa = stockByDeposits.find(
      (s) => s.id === 'crop-soja' && s.depositId === 'silobolsa-1'
    )
    expect(sojaInSilobolsa).toBeDefined()
    expect(sojaInSilobolsa?.dataCrop?.descriptionES).toBe('Soja')
    expect(sojaInSilobolsa?.dataDeposit?.description).toBe('Silobolsa #1')
    expect(sojaInSilobolsa?.currentStock).toBe(50000)
    expect(sojaInSilobolsa?.tipo).toBe(TipoStock.CULTIVO)

    if (TEST_CONFIG.USE_REAL_DATABASE) {
      console.log('✅ Stock consultado de DB real - Tab 1:', stockByDeposits)
      console.log('')
      console.log('🎉 FLUJO COMPLETO VALIDADO CON DB REAL:')
      console.log('   1. ✅ Cosecha ejecutada → cropDeposits escrito en PouchDB')
      console.log('   2. ✅ Tab 0 → Consulta PouchDB y muestra Soja')
      console.log('   3. ✅ Tab 1 → Consulta PouchDB y muestra Soja en Silobolsa')
      console.log('   4. ✅ Índices funcionan correctamente')
      console.log('   5. ✅ Queries funcionan correctamente')
      console.log('')
      console.log('💾 Todas las DBs de testing serán eliminadas automáticamente')
    }
  })

  it('✅ REGRESSION: Stock duplicado en legacy + cropDeposits (DB REAL)', async () => {
    /**
     * Escenario crítico: Si hay Soja en stock legacy Y en cropDeposits
     * NO debe mostrar 2 registros, sino 1 con el stock sumado
     */

    const mockCrops = [{ _id: 'crop-soja', descriptionES: 'Soja' }]

    const mockStockLegacy = [
      {
        _id: 'stock-legacy',
        id: 'crop-soja',
        tipo: TipoStock.CULTIVO,
        depositId: 'silobolsa-1',
        currentStock: 1000,
        reservedStock: 100,
        accountId: 'test-account-id',
      },
    ]

    const mockCropDeposits = [
      {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        currentStockKg: 50000,
        reservedStockKg: 5000,
      },
    ]

    if (TEST_CONFIG.USE_REAL_DATABASE) {
      await dbContext.crops.bulkDocs(mockCrops)
      await dbContext.stock.bulkDocs(mockStockLegacy)
      await dbContext.cropDeposits.bulkDocs(mockCropDeposits)
    } else {
      vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
      vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
      vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
        rows: mockCrops.map((crop) => ({ doc: crop })),
      } as any)
      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)
    }

    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockData()
    })

    await waitFor(() => {
      expect(result.current.stockBySupplies.length).toBeGreaterThan(0)
    })

    // ✅ Debe tener SOLO 1 registro de Soja
    const sojaStocks = result.current.stockBySupplies.filter((s) => s.id === 'crop-soja')
    expect(sojaStocks).toHaveLength(1)

    // ✅ Stock combinado
    const sojaStock = sojaStocks[0]
    expect(sojaStock.currentStock).toBe(51000) // 1,000 + 50,000
    expect(sojaStock.reservedStock).toBe(5100) // 100 + 5,000

    if (TEST_CONFIG.USE_REAL_DATABASE) {
      console.log('✅ No hay duplicación - Stock combinado correctamente:', sojaStock)
    }
  })

  it('✅ REAL: Múltiples cosechas en diferentes depósitos', async () => {
    const mockCrops = [{ _id: 'crop-soja', descriptionES: 'Soja' }]

    const mockDeposits = [
      { _id: 'silobolsa-1', description: 'Silobolsa #1' },
      { _id: 'silobolsa-2', description: 'Silobolsa #2' },
    ]

    const mockCropDeposits = [
      {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        currentStockKg: 50000,
        reservedStockKg: 5000,
      },
      {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-2',
        currentStockKg: 30000,
        reservedStockKg: 0,
      },
    ]

    if (TEST_CONFIG.USE_REAL_DATABASE) {
      await dbContext.crops.bulkDocs(mockCrops)
      await dbContext.deposits.bulkDocs(mockDeposits)
      await dbContext.cropDeposits.bulkDocs(mockCropDeposits)
    } else {
      vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: [] } as any)
      vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
      vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)
      vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
        rows: mockCrops.map((crop) => ({ doc: crop })),
      } as any)
      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)
    }

    const { result } = renderHook(() => useSupply(), { wrapper })

    // Tab 0: Agregado
    await waitFor(async () => {
      await result.current.getStockData()
    })

    await waitFor(() => {
      expect(result.current.stockBySupplies).toHaveLength(1)
    })

    const sojaAggregated = result.current.stockBySupplies[0]
    expect(sojaAggregated.currentStock).toBe(80000) // 50k + 30k
    expect(sojaAggregated.reservedStock).toBe(5000)

    // Tab 1: Desglosado
    await waitFor(async () => {
      await result.current.getStockByDeposits()
    })

    await waitFor(() => {
      expect(result.current.stockByDeposits).toHaveLength(2)
    })

    const silobolsa1 = result.current.stockByDeposits.find((s) => s.depositId === 'silobolsa-1')
    expect(silobolsa1?.currentStock).toBe(50000)

    const silobolsa2 = result.current.stockByDeposits.find((s) => s.depositId === 'silobolsa-2')
    expect(silobolsa2?.currentStock).toBe(30000)

    if (TEST_CONFIG.USE_REAL_DATABASE) {
      console.log('✅ Agregación multi-depósito funciona correctamente')
    }
  })
})
