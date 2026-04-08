import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useSupply } from '../useSupply'
import { dbContext } from '../../services/pouchdbService'
import { Supply } from '../../types'

// Mock PouchDB
vi.mock('../../services/pouchdbService', () => ({
  dbContext: {
    supplies: {
      find: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      remove: vi.fn(),
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

// Mock NotificationService
vi.mock('../../services/notificationService', () => ({
  NotificationService: {
    showWarning: vi.fn(),
    showAdded: vi.fn(),
    showUpdated: vi.fn(),
    showDeleted: vi.fn(),
    showError: vi.fn(),
    showSuccess: vi.fn(),
  },
}))

const createMockStore = () =>
  configureStore({
    reducer: {
      auth: () => ({
        user: {
          accountId: 'test-account-id',
          id: 'test-user-id',
          countryId: 'AR',
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

describe('useSupply - createSupply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('✅ debe crear un nuevo insumo correctamente', async () => {
    // Arrange
    const newSupply: Supply = {
      name: 'Fertilizante NPK',
      type: 'Fertilizante',
      unitMeasurement: 'kg',
      currentStock: 0,
      reservedStock: 0,
    } as Supply

    // Mock: No existe insumo con ese nombre y tipo
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.supplies.post).mockResolvedValue({ ok: true, id: 'supply-123', rev: '1-abc' } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.createSupply(newSupply)
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Debe verificar si existe el insumo
    expect(dbContext.supplies.find).toHaveBeenCalledWith({
      selector: {
        $and: [
          { accountId: 'test-account-id' },
          { type: 'Fertilizante' },
          { name: 'Fertilizante NPK' },
        ],
      },
    })

    // Debe crear el insumo con los datos correctos
    expect(dbContext.supplies.post).toHaveBeenCalledWith({
      ...newSupply,
      accountId: 'test-account-id',
      countryId: 'AR',
    })
  })

  it('❌ NO debe crear insumo si ya existe con mismo nombre y tipo', async () => {
    // Arrange
    const newSupply: Supply = {
      name: 'Fertilizante NPK',
      type: 'Fertilizante',
      unitMeasurement: 'kg',
    } as Supply

    // Mock: Ya existe un insumo con ese nombre y tipo
    const existingSupply = {
      _id: 'supply-existing',
      name: 'Fertilizante NPK',
      type: 'Fertilizante',
      accountId: 'test-account-id',
    }

    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [existingSupply] } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.createSupply(newSupply)
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // NO debe llamar a post porque ya existe
    expect(dbContext.supplies.post).not.toHaveBeenCalled()
  })

  it('✅ debe permitir crear insumo con mismo nombre pero diferente tipo', async () => {
    // Arrange
    const existingHerbicida: Supply = {
      _id: 'supply-1',
      name: 'Glifosato',
      type: 'Herbicida',
      accountId: 'test-account-id',
    } as Supply

    const newFungicida: Supply = {
      name: 'Glifosato', // Mismo nombre
      type: 'Fungicida', // Diferente tipo
      unitMeasurement: 'L',
    } as Supply

    // Mock: No existe "Glifosato" como "Fungicida"
    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: [] } as any)
    vi.mocked(dbContext.supplies.post).mockResolvedValue({ ok: true } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.createSupply(newFungicida)
    })

    // Assert
    expect(dbContext.supplies.post).toHaveBeenCalledWith({
      ...newFungicida,
      accountId: 'test-account-id',
      countryId: 'AR',
    })
  })

  it('✅ debe actualizar un insumo existente correctamente', async () => {
    // Arrange
    const updatedSupply: Supply = {
      _id: 'supply-123',
      _rev: '1-abc',
      name: 'Fertilizante NPK 20-20-20',
      type: 'Fertilizante',
      unitMeasurement: 'kg',
      currentStock: 500,
      reservedStock: 50,
      accountId: 'test-account-id',
    } as Supply

    vi.mocked(dbContext.supplies.put).mockResolvedValue({ ok: true, id: 'supply-123', rev: '2-def' } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.updateSupply(updatedSupply)
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(dbContext.supplies.put).toHaveBeenCalledWith(updatedSupply)
  })

  it('✅ debe eliminar un insumo correctamente', async () => {
    // Arrange
    const supplyId = 'supply-123'
    const supplyRev = '1-abc'

    vi.mocked(dbContext.supplies.remove).mockResolvedValue({ ok: true, id: supplyId, rev: '2-deleted' } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.deleteSupply(supplyId, supplyRev)
    })

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(dbContext.supplies.remove).toHaveBeenCalledWith(supplyId, supplyRev)
  })

  it('✅ debe obtener todos los insumos del usuario y los genéricos', async () => {
    // Arrange
    const mockSupplies = [
      {
        _id: 'supply-1',
        name: 'Fertilizante Usuario',
        type: 'Fertilizante',
        accountId: 'test-account-id',
        countryId: 'AR',
      },
      {
        _id: 'supply-2',
        name: 'Herbicida Genérico',
        type: 'Herbicida',
        isDefault: true,
        countryId: 'AR',
      },
    ]

    vi.mocked(dbContext.supplies.find).mockResolvedValue({ docs: mockSupplies } as any)

    // Act
    const { result } = renderHook(() => useSupply(), { wrapper })

    await waitFor(async () => {
      await result.current.getSupplies()
    })

    // Assert
    await waitFor(() => {
      expect(result.current.supplies).toHaveLength(2)
    })

    expect(dbContext.supplies.find).toHaveBeenCalledWith({
      selector: {
        $or: [
          { accountId: 'test-account-id' },
          { isDefault: true },
        ],
      },
    })

    expect(result.current.supplies).toEqual(mockSupplies)
  })
})
