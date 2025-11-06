import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import PlanActivity from '../PlanActivity'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBMemory from 'pouchdb-adapter-memory'
import { renderHook } from '@testing-library/react'
import { useOrder } from '../../../hooks/useOrder'
import { useStockMovement } from '../../../hooks/useStockMovement'

PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBMemory)

// i18n mock
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => new Promise(() => { }) } }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock usePlanActivity with configurable shared state
const planRef: any = {
    formData: {
        detalles: {
            fecha_ejecucion_tentativa: '2025-01-02',
            cultivo: { _id: 'crop-1', descriptionES: 'Soja' },
            contratista: { _id: 'contr-1', nombreCompleto: 'Contractor Uno' },
            hectareas: 10,
            dosis: [],
            servicios: [{ id: 'srv-1' }],
            // Required fields for sowing otherData validation
            densidad_objetivo: 350000,
            peso_1000: 180,
            profundidad: 5,
            tipo_siembra: 'directa',
            distancia: 52,
        },
        condiciones: {
            humedad_max: 80,
            humedad_min: 10,
            temperatura_max: 35,
            temperatura_min: 5,
            velocidad_max: 20,
            velocidad_min: 1,
        },
    },
    setFormData: vi.fn(),
    missingItem: null,
    setMissingItem: vi.fn(),
    openConfirmDialog: false,
    setOpenConfirmDialog: vi.fn(),
    openSnackbar: false,
    setOpenSnackbar: vi.fn(),
    snackbarMessage: '',
    setSnackbarMessage: vi.fn(),
    activeStep: 5,  // Último paso (observations) para que muestre el botón "save"
    setActiveStep: vi.fn(),
    maxStepReached: 5,  // Todos los pasos completados
    setMaxStepReached: vi.fn(),
    handleCloseSnackbar: vi.fn(),
    handleNext: vi.fn(),
    handleBack: vi.fn(),
    handleStep: vi.fn(),
}
vi.mock('../components/usePlanActivity', () => ({
    usePlanActivity: () => planRef,
}))

// Mock services dbContext to in-memory DBs
const dbs: Record<string, PouchDB.Database<any>> = {}
vi.mock('../../../services')

// Import after mocking services
import { dbContext } from '../../../services'

// Initialize mocked dbContext databases lazily to avoid hoist issues
function initInMemoryDbs() {
    ; (dbContext as any).numerators = new PouchDB('mem-numerators', { adapter: 'memory' })
        ; (dbContext as any).withdrawalOrders = new PouchDB('mem-withdrawalOrders', { adapter: 'memory' })
        ; (dbContext as any).depositSupplyOrder = new PouchDB('mem-depositSupplyOrder', { adapter: 'memory' })
        ; (dbContext as any).withdrawalsByDepositSupply = new PouchDB('mem-withdrawalsByDepositSupply', { adapter: 'memory' })
        ; (dbContext as any).stockMovements = new PouchDB('mem-stockMovements', { adapter: 'memory' })
        ; (dbContext as any).stock = new PouchDB('mem-stock', { adapter: 'memory' })
        ; (dbContext as any).deposits = new PouchDB('mem-deposits', { adapter: 'memory' })
        ; (dbContext as any).supplies = new PouchDB('mem-supplies', { adapter: 'memory' })
        ; (dbContext as any).socialEntities = new PouchDB('mem-socialEntities', { adapter: 'memory' })
        ; (dbContext as any).campaigns = new PouchDB('mem-campaigns', { adapter: 'memory' })
        ; (dbContext as any).crops = new PouchDB('mem-crops', { adapter: 'memory' })
        ; (dbContext as any).cropDeposits = new PouchDB('mem-cropDeposits', { adapter: 'memory' })
        ; (dbContext as any).cropStockControl = new PouchDB('mem-cropStockControl', { adapter: 'memory' })
        ; (dbContext as any).cropMovements = new PouchDB('mem-cropMovements', { adapter: 'memory' })
        ; (dbContext as any).fields = new PouchDB('mem-fields', { adapter: 'memory' })
        ; (dbContext as any).movementsType = new PouchDB('mem-movementsType', { adapter: 'memory' })
}

const makeStore = () =>
    configureStore({
        reducer: {
            auth: () => ({ user: { id: 'u1', accountId: 'acc-1', licenceId: 'lic-1', currency: 'ARS' } }),
            campaign: () => ({ selectedCampaign: { _id: 'camp-1-doc', campaignId: 'camp-1', zafra: '2024/2025' } }),
            order: () => ({ withdrawalOrderActive: null }),
        },
    })

