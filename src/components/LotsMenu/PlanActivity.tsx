import React, { useState } from 'react'
import { Snackbar } from '@mui/material'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import GrassIcon from '@mui/icons-material/Grass'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import { useAppSelector, useOrder } from '../../hooks'
import { useTranslation } from 'react-i18next'
import LandscapeIcon from '@mui/icons-material/Landscape';
import ConfirmDialog from './components/ConfirmDialog'
import PlanActivityStepper from './components/PlanActivityStepper'
import ActionButtons from './components/ActionButtons'
import PlanActivityContent from './components/PlanActivityContent'
import ActivityHeader from './components/ActivityHeader'
import ValidationAlert from './ValidationAlert'
import { saveActivity } from './components/activityService'
import { usePlanActivity } from './components/usePlanActivity'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Progress,
  Alert,
  Container,
  Row,
  Col,
} from 'reactstrap'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  MapIcon,
  MapPin,
  Sprout,
} from 'lucide-react'

const activityTypeTranslations = {
  preparation: 'Preparado',
  sowing: 'Siembra',
  harvesting: 'Cosecha',
  application: 'Aplicacion',
}

// Replace the current activityIcons object with this enhanced version
const activityIcons = {
  sowing: <LocalFloristIcon sx={{ fontSize: 50, color: "white" }} />,
  application: <GrassIcon sx={{ fontSize: 50, color: "white" }} />,
  harvesting: <AgricultureIcon sx={{ fontSize: 50, color: "white" }} />,
  preparation: <LandscapeIcon sx={{ fontSize: 50, color: "white" }} />
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
  const [showValidationNotification, setShowValidationNotification] = useState(
    false,
  )
  const [missingFieldsList, setMissingFieldsList] = useState([])
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

  const getMissingFieldsMessages = (step) => {
    const fields = []
    const formDetails = formData.detalles || {}

    // Get the current step name instead of relying on index
    const currentStepName = steps[step]

    // Validate based on step name rather than index
    switch (currentStepName) {
      case 'General':
        if (!formDetails.fecha_ejecucion_tentativa) fields.push('Fecha de ejecución')
        if (!formDetails.cultivo) fields.push('Cultivo')
        if (!formData.contratista) fields.push('Contratista')
        if (!formDetails.hectareas) fields.push('Hectáreas')
        break

      case 'Insumos':
        if (!formDetails.dosis || formDetails.dosis.length === 0) {
          fields.push('Al menos un insumo con su dosis')
        }
        break

      case 'Otros Datos':
        // Only relevant for sowing activities
        if (activityType === 'sowing') {
          if (!formDetails.densidad_objetivo) fields.push('Densidad objetivo')
          if (!formDetails.peso_1000) fields.push('Peso de 1000 semillas')
          if (!formDetails.profundidad) fields.push('Profundidad de siembra')
          if (!formDetails.tipo_siembra) fields.push('Tipo de siembra')
          if (!formDetails.distancia) fields.push('Distancia entre surcos')
        }
        break

      case 'Servicios':
        // Add any Service-specific validations here
        // For example:
        if (!formDetails.servicios || formDetails.servicios.length === 0) {
          fields.push('Al menos un servicio agregado')
        }
        break

      case 'Condiciones':
        const condiciones = formData.condiciones || {}
        if (condiciones.humedad_max === undefined) fields.push('Humedad máxima')
        if (condiciones.humedad_min === undefined) fields.push('Humedad mínima')
        if (condiciones.temperatura_max === undefined) fields.push('Temperatura máxima')
        if (condiciones.temperatura_min === undefined) fields.push('Temperatura mínima')
        if (condiciones.velocidad_max === undefined) fields.push('Velocidad máxima')
        if (condiciones.velocidad_min === undefined) fields.push('Velocidad mínima')
        break
    }

    return fields
  }

  // Also replace the countMissingFields function with this:
  const countMissingFields = (formData, step) => {
    let missingFields = 0
    const currentStepName = steps[step]

    switch (currentStepName) {
      case 'General': // PersonalForm
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

      case 'Insumos': // SuppliesForm
        if (
          !formData.detalles ||
          !formData.detalles.dosis ||
          formData.detalles.dosis.length === 0
        ) {
          missingFields++
        }
        break

      case 'Otros Datos': // OtherDetailsForm (only for sowing)
        if (activityType === 'sowing') {
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
        }
        break

      case 'Servicios': // ServicesForm
        if (!formData.detalles || !formData.detalles.servicios || formData.detalles.servicios.length === 0) {
          missingFields++
        }
        break

      case 'Condiciones': // ConditionsForm
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

      case 'Observaciones':
        // No required fields in Observaciones typically
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

  const getStepValidationStatus = (stepIndex) => {
    const missingFields = countMissingFields(formData, stepIndex)
    return {
      isValid: missingFields === 0,
      missingCount: missingFields,
    }
  }

  const getStepStatus = (stepIndex) => {
    if (stepIndex === activeStep) return 'current'
    if (stepIndex < activeStep) {
      const { isValid } = getStepValidationStatus(stepIndex)
      return isValid ? 'complete' : 'invalid'
    }
    if (stepIndex <= maxStepReached) return 'available'
    return 'upcoming'
  }

  const getActivityColor = () => {
    switch (activityType) {
      case 'sowing':
        return '#10b981'
      case 'application':
        return '#3b82f6'
      case 'harvesting':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const getProgressColor = () => {
    switch (activityType) {
      case 'sowing':
        return 'success'
      case 'application':
        return 'info'
      case 'harvesting':
        return 'warning'
      default:
        return 'secondary'
    }
  }
  const handleStepClick = (index) => {
    if (index <= maxStepReached) {
      const currentStepValidation = getStepValidationStatus(activeStep)

      if (!currentStepValidation.isValid) {
        const missingFields = getMissingFieldsMessages(activeStep)
        setMissingFieldsList(missingFields)
        setShowValidationNotification(true)
        return
      }

      handleStep(index)
    }
  }

  const getStepStyle = (status) => {
    switch (status) {
      case 'complete':
        return {
          background: getActivityColor(),
          color: 'white',
          border: 'none',
        }
      case 'current':
        return {
          background: 'white',
          color: getActivityColor(),
          border: `2px solid ${getActivityColor()}`,
        }
      case 'invalid':
        return {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        }
      case 'upcoming':
        return {
          background: '#f3f4f6',
          color: '#6b7280',
          border: 'none',
        }
      default:
        return {
          background: '#e5e7eb',
          color: '#6b7280',
          border: 'none',
        }
    }
  }

  return (
    <Container className="py-6">
      <Card className="shadow-lg">
        {/* Header - mantener igual */}
        <CardHeader
          style={{
            background: getActivityColor(),
            borderTopLeftRadius: '0.5rem',
            borderTopRightRadius: '0.5rem',
            padding: '2rem',
          }}
        >
          <Row className="align-items-center">
            <Col>
              <h1
                className="text-white mb-4"
                style={{ fontSize: '2rem', fontWeight: 'bold' }}
              >
                {activityTypeTranslations[activityType]}
              </h1>

              <div className="d-flex gap-4">
                <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                  <MapIcon className="text-white" size={20} />
                  <div>
                    <div
                      className="text-white-50 mb-0"
                      style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Campo
                    </div>
                    <div className="text-white fw-semibold">{fieldName}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                  <MapPin className="text-white" size={20} />
                  <div>
                    <div
                      className="text-white-50 mb-0"
                      style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Lote
                    </div>
                    <div className="text-white fw-semibold">
                      {lot.properties.nombre}
                    </div>
                  </div>
                </div>

                {formData.detalles?.cultivo?.descriptionES && (
                  <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                    <Sprout className="text-white" size={20} />
                    <div>
                      <div
                        className="text-white-50 mb-0"
                        style={{
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Cultivo
                      </div>
                      <div className="text-white fw-semibold">
                        {formData.detalles.cultivo.descriptionES}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Col>
            <Col xs="auto">
              <div
                className="rounded-circle p-3"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
                  backdropFilter: "blur(2px)"
                }}
              >
                {activityIcons[activityType]}
              </div>
            </Col>
          </Row>
        </CardHeader>
        {/* Stepper modificado */}
        <div className="px-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index)
              const { isValid, missingCount } = getStepValidationStatus(index)
              const tooltipText =
                !isValid && index < activeStep
                  ? `Faltan ${missingCount} campos requeridos en ${step}`
                  : ''

              return (
                <div
                  key={step}
                  className="text-center position-relative"
                  style={{ flex: 1 }}
                >
                  <div
                    onClick={() => handleStepClick(index)}
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      cursor: index <= maxStepReached ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      ...getStepStyle(status),
                    }}
                    title={tooltipText}
                  >
                    {status === 'complete' ? (
                      <Check size={20} />
                    ) : status === 'invalid' ? (
                      <AlertCircle size={20} />
                    ) : (
                      <span style={{ fontWeight: '600' }}>{index + 1}</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <small
                      className={
                        status === 'invalid' ? 'text-danger' : 'text-muted'
                      }
                      style={{
                        fontWeight: status === 'current' ? '600' : '400',
                      }}
                    >
                      {step}
                    </small>
                  </div>

                  {index < steps.length - 1 && (
                    <Progress
                      value={index < activeStep ? 100 : 0}
                      color={
                        status === 'invalid' ? 'danger' : getProgressColor()
                      }
                      style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        width: '100%',
                        height: '2px',
                        zIndex: -1,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <CardBody className="p-4">
          <PlanActivityContent
            step={activeStep}
            activityType={activityType}
            lot={lot}
            db={db}
            formData={formData}
            setFormData={setFormData}
          />
        </CardBody>

        {/* Actions */}
        <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
          <Button
            color="light"
            onClick={backToActivites}
            className="d-flex align-items-center gap-2"
          >
            <ChevronLeft size={16} />
            Volver
          </Button>

          <div className="d-flex gap-2">
            {activeStep > 0 && (
              <Button
                color="light"
                onClick={handleBack}
                className="d-flex align-items-center gap-2"
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button color={getProgressColor()} onClick={handleSave}>
                {isEditing ? 'Actualizar' : 'Guardar'} Actividad
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={() => {
                  const currentStepValidation = getStepValidationStatus(
                    activeStep,
                  )
                  if (!currentStepValidation.isValid) {
                    const missingFields = getMissingFieldsMessages(activeStep)
                    setMissingFieldsList(missingFields)
                    setShowValidationNotification(true)
                    return
                  }
                  handleNext(steps)
                }}
                className="d-flex align-items-center gap-2"
              >
                Siguiente
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Alert */}
      {openSnackbar && (
        <Alert
          color="warning"
          className="position-fixed bottom-0 end-0 m-4 d-flex align-items-center justify-content-between"
          style={{
            maxWidth: '400px',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'slideUp 0.3s ease-out',
            zIndex: 1050,
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <span>{snackbarMessage}</span>
          </div>
          <Button close onClick={handleCloseSnackbar} />
        </Alert>
      )}

      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}
      </style>

      {showValidationNotification && (
        <ValidationAlert
          isOpen={showValidationNotification}
          onClose={() => setShowValidationNotification(false)}
          currentStep={steps[activeStep]}
          requiredFields={missingFieldsList}
        />
      )}
    </Container>
  )
}

export default PlanActivity
