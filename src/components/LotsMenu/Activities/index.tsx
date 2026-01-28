import React, { useState } from 'react'
import Activity from './Activity'
import SowingIcon from '../../../images/icons/sowing.png'
import HarvestIcon from '../../../images/icons/harvest.png'
import NoteIcon from '../../../images/icons/note.png'
import SoilAnalysisIcon from '../../../images/icons/ground-sample.png'
import ApplicationIcon from '../../../images/icons/application.png'
import PreparadoIcon from '../../../images/icons/preparation.png'
import Snackbar from '@mui/material/Snackbar'
import { Paper, Box, Chip } from '@mui/material'
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
  plannedActivitiesCount = 0,
}) => {
  const [userMessage, setUserMessage] = useState('')
  const db = dbContext.fields
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { t } = useTranslation();
  const { getOrderDetailByNumber, confirmAutomaticWithdrawalOrder } = useOrder();
  const { user } = useAppSelector((s) => s.auth)

  const handleSnackbarClose = (event: any, reason: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenSnackbar(false)
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
      <ModernHeader
        fieldDoc={fieldDoc}
        lotDoc={lotDoc}
        activitiesData={activitiesData}
      />
      {plannedActivitiesCount > 0 && (
        <Box
          sx={{
            border: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginTop: '-8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={t('Hay planificaciones pendientes de revisión')}
              variant="outlined"
              color="warning"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={plannedActivitiesCount}
              size="small"
              sx={{
                backgroundColor: '#fff7ed',
                color: '#9a3412',
                fontWeight: 700,
                border: '1px solid #fed7aa',
              }}
            />
          </Box>
        </Box>
      )}
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
      {activitiesData
        .filter((activityData) => {
          // Filtrar actividades planificadas (fantasma) - no mostrarlas en la lista
          const isPlanned = activityData?.actividad?.isPlanificada || activityData?.actividad?.estado === 'planificada'
          return !isPlanned
        })
        .map((activityData, index) => {
          const Icon = getIcon(activityData.actividad.tipo)
          const complementaryColor = getComplementaryColor(
            activityData.actividad.tipo,
          )

          return (
            <div key={index} style={{ position: 'relative' }}>
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