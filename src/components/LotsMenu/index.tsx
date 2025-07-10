import React, { useEffect, useState } from 'react'
import { Paper, IconButton, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import { useLocation, useNavigate } from 'react-router-dom'
import { dbContext } from '../../services'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useField } from '../../hooks'
import { setLotActive } from '../../redux/map'
import Swal from 'sweetalert2'
import { Actividad } from '../../interfaces/activity'
import { isBefore, parseISO } from 'date-fns'
import AssignCampaignsToActivities from './AssignCampaignsToActivities'
import LotMenuContent from './components/LotMenuContent'
import ActivitiesBar from './components/ActivitiesBar'

interface LotsMenuProps {
  lot: any
  field: any
  isOpen: boolean
  toggle: () => void
}

const LotsMenu: React.FC<LotsMenuProps> = ({ lot, field, isOpen, toggle }) => {
  const dispatch = useAppDispatch()
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null)
  const db = dbContext.fields
  const [activities, setActivities] = useState<any>(null)
  const { t } = useTranslation()

  // Información de actividad que se está editando:
  const [editingActivityInfo, setEditingActivityInfo] = useState<{
    activity: Actividad | null
    isExecuting: boolean
  }>({ activity: null, isExecuting: false })

  const selectedCampaign = useSelector(
    (state: RootState) => state.campaign.selectedCampaign
  )

  const navigate = useNavigate()
  const location = useLocation()
  const backUrl = location.pathname

  const selectCategory = (categoryId: string) => {
    // Pasamos claves sin traducir:
    setSelectedCategory(categoryId)
  }

  const backToActivites = () => {
    setSelectedCategory(null)
    if (lot && lot.id) {
      getActivities(lot.id).then((res) => setActivities(res))
    }
  }

  const getActivities = async (uuid_del_lote: string) => {
    try {
      // Primero obtener las actividades normales como siempre
      let acts = await gbl_docs_starting(
        'actividad',
        true,
        true,
        true
      ).then(only_docs) as any[]

      let s = acts.filter(({ lote_uuid }) => lote_uuid === uuid_del_lote)
      let _actividades_docs = s.reverse()

      // Ahora intentar agregar las actividades planificadas
      try {
        let planificadasResponse = await gbl_docs_starting(
          'planactividad',
          true,
          true,
          true
        )
        let planificadas = only_docs(planificadasResponse) || []

        // Filtrar las actividades planificadas por loteId
        let actividadesPlanificadas = planificadas.filter((doc: any) => doc && doc.loteId === uuid_del_lote)

        // Load complete planned activity data and convert to expected format
        for (const planif of actividadesPlanificadas) {
          const planifData = planif as any;
          if (planifData && planifData._id) {
            try {
              // Load complete planification data from database
              const completePlanifData = await db.get(planifData._id) as any;
              console.log('🔄 LOADING COMPLETE PLANIF DATA:', completePlanifData);

              let actividadFormateada: any = {
                _id: planifData._id,
                lote_uuid: planifData.loteId,
                uuid: planifData._id.replace('planactividad:', ''),
                tipo: planifData.tipo || 'otro',
                estado: 'planificada',
                fecha: planifData.fecha,
                detalles: {
                  fecha_ejecucion_tentativa: planifData.fecha,
                  hectareas: planifData.area || 0,
                  // Map complete planned activity fields to regular activity format
                  cultivo: completePlanifData.cultivo || null,
                  contratista: completePlanifData.contratista || null,
                  business: completePlanifData.accountId || planifData.accountId || null,
                  dosis: completePlanifData.dosis || [],
                  servicios: completePlanifData.servicios || [],
                  rinde_estimado: completePlanifData.rindeEstimado || completePlanifData.rendimientoEstimado || 0,
                  rinde_estimado_total: completePlanifData.rendimientoEstimadoTotal || 0,
                  fertilizacion: completePlanifData.fertilizacion || false,
                  fitosanitaria: completePlanifData.fitosanitaria || false,
                  zafra: completePlanifData.zafra || '',
                },
                campaña: {
                  campaignId: planifData.campanaId
                },
                ts_generacion: planifData.created?.date || new Date().toISOString(),
                contratista: completePlanifData.contratista || null,
                ingeniero: null,
                comentario: completePlanifData.comentarios || completePlanifData.comentario || 'Actividad planificada',
                observaciones: completePlanifData.comentarios || completePlanifData.observaciones || '',
                condiciones: completePlanifData.condiciones || {
                  humedad_max: undefined,
                  humedad_min: undefined,
                  temperatura_max: undefined,
                  temperatura_min: undefined,
                  velocidad_max: undefined,
                  velocidad_min: undefined,
                },
                isPlanificada: true,
                // Keep reference to original planned activity data
                _originalPlanifData: completePlanifData
              }
              _actividades_docs.push(actividadFormateada)
            } catch (error) {
              console.warn('Could not load complete planification data for:', planifData._id, error);
              // Fallback to basic mapping if complete data is not available
              let actividadFormateada: any = {
                _id: planifData._id,
                lote_uuid: planifData.loteId,
                uuid: planifData._id.replace('planactividad:', ''),
                tipo: planifData.tipo || 'otro',
                estado: 'planificada',
                fecha: planifData.fecha,
                detalles: {
                  fecha_ejecucion_tentativa: planifData.fecha,
                  hectareas: planifData.area || 0,
                  cultivo: null,
                  contratista: null,
                  business: planifData.accountId || null,
                  dosis: [],
                  servicios: [],
                  rinde_estimado: 0,
                  rinde_estimado_total: 0,
                  fertilizacion: false,
                  fitosanitaria: false,
                  zafra: '',
                },
                campaña: {
                  campaignId: planifData.campanaId
                },
                ts_generacion: planifData.created?.date || new Date().toISOString(),
                contratista: null,
                ingeniero: null,
                comentario: 'Actividad planificada',
                observaciones: '',
                condiciones: {
                  humedad_max: undefined,
                  humedad_min: undefined,
                  temperatura_max: undefined,
                  temperatura_min: undefined,
                  velocidad_max: undefined,
                  velocidad_min: undefined,
                },
                isPlanificada: true,
                _originalPlanifData: planifData
              }
              _actividades_docs.push(actividadFormateada)
            }
          }
        }
      } catch (err) {
        console.log('Error cargando actividades planificadas:', err)
        // Si hay error, continuar sin las actividades planificadas
      }

      let result = await db.allDocs({
        startkey: 'ejecucion:',
        endkey: 'ejecucion:\ufff0',
      })

      let respuesta: { actividad: any; ejecucion_id: string | undefined }[] = []
      if (result.rows) {
        _actividades_docs.forEach((actividad: any) => {
          let midoc = result.rows.find((doc) => doc.id.includes(actividad.uuid))
          respuesta.push({ actividad: actividad, ejecucion_id: midoc?.id })
        })

        // Ordenar por fecha
        respuesta.sort((a, b) => {
          let fecha_1_str = a.ejecucion_id
            ? a.ejecucion_id.split(':')[1]
            : a.actividad.tipo === 'nota'
              ? a.actividad.fecha
              : a.actividad.detalles?.fecha_ejecucion_tentativa

          let fecha_2_str = b.ejecucion_id
            ? b.ejecucion_id.split(':')[1]
            : b.actividad.tipo === 'nota'
              ? b.actividad.fecha
              : b.actividad.detalles?.fecha_ejecucion_tentativa

          // Validar que las fechas existan antes de parsear
          if (!fecha_1_str || !fecha_2_str) return 0

          try {
            let fecha_1 = parseISO(fecha_1_str as string)
            let fecha_2 = parseISO(fecha_2_str as string)
            return isBefore(fecha_1, fecha_2) ? 1 : -1
          } catch (e) {
            return 0
          }
        })
      }

      return respuesta ? respuesta : null
    } catch (error) {
      console.error('Error general en getActivities:', error)
      return null
    }
  }

  const gbl_docs_starting = async (
    key: string,
    devolver_docs: boolean = false,
    attachments: boolean = false,
    binary: boolean = false
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

  const only_docs = (alldocs: PouchDB.Core.AllDocsResponse<{}>) => {
    if (alldocs.rows.length > 0) {
      return alldocs.rows.map((row) => row.doc)
    } else {
      return []
    }
  }

  useEffect(() => {
    if (lot && lot.id) {
      getActivities(lot.id).then((res) => setActivities(res))
      dispatch(setLotActive(lot))
    }
  }, [lot, selectedCategory, dispatch])

  // La función handleEditActivity establece la categoría según el tipo de edición
  const handleEditActivity = (
    activity: Actividad,
    isExecuting = false,
    type = 'activity'
  ) => {
    switch (type) {
      case 'activity':
        setSelectedCategory(isExecuting ? 'executeActivity' : 'editActivity')
        break
      case 'note':
        setSelectedCategory('editNote')
        break
      case 'verifyActivity':
        setSelectedCategory('verifyActivity')
        break
      default:
        console.error('Invalid edit type')
        return
    }
    setEditingActivityInfo({ activity, isExecuting })
  }

  // Si el menú no está abierto, no se muestra nada:
  if (!isOpen) return null

  const { removeLotFromField } = useField()

  const handleDeleteLote = () => {
    Swal.fire({
      title: t('areYouSure'),
      text: t('cannotUndoAction'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('yesDelete'),
    }).then((result) => {
      if (result.isConfirmed) {
        removeLotFromField(field, lot).then(() => {
          Swal.fire({
            title: t('deleted'),
            text: t('lotHasBeenDeleted'),
            icon: 'success',
          })
          toggle()
        })
      }
    })
  }

  const handleEditLote = () => {
    navigate(`/init/overview/fields/edit-lot/${field._id}/${lot.id}`)
  }

  return (
    <>
      {/* <AssignCampaignsToActivities /> */}
      <Paper
        elevation={5}
        style={{
          position: 'fixed',
          top: '64px',
          height: 'calc(100vh - 64px)',
          width: '60vw',
          overflowY: 'auto',
          backgroundColor: '#fff',
          padding: '20px',
          zIndex: 1050,
          boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            marginBottom: '20px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <ActivitiesBar
              selectedCategory={selectedCategory}
              selectCategory={selectCategory}
              selectedCampaign={selectedCampaign}
              lot={lot}
              backUrl={backUrl}
            />
          </div>
          <div>
            {selectedCategory && (
              <IconButton
                aria-label={t('backToActivities')}
                onClick={backToActivites}
              >
                <ArrowBackIcon />
              </IconButton>
            )}

            {!selectedCategory && (
              <>
                <Tooltip title={t('editLot')} arrow placement="top">
                  <IconButton onClick={handleEditLote}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('deleteLot')} arrow placement="top">
                  <IconButton onClick={handleDeleteLote}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton aria-label={t('close')} onClick={toggle}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        <hr
          style={{
            border: '0',
            height: '1px',
            backgroundImage:
              'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))',
            margin: '20px 0',
          }}
        />

        <div>
          <LotMenuContent
            selectedCategory={selectedCategory}
            selectedCampaign={selectedCampaign}
            lot={lot}
            field={field}
            db={db}
            backToActivites={backToActivites}
            activities={activities}
            setActivities={setActivities}
            editingActivityInfo={editingActivityInfo}
            handleEditActivity={handleEditActivity}
          />
        </div>
      </Paper>
    </>
  )
}

export default LotsMenu
