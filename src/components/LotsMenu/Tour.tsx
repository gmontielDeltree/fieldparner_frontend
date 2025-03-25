import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import uuid4 from 'uuid4'
import EditIcon from '@mui/icons-material/Edit'
import PlaceMarker from '../NewGeometry/PlaceMarker'
import { useAppSelector } from '../../hooks'
import { getEmptyNote } from '../../interfaces/activity'
import TourForm from './forms/NotesForms/TourForm'
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
        console.error('Error removing marker:', error)
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
          console.log('Actividad updated', 'success')
          handleRemoveMarkers()
          backToActivites()
        })
        .catch((error) => {
          if (error.name === 'not_found') {
            console.log('Actividad not found. Creating a new one.')
            delete actividad._rev
            db.put(actividad)
              .then(() => {
                console.log('New actividad created', 'success')
                handleRemoveMarkers()
                backToActivites()
              })
              .catch((err) =>
                console.error('Error creating new actividad:', err),
              )
          } else {
            console.error('Error saving actividad:', error)
          }
        })
    } catch (error) {
      console.error('Error in handleSave:', error)
    }
  }

  const getTourColor = () => {
    return '#22c55e' // verde para recorrido
  }

  return (
    <Container className="py-6">
      <Card className="shadow-lg">
        {/* Header */}
        <CardHeader
          style={{
            background: getTourColor(),
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
                {isEditing ? 'Editar Recorrido' : 'Recorrido'}
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
                <AgricultureIcon sx={{ fontSize: 50, color: 'white' }} />
              </div>
            </Col>
          </Row>
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
            Volver
          </Button>

          <Button
            color="success"
            onClick={handleSave}
            className="d-flex align-items-center gap-2"
          >
            <Clipboard size={16} />
            {isEditing ? 'Actualizar' : 'Guardar'} Recorrido
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