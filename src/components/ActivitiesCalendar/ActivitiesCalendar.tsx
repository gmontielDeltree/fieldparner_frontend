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
  
  const selectedCampaign = useAppSelector((state) => state.campaign.selectedCampaign)
  const effectiveCampaignId = campaignId || selectedCampaign?._id

  const locale = i18n.language === 'es' ? es : i18n.language === 'pt' ? ptBR : enUS

  useEffect(() => {
    loadActivities()
  }, [effectiveCampaignId])

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
      regularActivitiesResult.rows.forEach((row) => {
        const doc = row.doc as any
        if (doc && doc.campaña?.campaignId === effectiveCampaignId) {
          allActivities.push(doc)
        }
      })

      // Process planned activities
      plannedActivitiesResult.rows.forEach((row) => {
        const doc = row.doc as any
        if (doc && doc.campanaId === effectiveCampaignId) {
          allActivities.push({
            ...doc,
            isPlanificada: true,
            detalles: {
              fecha_ejecucion_tentativa: doc.fecha,
              cultivo: doc.cultivo,
              hectareas: doc.area,
            }
          })
        }
      })

      setActivities(allActivities)
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
                        <Box key={tipo} sx={{ position: 'relative' }}>
                          {React.cloneElement(activityIcons[tipo] || <Event />, {
                            sx: { 
                              fontSize: 20, 
                              color: activityColors[tipo] || '#9ca3af',
                              opacity: 0.9,
                            }
                          })}
                        </Box>
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