import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useStockMovement } from '../useStockMovement'
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
    campaigns: {
      find: vi.fn(),
    },
    fields: {
      find: vi.fn(),
    },
    cropDeposits: {
      find: vi.fn(),
    },
    stockMovements: {
      find: vi.fn(),
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

describe('useStockMovement - getStock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('✅ debe obtener stock de CULTIVO desde cropDeposits', async () => {
    // Arrange
    const mockCropDeposits = [
      {
        _id: 'crop-deposit-1',
        _rev: '1-abc',
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        campaignId: 'campaign-2024',
        currentStockKg: 50000,
        reservedStockKg: 5000,
        lastUpdate: '2024-01-01',
      },
      {
        _id: 'crop-deposit-2',
        _rev: '1-def',
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-2',
        campaignId: 'campaign-2024',
        currentStockKg: 30000,
        reservedStockKg: 0,
        lastUpdate: '2024-01-01',
      },
    ]

    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)

    // Act
    const { result } = renderHook(() => useStockMovement(), { wrapper })

    let stockResult: any[] = []
    await waitFor(async () => {
      stockResult = (await result.current.getStock({
        tipo: TipoStock.CULTIVO,
        id: 'crop-soja',
        campaignId: 'campaign-2024',
      })) || []
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(dbContext.cropDeposits.find).toHaveBeenCalledWith({
      selector: {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        campaignId: 'campaign-2024',
      },
    })

    expect(stockResult).toHaveLength(2)
    expect(stockResult[0].tipo).toBe(TipoStock.CULTIVO)
    expect(stockResult[0].currentStock).toBe(50000)
    expect(stockResult[1].currentStock).toBe(30000)
  })

  it('✅ debe obtener stock de INSUMO desde stock legacy', async () => {
    // Arrange
    const mockStockLegacy = [
      {
        _id: 'stock-1',
        _rev: '1-abc',
        accountId: 'test-account-id',
        id: 'supply-fertilizer',
        tipo: TipoStock.INSUMO,
        depositId: 'warehouse-1',
        currentStock: 500,
        reservedStock: 50,
        nroLot: 'LOT-001',
        location: 'A1',
      },
    ]

    vi.mocked(dbContext.stock.find).mockResolvedValue({ docs: mockStockLegacy } as any)

    // Act
    const { result } = renderHook(() => useStockMovement(), { wrapper })

    let stockResult: any[] = []
    await waitFor(async () => {
      stockResult = (await result.current.getStock({
        tipo: TipoStock.INSUMO,
        id: 'supply-fertilizer',
        depositId: 'warehouse-1',
      })) || []
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(dbContext.stock.find).toHaveBeenCalledWith({
      selector: {
        accountId: 'test-account-id',
        tipo: TipoStock.INSUMO,
        id: 'supply-fertilizer',
        depositId: 'warehouse-1',
      },
    })

    expect(stockResult).toHaveLength(1)
    expect(stockResult[0].tipo).toBe(TipoStock.INSUMO)
    expect(stockResult[0].currentStock).toBe(500)
  })

  it('✅ debe obtener stock con fullItem=true incluyendo relaciones', async () => {
    // Arrange
    const mockCropDeposits = [
      {
        _id: 'crop-deposit-1',
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        campaignId: 'campaign-2024',
        fieldId: 'field-001',
        currentStockKg: 50000,
        reservedStockKg: 5000,
      },
    ]

    const mockDeposits = [
      {
        _id: 'silobolsa-1',
        description: 'Silobolsa #1',
        type: 'Silobolsa',
      },
    ]

    const mockCrops = [
      {
        _id: 'crop-soja',
        descriptionES: 'Soja',
        cropType: 'Oleaginosa',
      },
    ]

    const mockCampaigns = [
      {
        _id: 'campaign-2024',
        campaignId: 'campaign-2024',
        name: 'Campaña 2024',
      },
    ]

    const mockFields = [
      {
        _id: 'field-001',
        description: 'Campo Norte',
      },
    ]

    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: mockCropDeposits } as any)
    vi.mocked(dbContext.deposits.find).mockResolvedValue({ docs: mockDeposits } as any)
    vi.mocked(dbContext.crops.allDocs).mockResolvedValue({
      rows: mockCrops.map((crop) => ({ doc: crop })),
    } as any)
    vi.mocked(dbContext.campaigns.find).mockResolvedValue({ docs: mockCampaigns } as any)
    vi.mocked(dbContext.fields.find).mockResolvedValue({ docs: mockFields } as any)

    // Act
    const { result } = renderHook(() => useStockMovement(), { wrapper })

    let stockResult: any[] = []
    await waitFor(async () => {
      stockResult = (await result.current.getStock(
        {
          tipo: TipoStock.CULTIVO,
          id: 'crop-soja',
        },
        true // fullItem
      )) || []
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(stockResult).toHaveLength(1)
    expect(stockResult[0].dataCrop).toBeDefined()
    expect(stockResult[0].dataCrop.descriptionES).toBe('Soja')
    expect(stockResult[0].dataDeposit).toBeDefined()
    expect(stockResult[0].dataDeposit.description).toBe('Silobolsa #1')
    expect(stockResult[0].dataCampaign).toBeDefined()
    expect(stockResult[0].dataField).toBeDefined()
  })

  it('✅ debe filtrar stock por depositId cuando se especifica', async () => {
    // Arrange
    const mockCropDeposits = [
      {
        _id: 'crop-deposit-1',
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
        currentStockKg: 50000,
      },
      {
        _id: 'crop-deposit-2',
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-2',
        currentStockKg: 30000,
      },
    ]

    // Solo devuelve el que coincide con el depositId
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({
      docs: mockCropDeposits.filter((cd) => cd.depositId === 'silobolsa-1'),
    } as any)

    // Act
    const { result } = renderHook(() => useStockMovement(), { wrapper })

    let stockResult: any[] = []
    await waitFor(async () => {
      stockResult = (await result.current.getStock({
        tipo: TipoStock.CULTIVO,
        id: 'crop-soja',
        depositId: 'silobolsa-1',
      })) || []
    })

    // Assert
    expect(dbContext.cropDeposits.find).toHaveBeenCalledWith({
      selector: {
        accountId: 'test-account-id',
        cropId: 'crop-soja',
        depositId: 'silobolsa-1',
      },
    })

    expect(stockResult).toHaveLength(1)
    expect(stockResult[0].depositId).toBe('silobolsa-1')
    expect(stockResult[0].currentStock).toBe(50000)
  })

  it('✅ debe retornar array vacío cuando no hay stock', async () => {
    // Arrange
    vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({ docs: [] } as any)

    // Act
    const { result } = renderHook(() => useStockMovement(), { wrapper })

    let stockResult: any[] = []
    await waitFor(async () => {
      stockResult = (await result.current.getStock({
        tipo: TipoStock.CULTIVO,
        id: 'crop-inexistente',
      })) || []
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(stockResult).toHaveLength(0)
  })
})
