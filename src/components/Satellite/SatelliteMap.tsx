import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  Suspense,
} from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import DeckGL from '@deck.gl/react'
import { Map, MapRef, useControl } from 'react-map-gl'
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers'
import axios from 'axios'
import bbox from '@turf/bbox'
import { MapboxOverlay } from '@deck.gl/mapbox/typed'
import { MaskExtension } from '@deck.gl/extensions'
import { readPixelsToArray } from '@luma.gl/core'
import Draggable from 'react-draggable'
import { MenuItem, Select, Button, Grid, Chip, Paper } from '@mui/material'
import { format, parse } from 'date-fns'
import { Splash } from './Splash'
import { list_of_indexes, getTranslatedIndices } from '../../../owncomponents/ndvi-offcanvas/indices-types'
import { SatelliteCharts } from './SatelliteCharts'
import { SatelliteResumen } from './SatelliteResumen'
import { SatelliteDatePicker } from './SatelliteDatePicker'
import ContrastIcon from '@mui/icons-material/Contrast'
import ImageIcon from '@mui/icons-material/Image'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import { geotiff_to_excel } from '../../../owncomponents/ndvi-offcanvas/geotiff-helpers'
import { useNavigate } from 'react-router-dom'
import { GroupWork } from '@mui/icons-material'
import Close from '@mui/icons-material/Close'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { useTranslation } from 'react-i18next'

// LRU Cache implementation
class LRUCache {
  constructor(maxSize = 10) {
    this.cache = {}
    this.maxSize = maxSize
    this.keys = []
  }

  get(key) {
    if (!(key in this.cache)) return null

    // Refresh key position
    const keyIndex = this.keys.indexOf(key)
    this.keys.splice(keyIndex, 1)
    this.keys.push(key)

    return this.cache[key]
  }

  set(key, value) {
    if (key in this.cache) {
      // Refresh existing entry
      const keyIndex = this.keys.indexOf(key)
      this.keys.splice(keyIndex, 1)
    } else if (this.keys.length >= this.maxSize) {
      // Remove oldest entry
      const oldestKey = this.keys.shift()
      delete this.cache[oldestKey]
    }

    this.cache[key] = value
    this.keys.push(key)
  }

  clear() {
    this.cache = {}
    this.keys = []
  }
}

const indiceCache = new LRUCache(10)

const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw'

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props))
  overlay.setProps(props)
  return null
}