async function seedDatabases() {
    // create indexes used by find
    await dbContext.stock.createIndex({ index: { fields: ['accountId'] } } as any)
    await dbContext.deposits.createIndex({ index: { fields: ['accountId'] } } as any)
    await dbContext.supplies.createIndex({ index: { fields: ['accountId'] } } as any)
    await dbContext.withdrawalOrders.createIndex({ index: { fields: ['accountId'] } } as any)
    await dbContext.depositSupplyOrder.createIndex({ index: { fields: ['accountId'] } } as any)
    await dbContext.campaigns.createIndex({ index: { fields: ['accountId'] } } as any)
    await dbContext.socialEntities.createIndex({ index: { fields: ['accountId'] } } as any)
    await dbContext.crops.createIndex({ index: { fields: ['_id'] } } as any)
    await dbContext.cropDeposits.createIndex({ index: { fields: ['accountId', 'cropId', 'depositId', 'campaignId', 'zafra'] } } as any)
    await dbContext.cropStockControl.createIndex({ index: { fields: ['accountId', 'cropId', 'campaignId', 'zafra'] } } as any)

    // seed base docs
    await dbContext.deposits.post({ _id: 'dep-1', accountId: 'acc-1', description: 'Dep 1' } as any)
    await dbContext.supplies.post({ _id: 'sup-1', accountId: 'acc-1', name: 'Semilla Soja', unitMeasurement: 'kg', currentStock: 0, reservedStock: 0, stockByLot: false, type: 'Semillas' } as any)
    await dbContext.stock.post({ accountId: 'acc-1', id: 'sup-1', depositId: 'dep-1', location: '', nroLot: 'L1', currentStock: 100, reservedStock: 0, campaignId: 'camp-1' } as any)
    await dbContext.socialEntities.post({ _id: 'contr-1', accountId: 'acc-1', nombreCompleto: 'Contractor Uno' } as any)
    await dbContext.campaigns.post({ _id: 'camp-1-doc', accountId: 'acc-1', campaignId: 'camp-1', name: 'Campaña 1', zafra: '2024/2025' } as any)
    await dbContext.crops.post({ _id: 'crop-1', accountId: 'acc-1', descriptionES: 'Soja' } as any)
}

// Skip en CI, ejecutar solo si RUN_HEAVY_TESTS=1
const runHeavy = process.env.RUN_HEAVY_TESTS === '1'
const itHeavy = runHeavy ? it : it.skip

