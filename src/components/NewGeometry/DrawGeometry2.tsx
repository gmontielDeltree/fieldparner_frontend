import React, { useState, useEffect, useCallback } from 'react'
import { Map as MapboxMap } from 'mapbox-gl'
import MapboxDraw, { constants } from '@mapbox/mapbox-gl-draw'
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'
import { Button, Input, Row, Col, Container } from 'reactstrap'
import { useSelector } from 'react-redux'
import { selectMap } from '../../redux/map/mapSlice'
import { CloseButtonBack } from '../Basic/CloseButtonBack'
import MapIcon from '@mui/icons-material/Map'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'

MapboxDraw.modes.direct_select.onTrash = function (state) {
  if (state.selectedCoordPaths.length === 0) {
    this.deleteFeature(state.featureId)
    this.changeMode(constants.modes.SIMPLE_SELECT, {})
  } else {
    state.selectedCoordPaths
      .sort((a, b) => b.localeCompare(a, 'en', { numeric: true }))
      .forEach((id) => state.feature.removeCoordinate(id))
    this.fireUpdate()
    state.selectedCoordPaths = []
    this.clearSelectedCoordinates()
    this.fireActionable(state)
    if (state.feature.isValid() === false) {
      this.deleteFeature([state.featureId])
      this.changeMode(constants.modes.SIMPLE_SELECT, {})
    }
  }
}

interface DrawGeometryProps {
  handleSaveGeometry?: (formattedData: FormattedData) => void
  type: 'field' | 'lot'
  initialGeometry?: FeatureCollection
  initialName?: string
  edit?: boolean
}

interface FormattedData {
  field_name: string
  geometry: FeatureCollection<Geometry, GeoJsonProperties>[]
}

