import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useStockMovement } from '../useStockMovement'
import { dbContext } from '../../services/pouchdbService'
import { TypeMovement } from '../../types'
import { TipoStock } from '../../interfaces/stock'

// Mock PouchDB service used by the hook
vi.mock('../../services/pouchdbService', () => ({
    dbContext: {
        stock: { find: vi.fn(), put: vi.fn(), post: vi.fn() },
        deposits: { get: vi.fn() },
        stockMovements: { post: vi.fn(), bulkDocs: vi.fn() },
        crops: { allDocs: vi.fn() },
        deposits2: { find: vi.fn() },
    },
}))

// Mock react-router navigate to avoid real navigation
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => vi.fn() }
})

// Mock i18n to return keys
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => new Promise(() => { }) } }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock NotificationService to avoid UI side effects
vi.mock('../../services/notificationService', () => ({
    NotificationService: {
        showAdded: vi.fn(),
        showError: vi.fn(),
        showSuccess: vi.fn(),
    },
}))

const createMockStore = () =>
    configureStore({
        reducer: {
            auth: () => ({
                user: {
                    accountId: 'acc-1',
                    licenceId: 'lic-1',
                    id: 'user-1',
                    currency: 'ARS',
                },
            }),
        },
    })

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={createMockStore()}>{children}</Provider>
)