describe('PlanActivity - full sowing flow with stock checks', () => {
    beforeAll(async () => {
        vi.clearAllMocks()
        initInMemoryDbs()
        await seedDatabases()
    })

    afterAll(async () => {
        // Cleanup to avoid memory pressure in subsequent runs
        const dbsToReset = Object.values(dbContext) as PouchDB.Database<any>[]
        for (const db of dbsToReset) {
            try { await db.destroy() } catch { }
        }
    })

    itHeavy('plans sowing and reserves supply stock automatically', async () => {
        const store = makeStore()

        // Activity DB for plan documents
        const activityDb = new PouchDB('mem-activities', { adapter: 'memory' })

        // Configure planRef dosis for sowing with supply and deposit
        const supplyDoc = await dbContext.supplies.get('sup-1')
        const depositDoc = await dbContext.deposits.get('dep-1')
        planRef.formData = {
            detalles: {
                fecha_ejecucion_tentativa: '2025-01-02',
                cultivo: { _id: 'crop-1', descriptionES: 'Soja' },
                contratista: { _id: 'contr-1', nombreCompleto: 'Contractor Uno' },
                hectareas: 10,
                dosis: [{ insumo: supplyDoc, deposito: depositDoc, ubicacion: '', nro_lote: 'L1', total: 10 }],
                servicios: [{ id: 'srv-1' }],
                // Required fields for sowing otherData validation
                densidad_objetivo: 350000,
                peso_1000: 180,
                profundidad: 5,
                tipo_siembra: 'directa',
                distancia: 52,
            },
            condiciones: planRef.formData.condiciones,
        }

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <PlanActivity
                        activityType="sowing"
                        fieldName="Field A"
                        lot={{ id: 'lot1', properties: { nombre: 'Lote 1' } }}
                        db={activityDb}
                        existingActivity={{}}
                        backToActivites={vi.fn()}
                        lotActivities={[]}
                    />
                </MemoryRouter>
            </Provider>
        )

        // Save plan (this will reserve stock via withdrawal order)
        const saveButton = await screen.findByRole('button', { name: /save/i })
        console.log('🔘 Found save button, clicking...')
        fireEvent.click(saveButton)

        // Wait for the activity to be saved
        await waitFor(async () => {
            const actDocs = await activityDb.allDocs({ include_docs: true })
            console.log('📄 Activity docs after save:', actDocs.rows.length)
            expect(actDocs.rows.length).toBeGreaterThan(0)
        }, { timeout: 5000 })

        // Verify reserved stock increased by 10
        await waitFor(async () => {
            const resultStock = await dbContext.stock.find({ selector: { accountId: 'acc-1' } } as any)
            console.log('📊 Stock after save:', resultStock.docs)
            const s = resultStock.docs.find((d: any) => d.id === 'sup-1' && d.depositId === 'dep-1')
            console.log('📦 Found stock doc:', s)
            expect(s?.reservedStock).toBe(10)
            expect(s?.currentStock).toBe(100)
        }, { timeout: 5000 })

        // Read created activity to get order number
        const actDocs = await activityDb.allDocs({ include_docs: true })
        const actividadDoc = actDocs.rows[0].doc as any
        const orderNumber = actividadDoc?.detalles?.dosis?.[0]?.orden_de_retiro?.order
        expect(orderNumber).toBeTruthy()

        // Execute (confirm) automatic withdrawal to consume reserved/current
        const { result: orderHook } = renderHook(() => useOrder(), { wrapper: ({ children }) => <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider> })
        const orderDetail = await orderHook.current.getOrderDetailByNumber(orderNumber)
        expect(orderDetail?.suppliesOfTheOrder?.length).toBe(1)
        const success = await orderHook.current.confirmAutomaticWithdrawalOrder(orderDetail!.withdrawalOrder!, orderDetail!.suppliesOfTheOrder!, new Date().toISOString())
        expect(success).toBe(true)

        // Verify reserved and current decreased accordingly
        await waitFor(async () => {
            const resultStock2 = await dbContext.stock.find({ selector: { accountId: 'acc-1' } } as any)
            const s2 = resultStock2.docs.find((d: any) => d.id === 'sup-1' && d.depositId === 'dep-1')
            expect(s2?.reservedStock).toBe(0)
            expect(s2?.currentStock).toBe(90)
        })
    })

    // TODO: Re-enable these tests after fixing the component lifecycle issue
    // The test needs to handle component unmounting after successful save
    /*
    itHeavy('plans second sowing referencing previous activity', async () => {
        // Plan second sowing referencing previous activity (by adding a note)
        planRef.formData = {
            detalles: {
                fecha_ejecucion_tentativa: '2025-01-03',
                cultivo: { _id: 'crop-1', descriptionES: 'Soja' },
                contratista: { _id: 'contr-1', nombreCompleto: 'Contractor Uno' },
                hectareas: 5,
                referenciaActividadAnterior: actividadDoc._id,
                dosis: [{ insumo: supplyDoc, deposito: depositDoc, ubicacion: '', nro_lote: 'L1', total: 5 }],
                servicios: [{ id: 'srv-1' }],
                // Required fields for sowing otherData validation
                densidad_objetivo: 350000,
                peso_1000: 180,
                profundidad: 5,
                tipo_siembra: 'directa',
                distancia: 52,
            },
            condiciones: planRef.formData.condiciones,
        }

        fireEvent.click(await screen.findByRole('button', { name: /save/i }))

        // Verify reserved now 5 (after second plan)
        await waitFor(async () => {
            const resultStock3 = await dbContext.stock.find({ selector: { accountId: 'acc-1' } } as any)
            const s3 = resultStock3.docs.find((d: any) => d.id === 'sup-1' && d.depositId === 'dep-1')
            expect(s3?.reservedStock).toBe(5)
            expect(s3?.currentStock).toBe(90)
        })

        // Execute harvest: add 1000 kg to crop stock
        const { result: smHook } = renderHook(() => useStockMovement(), { wrapper: ({ children }) => <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider> })
        const harvestMovement = {
            accountId: 'acc-1',
            userId: 'u1',
            amount: 1000,
            creationDate: new Date().toISOString(),
            campaignId: 'camp-1',
            depositId: 'dep-1',
            isIncome: true,
            typeMovement: 'Labores',
            operationDate: new Date().toISOString(),
            isCrop: true,
            cropId: 'crop-1',
            detail: 'Cosecha Soja',
        } as any
        await smHook.current.updateCropStockTables(harvestMovement, { _id: 'crop-1' } as any, { _id: 'dep-1' } as any, { zafra: '2024/2025' })

        await waitFor(async () => {
            const cdc = await dbContext.cropDeposits.find({ selector: { accountId: 'acc-1', cropId: 'crop-1', depositId: 'dep-1', campaignId: 'camp-1', zafra: '2024/2025' } } as any)
            expect(cdc.docs[0]?.currentStockKg).toBe(1000)
            const csc = await dbContext.cropStockControl.find({ selector: { accountId: 'acc-1', cropId: 'crop-1', campaignId: 'camp-1', zafra: '2024/2025' } } as any)
            expect(csc.docs[0]?.currentStock).toBe(1000)
        })
    })
    */
})


