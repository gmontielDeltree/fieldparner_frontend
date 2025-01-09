import React, { useState, useCallback, useEffect, useRef } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { Button, Grid } from '@mui/material'
import area from '@turf/area'
import { addFieldsToMapSingleLayer } from '../helpers/mapHelpers'
import NewsBar from '../components/NewsBar'
import MapComponent from '../components/Map'
import uuid4 from 'uuid4'
import { Field, Lot } from '../interfaces/field'
import { useDispatch, useSelector } from 'react-redux'
import { setMap, selectMap } from '../redux/map/mapSlice'
import { selectDraw } from '../redux/draw/drawSlice'
import { RootState } from '../redux/store'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Devices } from '../components/Sensors/sensores'
import { addDepositosToMap } from '../../owncomponents/mapa-principal/depositos-layer'
import { useDeposit, useField } from '../hooks'
import useResizeObserver from '@react-hook/resize-observer'
import { dbContext } from '../services'
import { touchEvent } from '../../owncomponents/helpers'
import FieldsSideMenu from '../components/FieldsSideMenu'
import { useTranslation } from 'react-i18next'
import { Actividad } from '../interfaces/activity'
import { format, isBefore, isToday, parseISO } from 'date-fns'
import { hideFieldList } from '../redux/fieldsList'
import '../classes/engine/Engine'
import { selectSyncStatus } from '../redux/syncStatus'

