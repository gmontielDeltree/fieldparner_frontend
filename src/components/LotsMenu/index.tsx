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
import {
  getLotActivitiesWithCounts,
  invalidateLotActivitiesSnapshot,
} from '../../services/lotActivitiesSnapshot'

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
      invalidateLotActivitiesSnapshot()
      loadLotActivities(lot.id)
    }
  }

  const loadLotActivities = async (uuid_del_lote: string) => {
    try {
      const { activities: lotActivities, plannedActivitiesCount: plannedCount } =
        await getLotActivitiesWithCounts(uuid_del_lote, db)

      const respuesta = [...lotActivities]

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

      setPlannedActivitiesCount(plannedCount)
      setActivities(respuesta)
      return respuesta
    } catch (error) {
      console.error('Error general en getActivities:', error)
      setPlannedActivitiesCount(0)
      setActivities(null)
      return null
    }
  }

  useEffect(() => {
    if (lot && lot.id) {
      loadLotActivities(lot.id)
      dispatch(setLotActive(lot))
    }
  }, [lot, dispatch])

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
