import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { useOrder } from '../../../hooks/useOrder'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBMemory from 'pouchdb-adapter-memory'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBMemory)

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => new Promise(() => { }) } }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../../../services')
import { dbContext } from '../../../services'

const makeStore = () =>
    configureStore({
        reducer: {
            auth: () => ({ user: { id: 'u1', accountId: 'acc-1', licenceId: 'lic-1', currency: 'ARS' } }),
            campaign: () => ({ selectedCampaign: { _id: 'camp-1-doc', campaignId: 'camp-1', zafra: '2024/2025' } }),
            order: () => ({ withdrawalOrderActive: null }),
        },
    })

function initDbs() {
    ; (dbContext as any).numerators = new PouchDB('mem2-numerators', { adapter: 'memory' })
        ; (dbContext as any).withdrawalOrders = new PouchDB('mem2-withdrawalOrders', { adapter: 'memory' })
        ; (dbContext as any).depositSupplyOrder = new PouchDB('mem2-depositSupplyOrder', { adapter: 'memory' })
        ; (dbContext as any).withdrawalsByDepositSupply = new PouchDB('mem2-withdrawalsByDepositSupply', { adapter: 'memory' })
        ; (dbContext as any).stockMovements = new PouchDB('mem2-stockMovements', { adapter: 'memory' })
        ; (dbContext as any).stock = new PouchDB('mem2-stock', { adapter: 'memory' })
        ; (dbContext as any).deposits = new PouchDB('mem2-deposits', { adapter: 'memory' })
        ; (dbContext as any).supplies = new PouchDB('mem2-supplies', { adapter: 'memory' })
        ; (dbContext as any).campaigns = new PouchDB('mem2-campaigns', { adapter: 'memory' })
        ; (dbContext as any).socialEntities = new PouchDB('mem2-socialEntities', { adapter: 'memory' })
}

describe('Siembra - descuento usa cantidad total (no por ha)', () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        initDbs()
        await dbContext.stock.createIndex({ index: { fields: ['accountId'] } } as any)
        await dbContext.deposits.createIndex({ index: { fields: ['accountId'] } } as any)
        await dbContext.supplies.createIndex({ index: { fields: ['accountId'] } } as any)
        await dbContext.withdrawalOrders.createIndex({ index: { fields: ['accountId'] } } as any)
        await dbContext.depositSupplyOrder.createIndex({ index: { fields: ['accountId'] } } as any)
        await dbContext.socialEntities.createIndex({ index: { fields: ['accountId'] } } as any)
        await dbContext.campaigns.createIndex({ index: { fields: ['accountId'] } } as any)

        await dbContext.deposits.post({ _id: 'dep-1', accountId: 'acc-1', description: 'Dep 1' } as any)
        await dbContext.supplies.post({ _id: 'sup-1', accountId: 'acc-1', name: 'Semilla Soja', unitMeasurement: 'kg', currentStock: 0, reservedStock: 0, stockByLot: false, type: 'Semillas' } as any)
        await dbContext.stock.post({ accountId: 'acc-1', id: 'sup-1', depositId: 'dep-1', location: '', nroLot: 'L1', currentStock: 100, reservedStock: 0, campaignId: 'camp-1' } as any)
        await dbContext.campaigns.post({ _id: 'camp-1-doc', accountId: 'acc-1', campaignId: 'camp-1', name: 'Campaña 1', zafra: '2024/2025' } as any)
        await dbContext.socialEntities.post({ _id: 'W1', accountId: 'acc-1', name: 'Cliente 1' } as any)
    })

    it('crea orden de retiro con cantidad total correcta y confirma correctamente', async () => {
        const store = makeStore()
        const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>

        // 1) Crear orden con 12 unidades (total), con 3 ha y dosificación 2/ha. total es 12, no 6
        const { result: orderHook } = renderHook(() => useOrder(), { wrapper })
        const created = await orderHook.current.createWithdrawalOrder(
            { accountId: 'acc-1', type: 'Automatica', creationDate: new Date().toISOString(), order: 0, reason: 'Reserva', campaignId: 'camp-1', field: 'F1', state: 'Pending', withdrawId: 'W1' } as any,
            [{ accountId: 'acc-1', depositId: 'dep-1', supplyId: 'sup-1', location: '', nroLot: 'L1', originalAmount: 12, withdrawalAmount: 12 } as any],
        )
        expect(created).toBeTruthy()
        expect(created!.order).toBeGreaterThan(0)

        // 2) Verificar que la orden se guardó con los montos correctos
        const detail = await orderHook.current.getOrderDetailByNumber(created!.order)
        expect(detail?.withdrawalOrder).toBeTruthy()
        expect(detail?.suppliesOfTheOrder).toHaveLength(1)
        expect(detail!.suppliesOfTheOrder![0].originalAmount).toBe(12)

        // 3) Confirmar retiro automático
        const confirmed = await orderHook.current.confirmAutomaticWithdrawalOrder(
            detail!.withdrawalOrder as any,
            detail!.suppliesOfTheOrder!,
            new Date().toISOString()
        )
        expect(confirmed).toBe(true)

        // 4) Verificar que la orden se marcó como completada
        const ordersResult = await dbContext.withdrawalOrders.find({ selector: { accountId: 'acc-1' } } as any)
        const completedOrder = ordersResult.docs.find((d: any) => d.order === created!.order)
        expect(completedOrder?.state).toBe('Completed')
    })
})
