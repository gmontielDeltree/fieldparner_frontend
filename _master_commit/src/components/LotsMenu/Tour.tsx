import React, { useEffect, useRef, useState } from 'react'
import uuid4 from 'uuid4'
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
  Progress,
} from 'reactstrap'
import { Clipboard, ChevronLeft, ChevronRight, Check } from 'lucide-react'
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
  const [formData, setFormData] = useState(existingNote || getEmptyNote())
  const isEditing = existingNote && Object.keys(existingNote).length > 0
  const { selectedCampaign } = useAppSelector((state) => state.campaign)
  const removeMarkerFunctionsRef = useRef<(() => void)[]>([])
  const [activeStep, setActiveStep] = useState(0)
  const [maxStepReached, setMaxStepReached] = useState(0)

  // Define the steps for Tour
  const steps = [
    t('generalInfo'),
    t('inspectionPoints'),
    t('summary'),
  ]

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

  // Step navigation functions
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1
      setActiveStep(nextStep)
      setMaxStepReached(Math.max(maxStepReached, nextStep))
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleStepClick = (index: number) => {
    if (index <= maxStepReached) {
      setActiveStep(index)
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex === activeStep) return 'current'
    if (stepIndex < activeStep) return 'complete'
    if (stepIndex <= maxStepReached) return 'available'
    return 'upcoming'
  }

  const getStepStyle = (status: string) => {
    const tourColor = getTourColor()
    switch (status) {
      case 'complete':
        return {
          background: tourColor,
          color: 'white',
          border: 'none',
        }
      case 'current':
        return {
          background: 'white',
          color: tourColor,
          border: `2px solid ${tourColor}`,
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
        
        {/* Stepper */}
        {/* Stepper */}
        <div className="px-4 py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index)

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
                  >
                    {status === 'complete' ? (
                      <Check size={20} />
                    ) : (
                      <span style={{ fontWeight: '600' }}>{index + 1}</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <small
                      className="text-muted"
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
                      color="success"
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
          <TourForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
            tourSave={handleRemoveMarkers}
            activeStep={activeStep}
          />

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
        </CardBody>

        {/* Actions */}
        <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
          <div className="d-flex gap-2">
            <Button
              color="light"
              onClick={backToActivites}
              className="d-flex align-items-center gap-2"
            >
              <ChevronLeft size={16} />
              {t('cancel')}
            </Button>
            {activeStep > 0 && (
              <Button
                color="light"
                onClick={handleBack}
                className="d-flex align-items-center gap-2"
              >
                <ChevronLeft size={16} />
                {t('previous')}
              </Button>
            )}
          </div>

          <div className="d-flex gap-2">
            {activeStep < steps.length - 1 ? (
              <Button
                color="primary"
                onClick={handleNext}
                className="d-flex align-items-center gap-2"
              >
                {t('next')}
                <ChevronRight size={16} />
              </Button>
            ) : (
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