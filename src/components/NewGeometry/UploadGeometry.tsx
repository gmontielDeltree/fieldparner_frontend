import React, { useState, useEffect } from 'react'
import JSZip from 'jszip'
import toGeoJSON from 'togeojson'
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'
import { Button, Input, Spinner } from 'reactstrap'
import { CheckCircle, AlertCircle, MapPin, Save } from 'lucide-react'

interface UploadGeometryProps {
  file: File | null
  onGeoJSONProcessed?: (formattedData: FormattedData) => void
}

interface FormattedData {
  field_name: string
  geometry: FeatureCollection<Geometry, GeoJsonProperties>[]
}

function UploadGeometry({ file, onGeoJSONProcessed }: UploadGeometryProps) {
  const [geometryData, setGeometryData] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null)
  const [geometryName, setGeometryName] = useState('')
  const [showInputUI, setShowInputUI] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isSaveDisabled = !geometryName || !geometryData

  useEffect(() => {
    if (!file) return

    setProcessing(true)
    setError(null)
    setSuccess(false)

    if (file.name.endsWith('.kml')) {
      processKMLFile(file)
    } else if (file.name.endsWith('.kmz')) {
      processKMZFile(file)
    } else {
      setError('Por favor, sube un archivo .kml o .kmz')
      setProcessing(false)
    }
  }, [file])

  const saveGeometryAndName = () => {
    if (geometryData) {
      const formattedData: FormattedData = {
        field_name: geometryName,
        geometry: [geometryData],
      }

      setGeometryData(null)
      setShowInputUI(false)
      setSuccess(true)

      setTimeout(() => {
        setSuccess(false)
        onGeoJSONProcessed?.(formattedData)
      }, 1000)
    }
  }

  const processKMLFile = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const parser = new DOMParser()
        const kml = parser.parseFromString(
          event.target?.result as string,
          'text/xml',
        )
        const converted = toGeoJSON.kml(kml)

        setGeometryData(converted)
        setShowInputUI(true)
        setProcessing(false)
      }
      reader.onerror = () => {
        setError('Error al procesar el archivo KML')
        setProcessing(false)
      }
      reader.readAsText(file)
    } catch (err) {
      setError('Error al procesar el archivo KML')
      setProcessing(false)
    }
  }

  const processKMZFile = async (file: File) => {
    try {
      const zip = new JSZip()
      const content = await zip.loadAsync(file)
      const kmlKey = Object.keys(content.files).find((key) =>
        key.endsWith('.kml'),
      )

      if (kmlKey) {
        const kmlContent = await content.files[kmlKey].async('text')
        const parser = new DOMParser()
        const kml = parser.parseFromString(kmlContent, 'text/xml')
        const converted = toGeoJSON.kml(kml)

        setGeometryData(converted)
        setShowInputUI(true)
        setProcessing(false)
      } else {
        setError('No se encontró archivo KML dentro del KMZ')
        setProcessing(false)
      }
    } catch (err) {
      setError('Error al procesar el archivo KMZ')
      setProcessing(false)
    }
  }

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(229, 231, 235, 0.8)',
    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    transform:
      showInputUI || processing || error ? 'translateY(0)' : 'translateY(100%)',
  }

  const contentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  }

  const statusContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: error ? '#FEE2E2' : '#F3F4F6',
    color: error ? '#DC2626' : '#374151',
  }

  const inputWrapperStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  }

  const inputStyle: React.CSSProperties = {
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    padding: '8px 16px',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  }

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    borderRadius: '8px',
    backgroundColor: '#2563EB',
    border: 'none',
    color: 'white',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    opacity: isSaveDisabled ? 0.5 : 1,
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {processing && (
          <div style={statusContainerStyle}>
            <Spinner size="sm" color="primary" />
            <span>Procesando archivo...</span>
          </div>
        )}

        {error && (
          <div style={statusContainerStyle}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {showInputUI && !processing && !error && (
          <>
            <div style={inputWrapperStyle}>
              <MapPin size={20} color="#2563EB" />
              <Input
                type="text"
                value={geometryName}
                onChange={(e) => setGeometryName(e.target.value)}
                placeholder="Nombre del campossss"
                style={inputStyle}
              />
            </div>

            <Button
              style={buttonStyle}
              onClick={saveGeometryAndName}
              disabled={isSaveDisabled}
            >
              {success ? <CheckCircle size={20} /> : <Save size={20} />}
              {success ? '¡Guardado!' : 'Guarasdsadar'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default UploadGeometry
