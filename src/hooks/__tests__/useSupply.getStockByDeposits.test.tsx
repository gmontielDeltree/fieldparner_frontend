import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useSupply } from '../useSupply'
import { dbContext } from '../../services/pouchdbService'
import { TipoStock } from '../../interfaces/stock'

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
          id: 'test-user-id',
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

describe('useSupply - getStockByDeposits (Tab 1: Por Depósito)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('✅ debe mostrar cosechas en Silobolsas correctamente', async () => {
    // Arrange
    const mockDeposits = [
      {
        _id: 'silobolsa-1',
        description: 'Silobolsa #1',
        type: 'Silobolsa',
      },
      {
        _id: 'silobolsa-2',
        description: 'Silobolsa #2',
        type: 'Silobolsa',
      },
      {
        _id: 'warehouse-1',
        description: 'Almacén Principal',
        type: 'Almacén',
      },
    ]

    const mockCrops = [
      {
        _id: 'crop-soja',
        descriptionES: 'Soja',
        cropType: 'Oleaginosa',
      },
      {
        _id: 'crop-maiz',
        descriptionES: 'Maíz',
        cropType: 'Cereal',
      },
    ]

    // Stock legacy (insumos)
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

    const mockSupplies = [
      {
        _id: 'supply-fertilizer',
        name: 'Fertilizante NPK',
        type: 'Fertilizante',
        unitMeasurement: 'kg',
      },
    ]

    // CropDeposits (cosechas)
    const mockCropDeposits = [
      {
        _id: 'crop-dep-1',
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        campaignId: 'camp-1',
        currentStockKg: 50000,
        reservedStockKg: 5000,
      },
      {
        _id: 'crop-dep-2',
        accountId: 'test-account-id',
        cropId: 'crop-maiz',
        depositId: 'silobolsa-2',
        campaignId: 'camp-1',
        currentStockKg: 30000,
        reservedStockKg: 0,
      },
    ]

    // Mocks
    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
    vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: mockSupplies } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map((crop) => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockByDeposits()
    })

    await waitFor(() => {
      expect(result.current.stockByDeposits).toHaveLength(3) // 1 insumo + 2 cultivos
    })

    // Assert
    const stockByDeposits = result.current.stockByDeposits

    // 1. Debe tener el fertilizante en el almacén
    const fertilizerStock = stockByDeposits.find((s) => s.id === 'supply-fertilizer')
    expect(fertilizerStock).toBeDefined()
    expect(fertilizerStock?.dataSupply?.name).toBe('Fertilizante NPK')
    expect(fertilizerStock?.dataDeposit?.description).toBe('Almacén Principal')
    expect(fertilizerStock?.currentStock).toBe(500)

    // 2. Debe tener Soja en Silobolsa #1
    const sojaStock = stockByDeposits.find(
      (s) => s.id === 'crop-soja' && s.depositId === 'silobolsa-1'
    )
    expect(sojaStock).toBeDefined()
    expect(sojaStock?.dataCrop?.descriptionES).toBe('Soja')
    expect(sojaStock?.dataDeposit?.description).toBe('Silobolsa #1')
    expect(sojaStock?.currentStock).toBe(50000)
    expect(sojaStock?.reservedStock).toBe(5000)
    expect(sojaStock?.tipo).toBe(TipoStock.CULTIVO)

    // 3. Debe tener Maíz en Silobolsa #2
    const maizStock = stockByDeposits.find(
      (s) => s.id === 'crop-maiz' && s.depositId === 'silobolsa-2'
    )
    expect(maizStock).toBeDefined()
    expect(maizStock?.dataCrop?.descriptionES).toBe('Maíz')
    expect(maizStock?.dataDeposit?.description).toBe('Silobolsa #2')
    expect(maizStock?.currentStock).toBe(30000)
  })

  it('✅ debe combinar stock de mismo cultivo+depósito si está en legacy y cropDeposits', async () => {
    // Arrange
    const mockDeposits = [
      {
        _id: 'silobolsa-1',
        description: 'Silobolsa #1',
      },
    ]

    const mockCrops = [
      {
        _id: 'crop-soja',
        descriptionES: 'Soja',
      },
    ]

    // Stock legacy con Soja
    const mockStockLegacy = [
      {
        _id: 'stock-legacy-1',
        id: 'crop-soja',
        tipo: TipoStock.CULTIVO,
        depositId: 'silobolsa-1',
        currentStock: 1000, // Stock viejo
        reservedStock: 100,
      },
    ]

    // CropDeposits con más Soja en el mismo depósito
    const mockCropDeposits = [
      {
        _id: 'crop-dep-1',
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1', // MISMO DEPÓSITO
        currentStockKg: 50000, // Stock nuevo
        reservedStockKg: 5000,
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
    vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map((crop) => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockByDeposits()
    })

    await waitFor(() => {
      expect(result.current.stockByDeposits.length).toBeGreaterThan(0)
    })

    // Assert
    const stockByDeposits = result.current.stockByDeposits

    // Debe tener solo 1 registro de Soja en Silobolsa-1, no 2
    const sojaStocks = stockByDeposits.filter(
      (s) => s.id === 'crop-soja' && s.depositId === 'silobolsa-1'
    )
    expect(sojaStocks).toHaveLength(1)

    // Debe tener el stock combinado
    const sojaStock = sojaStocks[0]
    expect(sojaStock.currentStock).toBe(51000) // 1,000 + 50,000
    expect(sojaStock.reservedStock).toBe(5100) // 100 + 5,000
  })

  it('✅ debe manejar múltiples cosechas del mismo cultivo en diferentes depósitos', async () => {
    // Arrange
    const mockDeposits = [
      { _id: 'silobolsa-1', description: 'Silobolsa #1' },
      { _id: 'silobolsa-2', description: 'Silobolsa #2' },
      { _id: 'silobolsa-3', description: 'Silobolsa #3' },
    ]

    const mockCrops = [
      {
        _id: 'crop-soja',
        descriptionES: 'Soja',
      },
    ]

    // Soja distribuida en 3 Silobolsas
    const mockCropDeposits = [
      {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        currentStockKg: 40000,
        reservedStockKg: 0,
      },
      {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-2',
        currentStockKg: 35000,
        reservedStockKg: 5000,
      },
      {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-3',
        currentStockKg: 25000,
        reservedStockKg: 2000,
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map((crop) => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockByDeposits()
    })

    await waitFor(() => {
      expect(result.current.stockByDeposits).toHaveLength(3)
    })

    // Assert
    const stockByDeposits = result.current.stockByDeposits

    // Debe tener 3 registros de Soja, uno por depósito
    expect(stockByDeposits).toHaveLength(3)
    expect(stockByDeposits.every((s) => s.id === 'crop-soja')).toBe(true)
    expect(stockByDeposits.every((s) => s.dataCrop?.descriptionES === 'Soja')).toBe(true)

    // Verificar stock en cada depósito
    const silobolsa1 = stockByDeposits.find((s) => s.depositId === 'silobolsa-1')
    expect(silobolsa1?.currentStock).toBe(40000)

    const silobolsa2 = stockByDeposits.find((s) => s.depositId === 'silobolsa-2')
    expect(silobolsa2?.currentStock).toBe(35000)
    expect(silobolsa2?.reservedStock).toBe(5000)

    const silobolsa3 = stockByDeposits.find((s) => s.depositId === 'silobolsa-3')
    expect(silobolsa3?.currentStock).toBe(25000)
  })

  it('✅ debe funcionar cuando NO hay cosechas (cropDeposits vacío)', async () => {
    // Arrange
    const mockDeposits = [
      {
        _id: 'warehouse-1',
        description: 'Almacén Principal',
      },
    ]

    const mockStockLegacy = [
      {
        id: 'supply-123',
        tipo: TipoStock.INSUMO,
        depositId: 'warehouse-1',
        currentStock: 100,
        reservedStock: 10,
      },
    ]

    const mockSupplies = [
      {
        _id: 'supply-123',
        name: 'Fertilizante',
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
    vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: mockSupplies } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({ rows: [] } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: [] } as any) // VACÍO

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockByDeposits()
    })

    await waitFor(() => {
      expect(result.current.stockByDeposits).toHaveLength(1)
    })

    // Assert
    const stockByDeposits = result.current.stockByDeposits
    expect(stockByDeposits).toHaveLength(1)
    expect(stockByDeposits[0].dataSupply?.name).toBe('Fertilizante')
    expect(stockByDeposits[0].currentStock).toBe(100)
  })
})
