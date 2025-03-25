import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import { Box, Tabs, Tab, Menu, MenuItem, Chip, Grid } from '@mui/material'
import EventNoteIcon from '@mui/icons-material/EventNote'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import ScienceIcon from '@mui/icons-material/Science'
import PlanificationContent from './TabsContent/Planification'
import LaborOrderContent from './TabsContent/LaborOrder'
import ExecutionContent from './TabsContent/Execution'
import AttachedContent from './TabsContent/Attached'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ComparisonReportPdf } from './helper'
import { dbContext } from '../../../../services'
import ActivityActionsBar from '../../components/ActivityActionsBar'

const ActivityContent = ({
  activity,
  fieldName,
  lotName,
  lotDoc,
  complementaryColor,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF,
  handleConfirmExecution,
  handleReplicateActivity,
}) => {
  const db = dbContext.fields
  const [selectedTab, setSelectedTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [execution, setExecution] = useState(null)
  const open = Boolean(anchorEl)

  // Determinar si es un análisis de suelo u otro tipo de actividad
  const isGroundSample = activity?.tipo === 'analisis_suelo'

  // Normalizar la estructura de datos para unificar acceso a propiedades
  const normalizedActivity = isGroundSample
    ? {
      uuid: activity?.uuid || activity?.id,
      tipo: activity?.tipo || 'analisis_suelo',
      detalles: {
        fecha_ejecucion_tentativa: activity?.fecha,
        hectareas: activity?.detalles?.hectareas || lotDoc?.properties?.hectareas || 0,
        // Otros campos específicos de muestras de suelo
        laboratorio: activity?.laboratorio,
        soilVariables: activity?.soilVariables,
        characteristics: activity?.characteristics
      }
    }
    : activity?.actividad || activity // Estructura normal de actividad

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const uuid = isGroundSample ? activity?.uuid || activity?.id : normalizedActivity.uuid

        if (!uuid) {
          setExecution(null)
          return
        }

        const response = await db.find({
          selector: { actividad_uuid: uuid },
        })

        if (response.docs.length > 0) {
          setExecution(response.docs[0])
        } else {
          setExecution(null)
        }
      } catch (error) {
        console.error('Error fetching executions:', error)
        setExecution(null)
      }
    }

    fetchExecution()
  }, [activity?.uuid, activity?.id, normalizedActivity?.uuid, db, isGroundSample])

  const formattedDate = (date) => {
    if (!date) return 'Fecha no definida'

    try {
      // Intentar formatear como ISO string
      if (typeof date === 'string' && date.includes('T')) {
        return format(parseISO(date), 'PPPP', { locale: es })
      }
      // Si es un objeto Date o timestamp
      return format(new Date(date), 'PPPP', { locale: es })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Fecha inválida'
    }
  }

  const formattedPlanificadaDate = formattedDate(
    normalizedActivity?.detalles?.fecha_ejecucion_tentativa || activity?.fecha
  )

  const getCropInfo = () => {
    const crop = normalizedActivity?.detalles?.cultivo
    if (!crop) return null

    return {
      name: crop.descriptionES || crop.descriptionEN || crop.descriptionPT,
      type: crop.cropType,
    }
  }

  const cropInfo = getCropInfo()
  const activityType = isGroundSample
    ? 'ANÁLISIS DE SUELO'
    : (normalizedActivity?.tipo || 'ACTIVIDAD').toUpperCase()

  const hectares = normalizedActivity?.detalles?.hectareas || 0

  const handleComparisonReport = () => {
    if (!execution) {
      alert('Debe ejecutar primero para generar el informe!!!')
      return
    }
    ComparisonReportPdf(
      normalizedActivity,
      execution,
      fieldName || lotDoc?.properties?.nombre,
      lotName || lotDoc?.properties?.nombre,
    )
  }

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          marginBottom: '12px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '4px',
            padding: '8px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {isGroundSample ? (
              <ScienceIcon
                sx={{ marginRight: '8px', color: complementaryColor }}
              />
            ) : (
              <EventNoteIcon
                sx={{ marginRight: '8px', color: complementaryColor }}
              />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
                color="text.secondary"
              >
                {activityType} en {hectares} has.
                {cropInfo && (
                  <Chip
                    icon={<AgricultureIcon />}
                    label={`${cropInfo.name} - ${cropInfo.type}`}
                    size="small"
                    sx={{
                      backgroundColor: complementaryColor,
                      color: 'white',
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                  />
                )}
              </Typography>
              {execution ? (
                <Typography
                  sx={{ fontSize: 16, fontWeight: 'bold' }}
                  color="green"
                >
                  Ejecutada: {formattedDate(execution.detalles?.fecha_ejecucion)}
                </Typography>
              ) : (
                <Typography
                  sx={{ fontSize: 16, fontWeight: 'bold' }}
                  color="text.primary"
                >
                  {isGroundSample
                    ? `Fecha de muestra: ${formattedPlanificadaDate}`
                    : `Programada para: ${formattedPlanificadaDate}`}
                </Typography>
              )}

              {isGroundSample && activity?.laboratorio && (
                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                  Laboratorio: {activity.laboratorio}
                </Typography>
              )}
            </Box>
          </Box>

          <ActivityActionsBar
            sx={{ marginLeft: '8px' }}
            onEditActivity={() => handleEditActivity(activity)}
            onDeleteActivity={() =>
              handleDeleteActivity(activity._id)
            }
            onMeteo={() => alert('Proximamente - En Construcción')}
            onDownloadOT={() => handleDownloadPDF(activity)}
            onRepeatOT={() => handleReplicateActivity()}
            onShareOT={() => alert('Proximamente - En Construcción')}
            onDownloadCompare={handleComparisonReport}
            disabledActions={{
              edit: !!execution,
              downloadCompare: isGroundSample // Deshabilitar comparación para muestras de suelo
            }}
          />
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditActivity(activity)}>
          Editar {activityType}
        </MenuItem>
        {!isGroundSample && (
          <MenuItem onClick={() => handleReplicateActivity()}>
            Repetir Planificacion
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDownloadPDF(activity)}>
          {isGroundSample ? 'Informe PDF' : 'Orden de Trabajo PDF'}
        </MenuItem>
        {execution && !isGroundSample && (
          <MenuItem onClick={handleComparisonReport}>
            Ejecución vs Planificación PDF
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteActivity(activity._id)}>
          Eliminar
        </MenuItem>
      </Menu>

      {isGroundSample ? (
        // Tabs para muestras de suelo
        <>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ marginBottom: '16px' }}
          >
            <Tab label="Laboratorio" />
            <Tab label="Características" />
            <Tab label="Variables" />
            <Tab label="Adjuntos" />
          </Tabs>

          {selectedTab === 0 && (
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                Información de Laboratorio
              </Typography>
              <Typography>
                <strong>Fecha de muestra:</strong> {formattedPlanificadaDate}
              </Typography>
              <Typography>
                <strong>Laboratorio:</strong> {activity.laboratorio || 'No especificado'}
              </Typography>
              <Typography>
                <strong>Referencia:</strong> {activity.refDocLab || 'No especificada'}
              </Typography>
              {activity.responsableTecnico && (
                <Typography>
                  <strong>Responsable técnico:</strong> {activity.responsableTecnico}
                  {activity.matricula && ` (Matrícula: ${activity.matricula})`}
                </Typography>
              )}
            </Box>
          )}

          {selectedTab === 1 && (
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                Características del Suelo
              </Typography>
              {activity.characteristics ? (
                <>
                  {activity.characteristics.profundidad && (
                    <Typography>
                      <strong>Profundidad:</strong> {activity.characteristics.profundidad} cm
                    </Typography>
                  )}
                  {activity.characteristics.caracterizacion1 && (
                    <Typography>
                      <strong>Caracterización 1:</strong> {activity.characteristics.caracterizacion1}
                    </Typography>
                  )}
                  {activity.characteristics.caracterizacion2 && (
                    <Typography>
                      <strong>Caracterización 2:</strong> {activity.characteristics.caracterizacion2}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography>No hay características registradas</Typography>
              )}
            </Box>
          )}

          {selectedTab === 2 && (
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                Variables del Suelo
              </Typography>
              {activity.soilVariables && Object.keys(activity.soilVariables).length > 0 ? (
                <Grid container spacing={2}>
                  {Object.entries(activity.soilVariables)
                    .filter(([key, value]) => value > 0)
                    .map(([key, value]) => (
                      <Grid item xs={6} sm={4} md={3} key={key}>
                        <Typography>
                          <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {value}
                        </Typography>
                      </Grid>
                    ))}
                </Grid>
              ) : (
                <Typography>No hay variables registradas</Typography>
              )}
            </Box>
          )}

          {selectedTab === 3 && (
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                Archivos Adjuntos
              </Typography>
              {activity.attachedFileId ? (
                <Typography>
                  Archivo adjunto ID: {activity.attachedFileId}
                </Typography>
              ) : (
                <Typography>No hay archivos adjuntos</Typography>
              )}
            </Box>
          )}
        </>
      ) : (
        // Tabs para actividades normales
        <>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ marginBottom: '16px' }}
          >
            <Tab label="Programa" />
            <Tab label="Orden de trabajo" />
            <Tab label="Ejecucion" />
            <Tab label="Adjuntos" />
          </Tabs>

          {selectedTab === 0 && (
            <PlanificationContent
              activity={normalizedActivity}
              backgroundColor={complementaryColor}
              showEstimatedApplicationDate={activityType !== 'APPLICATION'}
            />
          )}
          {selectedTab === 1 && (
            <LaborOrderContent
              activity={normalizedActivity}
              lotDoc={lotDoc}
              handleDownloadPDF={handleDownloadPDF}
              handleConfirmExecution={handleConfirmExecution}
            />
          )}
          {selectedTab === 2 && (
            <ExecutionContent
              activity={normalizedActivity}
              handleEditActivity={handleEditActivity}
            />
          )}
          {selectedTab === 3 && <AttachedContent />}
        </>
      )}
    </div>
  )
}

export default ActivityContent