export const FieldsPage: React.FC = () => {
  const map = useSelector(selectMap)
  const { fields, getFields } = useField()
  const [activitiesCache, setActivitiesCache] = useState<{
    [key: string]: Array<{ actividad: Actividad; ejecucion_id: string }>
  }>({})
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null)

  const db = dbContext.fields
  const [selectedField, setSelectedField] = useState<any | null>(null)
  const selectedFieldRef = useRef<Field | null>(null)
  const draw = useSelector(selectDraw)
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const location = useLocation()
  const syncStatus = useSelector(selectSyncStatus)
  const isVisible = useSelector((state: RootState) => state.fieldList.isVisible)
  const navigate = useNavigate()
  const { deposits, getDeposits } = useDeposit()

  const updateMapAfterNew = () => {
    getFields()
  }

  const target = useRef(null)
  useResizeObserver(target, (entry) => {
    if (map) {
      console.count('map resize obs')
      map.resize()
    }
  })

  useEffect(() => {
    return () => {
      dispatch(setMap(null))
    }
  }, [])

  useEffect(() => {
    selectedFieldRef.current = selectedField
  }, [selectedField])

  useEffect(() => {
    getFields()
    getDeposits()
  }, [])

  useEffect(() => {
    getFields()
    getDeposits()
    setActivitiesCache({})
    console.log('FieldsPage - Updating by sync')
  }, [syncStatus])

  const only_docs = (alldocs: PouchDB.Core.AllDocsResponse<{}>) => {
    if (alldocs.rows.length > 0) {
      return alldocs.rows.map((row) => {
        return row.doc
      })
    } else {
      return []
    }
  }

  const gbl_docs_starting = async (
    key: string,
    devolver_docs: boolean = false,
    attachments: boolean = false,
    binary: boolean = false,
  ) => {
    return db
      .allDocs({
        include_docs: devolver_docs,
        attachments: attachments,
        binary: binary,
        startkey: key,
        endkey: key + '\ufff0',
      })
      .then((result) => {
        return result
      })
  }

  const getActivities = async (uuid_del_lote) => {
    let acts: Actividad[] = await gbl_docs_starting(
      'actividad',
      true,
      true,
      true,
    ).then(only_docs)

    let s = acts.filter(({ lote_uuid }) => lote_uuid === uuid_del_lote)
    let _actividades_docs = s.reverse()

    let result = await db.allDocs({
      startkey: 'ejecucion:',
      endkey: 'ejecucion:\ufff0',
    })

    let respuesta: { actividad: Actividad; ejecucion_id: string }[] = []

    if (result.rows) {
      _actividades_docs.forEach((actividad) => {
        let midoc = result.rows.find((doc) => doc.id.includes(actividad.uuid))
        respuesta.push({ actividad: actividad, ejecucion_id: midoc?.id })
      })

      respuesta.sort((a, b) => {
        let fecha_1 = a.ejecucion_id
          ? parseISO(a.ejecucion_id.split(':')[1])
          : parseISO(
              a.actividad.tipo === 'nota'
                ? a.actividad.fecha
                : a.actividad.detalles.fecha_ejecucion_tentativa,
            )
        let fecha_2 = b.ejecucion_id
          ? parseISO(b.ejecucion_id.split(':')[1])
          : parseISO(
              b.actividad.tipo === 'nota'
                ? b.actividad.fecha
                : b.actividad.detalles.fecha_ejecucion_tentativa,
            )
        return isBefore(fecha_1, fecha_2) ? 1 : -1
      })
    }

    return respuesta ? respuesta : []
  }

  const getActivitiesWithCache = async (uuid_del_lote) => {
    if (activitiesCache[uuid_del_lote]) {
      return activitiesCache[uuid_del_lote]
    }

    const activities = await getActivities(uuid_del_lote)
    setActivitiesCache((prev) => ({
      ...prev,
      [uuid_del_lote]: activities,
    }))

    return activities
  }

  useEffect(() => {
    if (!map) return

    let tooltip = document.getElementById('map-tooltip')
    if (!tooltip) {
      tooltip = document.createElement('div')
      tooltip.setAttribute('id', 'map-tooltip')
      tooltip.style.position = 'absolute'
      tooltip.style.background = 'rgba(255, 255, 255, 0.98)'
      tooltip.style.color = '#1e293b'
      tooltip.style.padding = '16px'
      tooltip.style.borderRadius = '16px'
      tooltip.style.display = 'none'
      tooltip.style.zIndex = '9999'
      tooltip.style.pointerEvents = 'none'
      tooltip.style.maxWidth = '400px'
      tooltip.style.backdropFilter = 'blur(8px)'
      tooltip.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)'
      tooltip.style.fontSize = '13px'
      tooltip.style.border = '1px solid rgba(226, 232, 240, 0.8)'
      document.body.appendChild(tooltip)
    }

    addFieldsToMapSingleLayer(map, fields)

    let currentLoteId: string | null = null
    let debounceTimeout: NodeJS.Timeout | null = null

    const updateTooltipContent = async (feature: any) => {
      const properties = feature.properties

      tooltip.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif;">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0
        ">
          <div style="font-weight: 600; font-size: 16px; color: #334155;">
            ${properties.nombre || 'Sin nombre'}
          </div>
          <div style="
            background: #edf2f7;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            color: #475569;
          ">
            ${properties.hectareas?.toFixed(2) || 0} ha
          </div>
        </div>
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          margin-bottom: 12px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Cargando actividades...
        </div>
      </div>
    `
      try {
        const activities = (await getActivitiesWithCache(properties.uuid)) || []

        if (currentLoteId !== properties.uuid) return

        const now = new Date()
        const upcomingActivities = activities
          .filter(({ actividad }) => {
            if (
              !actividad?.detalles?.fecha_ejecucion_tentativa &&
              !actividad?.fecha
            )
              return false
            const date = parseISO(
              actividad.detalles?.fecha_ejecucion_tentativa || actividad.fecha,
            )
            return isBefore(now, date)
          })
          .slice(0, 3)

        const recentActivities = activities
          .filter(({ actividad }) => {
            if (
              !actividad?.detalles?.fecha_ejecucion_tentativa &&
              !actividad?.fecha
            )
              return false
            const date = parseISO(
              actividad.detalles?.fecha_ejecucion_tentativa || actividad.fecha,
            )
            return isBefore(date, now)
          })
          .slice(0, 2)

        let content = `
          <div style="font-family: system-ui, -apple-system, sans-serif;">
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #e2e8f0
            ">
              <div style="font-weight: 600; font-size: 16px; color: #334155;">
                ${properties.nombre || 'Sin nombre'}
              </div>
              <div style="
                background: #edf2f7;
                padding: 4px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 500;
                color: #475569;
              ">
                ${properties.hectareas?.toFixed(2) || 0} ha
              </div>
            </div>
        `

        if (upcomingActivities.length > 0) {
          content += `
            <div style="margin-bottom: 12px;">
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                color: #2563eb;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 13px;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Próximas actividades
              </div>
              ${upcomingActivities
                .map(({ actividad }) => {
                  const fecha = format(
                    parseISO(
                      actividad.detalles?.fecha_ejecucion_tentativa ||
                        actividad.fecha,
                    ),
                    'dd/MM/yyyy',
                  )

                  return `
                  <div style="
                    background: #eff6ff;
                    margin: 6px 0;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid rgba(37, 99, 235, 0.1);
                  ">
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 6px;
                    ">
                      <div style="font-weight: 600; color: #1e40af;">
                        ${
                          actividad.tipo.charAt(0).toUpperCase() +
                          actividad.tipo.slice(1)
                        }
                      </div>
                      <div style="
                        background: rgba(37, 99, 235, 0.1);
                        padding: 3px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        color: #1e40af;
                        font-weight: 500;
                      ">
                        ${fecha}
                      </div>
                    </div>
                    ${
                      actividad.tipo === 'aplicacion'
                        ? `
                      <div style="
                        font-size: 12px;
                        color: #334155;
                        margin-top: 6px;
                      ">
                        <div style="display: flex; align-items: center; gap: 4px; opacity: 0.9;">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 7V4h16v3M9 20h6M12 4v16"></path>
                          </svg>
                          ${
                            actividad.detalles?.cultivo?.descriptionES ||
                            'No especificado'
                          }
                        </div>
                        ${
                          actividad.detalles?.dosis?.length
                            ? `
                          <div style="
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            margin-top: 4px;
                            opacity: 0.8;
                          ">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M19 5H5l7 7-7 7h14l-7-7 7-7z"></path>
                            </svg>
                            ${actividad.detalles.dosis
                              .map(
                                (d) =>
                                  `${d.insumo?.name || ''}: ${d.dosis || ''} ${
                                    d.insumo?.unitMeasurement || ''
                                  }`,
                              )
                              .join(', ')}
                          </div>
                        `
                            : ''
                        }
                      </div>
                    `
                        : ''
                    }
                  </div>
                `
                })
                .join('')}
            </div>
          `
        }

        if (recentActivities.length > 0) {
          content += `
            <div>
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                color: #6366f1;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 13px;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Actividades recientes
              </div>
              ${recentActivities
                .map(({ actividad }) => {
                  const fecha = format(
                    parseISO(
                      actividad.detalles?.fecha_ejecucion_tentativa ||
                        actividad.fecha,
                    ),
                    'dd/MM/yyyy',
                  )

                  return `
                  <div style="
                    background: #f5f3ff;
                    margin: 6px 0;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid rgba(99, 102, 241, 0.1);
                  ">
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 4px;
                    ">
                      <div style="font-weight: 600; color: #4338ca;">
                        ${
                          actividad.tipo.charAt(0).toUpperCase() +
                          actividad.tipo.slice(1)
                        }
                      </div>
                      <div style="
                        background: rgba(99, 102, 241, 0.1);
                        padding: 3px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        color: #4338ca;
                        font-weight: 500;
                      ">
                        ${fecha}
                      </div>
                    </div>
                    ${
                      actividad.tipo === 'aplicacion'
                        ? `
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-size: 12px;
                        color: #334155;
                        margin-top: 6px;
                        opacity: 0.9;
                      ">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${actividad.estado}
                      </div>
                    `
                        : ''
                    }
                  </div>
                `
                })
                .join('')}
            </div>
          `
        }

        if (!upcomingActivities.length && !recentActivities.length) {
          content += `
            <div style="
              text-align: center;
              color: #64748b;
              padding: 24px 0;
              background: #f8fafc;
              border-radius: 12px;
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 8px;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>No hay actividades registradas</div>
            </div>
          `
        }

        content += '</div>'

        if (currentLoteId === properties.uuid) {
          tooltip.innerHTML = content
        }
      } catch (error) {
        console.error('Error loading activities:', error)
      }
    }

    const handleMouseMove = (e: any) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      const loteId = feature.properties.uuid

      tooltip.style.display = 'block'
      tooltip.style.left = `${e.originalEvent.clientX + 15}px`
      tooltip.style.top = `${e.originalEvent.clientY + 15}px`

      if (currentLoteId !== loteId) {
        currentLoteId = loteId
        if (debounceTimeout) clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(
          () => updateTooltipContent(feature),
          100,
        ) as any
      }
    }

    map.on('mousemove', 'lotes-fill', handleMouseMove)

    map.on('mouseleave', 'lotes-fill', () => {
      currentLoteId = null
      if (debounceTimeout) clearTimeout(debounceTimeout)
      tooltip.style.display = 'none'
    })

    let devices = new Devices()
    devices.add_markers_to_map_react(map, (deviceId: string, date: string) =>
      navigate(`device/${deviceId}/${date}`),
    )

    if (deposits) {
      addDepositosToMap(map, deposits, (e: string) => navigate(e))
    }

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout)
      if (map) {
        map.off('mousemove', 'lotes-fill')
        map.off('mouseleave', 'lotes-fill')
        const tooltipElement = document.getElementById('map-tooltip')
        if (tooltipElement) {
          tooltipElement.remove()
        }
      }
    }
  }, [map, draw, fields, deposits, location.pathname])

  const handleMapClick = useCallback(
    async (event: any) => {
      if (
        location.pathname.includes('new-lot') ||
        location.pathname.includes('new-field') ||
        location.pathname.includes('edit-lot') ||
        location.pathname.includes('edit-field')
      ) {
        return
      }

      const features = map?.queryRenderedFeatures(event.point)
      console.log('Click on Map', event, features)

      if (features.length > 0) {
        const fieldId = features[0].properties.id
        const source = features[0].source

        if (source === 'campos') {
          try {
            navigate(fieldId)
          } catch (err) {
            console.error('Error fetching field from PouchDB', err)
          }
        } else if (source === 'lotes') {
          let parentId = features[0].properties.campo_parent_id
          let loteId = features[0].properties.uuid
          navigate(parentId + '/' + loteId)
        }
      }
    },
    [map, db, selectedField, location],
  )

  useEffect(() => {
    if (map) {
      map.on(touchEvent, handleMapClick)
    }
    return () => {
      if (map) {
        map.off(touchEvent, handleMapClick)
      }
    }
  }, [map, handleMapClick])

  const handleDirectLotSelection = (lot, field) => {
    navigate(`${field._id}/${lot.id}`)
  }

  const handleSelectField = (field) => {
    console.log('Field selected from menu:', field)
    navigate(field._id)
  }

  const onMapLoad = useCallback(
    (event: any) => {
      const map = event.target
      dispatch(setMap(map))
    },
    [dispatch, draw],
  )

  return (
    <>
      <FieldsSideMenu
        open={isVisible}
        fields={fields}
        onSelectField={handleSelectField}
        onSelectLot={handleDirectLotSelection}
      />

      <Grid container style={{ position: 'relative' }} ref={target}>
        <MapComponent onMapLoad={onMapLoad} />
      </Grid>

      {location.pathname === '/init/overview/fields' && (
        <Button
          color="primary"
          variant="contained"
          style={{
            position: 'absolute',
            bottom: 30,
            right: 20,
          }}
          onClick={() => navigate('new-field')}
        >
          {t('add_field')}
        </Button>
      )}

      {map && <Outlet context={{ updateMapAfterNew: updateMapAfterNew }} />}

      <NewsBar />
    </>
  )
}