const DrawGeometry2: React.FC<DrawGeometryProps> = ({
  handleSaveGeometry,
  type,
  initialGeometry,
  initialName,
  edit,
}) => {
  const [geometryName, setGeometryName] = useState(initialName || '')
  const [geometryData, setGeometryData] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(initialGeometry || null)
  const [isDrawing, setIsDrawing] = useState(!initialGeometry)
  const [areaInHectares, setAreaInHectares] = useState<number | null>(null)
  const map: MapboxMap = useSelector(selectMap)

  const [draw] = useState<MapboxDraw>(
    new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        trash: true,
      },
      defaultMode: 'draw_polygon',
    }),
  )

  const calculateAreaInHectares = useCallback((feature: any) => {
    if (
      !feature ||
      !feature.geometry ||
      !feature.geometry.coordinates ||
      !feature.geometry.coordinates[0]
    ) {
      return 0
    }

    try {
      const coordinates = feature.geometry.coordinates[0]

      const coordsInRadians = coordinates.map((coord: number[]) => [
        (coord[0] * Math.PI) / 180,
        (coord[1] * Math.PI) / 180,
      ])

      const R = 6371000

      let area = 0
      for (let i = 0; i < coordsInRadians.length - 1; i++) {
        area +=
          coordsInRadians[i][0] * coordsInRadians[i + 1][1] -
          coordsInRadians[i + 1][0] * coordsInRadians[i][1]
      }

      area +=
        coordsInRadians[coordsInRadians.length - 1][0] * coordsInRadians[0][1] -
        coordsInRadians[0][0] * coordsInRadians[coordsInRadians.length - 1][1]

      area = Math.abs((area * R * R) / 2)

      return area / 10000
    } catch (error) {
      console.error('Error calculating area:', error)
      return 0
    }
  }, [])

  const updateAreaCalculation = useCallback(() => {
    const features = draw.getAll().features
    if (features && features.length > 0) {
      const area = calculateAreaInHectares(features[0])
      setAreaInHectares(area)
    } else {
      setAreaInHectares(null)
    }
  }, [draw, calculateAreaInHectares])

  const typeName = type === 'field' ? 'campo' : 'lote'
  const isSaveDisabled = !geometryName || !geometryData

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '12px 20px',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    maxWidth: '900px',
    width: '95%',
    zIndex: 1000,
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '0.95rem',
    width: '100%',
    transition: 'border-color 0.2s ease',
  }

  const buttonBaseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    border: 'none',
    height: '38px',
  }

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#2563EB',
    color: 'white',
    opacity: isSaveDisabled ? 0.5 : 1,
  }

  const statusBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '16px',
    backgroundColor: isDrawing ? '#FEF3C7' : '#DEF7EC',
    color: isDrawing ? '#92400E' : '#03543F',
    fontSize: '0.813rem',
    fontWeight: 500,
  }

  const onDelete = useCallback(() => {
    try {
      draw.deleteAll()

      setGeometryData(null)
      setAreaInHectares(null)
      setIsDrawing(true)

      draw.changeMode('draw_polygon')
    } catch (error) {
      console.error('Error al borrar la geometría:', error)
    }
  }, [draw])

  const handleDrawComplete = useCallback(
    (event: any) => {
      if (event.features?.length > 0) {
        setGeometryData(draw.getAll())
        setIsDrawing(false)
        updateAreaCalculation()
      }
    },
    [draw, updateAreaCalculation],
  )

  const handleUpdate = useCallback(
    (event: any) => {
      if (event.features?.length > 0) {
        setGeometryData(draw.getAll())
        updateAreaCalculation()
      }
    },
    [draw, updateAreaCalculation],
  )

  const saveGeometryAndName = () => {
    if (geometryData && handleSaveGeometry) {
      const formattedData: FormattedData = {
        field_name: geometryName,
        geometry: [geometryData],
      }
      draw.deleteAll()
      draw.changeMode('draw_polygon')
      handleSaveGeometry(formattedData)
    }
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#F3F4F6',
    color: '#374151',
    padding: '8px',
    minWidth: '38px',
  }
  const deleteButtonStyle: React.CSSProperties = {
    ...secondaryButtonStyle,
    animation: 'fadeIn 0.3s ease-in-out',
    opacity: isDrawing ? 0 : 1,
    visibility: isDrawing ? 'hidden' : 'visible',
  }
  useEffect(() => {
    if (map) {
      map.addControl(draw)
      map.on('draw.delete', onDelete)
      map.on('draw.create', handleDrawComplete)
      map.on('draw.update', handleUpdate)

      if (initialGeometry) {
        draw.deleteAll()
        draw.add(initialGeometry)
        draw.changeMode('simple_select', {
          featureIds: [draw.getAll().features[0].id],
        })
        setGeometryData(draw.getAll())
        updateAreaCalculation()
      }

      return () => {
        map.removeControl(draw)
        map.off('draw.delete', onDelete)
        map.off('draw.create', handleDrawComplete)
        map.off('draw.update', handleUpdate)
      }
    }
  }, [
    map,
    draw,
    initialGeometry,
    onDelete,
    handleDrawComplete,
    handleUpdate,
    updateAreaCalculation,
  ])

  const closeButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    padding: 0,
    marginLeft: '4px',
    ':hover': {
      backgroundColor: '#E5E7EB',
      color: '#374151',
    },
  }

  return (
    <div style={containerStyle}>
      <Container fluid className="p-0">
        <Row className="g-2 align-items-center">
          <Col xs="auto">
            <div style={statusBadgeStyle}>
              <MapIcon style={{ fontSize: '0.875rem' }} />
              {isDrawing ? 'Dibujando...' : 'Completado'}
            </div>
          </Col>

          {areaInHectares !== null && areaInHectares > 0 && (
            <Col xs="auto">
              <div
                style={{
                  ...statusBadgeStyle,
                  backgroundColor: '#EFF6FF',
                  color: '#1E40AF',
                }}
              >
                <MapIcon style={{ fontSize: '0.875rem' }} />
                {areaInHectares.toFixed(2)} has
              </div>
            </Col>
          )}

          <Col>
            <Input
              type="text"
              value={geometryName}
              onChange={(e) => setGeometryName(e.target.value)}
              placeholder={`Nombre del ${typeName}`}
              style={inputStyle}
            />
          </Col>

          <Col xs="auto" className="d-flex align-items-center gap-2">
            {!isDrawing && (
              <Button
                style={deleteButtonStyle}
                onClick={onDelete}
                title="Borrar geometría"
              >
                <DeleteIcon style={{ fontSize: '1.25rem' }} />
              </Button>
            )}

            <Button
              style={primaryButtonStyle}
              onClick={saveGeometryAndName}
              disabled={isSaveDisabled}
            >
              <SaveIcon style={{ fontSize: '1rem' }} />
              Guardar
            </Button>

            <button
              onClick={() => window.history.back()}
              style={closeButtonStyle}
              title="Cerrar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default DrawGeometry2
