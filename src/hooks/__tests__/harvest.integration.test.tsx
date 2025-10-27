import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useStockMovement } from '../useStockMovement'
import { useSupply } from '../useSupply'
import { dbContext } from '../../services/pouchdbService'
import { TipoStock } from '../../interfaces/stock'
import { TypeMovement } from '../../types'

/**
 * ========================================
 * 🧪 TEST DE INTEGRACIÓN: FLUJO DE COSECHA
 * ========================================
 *
 * Este test valida el flujo completo que causaba el bug reportado:
 *
 * Bug: "Ejecute una cosecha en una Silobolsa, y en la consulta de stock no aparece"
 *
 * Flujo completo:
 * 1. Usuario ejecuta una cosecha → updateCropStockTables()
 * 2. Sistema actualiza cropDeposits
 * 3. Usuario consulta stock Tab 0 → getStockData()
 * 4. Usuario consulta stock Tab 1 → getStockByDeposits()
 * 5. ✅ La cosecha debe aparecer en AMBAS vistas
 */

// Mock PouchDB
vi.mock('../../services/pouchdbService', () => ({
  dbContext: {
    stock: {
      find: vi.fn(),
    },
    deposits: {
      find: vi.fn(),
    },
    supplies: {
      find: vi.fn(),
    },
    crops: {
      allDocs: vi.fn(),
    },
    cropDeposits: {
      find: vi.fn(),
      put: vi.fn(),
      post: vi.fn(),
    },
    cropStockControl: {
      find: vi.fn(),
      put: vi.fn(),
      post: vi.fn(),
    },
    cropMovements: {
      post: vi.fn(),
    },
  },
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

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

describe('🧪 INTEGRATION: Flujo completo de cosecha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('✅ END-TO-END: Cosecha en Silobolsa debe aparecer en ambas vistas de stock', async () => {
    /**
     * ESCENARIO:
     * - Usuario tiene Fertilizante en Almacén (stock legacy)
     * - Usuario ejecuta cosecha de Soja en Silobolsa #1
     * - Consulta stock y debe ver:
     *   - Tab 0: Fertilizante + Soja (agregado de todos los depósitos)
     *   - Tab 1: Fertilizante en Almacén + Soja en Silobolsa #1 (desglosado)
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

    // Stock legacy: Solo fertilizante
    const mockStockLegacy = [
      {
        _id: 'stock-1',
        id: 'supply-fertilizer',
        tipo: TipoStock.INSUMO,
        depositId: 'warehouse-1',
        currentStock: 500,
        reservedStock: 50,
      },
    ]

    // ========================================
    // 🌾 PASO 1: EJECUTAR COSECHA
    // ========================================

    const harvestMovement = {
      accountId: 'test-account-id',
      supplyId: 'crop-soja',
      userId: 'test-user-id',
      depositId: 'silobolsa-1',
      typeMovement: TypeMovement.Labores,
      isIncome: true, // Entrada de stock
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

    // Mock: No existe cropDeposit previo
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({
      docs: [],
    } as any)

    vi.mocked(dbContext.cropStockControl.find).mockResolvedValue({
      docs: [],
    } as any)

    // Mock: Creación exitosa
    let createdCropDeposit: any = null
    vi.mocked(dbContext.cropDeposits.post).mockImplementation((doc) => {
      createdCropDeposit = {
        ...doc,
        _id: 'crop-deposit-new',
        _rev: '1-abc',
      }
      return Promise.resolve({ ok: true } as any)
    })

    vi.mocked(dbContext.cropStockControl.post).mockResolvedValue({ ok: true } as any)
    vi.mocked(dbContext.cropMovements.post).mockResolvedValue({ ok: true } as any)

    // Ejecutar cosecha
    const { result: movementResult } = renderHook(() => useStockMovement(), { wrapper })

    await waitFor(async () => {
      await movementResult.current.updateCropStockTables(
        harvestMovement,
        mockCrop,
        mockDeposit,
        mockExtras
      )
    })

    // Verificar que se creó el cropDeposit
    expect(dbContext.cropDeposits.post).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'test-account-id',
        campaignId: 'campaign-2024',
        zafra: '2024/2025',
        depositId: 'silobolsa-1',
        cropId: 'crop-soja',
        currentStockKg: 50000,
        reservedStockKg: 0,
      })
    )

    // ========================================
    // 📊 PASO 2: CONSULTAR STOCK - TAB 0 (Por Insumo)
    // ========================================

    // Mock cropDeposits ahora devuelve la cosecha creada
    const mockCropDeposits = [
      {
        _id: 'crop-deposit-new',
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        campaignId: 'campaign-2024',
        zafra: '2024/2025',
        currentStockKg: 50000,
        reservedStockKg: 0,
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: mockSupplies } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map((crop) => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    const { result: supplyResult } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await supplyResult.current.getStockData()
    })

    await waitFor(() => {
      expect(supplyResult.current.stockBySupplies).toHaveLength(2) // Fertilizante + Soja
    })

    const stockBySupplies = supplyResult.current.stockBySupplies

    // Debe tener el fertilizante del stock legacy
    const fertilizerStock = stockBySupplies.find((s) => s.id === 'supply-fertilizer')
    expect(fertilizerStock).toBeDefined()
    expect(fertilizerStock?.dataSupply?.name).toBe('Fertilizante NPK')
    expect(fertilizerStock?.currentStock).toBe(500)
    expect(fertilizerStock?.tipo).toBe(TipoStock.INSUMO)

    // ✅ CRÍTICO: Debe tener la Soja de la cosecha
    const sojaStock = stockBySupplies.find((s) => s.id === 'crop-soja')
    expect(sojaStock).toBeDefined()
    expect(sojaStock?.dataCrop?.descriptionES).toBe('Soja')
    expect(sojaStock?.currentStock).toBe(50000)
    expect(sojaStock?.reservedStock).toBe(0)
    expect(sojaStock?.tipo).toBe(TipoStock.CULTIVO)

    // ========================================
    // 📊 PASO 3: CONSULTAR STOCK - TAB 1 (Por Depósito)
    // ========================================

    vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)

    await waitFor(async () => {
      await supplyResult.current.getStockByDeposits()
    })

    await waitFor(() => {
      expect(supplyResult.current.stockByDeposits).toHaveLength(2) // Fertilizante + Soja
    })

    const stockByDeposits = supplyResult.current.stockByDeposits

    // Debe tener el fertilizante en el almacén
    const fertilizerInWarehouse = stockByDeposits.find(
      (s) => s.id === 'supply-fertilizer' && s.depositId === 'warehouse-1'
    )
    expect(fertilizerInWarehouse).toBeDefined()
    expect(fertilizerInWarehouse?.dataSupply?.name).toBe('Fertilizante NPK')
    expect(fertilizerInWarehouse?.dataDeposit?.description).toBe('Almacén Principal')
    expect(fertilizerInWarehouse?.currentStock).toBe(500)

    // ✅ CRÍTICO: Debe tener la Soja en la Silobolsa
    const sojaInSilobolsa = stockByDeposits.find(
      (s) => s.id === 'crop-soja' && s.depositId === 'silobolsa-1'
    )
    expect(sojaInSilobolsa).toBeDefined()
    expect(sojaInSilobolsa?.dataCrop?.descriptionES).toBe('Soja')
    expect(sojaInSilobolsa?.dataDeposit?.description).toBe('Silobolsa #1')
    expect(sojaInSilobolsa?.currentStock).toBe(50000)
    expect(sojaInSilobolsa?.reservedStock).toBe(0)
    expect(sojaInSilobolsa?.tipo).toBe(TipoStock.CULTIVO)

    // ========================================
    // ✅ VALIDACIÓN FINAL
    // ========================================

    console.log('✅ FLUJO COMPLETO VALIDADO:')
    console.log('   1. Cosecha ejecutada → cropDeposits actualizado')
    console.log('   2. Tab 0 (Por Insumo) → Muestra Soja agregada')
    console.log('   3. Tab 1 (Por Depósito) → Muestra Soja en Silobolsa #1')
    console.log('   4. Stock legacy (Fertilizante) → Sigue visible')
    console.log('')
    console.log('🎉 BUG RESUELTO: Las cosechas ahora aparecen en la consulta de stock')
  })

  it('✅ REGRESSION: Múltiples cosechas del mismo cultivo en diferentes depósitos', async () => {
    /**
     * ESCENARIO:
     * - Usuario ejecuta cosecha de Soja en Silobolsa #1 (50 ton)
     * - Usuario ejecuta cosecha de Soja en Silobolsa #2 (30 ton)
     * - Tab 0 debe mostrar: Soja con 80 ton (agregado)
     * - Tab 1 debe mostrar: Soja en Silobolsa #1 (50 ton) + Soja en Silobolsa #2 (30 ton)
     */

    const mockCrops = [
      {
        _id: 'crop-soja',
        descriptionES: 'Soja',
      },
    ]

    const mockDeposits = [
      { _id: 'silobolsa-1', description: 'Silobolsa #1', type: 'Silobolsa' },
      { _id: 'silobolsa-2', description: 'Silobolsa #2', type: 'Silobolsa' },
    ]

    // Dos cosechas de Soja en diferentes Silobolsas
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

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map((crop) => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    const { result } = renderHook(() => useSupply(), { wrapper })

    // Tab 0: Por Insumo (agregado)
    await waitFor(async () => {
      await result.current.getStockData()
    })

    await waitFor(() => {
      expect(result.current.stockBySupplies).toHaveLength(1)
    })

    const sojaAggregated = result.current.stockBySupplies.find((s) => s.id === 'crop-soja')
    expect(sojaAggregated).toBeDefined()
    expect(sojaAggregated?.currentStock).toBe(80000) // 50,000 + 30,000
    expect(sojaAggregated?.reservedStock).toBe(5000) // 5,000 + 0

    // Tab 1: Por Depósito (desglosado)
    await waitFor(async () => {
      await result.current.getStockByDeposits()
    })

    await waitFor(() => {
      expect(result.current.stockByDeposits).toHaveLength(2)
    })

    const sojaInSilobolsa1 = result.current.stockByDeposits.find(
      (s) => s.id === 'crop-soja' && s.depositId === 'silobolsa-1'
    )
    expect(sojaInSilobolsa1?.currentStock).toBe(50000)
    expect(sojaInSilobolsa1?.reservedStock).toBe(5000)

    const sojaInSilobolsa2 = result.current.stockByDeposits.find(
      (s) => s.id === 'crop-soja' && s.depositId === 'silobolsa-2'
    )
    expect(sojaInSilobolsa2?.currentStock).toBe(30000)
    expect(sojaInSilobolsa2?.reservedStock).toBe(0)
  })

  it('✅ EDGE CASE: Cosecha con stock legacy existente (no duplicar)', async () => {
    /**
     * ESCENARIO:
     * - Existe stock legacy de Soja (1,000 kg)
     * - Usuario ejecuta nueva cosecha de Soja (50,000 kg)
     * - Debe mostrar SOLO 1 registro con 51,000 kg (NO 2 registros)
     */

    const mockCrops = [{ _id: 'crop-soja', descriptionES: 'Soja' }]

    // Stock legacy de Soja
    const mockStockLegacy = [
      {
        _id: 'stock-legacy',
        id: 'crop-soja',
        tipo: TipoStock.CULTIVO,
        depositId: 'silobolsa-1',
        currentStock: 1000,
        reservedStock: 100,
      },
    ]

    // Nuevo cropDeposit de Soja en el mismo depósito
    const mockCropDeposits = [
      {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        currentStockKg: 50000,
        reservedStockKg: 5000,
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map((crop) => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockData()
    })

    await waitFor(() => {
      expect(result.current.stockBySupplies.length).toBeGreaterThan(0)
    })

    // Debe tener solo 1 registro de Soja, NO 2
    const sojaStocks = result.current.stockBySupplies.filter((s) => s.id === 'crop-soja')
    expect(sojaStocks).toHaveLength(1)

    // Debe tener el stock combinado
    const sojaStock = sojaStocks[0]
    expect(sojaStock.currentStock).toBe(51000) // 1,000 + 50,000
    expect(sojaStock.reservedStock).toBe(5100) // 100 + 5,000
  })
})
