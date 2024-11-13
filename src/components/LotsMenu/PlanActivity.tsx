import React from 'react'
import { Snackbar } from '@mui/material'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import GrassIcon from '@mui/icons-material/Grass'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { useAppSelector, useOrder } from '../../hooks'
import { useTranslation } from 'react-i18next'

// Importamos los nuevos componentes y hooks
import ConfirmDialog from './components/ConfirmDialog'
import PlanActivityStepper from './components/PlanActivityStepper'
import ActionButtons from './components/ActionButtons'
import PlanActivityContent from './components/PlanActivityContent'
import ActivityHeader from './components/ActivityHeader'
import { saveActivity } from './components/activityService'
import { usePlanActivity } from './components/usePlanActivity'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

const activityTypeTranslations = {
  preparation: 'Preparado',
  sowing: 'Siembra',
  harvesting: 'Cosecha',
  application: 'Aplicacion',
}

const activityIcons = {
  sowing: <LocalFloristIcon sx={{ fontSize: 50, color: 'green' }} />,
  application: <GrassIcon sx={{ fontSize: 50, color: 'green' }} />,
  harvesting: <AgricultureIcon sx={{ fontSize: 50, color: 'green' }} />,
}

interface PlanActivityProps {
  activityType: string
  fieldName: string
  lot: any
  db: any
  field: any
  backToActivites: () => void
  existingActivity: any
}

const PlanActivity: React.FC<PlanActivityProps> = ({
  activityType,
  lot,
  db,
  backToActivites,
  fieldName,
  existingActivity,
}) => {
  if (!lot) return null

  const { user } = useAppSelector((state) => state.auth)
  const translatedActivityType = activityTypeTranslations[activityType]
  const { createWithdrawalOrder } = useOrder()
  const isEditing = existingActivity && Object.keys(existingActivity).length > 0
  const selectedCampaign = useAppSelector(
    (state) => state.campaign.selectedCampaign,
  )
  const { t } = useTranslation()

  // Usamos el hook personalizado
  const {
    formData,
    setFormData,
    missingItem,
    setMissingItem,
    openConfirmDialog,
    setOpenConfirmDialog,
    openSnackbar,
    setOpenSnackbar,
    snackbarMessage,
    setSnackbarMessage,
    activeStep,
    setActiveStep,
    maxStepReached,
    setMaxStepReached,
    handleCloseSnackbar,
    handleNext,
    handleBack,
    handleStep,
  } = usePlanActivity(
    activityType,
    lot,
    translatedActivityType,
    existingActivity,
    user,
    db,
    backToActivites,
    createWithdrawalOrder,
    selectedCampaign,
  )

  const steps =
    activityType === 'sowing'
      ? [
          'General',
          'Insumos',
          'Otros Datos',
          'Servicios',
          'Condiciones',
          'Observaciones',
        ]
      : ['General', 'Insumos', 'Servicios', 'Condiciones', 'Observaciones']

  const countMissingFields = (formData, step) => {
    let missingFields = 0

    if (activityType !== 'sowing' && step > 1) {
      step = step + 1
    }

    switch (step) {
      case 0: // PersonalForm
        if (!formData.detalles.fecha_ejecucion_tentativa) {
          missingFields++
        }
        if (!formData.detalles.cultivo) {
          missingFields++
        }
        if (!formData.contratista) {
          missingFields++
        }
        if (!formData.detalles || !formData.detalles.hectareas) {
          missingFields++
        }
        break
      case 1: // SuppliesForm (Insumos)
        if (
          !formData.detalles ||
          !formData.detalles.dosis ||
          formData.detalles.dosis.length === 0
        ) {
          missingFields++
        }
        break
      case 2: // OtherDetailsForm
        const details = formData.detalles || {}
        if (!details.densidad_objetivo) {
          missingFields++
        }
        if (!details.peso_1000) {
          missingFields++
        }
        if (!details.profundidad) {
          missingFields++
        }
        if (!details.tipo_siembra) {
          missingFields++
        }
        if (!details.distancia) {
          missingFields++
        }
        break
      case 3: // ServicesForm (Labores)
        if (!formData.detalles || !formData.detalles.servicios) {
          missingFields++
        }
        break
      case 4: // ConditionsForm
        const condiciones = formData.condiciones || {}
        if (condiciones.humedad_max === undefined) {
          missingFields++
        }
        if (condiciones.humedad_min === undefined) {
          missingFields++
        }
        if (condiciones.temperatura_max === undefined) {
          missingFields++
        }
        if (condiciones.temperatura_min === undefined) {
          missingFields++
        }
        if (condiciones.velocidad_max === undefined) {
          missingFields++
        }
        if (condiciones.velocidad_min === undefined) {
          missingFields++
        }
        break
      default:
        break
    }

    return missingFields
  }

  const handleSave = async () => {
    for (let step = 0; step < steps.length; step++) {
      const missingFields = countMissingFields(formData, step)
      if (missingFields > 0) {
        setSnackbarMessage(
          `Por favor completa todos los campos requeridos en el paso: ${steps[step]}`,
        )
        setOpenSnackbar(true)
        setActiveStep(step)
        return
      }
    }

    let actividad = { ...formData }

    await saveActivity(
      actividad,
      isEditing,
      db,
      user,
      selectedCampaign,
      createWithdrawalOrder,
      backToActivites,
    )
  }

  const ActivityIcon = activityIcons[activityType]

  const titleBg = isEditing
    ? `linear-gradient(60deg, #42a5f5, #ab47bc)`
    : `linear-gradient(45deg, #a0a0a0, #626262)`

  return (
    <div>
      {/* Utilizamos el componente ActivityHeader */}
      <ActivityHeader
        isEditing={isEditing}
        translatedActivityType={translatedActivityType}
        ActivityIcon={ActivityIcon}
        titleBg={titleBg}
      />

      {/* Utilizamos el componente PlanActivityStepper */}
      <PlanActivityStepper
        steps={steps}
        activeStep={activeStep}
        handleStep={handleStep}
        countMissingFields={countMissingFields}
        maxStepReached={maxStepReached}
        formData={formData}
      />

      {/* Utilizamos el componente ConfirmDialog */}
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={() => {
          setOpenConfirmDialog(false)
          setActiveStep((prevActiveStep) => {
            const nextStep = prevActiveStep + 1
            setMaxStepReached((prevMaxStep) => Math.max(prevMaxStep, nextStep))
            return nextStep
          })
        }}
        title="Atención"
        contentText={`No has agregado ningún ${missingItem}. ¿Estás seguro de que quieres avanzar sin agregar ninguno?`}
      />

      {/* Utilizamos el componente PlanActivityContent */}
      <div style={{ marginTop: '10px' }}>
        <PlanActivityContent
          step={activeStep}
          activityType={activityType}
          lot={lot}
          db={db}
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Utilizamos el componente ActionButtons */}
      <ActionButtons
        activeStep={activeStep}
        stepsLength={steps.length}
        handleBack={handleBack}
        handleNext={() => handleNext(steps)}
        handleSave={handleSave}
        isEditing={isEditing}
        backToActivites={backToActivites}
      />
    </div>
  )
}

export default PlanActivity
