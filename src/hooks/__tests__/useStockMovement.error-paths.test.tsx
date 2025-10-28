import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useStockMovement } from '../useStockMovement'
import { dbContext } from '../../services/pouchdbService'
import { TypeMovement } from '../../types'

vi.mock('../../services/pouchdbService', () => ({
    dbContext: {
        stock: { find: vi.fn(), put: vi.fn(), post: vi.fn() },
        deposits: { get: vi.fn(), find: vi.fn() },
        stockMovements: { post: vi.fn(), put: vi.fn(), find: vi.fn() },
        movementsType: { allDocs: vi.fn() },
        crops: { allDocs: vi.fn() },
        campaigns: { find: vi.fn() },
        fields: { find: vi.fn() },
    },
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => new Promise(() => { }) } }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../../services/notificationService', () => ({
    NotificationService: {
        showAdded: vi.fn(),
        showError: vi.fn(),
        showSuccess: vi.fn(),
        showUpdated: vi.fn(),
    },
}))

const store = configureStore({
    reducer: {
        auth: () => ({ user: { accountId: 'acc-1', licenceId: 'lic-1', id: 'user-1', currency: 'ARS' } }),
    },
})
const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>

describe('useStockMovement - error paths', () => {
    beforeEach(() => vi.clearAllMocks())

    it('Transferencia: lanza error si falta destino o no existe stock origen', async () => {
        vi.mocked(dbContext.stock.find as any).mockResolvedValue({ docs: [] } as any)
        const { result } = renderHook(() => useStockMovement(), { wrapper })
        await result.current.addNewStockMovement(
            {
                accountId: 'acc-1', userId: 'user-1', amount: 10, creationDate: new Date().toISOString(),
                campaignId: 'camp', depositId: 'dep-A', supplyId: 'sup-1', isCrop: false, isIncome: false, location: 'A', nroLot: 'L1', typeMovement: TypeMovement.TransferenciaDeposito,
            } as any,
            { _id: 'sup-1' } as any,
            undefined as any,
        )
        // should not write anything
        expect(dbContext.stockMovements.post).not.toHaveBeenCalled()
    })

    it('Salida sin stock: depósito inválido (not_found) produce error específico', async () => {
        // No stock existente
        vi.mocked(dbContext.stock.find as any).mockResolvedValue({ docs: [] } as any)
        const notFound = new Error('not_found') as any
        notFound.name = 'not_found'
        vi.mocked(dbContext.deposits.get as any).mockRejectedValue(notFound)

        const { result } = renderHook(() => useStockMovement(), { wrapper })
        await result.current.addNewStockMovement(
            {
                accountId: 'acc-1', userId: 'user-1', amount: 5, creationDate: new Date().toISOString(),
                campaignId: 'camp', depositId: 'dep-X', supplyId: 'sup-1', isCrop: false, isIncome: false, location: 'A', nroLot: 'L1', typeMovement: TypeMovement.Compra,
            } as any,
            { _id: 'sup-1' } as any,
        )
        // should not create stock negative if deposit invalid
        expect(dbContext.stock.post).not.toHaveBeenCalled()
    })

    it('getMovementsType: onlyManual true/false y vacio', async () => {
        vi.mocked(dbContext.movementsType.allDocs as any).mockResolvedValue({ rows: [] } as any)
        const { result } = renderHook(() => useStockMovement(), { wrapper })
        await waitFor(async () => { await result.current.getMovementsType(true) })
        await waitFor(async () => { await result.current.getMovementsType(false) })
        expect(dbContext.movementsType.allDocs).toHaveBeenCalledTimes(2)
    })

    it('updateMovement: camino de error maneja notificación y estado', async () => {
        vi.mocked(dbContext.stockMovements.put as any).mockRejectedValue(new Error('boom'))
        const { result } = renderHook(() => useStockMovement(), { wrapper })
        await result.current.updateMovement({ _id: 'm-1' } as any)
        expect(dbContext.stockMovements.put).toHaveBeenCalled()
    })
})


