import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import uuid4 from 'uuid4'
import EditIcon from '@mui/icons-material/Edit'
import PlaceMarker from '../NewGeometry/PlaceMarker'
import { useAppSelector } from '../../hooks'
import { getEmptyNote } from '../../interfaces/activity'
import TourForm from './forms/NotesForms/TourForm'
import ActivityHeader from './components/ActivityHeader'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Container,
  Row,
  Col,
  Progress,
} from 'reactstrap'
import {
  MapIcon,
  MapPin,
  Clipboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import AgricultureIcon from '@mui/icons-material/Assignment'

interface TourProps {
  lot: any
  fieldName: string
  db: any
  backToActivites: () => void
  existingNote?: any
}

const Tour: React.FC<TourProps> = ({
  lot,
  db,
  fieldName,
  backToActivites,
  existingNote,
}) => {
  if (!lot) return null

  const { t } = useTranslation()
  const theme = useTheme()
  const [formData, setFormData] = useState(existingNote || getEmptyNote())
  const isEditing = existingNote && Object.keys(existingNote).length > 0
  const { selectedCampaign } = useAppSelector((state) => state.campaign)
  const removeMarkerFunctionsRef = useRef<(() => void)[]>([])
  const [activeStep, setActiveStep] = useState(0)
  const [maxStepReached, setMaxStepReached] = useState(0)

  useEffect(() => {
    if (existingNote) {
      setFormData(existingNote)
    } else {
      setFormData(getEmptyNote())
    }
  }, [existingNote])

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      lote_uuid: lot.id,
      tipo: 'nota',
    }))
  }, [lot])

  // Cleanup all markers on unmount
  useEffect(() => {
    return () => {
      handleRemoveMarkers()
    }
  }, [])

  const handleRemoveMarkers = () => {
    removeMarkerFunctionsRef.current.forEach((removeFunc) => {
      try {
        removeFunc()
      } catch (error) {
        console.error(t('errorRemovingMarker'), error)
      }
    })
    removeMarkerFunctionsRef.current = []
  }

  const handleSetCoordinates = (
    index: number,
    newPosition: [number, number],
  ) => {
    const newFormData = { ...formData }
    newFormData.features[index].properties.posicion = newPosition
    setFormData(newFormData)
  }

  const handleSave = () => {
    let actividad = formData
    let formattedDate = new Date()
    try {
      actividad.campaña = selectedCampaign
      actividad._id =
        actividad._id || 'actividad:' + formattedDate + ':' + uuid4()

      db.get(actividad._id)
        .then((doc) => {
          actividad._rev = doc._rev
          return db.put(actividad)
        })
        .then(() => {
          console.log(t('activityUpdated'), 'success')
          handleRemoveMarkers()
          backToActivites()
        })
        .catch((error) => {
          if (error.name === 'not_found') {
            console.log(t('activityNotFound'))
            delete actividad._rev
            db.put(actividad)
              .then(() => {
                console.log(t('newActivityCreated'), 'success')
                handleRemoveMarkers()
                backToActivites()
              })
              .catch((err) =>
                console.error(t('errorCreatingActivity'), err),
              )
          } else {
            console.error(t('errorSavingActivity'), error)
          }
        })
    } catch (error) {
      console.error(t('errorInHandleSave'), error)
    }
  }

  const getTourColor = () => {
    return '#22c55e' // verde para recorrido
  }

  // Define steps for the tour
  const steps = [
    { label: t('generalInformation'), key: 'general' },
    { label: t('pointsAndObservations'), key: 'points' },
    { label: t('reviewAndSave'), key: 'review' },
  ]

  const handleNext = () => {
    const nextStep = activeStep + 1
    setActiveStep(nextStep)
    if (nextStep > maxStepReached) {
      setMaxStepReached(nextStep)
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const handleStepClick = (step: number) => {
    if (step <= maxStepReached) {
      setActiveStep(step)
    }
  }

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        // General information step
        return (
          <div>
            <h5 className="mb-3">{t('generalInformation')}</h5>
            <TourForm
              lot={lot}
              formData={formData}
              setFormData={setFormData}
              tourSave={handleRemoveMarkers}
            />
          </div>
        )
      case 1:
        // Points and observations step
        return (
          <div>
            <h5 className="mb-3">{t('pointsAndObservations')}</h5>
            {existingNote &&
              formData.features.map((feature, index) => (
                <PlaceMarker
                  key={index}
                  selectedLot={{
                    geometry: {
                      type: 'Point',
                      coordinates: feature.properties.posicion,
                    },
                  }}
                  setCoordinates={(newPosition) =>
                    handleSetCoordinates(index, newPosition)
                  }
                  isDraggable={true}
                  onRemoveMarkers={(removeFunc) => {
                    removeMarkerFunctionsRef.current.push(removeFunc)
                  }}
                />
              ))}
          </div>
        )
      case 2:
        // Review and save step
        return (
          <div>
            <h5 className="mb-3">{t('reviewAndSave')}</h5>
            <div className="p-3 bg-light rounded">
              <p><strong>{t('nameLabel')}:</strong> {formData.nombre || '-'}</p>
              <p><strong>{t('dateLabel')}:</strong> {formData.fecha ? new Date(formData.fecha).toLocaleDateString() : '-'}</p>
              <p><strong>{t('pointsCount')}:</strong> {formData.features?.length || 0}</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Define the activity icons for ActivityHeader
  const activityIcons = {
    tour: <AgricultureIcon sx={{ fontSize: 50, color: 'white' }} />
  }

  // Function to get activity color for ActivityHeader
  const getActivityColor = () => {
    return getTourColor()
  }

  return (
    <Container className="py-6">
      <Card className="shadow-lg">
        {/* Replace the old CardHeader with ActivityHeader */}
        <CardHeader
          className="p-0" // Remove padding as ActivityHeader has its own padding
          style={{
            borderTopLeftRadius: '0.5rem',
            borderTopRightRadius: '0.5rem',
          }}
        >
          <ActivityHeader
            activityType="tour"
            fieldName={fieldName}
            lot={lot}
            formData={formData}
            activityIcons={activityIcons}
            isEditing={isEditing}
            getActivityColor={getActivityColor}
          />
        </CardHeader>

        {/* Progress Bar */}
        <div className="px-4 pt-3">
          <Progress 
            value={(activeStep / (steps.length - 1)) * 100} 
            className="mb-3"
            style={{ height: '8px' }}
          />
          <div className="d-flex justify-content-between mb-3">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="text-center"
                style={{ cursor: index <= maxStepReached ? 'pointer' : 'not-allowed' }}
                onClick={() => handleStepClick(index)}
              >
                <div 
                  className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                    index === activeStep ? 'bg-primary text-white' : 
                    index < activeStep ? 'bg-success text-white' : 
                    index <= maxStepReached ? 'bg-secondary text-white' : 'bg-light text-muted'
                  }`}
                  style={{ width: '30px', height: '30px', fontSize: '14px' }}
                >
                  {index + 1}
                </div>
                <div className="small mt-1">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <CardBody className="p-4">
          {getStepContent()}
        </CardBody>

        {/* Actions */}
        <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
          <Button
            color="light"
            onClick={activeStep === 0 ? backToActivites : handleBack}
            className="d-flex align-items-center gap-2"
          >
            <ChevronLeft size={16} />
            {activeStep === 0 ? t('backButton') : t('previousStep')}
          </Button>

          <div className="d-flex gap-2">
            {activeStep < steps.length - 1 && (
              <Button
                color="primary"
                onClick={handleNext}
                className="d-flex align-items-center gap-2"
              >
                {t('nextStep')}
                <ChevronRight size={16} />
              </Button>
            )}
            
            {activeStep === steps.length - 1 && (
              <Button
                color="success"
                onClick={handleSave}
                className="d-flex align-items-center gap-2"
              >
                <Clipboard size={16} />
                {isEditing ? t('updateButton') : t('saveButton')} {t('tourLabel')}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

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
    </Container>
  )
}

export default Tour