describe('useStockMovement - transfer and negative stock (supplies)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('Transferencia: descuenta en origen y suma en destino cuando el lote existe', async () => {
        const sourceDoc = {
            _id: 'stock-src',
            _rev: '1-a',
            accountId: 'acc-1',
            id: 'sup-1',
            tipo: TipoStock.INSUMO,
            depositId: 'dep-A',
            location: 'A',
            nroLot: 'L1',
            campaignId: 'camp-2025',
            currentStock: 100,
            reservedStock: 0,
        }
        const destDoc = {
            _id: 'stock-dst',
            _rev: '1-b',
            accountId: 'acc-1',
            id: 'sup-1',
            tipo: TipoStock.INSUMO,
            depositId: 'dep-B',
            location: 'B',
            nroLot: 'L1',
            campaignId: 'camp-2025',
            currentStock: 20,
            reservedStock: 0,
        }

        // 1) getStock (origen)
        vi.mocked(dbContext.stock.find as any)
            .mockResolvedValueOnce({ docs: [sourceDoc] } as any)
            // 2) getStock (destino con mismo nroLot)
            .mockResolvedValueOnce({ docs: [destDoc] } as any)

        vi.mocked(dbContext.stock.put as any).mockResolvedValue({ ok: true } as any)
        vi.mocked(dbContext.stock.post as any).mockResolvedValue({ ok: true } as any)
        vi.mocked(dbContext.stockMovements.post as any).mockResolvedValue({ ok: true } as any)

        const newMovement = {
            accountId: 'acc-1',
            userId: 'user-1',
            amount: 30,
            creationDate: new Date().toISOString(),
            campaignId: 'camp-2025',
            currency: 'ARS',
            voucher: '',
            totalValue: 0,
            hours: '',
            depositId: 'dep-A',
            supplyId: 'sup-1',
            isCrop: false,
            detail: 'transfer',
            operationDate: new Date().toISOString(),
            dueDate: '',
            isIncome: false,
            location: 'A',
            movement: 'Manual',
            nroLot: 'L1',
            typeMovement: TypeMovement.TransferenciaDeposito,
        } as any

        const supplyData = { _id: 'sup-1' } as any
        const depositDestination = { depositId: 'dep-B', location: 'B' }

        const { result } = renderHook(() => useStockMovement(), { wrapper })
        await waitFor(async () => {
            await result.current.addNewStockMovement(newMovement, supplyData, depositDestination)
        })

        // Debe descontar en origen
        expect(dbContext.stock.put).toHaveBeenCalledWith(
            expect.objectContaining({ _id: 'stock-src', currentStock: 70 })
        )

        // Debe sumar en destino usando put (porque existía el lote)
        expect(dbContext.stock.put).toHaveBeenCalledWith(
            expect.objectContaining({ _id: 'stock-dst', currentStock: 50 })
        )

        // Dos movimientos: salida en origen + entrada en destino
        expect(dbContext.stockMovements.post).toHaveBeenCalledTimes(2)
    })

    it('Transferencia: crea stock en destino cuando no existe el lote', async () => {
        const sourceDoc = {
            _id: 'stock-src',
            _rev: '1-a',
            accountId: 'acc-1',
            id: 'sup-1',
            tipo: TipoStock.INSUMO,
            depositId: 'dep-A',
            location: 'A',
            nroLot: 'L1',
            campaignId: 'camp-2025',
            currentStock: 80,
            reservedStock: 0,
        }

        vi.mocked(dbContext.stock.find as any)
            .mockResolvedValueOnce({ docs: [sourceDoc] } as any) // origen
            .mockResolvedValueOnce({ docs: [] } as any) // destino inexistente

        vi.mocked(dbContext.stock.put as any).mockResolvedValue({ ok: true } as any)
        vi.mocked(dbContext.stock.post as any).mockResolvedValue({ ok: true } as any)
        vi.mocked(dbContext.stockMovements.post as any).mockResolvedValue({ ok: true } as any)

        const newMovement = {
            accountId: 'acc-1',
            userId: 'user-1',
            amount: 50,
            creationDate: new Date().toISOString(),
            campaignId: 'camp-2025',
            depositId: 'dep-A',
            supplyId: 'sup-1',
            isCrop: false,
            isIncome: false,
            location: 'A',
            nroLot: 'L1',
            typeMovement: TypeMovement.TransferenciaDeposito,
        } as any

        const supplyData = { _id: 'sup-1' } as any
        const depositDestination = { depositId: 'dep-B', location: 'B' }

        const { result } = renderHook(() => useStockMovement(), { wrapper })
        await waitFor(async () => {
            await result.current.addNewStockMovement(newMovement, supplyData, depositDestination)
        })

        // Origen actualizado
        expect(dbContext.stock.put).toHaveBeenCalledWith(
            expect.objectContaining({ _id: 'stock-src', currentStock: 30 })
        )

        // Destino creado con el nuevo registro
        expect(dbContext.stock.post).toHaveBeenCalledWith(
            expect.objectContaining({
                accountId: 'acc-1',
                id: 'sup-1',
                depositId: 'dep-B',
                location: 'B',
                nroLot: 'L1',
                currentStock: 50,
                reservedStock: 0,
            })
        )
    })

    it('Salida de insumo sin stock: permite crear negativo si el depósito lo permite', async () => {
        // No hay stock en origen
        vi.mocked(dbContext.stock.find as any).mockResolvedValue({ docs: [] } as any)
        vi.mocked(dbContext.deposits.get as any).mockResolvedValue({ _id: 'dep-A', isNegative: true })
        vi.mocked(dbContext.stock.post as any).mockResolvedValue({ ok: true } as any)
        vi.mocked(dbContext.stockMovements.post as any).mockResolvedValue({ ok: true } as any)

        const newMovement = {
            accountId: 'acc-1',
            userId: 'user-1',
            amount: 10,
            creationDate: new Date().toISOString(),
            campaignId: 'camp-2025',
            depositId: 'dep-A',
            supplyId: 'sup-1',
            isCrop: false,
            isIncome: false, // salida
            location: 'A',
            nroLot: 'L1',
            typeMovement: TypeMovement.VentasVarias,
        } as any

        const supplyData = { _id: 'sup-1' } as any

        const { result } = renderHook(() => useStockMovement(), { wrapper })
        await waitFor(async () => {
            await result.current.addNewStockMovement(newMovement, supplyData)
        })

        // Se crea registro con stock negativo
        expect(dbContext.stock.post).toHaveBeenCalledWith(
            expect.objectContaining({ currentStock: -10 })
        )
    })

    it('Salida de insumo sin stock: rechaza cuando depósito NO permite negativo', async () => {
        vi.mocked(dbContext.stock.find as any).mockResolvedValue({ docs: [] } as any)
        vi.mocked(dbContext.deposits.get as any).mockResolvedValue({ _id: 'dep-A', isNegative: false })
        vi.mocked(dbContext.stock.post as any).mockResolvedValue({ ok: true } as any)
        vi.mocked(dbContext.stockMovements.post as any).mockResolvedValue({ ok: true } as any)

        const newMovement = {
            accountId: 'acc-1',
            userId: 'user-1',
            amount: 5,
            creationDate: new Date().toISOString(),
            campaignId: 'camp-2025',
            depositId: 'dep-A',
            supplyId: 'sup-1',
            isCrop: false,
            isIncome: false,
            location: 'A',
            nroLot: 'L1',
            typeMovement: TypeMovement.Compra, // no transferencia
        } as any

        const supplyData = { _id: 'sup-1' } as any

        const { result } = renderHook(() => useStockMovement(), { wrapper })
        await waitFor(async () => {
            await result.current.addNewStockMovement(newMovement, supplyData)
        })

        // No debe crear registro negativo
        expect(dbContext.stock.post).not.toHaveBeenCalledWith(
            expect.objectContaining({ currentStock: -5 })
        )
    })
})


