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
import { es, enUS, pt } from 'date-fns/locale'
import { ComparisonReportPdf } from './helper'
import { dbContext } from '../../../../services'
import ActivityActionsBar from '../../components/ActivityActionsBar'
import { useTranslation } from 'react-i18next'

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
  const { t, i18n } = useTranslation();

  // Determine date-fns locale based on current language
  const getDateLocale = () => {
    const lang = i18n.language;
    if (lang.startsWith('es')) return es;
    if (lang.startsWith('pt')) return pt;
    return enUS; // Default to English
  };

  // Ensure we have a consistent activity structure regardless of what was passed
  const activityData = activity?.actividad || activity;

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
    if (!date) return t('dateNotDefined')

    try {
      // Get the current locale for date-fns
      const dateLocale = getDateLocale();

      // Intentar formatear como ISO string
      if (typeof date === 'string' && date.includes('T')) {
        return format(parseISO(date), 'PPPP', { locale: dateLocale })
      }
      // Si es un objeto Date o timestamp
      return format(new Date(date), 'PPPP', { locale: dateLocale })
    } catch (error) {
      console.error('Error formatting date:', error)
      return t('invalidDate')
    }
  }

  const formattedPlanificadaDate = formattedDate(
    normalizedActivity?.detalles?.fecha_ejecucion_tentativa || activity?.fecha
  )

  const getCropInfo = () => {
    const crop = normalizedActivity?.detalles?.cultivo
    if (!crop) return null;

    // Get the description based on current language
    let description;
    if (i18n.language.startsWith('es')) {
      description = crop.descriptionES;
    } else if (i18n.language.startsWith('pt')) {
      description = crop.descriptionPT;
    } else {
      description = crop.descriptionEN;
    }

    return {
      name: description || crop.descriptionES || crop.descriptionEN || crop.descriptionPT,
      type: crop.cropType,
    }
  }

  const cropInfo = getCropInfo()

  const getActivityTypeTranslation = (tipo) => {
    if (isGroundSample) return t('soilAnalysis').toUpperCase();

    // Map activity types to translation keys
    const typeToKey = {
      'preparado': 'tillage',
      'siembra': 'sowing',
      'aplicacion': 'application',
      'cosecha': 'harvesting',
      'nota': 'note'
    };

    const key = typeToKey[tipo.toLowerCase()] || 'activity';
    return t(key).toUpperCase();
  };

  const activityType = getActivityTypeTranslation(normalizedActivity?.tipo || 'activity');
  const hectares = normalizedActivity?.detalles?.hectareas || 0;

  const handleComparisonReport = () => {
    if (!execution) {
      alert(t('executeFirstForReport'));
      return;
    }
    ComparisonReportPdf(
      normalizedActivity,
      execution,
      fieldName || lotDoc?.properties?.nombre,
      lotName || lotDoc?.properties?.nombre,
    );
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
                {activityType} {t('on')} {hectares} {t('hectares')}
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
                  {t('executed')}: {formattedDate(execution.detalles?.fecha_ejecucion)}
                </Typography>
              ) : (
                <Typography
                  sx={{ fontSize: 16, fontWeight: 'bold' }}
                  color="text.primary"
                >
                  {isGroundSample
                    ? `${t('sampleDate')}: ${formattedPlanificadaDate}`
                    : `${t('scheduledFor')}: ${formattedPlanificadaDate}`}
                </Typography>
              )}

              {isGroundSample && activity?.laboratorio && (
                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                  {t('laboratory')}: {activity.laboratorio}
                </Typography>
              )}
            </Box>
          </Box>

          <ActivityActionsBar
            sx={{ marginLeft: '8px' }}
            onEditActivity={() => handleEditActivity(normalizedActivity)}
            onDeleteActivity={() => handleDeleteActivity(activity?.actividad?._id || activity?._id)}
            onMeteo={() => alert(t('comingSoon'))}
            onDownloadOT={() => handleDownloadPDF(activity)}
            onRepeatOT={() => handleReplicateActivity()}
            onShareOT={() => alert(t('comingSoon'))}
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
          {t('edit')} {activityType}
        </MenuItem>
        {!isGroundSample && (
          <MenuItem onClick={() => handleReplicateActivity()}>
            {t('repeatPlan')}
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDownloadPDF(activity)}>
          {isGroundSample ? t('pdfReport') : t('workOrderPdf')}
        </MenuItem>
        {execution && !isGroundSample && (
          <MenuItem onClick={handleComparisonReport}>
            {t('executionVsPlanningPdf')}
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteActivity(activity._id)}>
          {t('delete')}
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
            <Tab label={t('laboratory')} />
            <Tab label={t('characteristics')} />
            <Tab label={t('variables')} />
            <Tab label={t('attachments')} />
          </Tabs>

          {selectedTab === 0 && (
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                {t('laboratoryInformation')}
              </Typography>
              <Typography>
                <strong>{t('sampleDate')}:</strong> {formattedPlanificadaDate}
              </Typography>
              <Typography>
                <strong>{t('laboratory')}:</strong> {activity.laboratorio || t('notSpecified')}
              </Typography>
              <Typography>
                <strong>{t('reference')}:</strong> {activity.refDocLab || t('notSpecified')}
              </Typography>
              {activity.responsableTecnico && (
                <Typography>
                  <strong>{t('technicalResponsible')}:</strong> {activity.responsableTecnico}
                  {activity.matricula && ` (${t('registration')}: ${activity.matricula})`}
                </Typography>
              )}
            </Box>
          )}

          {selectedTab === 1 && (
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                {t('soilCharacteristics')}
              </Typography>
              {activity.characteristics ? (
                <>
                  {activity.characteristics.profundidad && (
                    <Typography>
                      <strong>{t('depth')}:</strong> {activity.characteristics.profundidad} cm
                    </Typography>
                  )}
                  {activity.characteristics.caracterizacion1 && (
                    <Typography>
                      <strong>{t('characterization')} 1:</strong> {activity.characteristics.caracterizacion1}
                    </Typography>
                  )}
                  {activity.characteristics.caracterizacion2 && (
                    <Typography>
                      <strong>{t('characterization')} 2:</strong> {activity.characteristics.caracterizacion2}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography>{t('noCharacteristicsRegistered')}</Typography>
              )}
            </Box>
          )}

          {selectedTab === 2 && (
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                {t('soilVariables')}
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
                <Typography>{t('noVariablesRegistered')}</Typography>
              )}
            </Box>
          )}

          {selectedTab === 3 && (
            <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                {t('attachedFiles')}
              </Typography>
              {activity.attachedFileId ? (
                <Typography>
                  {t('attachedFileId')}: {activity.attachedFileId}
                </Typography>
              ) : (
                <Typography>{t('noAttachedFiles')}</Typography>
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
            <Tab label={t('program')} />
            <Tab label={t('workOrder')} />
            <Tab label={t('execution')} />
            <Tab label={t('attachments')} />
          </Tabs>

          {selectedTab === 0 && (
            <PlanificationContent
              activity={normalizedActivity}
              backgroundColor={complementaryColor}
              showEstimatedApplicationDate={activityType !== 'APLICACIÓN'}
            />
          )}
          {selectedTab === 1 && (
            <LaborOrderContent
              activity={normalizedActivity}
              lotDoc={lotDoc}
              fieldName={fieldName}
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