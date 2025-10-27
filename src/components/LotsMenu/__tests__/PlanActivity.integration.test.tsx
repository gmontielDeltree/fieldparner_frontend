import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import PlanActivity from '../PlanActivity'

// Mock translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (k: string, _opts?: any) => k,
        i18n: { changeLanguage: () => new Promise(() => { }) },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock useOrder
vi.mock('../../../hooks', async () => {
    const actual = await vi.importActual('../../../hooks')
    return {
        ...actual as any,
        useOrder: () => ({ createWithdrawalOrder: vi.fn() }),
    }
})

// Mock usePlanActivity to control form state and navigation via a shared ref
const handleNextSpy = vi.fn()
const planStateRef: any = {
    formData: {
        detalles: {
            fecha_ejecucion_tentativa: '2025-01-01',
            cultivo: { _id: 'crop1' },
            contratista: { nombreCompleto: 'Juan Perez' },
            hectareas: 10,
            dosis: [{ id: 'sup-1' }],
            servicios: [{ id: 'srv-1' }],
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
    activeStep: 4,
    setActiveStep: vi.fn(),
    maxStepReached: 4,
    setMaxStepReached: vi.fn(),
    handleCloseSnackbar: vi.fn(),
    handleNext: handleNextSpy,
    handleBack: vi.fn(),
    handleStep: vi.fn(),
}
vi.mock('../components/usePlanActivity', () => ({
    usePlanActivity: () => planStateRef,
}))

// Mock saveActivity to resolve and invoke success callback
const saveActivityMock = vi.fn((_actividad, _isEditing, _db, _user, _campaign, _createWithdrawalOrder, onSuccess) => {
    onSuccess && onSuccess()
    return Promise.resolve(true)
})
vi.mock('../components/activityService', () => ({
    saveActivity: (...args: any[]) => saveActivityMock(...args),
}))

const makeStore = () => configureStore({
    reducer: {
        auth: () => ({ user: { id: 'u1', accountId: 'acc-1', licenceId: 'lic-1', currency: 'ARS' } }),
        campaign: () => ({ selectedCampaign: { _id: 'camp-1' } }),
        ui: () => ({ showModal: '', isLoading: false, openSideBar: false }),
    },
})

const baseProps = {
    activityType: 'application',
    fieldName: 'Field A',
    lot: { id: 'lot1', properties: { nombre: 'Lote 1' } },
    db: {
        info: vi.fn().mockResolvedValue({}),
    },
    backToActivites: vi.fn(),
    lotActivities: [],
    existingActivity: {},
}

describe('PlanActivity - integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('saves an activity when fields are valid and Save is clicked', async () => {
        const store = makeStore()
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <PlanActivity {...baseProps} />
                </MemoryRouter>
            </Provider>
        )

        const saveButton = await screen.findByRole('button', { name: /save/i })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(saveActivityMock).toHaveBeenCalled()
            expect(baseProps.backToActivites).toHaveBeenCalled()
        })
    })

    it('does not advance when current step has missing required fields', async () => {
        // Configure shared ref to have missing fields and at first step
        planStateRef.formData = { detalles: {} }
        planStateRef.activeStep = 0
        planStateRef.maxStepReached = 0
        const store = makeStore()
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <PlanActivity {...baseProps} />
                </MemoryRouter>
            </Provider>
        )

        const nextButton = await screen.findByRole('button', { name: /next/i })
        fireEvent.click(nextButton)

        await waitFor(() => {
            expect(handleNextSpy).not.toHaveBeenCalled()
        })
    })
})


