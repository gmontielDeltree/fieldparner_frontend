import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useStockMovement } from '../useStockMovement'
import { dbContext } from '../../services/pouchdbService'
import { TipoStock } from '../../interfaces/stock'
import { TypeMovement } from '../../types'

// Mock PouchDB
vi.mock('../../services/pouchdbService', () => ({
  dbContext: {
    cropDeposits: {
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

// Mock Redux store
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

describe('useStockMovement - updateCropStockTables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('✅ Cosecha: Entrada de stock (isIncome: true)', () => {
    it('debe crear nuevo cropDeposit cuando no existe', async () => {
      // Arrange
      const mockMovement = {
        accountId: 'test-account-id',
        supplyId: 'crop-123',
        userId: 'test-user-id',
        depositId: 'silobolsa-456',
        typeMovement: TypeMovement.Labores,
        isIncome: true,
        isCrop: true,
        detail: 'Harvest Entry - Soja',
        operationDate: new Date().toISOString(),
        amount: 10000, // 10 toneladas
        campaignId: 'campaign-789',
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
        _id: 'crop-123',
        descriptionES: 'Soja',
      }

      const mockDeposit = {
        _id: 'silobolsa-456',
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

      // Mock: No existe cropDeposits previo
      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({
        docs: [],
      } as any)

      // Mock: Creación exitosa
      vi.mocked(dbContext.cropDeposits.post).mockResolvedValue({ ok: true } as any)
      vi.mocked(dbContext.cropDeposits.post).mockResolvedValue({ ok: true } as any)
      vi.mocked(dbContext.cropMovements.post).mockResolvedValue({ ok: true } as any)

      // Act
      const { result } = renderHook(() => useStockMovement(), { wrapper })

      await waitFor(async () => {
        await result.current.updateCropStockTables(mockMovement, mockCrop, mockDeposit, mockExtras)
      })

      // Assert
      // 1. Debe crear cropDeposit con stock inicial
      expect(dbContext.cropDeposits.post).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 'test-account-id',
          licenceId: 'test-licence-id',
          campaignId: 'campaign-789',
          zafra: '2024/2025',
          depositId: 'silobolsa-456',
          cropId: 'crop-123',
          fieldId: 'field-001',
          lotId: 'lot-001',
          currentStockKg: 10000,
          reservedStockKg: 0,
        })
      )

      // 2. Debe crear cropDeposits
      expect(dbContext.cropDeposits.post).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 'test-account-id',
          licenceId: 'test-licence-id',
          campaignId: 'campaign-789',
          zafra: '2024/2025',
          cropId: 'crop-123',
          currentStock: 10000,
          committedStock: 0,
          deliveredStock: 0,
        })
      )

      // 3. Debe crear cropMovement de entrada
      expect(dbContext.cropMovements.post).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 'test-account-id',
          depositId: 'silobolsa-456',
          cropId: 'crop-123',
          campaignId: 'campaign-789',
          zafra: '2024/2025',
          fieldId: 'field-001',
          lotId: 'lot-001',
          inOut: 'E', // Entrada
          amountKg: 10000,
        })
      )
    })

    it('debe sumar al cropDeposit existente cuando ya existe stock', async () => {
      // Arrange
      const mockMovement = {
        accountId: 'test-account-id',
        supplyId: 'crop-123',
        userId: 'test-user-id',
        depositId: 'silobolsa-456',
        typeMovement: TypeMovement.Labores,
        isIncome: true,
        isCrop: true,
        detail: 'Harvest Entry - Soja',
        operationDate: new Date().toISOString(),
        amount: 5000, // 5 toneladas nuevas
        campaignId: 'campaign-789',
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
        _id: 'crop-123',
        descriptionES: 'Soja',
      }

      const mockDeposit = {
        _id: 'silobolsa-456',
        description: 'Silobolsa #1',
      }

      const mockExtras = {
        fieldId: 'field-001',
        lotId: 'lot-001',
        zafra: '2024/2025',
      }

      // Mock: Ya existe cropDeposit con 10,000 kg
      const existingCropDeposit = {
        _id: 'crop-deposit-1',
        _rev: '1-abc',
        accountId: 'test-account-id',
        licenceId: 'test-licence-id',
        campaignId: 'campaign-789',
        zafra: '2024/2025',
        depositId: 'silobolsa-456',
        cropId: 'crop-123',
        currentStockKg: 10000,
        reservedStockKg: 0,
      }

      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({
        docs: [existingCropDeposit],
      } as any)

      // Mock: Ya existe cropDeposits con 10,000 kg
      const existingCropControl = {
        _id: 'crop-control-1',
        _rev: '1-def',
        accountId: 'test-account-id',
        licenceId: 'test-licence-id',
        campaignId: 'campaign-789',
        zafra: '2024/2025',
        cropId: 'crop-123',
        currentStock: 10000,
        committedStock: 0,
        deliveredStock: 0,
      }

      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({
        docs: [existingCropControl],
      } as any)

      vi.mocked(dbContext.cropDeposits.put).mockResolvedValue({ ok: true } as any)
      vi.mocked(dbContext.cropDeposits.put).mockResolvedValue({ ok: true } as any)
      vi.mocked(dbContext.cropMovements.post).mockResolvedValue({ ok: true } as any)

      // Act
      const { result } = renderHook(() => useStockMovement(), { wrapper })

      await waitFor(async () => {
        await result.current.updateCropStockTables(mockMovement, mockCrop, mockDeposit, mockExtras)
      })

      // Assert
      // 1. Debe actualizar cropDeposit sumando al stock existente
      expect(dbContext.cropDeposits.put).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingCropDeposit,
          currentStockKg: 15000, // 10,000 + 5,000
        })
      )

      // 2. Debe actualizar cropDeposits sumando al stock existente
      expect(dbContext.cropDeposits.put).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingCropControl,
          currentStock: 15000, // 10,000 + 5,000
        })
      )

      // 3. Debe crear cropMovement de entrada
      expect(dbContext.cropMovements.post).toHaveBeenCalledWith(
        expect.objectContaining({
          inOut: 'E',
          amountKg: 5000,
        })
      )

      // 4. NO debe llamar a post (solo put)
      expect(dbContext.cropDeposits.post).not.toHaveBeenCalled()
      expect(dbContext.cropDeposits.post).not.toHaveBeenCalled()
    })
  })

  describe('❌ Salida de stock (isIncome: false)', () => {
    it('debe restar del cropDeposit existente', async () => {
      // Arrange
      const mockMovement = {
        accountId: 'test-account-id',
        supplyId: 'crop-123',
        userId: 'test-user-id',
        depositId: 'silobolsa-456',
        typeMovement: TypeMovement.Labores,
        isIncome: false, // SALIDA
        isCrop: true,
        detail: 'Sale to client',
        operationDate: new Date().toISOString(),
        amount: 3000, // 3 toneladas vendidas
        campaignId: 'campaign-789',
        location: '',
        nroLot: '',
        creationDate: new Date().toISOString(),
        dueDate: '',
        voucher: '',
        currency: 'ARS',
        totalValue: 0,
        hours: '0',
        movement: 'Sale',
      }

      const mockCrop = { _id: 'crop-123', descriptionES: 'Soja' }
      const mockDeposit = { _id: 'silobolsa-456', description: 'Silobolsa #1' }
      const mockExtras = { fieldId: 'field-001', lotId: 'lot-001', zafra: '2024/2025' }

      // Mock: Existe cropDeposit con 10,000 kg
      const existingCropDeposit = {
        _id: 'crop-deposit-1',
        _rev: '1-abc',
        accountId: 'test-account-id',
        currentStockKg: 10000,
      }

      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({
        docs: [existingCropDeposit],
      } as any)

      vi.mocked(dbContext.cropDeposits.find).mockResolvedValue({
        docs: [{ _id: 'ctrl-1', _rev: '1-x', currentStock: 10000 }],
      } as any)

      vi.mocked(dbContext.cropDeposits.put).mockResolvedValue({ ok: true } as any)
      vi.mocked(dbContext.cropDeposits.put).mockResolvedValue({ ok: true } as any)
      vi.mocked(dbContext.cropMovements.post).mockResolvedValue({ ok: true } as any)

      // Act
      const { result } = renderHook(() => useStockMovement(), { wrapper })

      await waitFor(async () => {
        await result.current.updateCropStockTables(mockMovement, mockCrop, mockDeposit, mockExtras)
      })

      // Assert
      // 1. Debe restar del stock
      expect(dbContext.cropDeposits.put).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStockKg: 7000, // 10,000 - 3,000
        })
      )

      // 2. Debe crear cropMovement de salida
      expect(dbContext.cropMovements.post).toHaveBeenCalledWith(
        expect.objectContaining({
          inOut: 'S', // Salida
          amountKg: 3000,
        })
      )
    })
  })
})
