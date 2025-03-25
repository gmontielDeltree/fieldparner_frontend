import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import { Box, Tabs, Tab, Menu, MenuItem, Chip } from '@mui/material'
import EventNoteIcon from '@mui/icons-material/EventNote'
import AgricultureIcon from '@mui/icons-material/Agriculture'
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
  // Ensure we have a consistent activity structure regardless of what was passed
  const activityData = activity?.actividad || activity;

  const db = dbContext.fields
  const [selectedTab, setSelectedTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [execution, setExecution] = useState(null)
  const open = Boolean(anchorEl)

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const response = await db.find({
          selector: { actividad_uuid: activityData?.uuid },
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

    if (activityData?.uuid) {
      fetchExecution()
    }
  }, [activityData?.uuid, db])

  const formattedDate = (date) =>
    date ? format(parseISO(date), 'PPPP', { locale: es }) : 'Fecha no definida'

  const formattedPlanificadaDate = formattedDate(
    activityData?.detalles?.fecha_ejecucion_tentativa,
  )

  const getCropInfo = () => {
    const crop = activityData?.detalles?.cultivo
    if (!crop) return null

    return {
      name: crop.descriptionES || crop.descriptionEN || crop.descriptionPT,
      type: crop.cropType,
    }
  }

  const cropInfo = getCropInfo()
  const activityType = activityData?.tipo?.toUpperCase() || 'ACTIVIDAD'
  const hectares = activityData?.detalles?.hectareas

  const handleComparisonReport = () => {
    if (!execution) {
      alert('Debe ejecutar primero para generar el informe!!!')
      return
    }
    ComparisonReportPdf(
      activityData,
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
            <EventNoteIcon
              sx={{ marginRight: '8px', color: complementaryColor }}
            />
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
                  Ejecutada: {formattedDate(execution.detalles.fecha_ejecucion)}
                </Typography>
              ) : (
                <Typography
                  sx={{ fontSize: 16, fontWeight: 'bold' }}
                  color="text.primary"
                >
                  Programada para: {formattedPlanificadaDate}
                </Typography>
              )}
            </Box>
          </Box>

          <ActivityActionsBar
            sx={{ marginLeft: '8px' }}
            onEditActivity={() => handleEditActivity(activityData)}
            onDeleteActivity={() =>
              handleDeleteActivity(activityData?._id)
            }
            onMeteo={() => alert('Proximamente - En Construcción')}
            onDownloadOT={() => handleDownloadPDF(activityData)}
            onRepeatOT={() => handleReplicateActivity()}
            onShareOT={() => alert('Proximamente - En Construcción')}
            onDownloadCompare={handleComparisonReport}
            disabledActions={{ edit: !!execution }}
          />
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditActivity(activityData)}>
          Editar {activityType}
        </MenuItem>
        <MenuItem onClick={() => handleReplicateActivity()}>
          Repetir Planificacion
        </MenuItem>
        <MenuItem onClick={() => handleDownloadPDF(activityData)}>
          Orden de Trabajo PDF
        </MenuItem>
        {execution && (
          <MenuItem onClick={handleComparisonReport}>
            Ejecución vs Planificación PDF
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteActivity(activityData?._id)}>
          Eliminar
        </MenuItem>
      </Menu>

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
          activity={activityData}
          backgroundColor={complementaryColor}
          showEstimatedApplicationDate={activityType !== 'APPLICATION'}
        />
      )}
      {selectedTab === 1 && (
        <LaborOrderContent
          activity={activityData}
          lotDoc={lotDoc}
          handleDownloadPDF={handleDownloadPDF}
          handleConfirmExecution={handleConfirmExecution}
        />
      )}
      {selectedTab === 2 && (
        <ExecutionContent
          activity={activityData}
          handleEditActivity={handleEditActivity}
        />
      )}
      {selectedTab === 3 && <AttachedContent />}
    </div>
  )
}

export default ActivityContent