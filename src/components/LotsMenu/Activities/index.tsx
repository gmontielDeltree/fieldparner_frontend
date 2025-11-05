import React, { useMemo, useState } from 'react'
import Activity from './Activity'
import SowingIcon from '../../../images/icons/sowing.png'
import HarvestIcon from '../../../images/icons/harvest.png'
import NoteIcon from '../../../images/icons/note.png'
import SoilAnalysisIcon from '../../../images/icons/ground-sample.png'
import ApplicationIcon from '../../../images/icons/application.png'
import PreparadoIcon from '../../../images/icons/preparation.png'
import Snackbar from '@mui/material/Snackbar'
import { Paper, Checkbox, Button, Box, Chip } from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import './Activities.css'
import { styled } from '@mui/material/styles'
import { mapboxStaticImg } from '../../../utils/mapboxStaticImg'
import { googleMapsLinkGoTo } from '../../../utils/googleMapsLink'
import ordenDefinition from '../../../utils/ordenDefinition'
import { dbContext } from '../../../services'
import ModernHeader from './ModernHeader'
import { useTranslation } from "react-i18next";
import { useOrder, useAppSelector } from '../../../hooks'
import { saveActivity } from '../components/activityService'
import { WithdrawalOrder } from '@types'
import { getShortDate } from '../../../helpers/dates'

const Alert = styled(MuiAlert)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[5],
  '& .MuiAlert-icon': {
    fontSize: '1.5em',
  },
  '& .MuiAlert-message': {
    fontSize: '1em',
    fontWeight: 'bold',
  },
  '& .MuiAlert-action': {
    alignItems: 'center',
  },
}))

