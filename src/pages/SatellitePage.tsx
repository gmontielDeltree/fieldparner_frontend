// SatellitePage.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Grid } from '@mui/material'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { get_lote_doc } from '../../owncomponents/helpers'
import bbox from '@turf/bbox'
import { format } from 'date-fns'
import { SatelliteMap } from '../components/Satellite/SatelliteMap'
import { dbContext } from '../services'

// Cache para almacenar respuestas de features
const featuresCache = new Map()

export const SatellitePage: React.FC = () => {
  const { loteId } = useParams()
  const db = dbContext.fields

  const [lote, setLote] = useState(null)
  const [features, setFeatures] = useState(null)
  const [dualMode, setDualMode] = useState(false)
  const [viewState, setViewState] = useState({
    longitude: -122,
    latitude: 37,
    zoom: 12,
    pitch: 30,
  })

  // Memoizar el handler de viewState
  const onViewStateChange = useCallback((newViewState) => {
    setViewState(newViewState)
  }, [])

  // Obtener lote con suspense y caché
  useEffect(() => {
    if (!loteId) return

    let isMounted = true
    const fetchLote = async () => {
      try {
        const result = await get_lote_doc(db, loteId)
        if (isMounted) setLote(result)
      } catch (error) {
        console.error('Error fetching lote:', error)
      }
    }

    fetchLote()
    return () => {
      isMounted = false
    }
  }, [loteId, db])

  // Obtener features con caché
  useEffect(() => {
    if (!lote) return

    let isMounted = true
    const fetchFeatures = async () => {
      const date = format(new Date(), 'yyyy-MM-dd')
      const bboxStr = bbox(lote).join(',')
      const cacheKey = `${bboxStr}-${date}`

      // Verificar caché
      if (featuresCache.has(cacheKey)) {
        setFeatures(featuresCache.get(cacheKey))
        return
      }

      try {
        const url = `${
          import.meta.env.VITE_COGS_SERVER_URL
        }/indices/features?bbox=${bboxStr}&date=${date}`
        const response = await axios.get(url)

        if (isMounted) {
          setFeatures(response.data)
          featuresCache.set(cacheKey, response.data)
        }
      } catch (error) {
        console.error('Error fetching features:', error)
      }
    }

    fetchFeatures()
    return () => {
      isMounted = false
    }
  }, [lote])

  // Memoizar el componente Grid para evitar re-renders innecesarios
  const satelliteMapProps = useMemo(
    () => ({
      viewState,
      onViewStateChange,
      features,
      lote,
      onDualToggle: () => setDualMode(!dualMode),
      dualMode,
    }),
    [viewState, onViewStateChange, features, lote, dualMode],
  )

  return (
    <Grid container spacing={0}>
      <Grid item xs={dualMode ? 6 : 12}>
        <SatelliteMap {...satelliteMapProps} />
      </Grid>
      {dualMode && (
        <Grid item xs={6}>
          <SatelliteMap {...satelliteMapProps} />
        </Grid>
      )}
    </Grid>
  )
}
