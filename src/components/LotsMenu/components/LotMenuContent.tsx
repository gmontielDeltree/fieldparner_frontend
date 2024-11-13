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

  const isAccessibleWithoutCampaign = [
    'Vista de Satelite',
    'Recorrido',
  ].includes(selectedCategory || '')

  if (!selectedCampaign && !isAccessibleWithoutCampaign) {
    return (
      <Fade in={true} timeout={1000}>
        <Box textAlign="center" marginTop="20px">
          <Typography variant="h5" component="h2" gutterBottom>
            {t('choose_a_campaign')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('select_a_campaign_from_the_top_row')}
          </Typography>
        </Box>
      </Fade>
    )
  }

  if (!selectedCategory) {
    if (!activities || activities.length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p>No hay actividades.</p>
          <p>Agregue alguna utilizando los botones superiores</p>
        </div>
      )
    }

    const filteredActivities = activities.filter((activity: any) => {
      const campaña = activity.actividad?.campaña
      return !campaña || campaña.campaignId === selectedCampaign.campaignId
    })

    if (filteredActivities.length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p>No hay actividades para esta campaña.</p>
          <p>Seleccione otra campaña o agregue actividades a esta.</p>
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

  switch (selectedCategory) {
    case 'Programar Preparado':
      return (
        <PlanActivity
          activityType={'preparation'}
          lot={lot}
          fieldName={field.nombre}
          db={db}
          backToActivites={backToActivites}
        />
      )
    case 'Programar Siembra':
      return (
        <PlanActivity
          activityType={'sowing'}
          lot={lot}
          fieldName={field.nombre}
          db={db}
          backToActivites={backToActivites}
        />
      )
    case 'Programar Cosecha':
      return (
        <PlanActivity
          activityType={'harvesting'}
          lot={lot}
          fieldName={field.nombre}
          db={db}
          backToActivites={backToActivites}
        />
      )
    case 'Programar Aplicacion':
      return (
        <PlanActivity
          activityType={'application'}
          lot={lot}
          fieldName={field.nombre}
          db={db}
          backToActivites={backToActivites}
        />
      )
    case 'Recorrido':
      return (
        <Tour
          lot={lot}
          db={db}
          fieldName={field.nombre}
          backToActivites={backToActivites}
        />
      )
    case 'Muestra de suelo':
      return (
        <GroundSample
          lot={lot}
          db={db}
          fieldName={field.nombre}
          backToActivites={backToActivites}
        />
      )
    case 'Edit Activity':
      return (
        <PlanActivity
          activityType={
            activityTypeTranslations[
              editingActivityInfo.activity?.tipo.toLowerCase() || ''
            ]
          }
          lot={lot}
          fieldName={field.nombre}
          db={db}
          backToActivites={backToActivites}
          existingActivity={editingActivityInfo.activity}
        />
      )
    case 'Edit Note':
      return (
        <Tour
          lot={lot}
          db={db}
          fieldName={field.nombre}
          backToActivites={backToActivites}
          existingNote={editingActivityInfo.activity}
        />
      )
    case 'Execute Activity':
      return (
        <ExecuteActivity
          activityType={
            activityTypeTranslations[
              editingActivityInfo.activity?.tipo.toLowerCase() || ''
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
    default:
      return <div>Select a category to view its forms</div>
  }
}

export default LotMenuContent
