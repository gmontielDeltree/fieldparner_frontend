import React, { useEffect, useState } from 'react'
import { Paper, IconButton, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import { useLocation, useNavigate } from 'react-router-dom'
import { dbContext } from '../../services'
import { styled } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useField } from '../../hooks'
import { setLotActive } from '../../redux/map'
import Swal from 'sweetalert2'
import { Actividad } from '../../interfaces/activity'
import { isBefore, parseISO } from 'date-fns'
import AssignCampaignsToActivities from './AssignCampaignsToActivities';
import LotMenuContent from './components/LotMenuContent'
import ActivitiesBar from './components/ActivitiesBar'

interface LotsMenuProps {
  lot: any
  field: any
  isOpen: () => void
  toggle: () => void
}

const LotsMenu: React.FC<LotsMenuProps> = ({ lot, field, isOpen, toggle }) => {
  const dispatch = useAppDispatch()
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null)
  const db = dbContext.fields
  const [activities, setActivities] = useState(null)
  const { t } = useTranslation()
  const [editingActivityInfo, setEditingActivityInfo] = useState<{
    activity: Actividad | null
    isExecuting: boolean
  }>({ activity: null, isExecuting: false })
  const selectedCampaign = useSelector(
    (state: RootState) => state.campaign.selectedCampaign,
  )

  const navigate = useNavigate()
  let location = useLocation()

  let backUrl = location.pathname

  const selectCategory = (categoryId: any) => {
    setSelectedCategory(categoryId)
  }

  const backToActivites = () => {
    setSelectedCategory(null)
    if (lot && lot.id) {
      getActivities(lot.id).then((res) => setActivities(res))
    }
  }

  const getActivities = async (uuid_del_lote: string) => {
    console.log('Starting getActivities for lot:', uuid_del_lote);
    
    let acts: Actividad[] = await gbl_docs_starting(
      'actividad',
      true,
      true,
      true,
    ).then(only_docs)
    console.log('All activities fetched:', acts);

    let s = acts.filter(({ lote_uuid }) => lote_uuid === uuid_del_lote)
    console.log('Filtered activities for this lot:', s);

    let _actividades_docs = s.reverse()
    console.log('Reversed activities:', _actividades_docs);

    let result = await db.allDocs({
      startkey: 'ejecucion:',
      endkey: 'ejecucion:\ufff0',
    })
    console.log('Execution documents:', result.rows);

    let respuesta: { actividad: Actividad; ejecucion_id: string }[] = []

    if (result.rows) {
      _actividades_docs.forEach((actividad) => {
        let midoc = result.rows.find((doc) => doc.id.includes(actividad.uuid))
        respuesta.push({ actividad: actividad, ejecucion_id: midoc?.id })
      })

      console.log('Activities with execution IDs:', respuesta);

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
      
      console.log('Final sorted activities:', respuesta);
    }

    return respuesta ? respuesta : null
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

  const only_docs = (alldocs: PouchDB.Core.AllDocsResponse<{}>) => {
    if (alldocs.rows.length > 0) {
      return alldocs.rows.map((row) => {
        return row.doc
      })
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

  const handleEditActivity = (
    activity: Actividad,
    isExecuting = false,
    type = 'activity',
  ) => {
    switch (type) {
      case 'activity':
        setSelectedCategory(isExecuting ? t('Execute Activity') : t('Edit Activity'))
        break
      case 'note':
        setSelectedCategory(t('Edit Note'))
        break
      default:
        console.error(t('Invalid edit type'))
        return
    }
    setEditingActivityInfo({ activity, isExecuting })
  }

  const hrStyle = {
    border: '0',
    height: '1px',
    backgroundImage:
      'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))',
    margin: '20px 0',
  }

  if (!isOpen) return null

  const { removeLotFromField } = useField()

  const handleDeleteLote = () => {
    Swal.fire({
      title: t('¿Esta seguro?'),
      text: t('No podrá revertir esta acción'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('Si, eliminar'),
    }).then((result) => {
      if (result.isConfirmed) {
        removeLotFromField(field, lot).then(() => {
          Swal.fire({
            title: t('Eliminado'),
            text: t('El lote ha sido eliminado'),
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
          {/* Reemplazamos la barra de categorías con el nuevo componente ActivitiesBar */}
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
              aria-label={t('back to activities')}
              onClick={backToActivites}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {!selectedCategory && (
            <>
              <Tooltip
                title={t('Editar Lote')}
                arrow
                placement="top"
                sx={{
                  tooltip: {
                    backgroundColor: '#333',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    fontSize: '1em',
                  },
                  arrow: {
                    color: '#333',
                  },
                }}
              >
                <IconButton onClick={handleEditLote}>
                  <EditIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={t('Eliminar Lote')}
                arrow
                placement="top"
                sx={{
                  tooltip: {
                    backgroundColor: '#333',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    fontSize: '1em',
                  },
                  arrow: {
                    color: '#333',
                  },
                }}
              >
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
      <hr style={hrStyle} />

      {/* <Header>
        <FieldInfo>Lote: {lot.properties.nombre}</FieldInfo>
        <FieldInfo>Campo: {field.nombre}</FieldInfo>
      </Header> */}
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