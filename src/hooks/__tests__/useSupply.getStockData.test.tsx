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

describe('useSupply - getStockData (Tab 0: Por Insumo)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('✅ debe combinar stock legacy + cropDeposits correctamente', async () => {
    // Arrange
    const mockStockLegacy = [
      {
        _id: 'stock-1',
        id: 'supply-123',
        tipo: TipoStock.INSUMO,
        accountId: 'test-account-id',
        depositId: 'dep-1',
        currentStock: 100,
        reservedStock: 10,
      },
    ]

    const mockSupplies = [
      {
        _id: 'supply-123',
        name: 'Fertilizante NPK',
        type: 'Fertilizante',
        unitMeasurement: 'kg',
      },
    ]

    const mockCrops = [
      {
        _id: 'crop-456',
        descriptionES: 'Soja',
        cropType: 'Oleaginosa',
      },
      {
        _id: 'crop-789',
        descriptionES: 'Maíz',
        cropType: 'Cereal',
      },
    ]

    // Mock cropDeposits - COSECHAS
    const mockCropDeposits = [
      // Soja en 2 depósitos
      {
        _id: 'crop-dep-1',
        accountId: 'test-account-id',
        cropId: 'crop-456',
        depositId: 'silobolsa-1',
        campaignId: 'camp-1',
        currentStockKg: 50000,
        reservedStockKg: 5000,
      },
      {
        _id: 'crop-dep-2',
        accountId: 'test-account-id',
        cropId: 'crop-456',
        depositId: 'silobolsa-2',
        campaignId: 'camp-1',
        currentStockKg: 30000,
        reservedStockKg: 0,
      },
      // Maíz en 1 depósito
      {
        _id: 'crop-dep-3',
        accountId: 'test-account-id',
        cropId: 'crop-789',
        depositId: 'silobolsa-3',
        campaignId: 'camp-2',
        currentStockKg: 25000,
        reservedStockKg: 2000,
      },
    ]

    // Mocks
    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: mockSupplies } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map(crop => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockData()
    })

    await waitFor(() => {
      expect(result.current.stockBySupplies).toHaveLength(3) // 1 insumo + 2 cultivos
    })

    // Assert
    const stockBySupplies = result.current.stockBySupplies

    // 1. Debe tener el insumo del stock legacy
    const fertilizerStock = stockBySupplies.find((s) => s.id === 'supply-123')
    expect(fertilizerStock).toBeDefined()
    expect(fertilizerStock?.dataSupply?.name).toBe('Fertilizante NPK')
    expect(fertilizerStock?.currentStock).toBe(100)
    expect(fertilizerStock?.reservedStock).toBe(10)

    // 2. Debe tener la Soja con stock agregado de ambos depósitos
    const sojaStock = stockBySupplies.find((s) => s.id === 'crop-456')
    expect(sojaStock).toBeDefined()
    expect(sojaStock?.dataCrop?.descriptionES).toBe('Soja')
    expect(sojaStock?.currentStock).toBe(80000) // 50,000 + 30,000
    expect(sojaStock?.reservedStock).toBe(5000) // 5,000 + 0
    expect(sojaStock?.tipo).toBe(TipoStock.CULTIVO)

    // 3. Debe tener el Maíz
    const maizStock = stockBySupplies.find((s) => s.id === 'crop-789')
    expect(maizStock).toBeDefined()
    expect(maizStock?.dataCrop?.descriptionES).toBe('Maíz')
    expect(maizStock?.currentStock).toBe(25000)
    expect(maizStock?.reservedStock).toBe(2000)
  })

  it('✅ NO debe duplicar cultivos si están en stock legacy Y cropDeposits', async () => {
    // Arrange
    const mockStockLegacy = [
      {
        _id: 'stock-legacy-crop',
        id: 'crop-456',
        tipo: TipoStock.CULTIVO,
        accountId: 'test-account-id',
        depositId: 'dep-old',
        currentStock: 1000, // Stock viejo
        reservedStock: 100,
      },
    ]

    const mockCrops = [
      {
        _id: 'crop-456',
        descriptionES: 'Soja',
        cropType: 'Oleaginosa',
      },
    ]

    const mockCropDeposits = [
      {
        _id: 'crop-dep-new',
        accountId: 'test-account-id',
        cropId: 'crop-456',
        depositId: 'silobolsa-1',
        currentStockKg: 50000, // Stock nuevo
        reservedStockKg: 5000,
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map(crop => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockData()
    })

    await waitFor(() => {
      expect(result.current.stockBySupplies.length).toBeGreaterThan(0)
    })

    // Assert
    const stockBySupplies = result.current.stockBySupplies

    // Debe tener solo 1 registro de Soja, no 2
    const sojaStocks = stockBySupplies.filter((s) => s.id === 'crop-456')
    expect(sojaStocks).toHaveLength(1)

    // Debe tener el stock combinado (legacy + cropDeposits)
    const sojaStock = sojaStocks[0]
    expect(sojaStock.currentStock).toBe(51000) // 1,000 (legacy) + 50,000 (cropDeposits)
    expect(sojaStock.reservedStock).toBe(5100) // 100 (legacy) + 5,000 (cropDeposits)
  })

  it('✅ debe funcionar cuando cropDeposits está vacío (sin cosechas)', async () => {
    // Arrange
    const mockStockLegacy = [
      {
        _id: 'stock-1',
        id: 'supply-123',
        tipo: TipoStock.INSUMO,
        currentStock: 100,
        reservedStock: 10,
      },
    ]

    const mockSupplies = [
      {
        _id: 'supply-123',
        name: 'Fertilizante NPK',
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: mockSupplies } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({ rows: [] } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: [] } as any) // VACÍO

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockData()
    })

    await waitFor(() => {
      expect(result.current.stockBySupplies).toHaveLength(1)
    })

    // Assert
    const stockBySupplies = result.current.stockBySupplies
    expect(stockBySupplies).toHaveLength(1)
    expect(stockBySupplies[0].dataSupply?.name).toBe('Fertilizante NPK')
  })

  it('✅ debe calcular correctamente disponible = currentStock - reservedStock', async () => {
    // Arrange
    const mockCrops = [
      {
        _id: 'crop-456',
        descriptionES: 'Soja',
      },
    ]

    const mockCropDeposits = [
      {
        accountId: 'test-account-id',
        cropId: 'crop-456',
        depositId: 'silobolsa-1',
        currentStockKg: 100000,
        reservedStockKg: 25000, // 25% reservado
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map(crop => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getStockData()
    })

    await waitFor(() => {
      expect(result.current.stockBySupplies.length).toBeGreaterThan(0)
    })

    // Assert
    const sojaStock = result.current.stockBySupplies[0]
    expect(sojaStock.currentStock).toBe(100000)
    expect(sojaStock.reservedStock).toBe(25000)

    // Disponible = 100,000 - 25,000 = 75,000
    const availableStock = sojaStock.currentStock - sojaStock.reservedStock
    expect(availableStock).toBe(75000)
  })
})
