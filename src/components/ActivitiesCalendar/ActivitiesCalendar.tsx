import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Badge,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Close,
  LocalFlorist,
  Grass,
  Agriculture,
  Landscape,
  Event,
  FilterList,
} from '@mui/icons-material'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isValid } from 'date-fns'
import { es, enUS, ptBR } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../hooks'
import { dbContext } from '../../services'

interface Activity {
  _id: string
  tipo: string
  detalles?: {
    fecha_ejecucion_tentativa?: string
    cultivo?: any
    hectareas?: number
    contratista?: any
    servicios?: any[]
    dosis?: any[]
    observaciones?: string
  }
  lote_uuid?: string
  loteUuid?: string
  estado?: string
  isPlanificada?: boolean
  condiciones?: {
    temperatura_min?: number
    temperatura_max?: number
    humedad_min?: number
    humedad_max?: number
    velocidad_min?: number
    velocidad_max?: number
  }
  // Added field/lot information
  fieldInfo?: {
    fieldName?: string
    lotName?: string
  }
}

interface ActivitiesCalendarProps {
  campaignId?: string
  onClose?: () => void
}

const activityIcons = {
  siembra: <LocalFlorist />,
  aplicacion: <Grass />,
  cosecha: <Agriculture />,
  preparado: <Landscape />,
}

const activityColors = {
  siembra: '#10b981',
  aplicacion: '#3b82f6',
  cosecha: '#f59e0b',
  preparado: '#6b7280',
}

