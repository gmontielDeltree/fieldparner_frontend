import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useSupply } from '../useSupply'
import { dbContext } from '../../services/pouchdbService'
import { NotificationService } from '../../services/notificationService'

vi.mock('../../services/pouchdbService', () => ({
    dbContext: {
        supplies: { find: vi.fn(), put: vi.fn(), remove: vi.fn() },
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
        showWarning: vi.fn(),
        showAdded: vi.fn(),
        showUpdated: vi.fn(),
        showDeleted: vi.fn(),
        showSuccess: vi.fn(),
        showError: vi.fn(),
    },
}))

const store = configureStore({
    reducer: {
        auth: () => ({ user: { id: 'user-1', accountId: 'acc-1', licenceId: 'lic-1', currency: 'ARS', countryId: 'AR' } }),
        supply: () => ({ supplyActive: null }),
    },
})

const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>

describe('useSupply - delete and error cases', () => {
    beforeEach(() => vi.clearAllMocks())

    it('deleteSupply: muestra notificación y navega (put ok)', async () => {
        vi.mocked(dbContext.supplies.remove as any).mockResolvedValue({ ok: true } as any)
        const { result } = renderHook(() => useSupply(), { wrapper })
        await waitFor(async () => { await result.current.deleteSupply('sup-1', 'rev-1') })
        expect(NotificationService.showDeleted).toHaveBeenCalled()
    })

    it('deleteSupply: maneja error mostrando showError', async () => {
        vi.mocked(dbContext.supplies.remove as any).mockRejectedValue(new Error('boom'))
        const { result } = renderHook(() => useSupply(), { wrapper })
        await waitFor(async () => { await result.current.deleteSupply('sup-1', 'rev-1') })
        expect(NotificationService.showError).toHaveBeenCalled()
    })

    it('getStockBySupplyAndDeposit: retorna [] si faltan ids', async () => {
        const { result } = renderHook(() => useSupply(), { wrapper })
        const data = await result.current.getStockBySupplyAndDeposit('', '')
        expect(data).toEqual([])
    })
})



