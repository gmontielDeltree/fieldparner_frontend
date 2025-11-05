import React, { useState, useEffect, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Button, Tooltip, Box, Chip } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import PreviewIcon from '@mui/icons-material/Preview'
import Note from './ActivityTypes/Note/Note'
import WeatherForecast from './../../WeatherForecast'
import ReplicateActivityMenu from './ReplicateActivityMenu'
import ActivityContent from './ActivityTypes/ActivityContent'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

function Activity({
  activity,
  fieldDoc,
  lotDoc,
  complementaryColor,
  icon,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF,
  handleConfirmExecution,
}) {
  const [gradientAngle, setGradientAngle] = useState(0)
  const [showReplicateActivityMenu, setShowReplicateActivityMenu] = useState(
    false,
  )
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Check if activity is planificada
  const isPlanificada = activity?.actividad?.isPlanificada || activity?.actividad?.estado === 'planificada'

  const executionDate = useMemo(() => {
    if (
      activity?.actividad?.detalles?.fecha_ejecucion_tentativa &&
      !isNaN(Date.parse(activity.actividad.detalles.fecha_ejecucion_tentativa))
    ) {
      return new Date(activity.actividad.detalles.fecha_ejecucion_tentativa)
    }
    return new Date()
  }, [activity?.actividad?.detalles?.fecha_ejecucion_tentativa])

  // LANZA DEMASIADOS RENDERIZADOS
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setGradientAngle((prevAngle) => (prevAngle + 1) % 360);
  //   }, 100);
  //   return () => clearInterval(interval);
  // }, []);

  const gradientBackground = isPlanificada
    ? `linear-gradient(${gradientAngle}deg, #e0e0e0 30%, #f5f5f5 100%)`
    : `linear-gradient(${gradientAngle}deg, ${complementaryColor} 30%, #f0f0f0 100%)`

  const cardStyle = {
    border: isPlanificada ? `2px dashed #9e9e9e` : `2px solid ${complementaryColor}`,
    borderRadius: '10px',
    minWidth: 275,
    width: '100%',
    backgroundImage: gradientBackground,
    boxShadow: isPlanificada ? '0 2px 4px 0 rgba(0,0,0,0.1)' : '0 4px 8px 0 rgba(0,0,0,0.2)',
    opacity: isPlanificada ? 0.8 : 1,
  }

  const handleReplicateActivity = () => {
    setShowReplicateActivityMenu(!showReplicateActivityMenu)
  }

  const handleVerifyPlanificada = () => {
    // Debug: Log the activity data structure
    console.log('🔍 VERIFY ACTIVITY DEBUG:', {
      fullActivity: activity,
      actividadData: activity.actividad,
      detalles: activity.actividad?.detalles,
      isPlanificada: activity.actividad?.isPlanificada,
      estado: activity.actividad?.estado,
      originalPlanifData: activity.actividad?._originalPlanifData,
      dosis: activity.actividad?.detalles?.dosis,
      servicios: activity.actividad?.detalles?.servicios,
      cultivo: activity.actividad?.detalles?.cultivo,
      contratista: activity.actividad?.detalles?.contratista
    });

    // Use the same pattern as edit activity but with a special type for verification
    handleEditActivity(activity.actividad, false, 'verifyActivity')
  }

  const renderActivityContent = () => {
    switch (activity.actividad.tipo) {
      case 'preparado':
        return (
          <ActivityContent
            activity={activity}
            fieldName={fieldDoc.nombre}
            lotName={lotDoc.properties.nombre}
            lotDoc={lotDoc}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
            handleDownloadPDF={handleDownloadPDF}
            handleConfirmExecution={handleConfirmExecution}
            handleReplicateActivity={handleReplicateActivity}
          />
        )

      case 'siembra':
        return (
          <ActivityContent
            activity={activity}
            fieldName={fieldDoc.nombre}
            lotName={lotDoc.properties.nombre}
            lotDoc={lotDoc}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
            handleDownloadPDF={handleDownloadPDF}
            handleConfirmExecution={handleConfirmExecution}
            handleReplicateActivity={handleReplicateActivity}
          />
        )
      case 'cosecha':
        return (
          <ActivityContent
            activity={activity}
            lotDoc={lotDoc}
            fieldName={fieldDoc.nombre}
            lotName={lotDoc.properties.nombre}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
            handleDownloadPDF={handleDownloadPDF}
            handleConfirmExecution={handleConfirmExecution}
            handleReplicateActivity={handleReplicateActivity}
          />
        )
      case 'nota':
        return (
          <Note
            activity={activity}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
          />
        )
      case 'aplicacion':
        return (
          <ActivityContent
            activity={activity}
            fieldName={fieldDoc.nombre}
            lotName={lotDoc.properties.nombre}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
            handleDownloadPDF={handleDownloadPDF}
            handleConfirmExecution={handleConfirmExecution}
            handleReplicateActivity={handleReplicateActivity}
            lotDoc={lotDoc}
          />
        )
      case 'analisis_suelo':
        return (
          <ActivityContent
            activity={activity.actividad}
            fieldName={fieldDoc.nombre}
            lotName={lotDoc.properties.nombre}
            lotDoc={lotDoc}
            complementaryColor={complementaryColor}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
            handleDownloadPDF={handleDownloadPDF}
            handleConfirmExecution={handleConfirmExecution}
            handleReplicateActivity={handleReplicateActivity}
          />
        )

      default:
        return <Typography>Unknown Activity Type</Typography>
    }
  }

  return (
    <div
      style={{ display: 'flex', marginBottom: '32px', position: 'relative' }}
    >
      <div style={{ marginRight: '8px', position: 'relative', zIndex: 2 }}>
        {icon && (
          <img
            src={icon}
            alt={activity.actividad.tipo}
            style={{
              height: '40px',
              width: '40px',
              transition: 'transform 0.3s ease, filter 0.3s ease',
              filter: isPlanificada
                ? `grayscale(100%) drop-shadow(2px 4px 6px #9e9e9e)`
                : `drop-shadow(2px 4px 6px ${complementaryColor})`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'rotate(20deg)'
              e.currentTarget.style.filter = isPlanificada
                ? `grayscale(100%) drop-shadow(2px 4px 6px #9e9e9e)`
                : `drop-shadow(2px 4px 6px ${complementaryColor})`
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg)'
              e.currentTarget.style.filter = isPlanificada
                ? `grayscale(100%) drop-shadow(2px 4px 6px #9e9e9e)`
                : `drop-shadow(2px 4px 6px ${complementaryColor})`
            }}
          />
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '20px',
          bottom: '-32px',
          width: '2px',
          background: isPlanificada
            ? 'linear-gradient(to bottom, #9e9e9e 0%, #bdbdbd 100%)'
            : 'linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%)',
          zIndex: 1,
        }}
      ></div>
      <Card sx={{
        ...cardStyle,
        ...(isPlanificada ? { filter: 'grayscale(0.7)', opacity: 0.9 } : {}),
      }}>
        <CardContent>
          {isPlanificada && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                icon={<PreviewIcon />}
                label={t('Actividad Planificada')}
                color="default"
                variant="outlined"
                size="small"
              />
              <Tooltip title={t('Confirmá para reservar stock y dejarla lista para ejecutar')}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<VerifiedIcon />}
                  onClick={handleVerifyPlanificada}
                  sx={{
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  {t('Confirmar planificación')}
                </Button>
              </Tooltip>
            </Box>
          )}
          {showReplicateActivityMenu ? (
            <ReplicateActivityMenu
              originalActivity={activity.actividad}
              handleReplicateActivity={handleReplicateActivity}
            />
          ) : (
            <>
              {renderActivityContent()}
              <WeatherForecast date={executionDate} />{' '}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(Activity)
