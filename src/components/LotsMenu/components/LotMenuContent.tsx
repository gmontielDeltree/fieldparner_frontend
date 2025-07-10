import React from 'react'
import { Box, Fade, Typography } from '@mui/material'
import PlanActivity from '../PlanActivity'
import Tour from '../Tour'
import { Activities } from '../Activities/index'
import GroundSample from '../GroundSample'
import ExecuteActivity from '../ExecuteActivity'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Actividad } from '../../../interfaces/activity'

interface LotMenuContentProps {
  selectedCategory: string | null
  selectedCampaign: any
  lot: any
  field: any
  db: any
  backToActivites: () => void
  activities: any
  setActivities: (activities: any) => void
  editingActivityInfo: {
    activity: Actividad | null
    isExecuting: boolean
  }
  handleEditActivity: (
    activity: any,
    isExecuting?: boolean,
    type?: string,
  ) => void
}

const LotMenuContent: React.FC<LotMenuContentProps> = ({
  selectedCategory,
  selectedCampaign,
  lot,
  field,
  db,
  backToActivites,
  activities,
  setActivities,
  editingActivityInfo,
  handleEditActivity,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const activityTypeTranslations = {
    preparado: 'preparation',
    siembra: 'sowing',
    cosecha: 'harvesting',
    aplicacion: 'application',
  }

  // Mapea todas las posibles claves de traducción a sus valores traducidos
  const translationKeyMap = {
    satelliteView: t('satelliteView'),
    fieldVisit: t('fieldVisit'),
    scheduleTillage: t('scheduleTillage'),
    scheduleSowing: t('scheduleSowing'),
    scheduleHarvest: t('scheduleHarvest'),
    scheduleApplication: t('scheduleApplication'),
    soilSample: t('soilSample'),
    editActivity: t('editActivity'),
    editNote: t('editNote'),
    executeActivity: t('executeActivity'),
    verifyActivity: t('verifyActivity'),
    lotPlanning: t('lotPlanning')
  }

  // Función para verificar si selectedCategory coincide con una clave de traducción
  const categoryMatches = (key) => {
    return selectedCategory === translationKeyMap[key] || selectedCategory === key
  }

  const isAccessibleWithoutCampaign = ['satelliteView', 'fieldVisit'].some(key =>
    categoryMatches(key)
  )

  // Filtra las actividades según la campaña seleccionada
  const filteredActivities = activities ? activities.filter((activity: any) => {
    const campaña = activity.actividad?.campaña
    return !campaña || campaña.campaignId === selectedCampaign?.campaignId
  }) : []

  if (!selectedCampaign && !isAccessibleWithoutCampaign) {
    return (
      <Fade in={true} timeout={1000}>
        <Box textAlign="center" marginTop="20px">
          <Typography variant="h5" component="h2" gutterBottom>
            {t('chooseACampaign')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('selectCampaignFromTopRow')}
          </Typography>
        </Box>
      </Fade>
    )
  }

  if (!selectedCategory) {
    if (!activities || activities.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            margin: '24px auto',
            padding: '24px',
            maxWidth: '500px',
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '16px' }}
          >
            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
            <path d="M12 12h.01"></path>
            <path d="M17 12h.01"></path>
            <path d="M7 12h.01"></path>
          </svg>
          <Typography variant="h6" gutterBottom style={{ color: '#374151' }}>
            {t('noActivitiesYet')}
          </Typography>
          <Typography variant="body2" style={{ color: '#6B7280' }}>
            {t('addActivitiesUsingTopButtons')}
          </Typography>
        </div>
      )
    }

    if (filteredActivities.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            margin: '24px auto',
            padding: '24px',
            maxWidth: '500px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '16px' }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <Typography variant="h6" gutterBottom style={{ color: '#1E40AF' }}>
            {t('noActivitiesForCampaign')}
          </Typography>
          <Typography variant="body2" style={{ color: '#3B82F6' }}>
            {t('selectDifferentCampaignOrAddNew')}
          </Typography>
        </div>
      )
    }

    return (
      <Activities
        activitiesData={filteredActivities}
        setActivitiesData={setActivities}
        lotDoc={lot}
        fieldDoc={field}
        handleEditActivity={handleEditActivity}
      />
    )
  }

  if (categoryMatches('scheduleTillage')) {
    return (
      <PlanActivity
        activityType={'preparation'}
        lot={lot}
        fieldName={field.nombre}
        db={db}
        backToActivites={backToActivites}
      />
    )
  }
  if (categoryMatches('scheduleSowing')) {
    return (
      <PlanActivity
        activityType={'sowing'}
        lot={lot}
        fieldName={field.nombre}
        db={db}
        backToActivites={backToActivites}
      />
    )
  }
  if (categoryMatches('scheduleHarvest')) {
    return (
      <PlanActivity
        activityType={'harvesting'}
        lot={lot}
        fieldName={field.nombre}
        lotActivities={filteredActivities}
        db={db}
        backToActivites={backToActivites}
      />
    )
  }
  if (categoryMatches('scheduleApplication')) {
    return (
      <PlanActivity
        activityType={'application'}
        lot={lot}
        fieldName={field.nombre}
        lotActivities={filteredActivities}
        db={db}
        backToActivites={backToActivites}
      />
    )
  }
  if (categoryMatches('fieldVisit')) {
    return (
      <Tour
        lot={lot}
        db={db}
        fieldName={field.nombre}
        backToActivites={backToActivites}
      />
    )
  }
  if (categoryMatches('soilSample')) {
    return (
      <GroundSample
        lot={lot}
        db={db}
        fieldName={field.nombre}
        backToActivites={backToActivites}
        selectedCampaign={selectedCampaign}
      />
    )
  }
  if (categoryMatches('editActivity')) {
    return (
      <PlanActivity
        activityType={
          activityTypeTranslations[
          editingActivityInfo.activity?.tipo?.toLowerCase() || ''
          ]
        }
        lot={lot}
        fieldName={field.nombre}
        db={db}
        backToActivites={backToActivites}
        existingActivity={editingActivityInfo.activity}
      />
    )
  }
  if (categoryMatches('editNote')) {
    return (
      <Tour
        lot={lot}
        db={db}
        fieldName={field.nombre}
        backToActivites={backToActivites}
        existingNote={editingActivityInfo.activity}
      />
    )
  }
  if (categoryMatches('executeActivity')) {
    return (
      <ExecuteActivity
        activityType={
          activityTypeTranslations[
          editingActivityInfo.activity?.tipo?.toLowerCase() || ''
          ]
        }
        lot={lot}
        db={db}
        fieldName={field.nombre}
        backToActivites={backToActivites}
        existingActivity={editingActivityInfo.activity}
        isExecuting={editingActivityInfo.isExecuting}
      />
    )
  }

  if (selectedCategory === 'verifyActivity') {
    return (
      <PlanActivity
        activityType={
          activityTypeTranslations[
          editingActivityInfo.activity?.tipo?.toLowerCase() || ''
          ]
        }
        lot={lot}
        field={field}
        fieldName={field.nombre}
        db={db}
        backToActivites={backToActivites}
        existingActivity={editingActivityInfo.activity}
        verificationMode={true}
      />
    )
  }

  // Caso por defecto
  return (
    <div style={{ textAlign: 'center', margin: '20px', color: '#6B7280' }}>
      {t('selectCategoryToViewForms')}
    </div>
  )
}

export default LotMenuContent
