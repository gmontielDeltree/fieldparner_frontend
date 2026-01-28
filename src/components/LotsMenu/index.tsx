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
  const [plannedActivitiesCount, setPlannedActivitiesCount] = useState<number>(0)
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

      // Contar actividades planificadas para el banner (sin cargarlas en la lista)
      try {
        let planificadasResponse = await gbl_docs_starting(
          'planactividad',
          true,
          true,
          true
        )
        let planificadas = only_docs(planificadasResponse) || []
        const count = planificadas.filter((doc: any) => doc && doc.loteId === uuid_del_lote).length
        setPlannedActivitiesCount(count)
      } catch (err) {
        console.log('Error contando actividades planificadas:', err)
        setPlannedActivitiesCount(0)
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
            plannedActivitiesCount={plannedActivitiesCount}
          />
        </div>
      </Paper>
    </>
  )
}

export default LotsMenu
