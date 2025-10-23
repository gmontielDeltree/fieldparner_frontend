import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { useStockMovement } from '../../../hooks/useStockMovement'
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
        },
    })

function initDbs() {
    ; (dbContext as any).stockMovements = new PouchDB('mem3-stockMovements', { adapter: 'memory' })
        ; (dbContext as any).stock = new PouchDB('mem3-stock', { adapter: 'memory' })
        ; (dbContext as any).deposits = new PouchDB('mem3-deposits', { adapter: 'memory' })
}

describe('Siembra sin orden de retiro - descuenta usando total exacto', () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        initDbs()
        await dbContext.stock.createIndex({ index: { fields: ['accountId', 'id', 'depositId', 'location', 'nroLot', 'campaignId', 'tipo'] } } as any)
        await dbContext.deposits.createIndex({ index: { fields: ['accountId'] } } as any)
        await dbContext.stockMovements.createIndex({ index: { fields: ['accountId'] } } as any)

        await dbContext.deposits.post({ _id: 'dep-1', accountId: 'acc-1', description: 'Dep 1' } as any)
        await dbContext.stock.post({ accountId: 'acc-1', id: 'sup-1', depositId: 'dep-1', location: '', nroLot: 'L1', currentStock: 100, reservedStock: 0, campaignId: 'camp-1', tipo: 'INSUMO' } as any)
    })

    it('consume 12 unidades (total) y no 6 (dosificación x ha)', async () => {
        const store = makeStore()
        const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>
        const { result } = renderHook(() => useStockMovement(), { wrapper })

        // Emular movimiento de ejecución (sin orden de retiro) con total 12
        const movement: any = {
            accountId: 'acc-1',
            userId: 'u1',
            amount: 12,
            creationDate: new Date().toISOString(),
            campaignId: 'camp-1',
            depositId: 'dep-1',
            isIncome: false,
            typeMovement: 'Labores',
            operationDate: new Date().toISOString(),
            isCrop: false,
            supplyId: 'sup-1',
            detail: 'Ejecución Siembra',
            location: '',
            nroLot: 'L1',
        }

        // addNewStockMovement debería restar exactamente 12: crear stock inicial por getStock
        // La API espera un Supply completo; pasamos uno mínimo con _id
        await result.current.addNewStockMovement(movement, { _id: 'sup-1', name: 'Semilla', unitMeasurement: 'kg' } as any)

        const st = await dbContext.stock.find({ selector: { accountId: 'acc-1' } } as any)
        const s = st.docs.find((d: any) => d.id === 'sup-1')
        expect(s?.currentStock).toBe(88)
    })
})