const ActivitiesCalendar: React.FC<ActivitiesCalendarProps> = ({ campaignId, onClose }) => {
  const theme = useTheme()
  const { t, i18n } = useTranslation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lotsMap, setLotsMap] = useState<Map<string, any>>(new Map())
  const [fieldsMap, setFieldsMap] = useState<Map<string, any>>(new Map())
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([])
  const [fieldsWithActivities, setFieldsWithActivities] = useState<Map<string, string>>(new Map())

  const selectedCampaign = useAppSelector((state) => state.campaign.selectedCampaign)
  const effectiveCampaignId = campaignId || selectedCampaign?._id

  const locale = i18n.language === 'es' ? es : i18n.language === 'pt' ? ptBR : enUS

  useEffect(() => {
    loadFieldsAndLots()
    loadActivities()
  }, [effectiveCampaignId])

  // Reload activities when fields and lots are loaded
  useEffect(() => {
    if (fieldsMap.size > 0 || lotsMap.size > 0) {
      loadActivities()
    }
  }, [fieldsMap, lotsMap])

  // Listen for database changes to reload activities
  useEffect(() => {
    const db = dbContext.fields

    const changesHandler = db.changes({
      since: 'now',
      live: true,
      include_docs: false
    }).on('change', (change) => {
      // Reload when activities or campos are modified
      if (change.id.startsWith('actividad:') ||
          change.id.startsWith('planactividad:') ||
          change.id.startsWith('campos_')) {
        console.log('Database change detected, reloading...')
        loadFieldsAndLots()
        loadActivities()
      }
    })

    return () => {
      changesHandler.cancel()
    }
  }, [effectiveCampaignId])

  const loadFieldsAndLots = async () => {
    try {
      const db = dbContext.fields

      // Load campos (fields) with their lotes
      const camposResult = await db.allDocs({
        include_docs: true,
        startkey: 'campos_',
        endkey: 'campos_\ufff0'
      })

      console.log('Campos loaded:', camposResult.rows.length, 'campos')
      const newFieldsMap = new Map()
      const newLotsMap = new Map()

      // Process campos and extract lotes
      camposResult.rows.forEach(row => {
        if (row.doc) {
          const campo = row.doc as any
          console.log('Processing campo:', campo._id, campo.nombre || campo.properties?.nombre || campo.name)
          newFieldsMap.set(campo._id, campo)

          // Extract lotes from campo
          if (campo.lotes && Array.isArray(campo.lotes)) {
            console.log(`Campo ${campo._id} has ${campo.lotes.length} lotes`)
            campo.lotes.forEach((lote: any) => {
              if (lote.properties?.uuid) {
                // Store lote with reference to its campo
                newLotsMap.set(lote.properties.uuid, {
                  ...lote,
                  campoId: campo._id,
                  campoName: campo.nombre || campo.properties?.nombre || campo.name || campo._id
                })
                console.log('Added lote:', lote.properties.uuid, 'from campo:', campo.nombre || campo.properties?.nombre || campo.name)
              }
            })
          }
        }
      })

      console.log('Total lotes in map:', newLotsMap.size)
      setFieldsMap(newFieldsMap)
      setLotsMap(newLotsMap)
    } catch (error) {
      console.error('Error loading fields and lots:', error)
    }
  }

  const loadActivities = async () => {
    if (!effectiveCampaignId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const db = dbContext.fields
      
      // Load regular activities
      const regularActivitiesResult = await db.allDocs({
        include_docs: true,
        startkey: 'actividad:',
        endkey: 'actividad:\ufff0'
      })

      // Load planned activities
      const plannedActivitiesResult = await db.allDocs({
        include_docs: true,
        startkey: 'planactividad:',
        endkey: 'planactividad:\ufff0'
      })

      const allActivities: Activity[] = []

      // Process regular activities
      console.log('Processing regular activities:', regularActivitiesResult.rows.length, 'total')
      console.log('Campaign filter - ID:', effectiveCampaignId, 'Name:', selectedCampaign?.name)

      regularActivitiesResult.rows.forEach((row) => {
        const doc = row.doc as any
        if (doc) {
          // Check if activity matches current campaign by ID or name
          const matchesCampaign = doc.campaña?.campaignId === effectiveCampaignId ||
                                 doc.campaña?.campaignId === selectedCampaign?.name ||
                                 doc.campaña?.name === selectedCampaign?.name

          console.log('Activity:', {
            id: doc._id,
            tipo: doc.tipo,
            campaignId: doc.campaña?.campaignId,
            campaignName: doc.campaña?.name,
            expectedCampaignId: effectiveCampaignId,
            expectedCampaignName: selectedCampaign?.name,
            matches: matchesCampaign,
            lote_uuid: doc.lote_uuid || doc.loteUuid,
            fecha: doc.detalles?.fecha_ejecucion_tentativa
          })
        }

        // Match by campaign ID or campaign name
        const matchesCampaign = doc && (
          doc.campaña?.campaignId === effectiveCampaignId ||
          doc.campaña?.campaignId === selectedCampaign?.name ||
          doc.campaña?.name === selectedCampaign?.name
        )

        if (matchesCampaign) {
          // Get lot and field information
          const lotId = doc.lote_uuid || doc.loteUuid
          let fieldInfo = {
            fieldName: '',
            lotName: ''
          }

          // Try to get lot info
          if (lotId) {
            // Lots are stored by UUID
            const lot = lotsMap.get(lotId)
            console.log('Looking for lot:', lotId, 'found:', !!lot)

            if (lot) {
              // Get lot name from properties
              fieldInfo.lotName = lot.properties?.nombre || lot.properties?.name || ''

              // Campo name was stored when we processed the data
              fieldInfo.fieldName = lot.campoName || ''
              console.log('Field info for activity:', fieldInfo)
            }
          }

          allActivities.push({
            ...doc,
            fieldInfo
          })
        }
      })

      // Process planned activities
      console.log('Processing planned activities:', plannedActivitiesResult.rows.length, 'total')
      plannedActivitiesResult.rows.forEach((row) => {
        const doc = row.doc as any

        // Match by campaign ID or campaign name for planned activities
        const matchesCampaign = doc && (
          doc.campanaId === effectiveCampaignId ||
          doc.campanaId === selectedCampaign?.name ||
          doc.campaña?.campaignId === effectiveCampaignId ||
          doc.campaña?.campaignId === selectedCampaign?.name ||
          doc.campaña?.name === selectedCampaign?.name
        )

        if (matchesCampaign) {
          // Get lot and field information
          const lotId = doc.loteUuid || doc.lote_uuid
          let fieldInfo = {
            fieldName: '',
            lotName: ''
          }

          // Try to get lot info
          if (lotId) {
            // Lots are stored by UUID
            const lot = lotsMap.get(lotId)

            if (lot) {
              // Get lot name from properties
              fieldInfo.lotName = lot.properties?.nombre || lot.properties?.name || ''

              // Campo name was stored when we processed the data
              fieldInfo.fieldName = lot.campoName || ''
            }
          }

          allActivities.push({
            ...doc,
            isPlanificada: true,
            detalles: {
              fecha_ejecucion_tentativa: doc.fecha,
              cultivo: doc.cultivo,
              hectareas: doc.area,
            },
            fieldInfo
          })
        }
      })

      console.log('Total activities loaded:', allActivities.length)
      console.log('Activities summary:', allActivities.map(a => ({
        tipo: a.tipo,
        fecha: a.detalles?.fecha_ejecucion_tentativa,
        field: a.fieldInfo?.fieldName,
        lot: a.fieldInfo?.lotName
      })))

      setActivities(allActivities)

      // Identify fields with activities in current month view
      const fieldsSet = new Map<string, string>()
      allActivities.forEach(activity => {
        // Only count if activity has a valid date
        const activityDateStr = activity.detalles?.fecha_ejecucion_tentativa
        if (!activityDateStr) return

        try {
          const activityDate = parseISO(activityDateStr)
          if (!isValid(activityDate)) return

          // Get the campo ID from the lot
          const lotId = activity.lote_uuid || activity.loteUuid
          if (lotId) {
            const lot = lotsMap.get(lotId)
            if (lot?.campoId && lot?.campoName) {
              fieldsSet.set(lot.campoId, lot.campoName)
            }
          }
        } catch {
          // Invalid date, skip
        }
      })
      setFieldsWithActivities(fieldsSet)

      // Initially select all fields
      setSelectedFieldIds(Array.from(fieldsSet.keys()))
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (date: Date, dayActivities: Activity[]) => {
    setSelectedDate(date)
    setSelectedActivities(dayActivities)
    setDialogOpen(true)
  }

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDateStr = activity.detalles?.fecha_ejecucion_tentativa
      if (!activityDateStr) return false

      // Check if activity belongs to a selected field
      const lotId = activity.lote_uuid || activity.loteUuid
      if (lotId && selectedFieldIds.length > 0) {
        const lot = lotsMap.get(lotId)
        if (lot?.campoId && !selectedFieldIds.includes(lot.campoId)) {
          return false
        }
      }

      try {
        const activityDate = parseISO(activityDateStr)
        return isValid(activityDate) && isSameDay(activityDate, date)
      } catch {
        return false
      }
    })
  }

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Add empty cells for alignment
    const startDayOfWeek = monthStart.getDay()
    const emptyCells = Array(startDayOfWeek).fill(null)

    return (
      <Grid container spacing={1}>
        {/* Week headers */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <Grid item xs={12 / 7} key={day}>
            <Typography
              variant="caption"
              align="center"
              display="block"
              fontWeight="bold"
              color="text.secondary"
            >
              {day}
            </Typography>
          </Grid>
        ))}
        
        {/* Empty cells */}
        {emptyCells.map((_, index) => (
          <Grid item xs={12 / 7} key={`empty-${index}`}>
            <Box sx={{ height: 80 }} />
          </Grid>
        ))}
        
        {/* Calendar days */}
        {days.map((day) => {
          const dayActivities = getActivitiesForDate(day)
          const hasActivities = dayActivities.length > 0
          
          return (
            <Grid item xs={12 / 7} key={day.toISOString()}>
              <Paper
                elevation={hasActivities ? 2 : 0}
                sx={{
                  height: 80,
                  p: 0.5,
                  cursor: hasActivities ? 'pointer' : 'default',
                  backgroundColor: hasActivities ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s',
                  '&:hover': hasActivities ? {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  } : {},
                }}
                onClick={() => hasActivities && handleDateClick(day, dayActivities)}
              >
                <Typography variant="caption" fontWeight={hasActivities ? 'bold' : 'normal'}>
                  {format(day, 'd')}
                </Typography>
                
                {hasActivities && (
                  <Box sx={{ mt: 0.5, position: 'relative' }}>
                    {dayActivities.length > 1 && (
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -4,
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          borderRadius: '10px',
                          px: 0.5,
                          fontSize: '10px',
                          fontWeight: 'bold',
                          minWidth: '16px',
                          textAlign: 'center',
                        }}
                      >
                        {dayActivities.length}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {[...new Set(dayActivities.map(a => a.tipo))].slice(0, 3).map((tipo, index) => (
                        <Tooltip
                          key={tipo}
                          title={
                            <Box>
                              <Typography variant="caption">{getActivityTranslation(tipo)}</Typography>
                              {dayActivities
                                .filter(a => a.tipo === tipo)
                                .slice(0, 2)
                                .map((act, i) => (
                                  <Typography key={i} variant="caption" display="block" fontSize="10px">
                                    {act.fieldInfo?.fieldName && act.fieldInfo?.lotName
                                      ? `${act.fieldInfo.fieldName} - ${act.fieldInfo.lotName}`
                                      : act.fieldInfo?.lotName || t('noFieldSpecified')}
                                  </Typography>
                                ))}
                              {dayActivities.filter(a => a.tipo === tipo).length > 2 && (
                                <Typography variant="caption" fontSize="10px">
                                  +{dayActivities.filter(a => a.tipo === tipo).length - 2} más
                                </Typography>
                              )}
                            </Box>
                          }
                          placement="top"
                          arrow
                        >
                          <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                            {React.cloneElement(activityIcons[tipo] || <Event />, {
                              sx: {
                                fontSize: 20,
                                color: activityColors[tipo] || '#9ca3af',
                                opacity: 0.9,
                              }
                            })}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    )
  }

  const getActivityTranslation = (tipo: string) => {
    const translations = {
      siembra: t('sowing'),
      aplicacion: t('application'),
      cosecha: t('harvesting'),
      preparado: t('preparation'),
    }
    return translations[tipo] || tipo
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Event sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Calendario de Actividades
            </Typography>
            {selectedCampaign && (
              <Typography variant="caption">
                {selectedCampaign.nombreComercial || selectedCampaign.name}
              </Typography>
            )}
          </Box>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Field Filter */}
      {fieldsWithActivities.size > 0 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.grey[100], 0.5),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
              Filtrar por Campo:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.from(fieldsWithActivities.entries()).map(([fieldId, fieldName]) => (
                <Chip
                  key={fieldId}
                  label={fieldName}
                  onClick={() => {
                    setSelectedFieldIds(prev => {
                      if (prev.includes(fieldId)) {
                        // If removing this field and it's the last one, don't allow
                        if (prev.length === 1) return prev
                        return prev.filter(id => id !== fieldId)
                      } else {
                        return [...prev, fieldId]
                      }
                    })
                  }}
                  variant={selectedFieldIds.includes(fieldId) ? "filled" : "outlined"}
                  color={selectedFieldIds.includes(fieldId) ? "primary" : "default"}
                  sx={{
                    fontWeight: selectedFieldIds.includes(fieldId) ? 600 : 400,
                    '&:hover': {
                      backgroundColor: selectedFieldIds.includes(fieldId)
                        ? theme.palette.primary.dark
                        : alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                />
              ))}
              {selectedFieldIds.length < fieldsWithActivities.size && (
                <Chip
                  label="Ver todos"
                  onClick={() => setSelectedFieldIds(Array.from(fieldsWithActivities.keys()))}
                  variant="outlined"
                  color="secondary"
                  sx={{ fontStyle: 'italic' }}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Calendar Navigation */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton onClick={handlePreviousMonth}>
          <ChevronLeft />
        </IconButton>

        <Typography variant="h6" fontWeight="bold">
          {format(currentDate, 'MMMM yyyy', { locale })}
        </Typography>

        <IconButton onClick={handleNextMonth}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>{t('loading')}...</Typography>
          </Box>
        ) : (
          renderCalendarDays()
        )}
      </Box>

      {/* Activity Legend */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(activityColors).map(([tipo, color]) => (
            <Chip
              key={tipo}
              icon={activityIcons[tipo]}
              label={getActivityTranslation(tipo)}
              size="small"
              sx={{
                backgroundColor: alpha(color, 0.1),
                color: color,
                '& .MuiChip-icon': { color },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Activities Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Event sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Actividades del día
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {selectedDate && format(selectedDate, 'EEEE, dd MMMM yyyy', { locale })}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {selectedActivities.map((activity, index) => (
              <React.Fragment key={activity._id}>
                <ListItem
                  sx={{
                    p: 3,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: alpha(activityColors[activity.tipo] || '#9ca3af', 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {React.cloneElement(activityIcons[activity.tipo] || <Event />, {
                          sx: { fontSize: 28, color: activityColors[activity.tipo] || '#9ca3af' }
                        })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {getActivityTranslation(activity.tipo)}
                          </Typography>
                          {activity.isPlanificada && (
                            <Chip label={t('planned')} size="small" color="info" variant="outlined" />
                          )}
                          {activity.estado && (
                            <Chip
                              label={activity.estado}
                              size="small"
                              color={activity.estado === 'completada' ? 'success' : 'default'}
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {/* Field and Lot information */}
                        {(activity.fieldInfo?.fieldName || activity.fieldInfo?.lotName) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              📍
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {activity.fieldInfo.fieldName && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Campo:</strong> {activity.fieldInfo.fieldName}
                                </Typography>
                              )}
                              {activity.fieldInfo.fieldName && activity.fieldInfo.lotName && (
                                <Typography variant="body2" color="text.secondary">•</Typography>
                              )}
                              {activity.fieldInfo.lotName && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Lote:</strong> {activity.fieldInfo.lotName}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Details Grid */}
                    <Grid container spacing={2}>
                      {/* Basic Info */}
                      <Grid item xs={12} md={6}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.grey[100], 0.5),
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Información General
                          </Typography>
                          {activity.detalles?.cultivo?.comercialName && (
                            <Typography variant="body2" gutterBottom>
                              <strong>{t('crop')}:</strong> {activity.detalles.cultivo.comercialName}
                            </Typography>
                          )}
                          {activity.detalles?.hectareas && (
                            <Typography variant="body2" gutterBottom>
                              <strong>{t('hectares')}:</strong> {activity.detalles.hectareas} ha
                            </Typography>
                          )}
                          {activity.detalles?.contratista && (
                            <Typography variant="body2" gutterBottom>
                              <strong>{t('contractor')}:</strong> {
                                activity.detalles.contratista.nombreCompleto || 
                                activity.detalles.contratista.razonSocial || 
                                'N/A'
                              }
                            </Typography>
                          )}
                        </Paper>
                      </Grid>

                      {/* Conditions */}
                      {activity.condiciones && (
                        <Grid item xs={12} md={6}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.grey[100], 0.5),
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              {t('conditions')}
                            </Typography>
                            {activity.condiciones.temperatura_min !== undefined && (
                              <Typography variant="body2" gutterBottom>
                                <strong>Temperatura:</strong> {activity.condiciones.temperatura_min}°C - {activity.condiciones.temperatura_max}°C
                              </Typography>
                            )}
                            {activity.condiciones.humedad_min !== undefined && (
                              <Typography variant="body2" gutterBottom>
                                <strong>Humedad:</strong> {activity.condiciones.humedad_min}% - {activity.condiciones.humedad_max}%
                              </Typography>
                            )}
                            {activity.condiciones.velocidad_min !== undefined && (
                              <Typography variant="body2" gutterBottom>
                                <strong>Velocidad del viento:</strong> {activity.condiciones.velocidad_min} - {activity.condiciones.velocidad_max} km/h
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      )}

                      {/* Supplies */}
                      {activity.detalles?.dosis && activity.detalles.dosis.length > 0 && (
                        <Grid item xs={12}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.grey[100], 0.5),
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Insumos
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {activity.detalles.dosis.map((dosis, i) => {
                                const insumoName = typeof dosis.insumo === 'object' 
                                  ? (dosis.insumo?.nombre || dosis.insumo?.comercialName || 'Insumo sin nombre') 
                                  : String(dosis.insumo || 'N/A');
                                const dosisAmount = dosis.dosis || 0;
                                const unit = typeof dosis.insumo === 'object' 
                                  ? (dosis.insumo?.unidad || dosis.insumo?.unit || '') 
                                  : '';
                                const totalAmount = dosis.total || (dosisAmount * (activity.detalles?.hectareas || 0));
                                const total = Number(totalAmount) || 0;
                                
                                return (
                                  <Box key={i} sx={{ mb: 1.5, pl: 2 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                      • {insumoName}
                                    </Typography>
                                    <Box sx={{ pl: 2, mt: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Dosis: {dosisAmount} {unit} {unit ? 'por hectárea' : ''}
                                      </Typography>
                                      {total > 0 && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Total: {total.toFixed(2)} {unit}
                                        </Typography>
                                      )}
                                      {dosis.precio_estimado && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Precio estimado: ${dosis.precio_estimado}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Paper>
                        </Grid>
                      )}

                      {/* Services */}
                      {activity.detalles?.servicios && activity.detalles.servicios.length > 0 && (
                        <Grid item xs={12}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.grey[100], 0.5),
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Servicios
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {activity.detalles.servicios.map((servicio, i) => {
                                let serviceName = 'N/A';
                                let cost = 0;
                                let contractor = null;
                                let comment = '';
                                
                                // Extract service name
                                if (typeof servicio === 'string') {
                                  serviceName = servicio;
                                } else if (servicio.servicio) {
                                  if (typeof servicio.servicio === 'string') {
                                    serviceName = servicio.servicio;
                                  } else if (typeof servicio.servicio === 'object') {
                                    serviceName = servicio.servicio.service || servicio.servicio.description || servicio.servicio.nombre || 'Servicio';
                                  }
                                } else if (servicio.laborNombre) {
                                  serviceName = servicio.laborNombre;
                                } else if (servicio.service) {
                                  if (typeof servicio.service === 'string') {
                                    serviceName = servicio.service;
                                  } else if (typeof servicio.service === 'object') {
                                    serviceName = servicio.service.service || servicio.service.description || 'Servicio';
                                  }
                                }
                                
                                // Extract other fields
                                cost = servicio.costo_total || servicio.totalCosto || servicio.cost || 0;
                                contractor = servicio.contratista;
                                comment = servicio.comentario || '';
                                
                                return (
                                  <Box key={i} sx={{ mb: 1.5, pl: 2 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                      • {String(serviceName)}
                                    </Typography>
                                    <Box sx={{ pl: 2, mt: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Costo total: ${String(cost)}
                                      </Typography>
                                      {contractor && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Contratista: {typeof contractor === 'object' 
                                            ? (contractor.nombreCompleto || contractor.razonSocial || 'N/A') 
                                            : String(contractor)}
                                        </Typography>
                                      )}
                                      {comment && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Comentario: {comment}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Paper>
                        </Grid>
                      )}

                      {/* Observations */}
                      {activity.detalles?.observaciones && (
                        <Grid item xs={12}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.info.main, 0.05),
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              {t('observations')}
                            </Typography>
                            <Typography variant="body2">
                              {activity.detalles.observaciones}
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </ListItem>
                {index < selectedActivities.length - 1 && <Box sx={{ mx: 3, borderBottom: `1px solid ${theme.palette.divider}` }} />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ActivitiesCalendar