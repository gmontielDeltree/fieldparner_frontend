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
} from 'reactstrap'
import {
  MapIcon,
  MapPin,
  Clipboard,
  ChevronLeft,
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

        {/* Content */}
        <CardBody className="p-4">
          <TourForm
            lot={lot}
            formData={formData}
            setFormData={setFormData}
            tourSave={handleRemoveMarkers}
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
          <Button
            color="light"
            onClick={backToActivites}
            className="d-flex align-items-center gap-2"
          >
            <ChevronLeft size={16} />
            {t('backButton')}
          </Button>

          <Button
            color="success"
            onClick={handleSave}
            className="d-flex align-items-center gap-2"
          >
            <Clipboard size={16} />
            {isEditing ? t('updateButton') : t('saveButton')} {t('tourLabel')}
          </Button>
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