export const SatelliteMap = ({
  viewState,
  onViewStateChange,
  onDualToggle,
  features,
  lote,
  dualMode,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [hoverInfo, setHoverInfo] = useState(null)

  // Usar los índices traducidos en lugar de los estáticos
  const translatedIndices = useMemo(() => getTranslatedIndices(t), [t]);
  const [indice, setIndice] = useState(translatedIndices[0]);

  const [selectedDate, setSelectedDate] = useState(null)
  const [indiceRequestResponse, setIndiceRequestResponse] = useState(null)
  const [showCharts, setShowCharts] = useState(true)

  const borderLayer = useMemo(
    () =>
      new GeoJsonLayer({
        id: 'borde',
        data: lote,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 3,
        getLineColor: [254, 176, 25, 255],
      }),
    [lote],
  )

  const layers = useMemo(() => {
    if (!indiceRequestResponse || !lote) return [borderLayer]

    const image_url =
      import.meta.env.VITE_COGS_SERVER_URL + indiceRequestResponse.png_url
    const greyscale_url = image_url.replace('.png', '_greyscale.png')

    const mask_layer = new GeoJsonLayer({
      id: 'geofence',
      data: lote,
      operation: 'mask',
    })

    const coloredLayer = new BitmapLayer({
      id: 'bitmap-layer',
      bounds: bbox(lote),
      image: image_url,
      extensions: [new MaskExtension()],
      maskId: 'geofence',
    })

    const valueLayer = new BitmapLayer({
      id: 'value-layer',
      bounds: bbox(lote),
      image: greyscale_url,
      extensions: [new MaskExtension()],
      maskId: 'geofence',
      pickable: true,
      onHover: (info) => {
        if (info.bitmap) {
          const pixelColor = readPixelsToArray(info.layer.props.image, {
            sourceX: info.bitmap.pixel[0],
            sourceY: info.bitmap.pixel[1],
            sourceWidth: 1,
            sourceHeight: 1,
          })
          const indexValue = parseFloat(
            ((pixelColor[0] * 2) / 255 - 1).toFixed(2),
          )
          setHoverInfo({
            x: info.x,
            y: info.y,
            color: indexValue,
          })
        } else {
          setHoverInfo(null)
        }
      },
    })

    return [mask_layer, valueLayer, coloredLayer, borderLayer]
  }, [indiceRequestResponse, lote, borderLayer])

  useEffect(() => {
    if (selectedDate && indice && lote) {
      const fetchIndiceData = async () => {
        const cacheKey = `${lote.id}-${indice.name}-${format(
          selectedDate,
          'yyyy-MM-dd',
        )}`

        const cachedData = indiceCache.get(cacheKey)
        if (cachedData) {
          setIndiceRequestResponse(cachedData)
          return
        }

        const body = {
          resourceId: lote.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          histogramOptions: { bins: indice.thresholds },
          lote,
          indice,
        }

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_COGS_SERVER_URL}/indices/request`,
            body,
          )
          setIndiceRequestResponse(response.data)
          indiceCache.set(cacheKey, response.data)
        } catch (error) {
          console.error('Error fetching indice data:', error)
        }
      }

      fetchIndiceData()
    }
  }, [selectedDate, indice, lote])

  useEffect(() => {
    if (features) {
      const dateStr = features.features[1].properties.datetime
      const parsedDate = parse(
        dateStr,
        "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX",
        new Date(),
      )
      setSelectedDate(parsedDate)
    }
  }, [features])

  useEffect(() => {
    if (lote && mapRef.current) {
      const [minLng, minLat, maxLng, maxLat] = bbox(lote)
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 1000 },
      )
    }
  }, [lote, dualMode])

  // Cleanup effect
  useEffect(() => {
    return () => {
      indiceCache.clear()
    }
  }, [])

  // Actualizar el índice seleccionado cuando cambia el idioma
  useEffect(() => {
    // Actualizar el índice seleccionado con su versión traducida
    if (indice) {
      const updatedIndice = translatedIndices.find(i => i.name === indice.name);
      if (updatedIndice) {
        setIndice(updatedIndice);
      }
    }
  }, [translatedIndices, indice?.name]);

  const onLoad = useCallback(() => {
    setLoading(false)
  }, [])

  const handleIndiceChange = useCallback((e) => {
    const indiceSelected = translatedIndices.find(
      (i) => i.name === e.target.value,
    )
    setIndice(indiceSelected)
  }, [translatedIndices])

  return (
    <>
      <Grid container style={{ height: '100%', position: 'relative' }}>
        <Grid item xs={12} style={{ height: '100%' }}>
          <Map
            ref={mapRef}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12?optimize=true"
            {...viewState}
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            onLoad={onLoad}
            onMove={(evt) => onViewStateChange(evt.viewState)}
          >
            <DeckGLOverlay layers={layers} />
          </Map>
        </Grid>

        <Paper
          style={{
            position: 'absolute',
            top: '1%',
            marginLeft: '10px',
            display: 'flex',
            gap: '10px',
            backgroundColor: '#1976d2',
            padding: '10px',
            color: 'white',
            zIndex: 2,
          }}
        >
          <Select
            value={indice.name}
            onChange={handleIndiceChange}
            sx={{
              color: 'primary.contrastText',
              '& .MuiOutlinedInput-root': {
                borderColor: 'white',
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
            }}
          >
            {translatedIndices.map((i) => (
              <MenuItem key={i.name} value={i.name}>
                {i.name}
              </MenuItem>
            ))}
          </Select>

          {features && (
            <SatelliteDatePicker
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              features={features}
            />
          )}
        </Paper>

        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            top: '3%',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <Button
            variant="contained"
            sx={{ marginBottom: '3rem' }}
            color="error"
            onClick={() => navigate(-1)}
            title={t('close')}
          >
            <Close />
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              if (indiceRequestResponse?.tiff_url) {
                geotiff_to_excel(
                  import.meta.env.VITE_COGS_SERVER_URL +
                  indiceRequestResponse.tiff_url,
                  indice.name,
                )
              }
            }}
            title={t('downloadExcel')}
          >
            <CloudDownloadIcon />
          </Button>

          <Button
            variant="contained"
            title={t('downloadPNG')}
            target="_blank"
            href={
              indiceRequestResponse?.png_url
                ? import.meta.env.VITE_COGS_SERVER_URL +
                indiceRequestResponse.png_url
                : '#'
            }
          >
            <ImageIcon />
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              if (indiceRequestResponse?.png_url) {
                navigate(
                  '/init/overview/zoning/' +
                  indiceRequestResponse.png_url
                    .split('/')[3]
                    .replace('.png', ''),
                )
              }
            }}
            title={t('zoneGenerator')}
          >
            <GroupWork />
          </Button>

          <Button variant="contained" onClick={onDualToggle} title={t('dualMap')}>
            <ContrastIcon />
          </Button>

          {!showCharts && (
            <Button
              variant="contained"
              onClick={() => setShowCharts(true)}
              title={t('showCharts')}
            >
              <ShowChartIcon />
            </Button>
          )}
        </div>

        {selectedDate && indiceRequestResponse && (
          <>
            {showCharts && (
              <Draggable>
                <Paper
                  style={{
                    position: 'absolute',
                    zIndex: 5,
                    top: '10%',
                    right: '6%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: dualMode ? '34%' : '17%',
                    minWidth: '300px',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    backgroundColor: '#1976d299',
                    cursor: 'move',
                  }}
                >
                  <Button
                    onClick={() => setShowCharts(false)}
                    style={{ alignSelf: 'flex-end', minWidth: '30px' }}
                  >
                    <Close />
                  </Button>

                  <Suspense fallback={<div>{t('loadingCharts')}</div>}>
                    <SatelliteCharts
                      data={indiceRequestResponse}
                      indice={indice}
                      date={indiceRequestResponse.date}
                      hectareas_del_lote={
                        indiceRequestResponse.area_mts_squared / 10000
                      }
                      dualMode={dualMode}
                    />
                  </Suspense>
                </Paper>
              </Draggable>
            )}

            <div
              style={{
                position: 'absolute',
                zIndex: 5,
                top: '15%',
                left: '3%',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <SatelliteResumen
                date={selectedDate}
                lote={lote}
                indice={indice}
              />
            </div>
          </>
        )}

        {loading && <Splash />}
      </Grid>

      {hoverInfo && hoverInfo.color && (
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            pointerEvents: 'none',
            left: hoverInfo.x,
            top: hoverInfo.y - 30,
          }}
        >
          <Chip label={hoverInfo.color} color="primary" />
        </div>
      )}
    </>
  )
}