export const Activities = ({
  activitiesData,
  setActivitiesData,
  fieldDoc,
  lotDoc,
  handleEditActivity,
}) => {
  const [userMessage, setUserMessage] = useState('')
  const db = dbContext.fields
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { t } = useTranslation();
  const { getOrderDetailByNumber, confirmAutomaticWithdrawalOrder, createWithdrawalOrder } = useOrder();
  const { user } = useAppSelector((s) => s.auth)
  const { selectedCampaign } = useAppSelector((s) => s.campaign)

  const [selectedToConfirm, setSelectedToConfirm] = useState<string[]>([])

  const plannedActivities = useMemo(() =>
    (activitiesData || []).filter(a => a?.actividad?.isPlanificada || a?.actividad?.estado === 'planificada')
  , [activitiesData])

  const handleSnackbarClose = (event: any, reason: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnackbar(false)
  }

  const toggleSelect = (id: string) => {
    setSelectedToConfirm((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const confirmPlannedOne = async (activityWrapper: any) => {
    const existingActivity = activityWrapper.actividad
    const sourceData = existingActivity._originalPlanifData || existingActivity
    // Build actividad objeto como en verificationMode
    const actividad: any = {
      ...existingActivity,
      detalles: {
        ...(existingActivity.detalles || {}),
      },
    }
    actividad.isPlanificada = false
    actividad.estado = 'pendiente'
    // Generar nuevo _id y uuid ya existe
    try {
      const fecha = actividad.detalles.fecha_ejecucion_tentativa || sourceData.fecha
      const parsedDate = new Date(fecha)
      const formattedDate = format(parsedDate, 'yyyy-MM-dd')
      actividad._id = 'actividad:' + formattedDate + ':' + actividad.uuid
      delete actividad._rev
    } catch {}

    // Borrar planactividad + líneas
    try {
      if (existingActivity._id && existingActivity._id.startsWith('planactividad:')) {
        const currentDoc = await db.get(existingActivity._id)
        await db.remove(currentDoc)
        if (currentDoc.insumosLineasIds?.length) {
          const ins = await db.allDocs({ keys: currentDoc.insumosLineasIds, include_docs: true })
          for (const row of ins.rows) { if (row.doc) await db.remove(row.doc as any) }
        }
        if (currentDoc.laboresLineasIds?.length) {
          const lab = await db.allDocs({ keys: currentDoc.laboresLineasIds, include_docs: true })
          for (const row of lab.rows) { if (row.doc) await db.remove(row.doc as any) }
        }
      }
    } catch (e) { console.warn('Error removing planned doc', e) }

    // Guardar actividad normal con reserva
    await saveActivity(
      actividad,
      false,
      db,
      user,
      selectedCampaign,
      createWithdrawalOrder,
      () => {}
    )
  }

  const confirmPlannedBulk = async (ids: string[]) => {
    const target = (activitiesData || []).filter(a => ids.includes(a.actividad._id))
    let ok = 0, fail = 0
    for (const a of target) {
      try { await confirmPlannedOne(a); ok++ } catch { fail++ }
    }
    setUserMessage(fail > 0 ? t('completedWithErrors', { ok, fail }) : t('completedSuccessfully', { ok }))
    setSnackbarSeverity(fail > 0 ? 'warning' : 'success')
    setOpenSnackbar(true)
    setSelectedToConfirm([])
  }

  console.log('FIELD DOC:', activitiesData)
  const handleDeleteActivity = (activityId) => {
    db.get(activityId)
      .then((doc) => {
        return db.remove(doc)
      })
      .then(() => {
        setActivitiesData(
          activitiesData.filter(
            (activity) => activity.actividad._id !== activityId,
          ),
        )
        setUserMessage(t('activityDeletedSuccessfully'))
        setOpenSnackbar(true)
        setSnackbarSeverity('success')
      })
      .catch((error) => {
        console.error('Error deleting actividad:', error)
        setUserMessage(t('errorDeletingActivity'))
        setSnackbarSeverity('error')
      })
  }

  const updateActivityStateToCompleted = (activityId) => {
    db.get(activityId)
      .then((doc) => {
        doc.estado = 'completada'
        return db.put(doc)
      })
      .then(() => {
        console.log('Activity state updated to completed successfully.')
        setOpenSnackbar(true)
        setSnackbarSeverity('success')
      })
      .catch((error) => {
        console.error('Error updating activity state:', error)
        setUserMessage(t('errorUpdatingActivityState'))
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      })
  }
  
  const initConfirmWithdrawal = async (confirmOrder: WithdrawalOrder) => {
    //Buscamos la orden de retiro y sus insumos a retirar:
    const orderDetails = await getOrderDetailByNumber(confirmOrder.order);
    console.log("Detalles de la orden de retiro: ", orderDetails);
    if (!orderDetails || !orderDetails.withdrawalOrder || !orderDetails.suppliesOfTheOrder) {
      console.error("No se encontraron detalles para la orden de retiro.");
      setUserMessage(t('errorConfirmingActivity'));
      setSnackbarSeverity('error');
      return;
    }
    await confirmAutomaticWithdrawalOrder(orderDetails.withdrawalOrder, orderDetails.suppliesOfTheOrder, getShortDate());
  };

  const handleConfirmExecution = (activity) => {
    const withdrawalOrder = activitiesData[0]?.actividad?.detalles?.dosis[0]?.orden_de_retiro;
    console.log("orden de retiro a confirmar: ", withdrawalOrder);
    if (withdrawalOrder === undefined || withdrawalOrder === null) {
      console.error("No se encontró la orden de retiro.");
      return;
    }
    initConfirmWithdrawal(withdrawalOrder);
    let executionDetails = {
      detalles: {
        fecha_ejecucion: new Date().toISOString(),
      },
      actividad_uuid: activity.uuid,
      estado: 'ejecutada',
    }

    executionDetails._id =
      'ejecucion:' +
      executionDetails.detalles.fecha_ejecucion +
      ':' +
      executionDetails.actividad_uuid

    db.get(executionDetails._id)
      .then((doc) => {
        executionDetails._rev = doc._rev
        return db.put(executionDetails)
      })
      .catch((error) => {
        if (error.name === 'not_found') {
          delete executionDetails._rev
          db.put(executionDetails)
            .then(() => {
              setUserMessage(t('activityConfirmedSuccessfully'))
              setOpenSnackbar(true)
              setSnackbarSeverity('success')
            })
            .then(() => {
              console.log('updating activity state to completed', activity._id)
              updateActivityStateToCompleted(activity._id)
            })
            .catch((err) => {
              console.error('Error creating new document:', err)
              setUserMessage(t('errorConfirmingActivity'))
              setSnackbarSeverity('error')
            })
        } else {
          console.error('Error saving execution details:', error)
          setUserMessage(t('errorConfirmingActivity'))
          setSnackbarSeverity('error')
        }
      })
  }
  const FieldInfo = styled('div')(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: theme.palette.primary.contrastText,
  }))

  const Header = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
    borderRadius: '8px',
    margin: theme.spacing(2, 0),
  }))

  const handleDownloadPDF = (activity) => {
    // TODO: Cambiar esto a un POST a server de informes

    let campos_url = mapboxStaticImg(fieldDoc, lotDoc)

    let google_map_link = googleMapsLinkGoTo(lotDoc)

    let dd = ordenDefinition(
      activity,
      fieldDoc.nombre,
      lotDoc.properties.nombre,
      campos_url,
      google_map_link,
    )

    const pdf_fonts = {
      Roboto: {
        normal:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics:
          'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
      },
    }

    import('pdfmake/build/pdfmake.min.js')
      .then(({ default: pdfMake }) => {
        pdfMake.fonts = pdf_fonts
        pdfMake.createPdf(dd).open()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'preparado':
        return PreparadoIcon
      case 'siembra':
        return SowingIcon
      case 'cosecha':
        return HarvestIcon
      case 'nota':
        return NoteIcon
      case 'aplicacion':
        return ApplicationIcon
      case 'analisis_suelo':
        return SoilAnalysisIcon
      default:
        return null
    }
  }

  const getComplementaryColor = (tipo) => {
    switch (tipo) {
      case 'preparado':
        return '#67FFC7'
      case 'siembra':
        return '#FF7E67'
      case 'cosecha':
        return '#FFD567'
      case 'nota':
        return '#FFAB67'
      case 'aplicacion':
        return '#67D3FF'
      case 'analisis_suelo':
        return '#C767FF'
      default:
        return '#AAAAAA'
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        position: 'relative',
      }}
    >
      {plannedActivities.length > 0 && (
        <Box sx={{
          border: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '-8px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip color="warning" label={t('Hay actividades pendientes de confirmación')} />
              <span>({plannedActivities.length})</span>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" onClick={() => confirmPlannedBulk(plannedActivities.map(a => a.actividad._id))}>{t('Confirmar todas')}</Button>
              {selectedToConfirm.length > 0 && (
                <Button size="small" variant="contained" onClick={() => confirmPlannedBulk(selectedToConfirm)}>{t('Confirmar seleccionadas')} ({selectedToConfirm.length})</Button>
              )}
            </Box>
          </Box>
        </Box>
      )}
      <ModernHeader
        fieldDoc={fieldDoc}
        lotDoc={lotDoc}
        activitiesData={activitiesData}
      />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {userMessage}
        </Alert>
      </Snackbar>
      {activitiesData.map((activityData, index) => {
        const Icon = getIcon(activityData.actividad.tipo)
        const complementaryColor = getComplementaryColor(
          activityData.actividad.tipo,
        )

        const isPlanned = !!(activityData?.actividad?.isPlanificada || activityData?.actividad?.estado === 'planificada')
        return (
          <div key={index} style={{ position: 'relative' }}>
            {isPlanned && (
              <Checkbox
                checked={selectedToConfirm.includes(activityData.actividad._id)}
                onChange={() => toggleSelect(activityData.actividad._id)}
                sx={{ position: 'absolute', left: -8, top: -8 }}
              />
            )}
            <Activity
              activity={activityData}
              fieldDoc={fieldDoc}
              lotDoc={lotDoc}
              complementaryColor={complementaryColor}
              icon={Icon}
              handleDeleteActivity={handleDeleteActivity}
              handleEditActivity={handleEditActivity}
              handleDownloadPDF={handleDownloadPDF}
              handleConfirmExecution={handleConfirmExecution}
            />
          </div>
        )
      })}
    </div>
  )
}