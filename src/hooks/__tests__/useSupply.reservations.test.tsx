import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useSupply } from '../useSupply'
import { dbContext } from '../../services'
import { NotificationService } from '../../services/notificationService'

// Mock pouchdb service used by the hook
vi.mock('../../services/pouchdbService', () => ({
    dbContext: {
        supplies: { find: vi.fn(), put: vi.fn() },
    },
}))
// Ensure the re-exported services module used in hooks is also mocked
vi.mock('../../services', () => ({
    dbContext: {
        supplies: { find: vi.fn(), put: vi.fn() },
    },
}))

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => new Promise(() => { }) } }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock NotificationService to avoid side effects
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

// Mock react-router navigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => vi.fn() }
})

const createMockStore = () =>
    configureStore({
        reducer: {
            auth: () => ({
                user: {
                    id: 'user-1',
                    accountId: 'acc-1',
                    licenceId: 'lic-1',
                    currency: 'ARS',
                    countryId: 'AR',
                },
            }),
            supply: () => ({ supplyActive: null }),
            deposit: () => ({ depositActive: null }),
        },
    })

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={createMockStore()}>{children}</Provider>
)

describe('useSupply - reservations', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('addReservedStock: incrementa reservedStock del insumo', async () => {
        const supply = {
            _id: 'sup-1',
            accountId: 'acc-1',
            name: 'Fertilizante X',
            type: 'Fertilizantes',
            unitMeasurement: 'kg',
            currentStock: 100,
            reservedStock: 10,
            stockByLot: false,
            activePrincipal: '',
            mermaVolatile: '',
            minimumDose: '',
            maximumDose: '',
            recommendedDose: '',
            replenishmentPoint: '',
            labors: [],
            generico: false,
        }

        vi.mocked(dbContext.supplies.find as any).mockResolvedValue({ docs: [supply] } as any)
        vi.mocked(dbContext.supplies.put as any).mockResolvedValue({ ok: true } as any)

        const { result } = renderHook(() => useSupply(), { wrapper })

        // Pre-cargar lista de insumos del hook para que addReservedStock los encuentre
        await waitFor(async () => {
            await result.current.getSupplies()
        })
        await waitFor(() => {
            expect(result.current.supplies.find(s => s._id === 'sup-1')).toBeTruthy()
        })

        await waitFor(async () => {
            await result.current.addReservedStock('sup-1', 5)
        })

        await waitFor(() => {
            const updated = result.current.supplies.find(s => s._id === 'sup-1')
            expect(updated?.reservedStock).toBe(15)
        })
    })

    it('removeReservedStock: resta de reserved y de current, y valida insuficiente', async () => {
        const supply = {
            _id: 'sup-err',
            accountId: 'acc-1',
            name: 'Semilla Y',
            type: 'Semillas',
            unitMeasurement: 'kg',
            currentStock: 50,
            reservedStock: 3,
            stockByLot: false,
            activePrincipal: '',
            mermaVolatile: '',
            minimumDose: '',
            maximumDose: '',
            recommendedDose: '',
            replenishmentPoint: '',
            labors: [],
            generico: false,
        }

        vi.mocked(dbContext.supplies.find as any).mockResolvedValue({ docs: [supply] } as any)
        vi.mocked(dbContext.supplies.put as any).mockResolvedValue({ ok: true } as any)

        const { result } = renderHook(() => useSupply(), { wrapper })
        await waitFor(async () => { await result.current.getSupplies() })

        // Caso válido: remover 2 -> reserved 1, current 48
        await waitFor(async () => { await result.current.removeReservedStock('sup-err', 2) })
        await waitFor(() => {
            expect(dbContext.supplies.put).toHaveBeenCalledWith(
                expect.objectContaining({ _id: 'sup-err', reservedStock: 1, currentStock: 48 })
            )
        })

        // Caso inválido: intentar remover más que reservado
        await result.current.removeReservedStock('sup-err', 5)
        // No debe escribir nuevamente en DB (solo la primera vez fue válida)
        expect(dbContext.supplies.put).toHaveBeenCalledTimes(1)
        // Debe mostrar error
        expect(NotificationService.showError).toHaveBeenCalled()
    })
})


