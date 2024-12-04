import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SeedlingIcon from '@mui/icons-material/Park'
import { keyframes } from '@emotion/react'

interface ActivityHeaderProps {
  isEditing: boolean
  translatedActivityType: string
  ActivityIcon: React.ReactNode
  titleBg: string
  formData?: any
  activityType?: string
  mode?: 'execute' | 'plan' // Nuevo prop para distinguir entre ejecución y planificación
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  isEditing,
  translatedActivityType,
  ActivityIcon,
  titleBg,
  formData,
  activityType,
  mode = 'plan',
}) => {
  const floating = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `

  const getCropInfo = () => {
    const crop = formData?.detalles?.cultivo
    if (!crop) return null

    return {
      name: crop.descriptionES || crop.descriptionEN || crop.descriptionPT,
      type: crop.cropType,
    }
  }

  const cropInfo = getCropInfo()
  const showCropInfo = cropInfo != null

  const getHeaderText = () => {
    if (mode === 'execute') {
      return `Ejecutar ${translatedActivityType}`
    }
    return isEditing
      ? `Editar ${translatedActivityType}`
      : `Programar ${translatedActivityType}`
  }

  return (
    <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
      {ActivityIcon}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 'bold',
            mt: 2,
            mb: showCropInfo ? 0 : 3,
            background: titleBg,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '1px 1px 4px rgba(0,0,0,0.15)',
            animation: isEditing
              ? `${floating} 3s ease-in-out infinite`
              : 'none',
          }}
        >
          {isEditing && mode === 'plan' && (
            <EditIcon
              sx={{
                verticalAlign: 'middle',
                mr: 1,
                animation: `${floating} 3s ease-in-out infinite`,
              }}
            />
          )}
          {getHeaderText()}
        </Typography>
        {showCropInfo && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
              marginTop: 1,
            }}
          >
            <Chip
              icon={<SeedlingIcon />}
              label={cropInfo.name}
              sx={{
                background: titleBg,
                color: 'white',
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
                boxShadow: '1px 1px 4px rgba(0,0,0,0.15)',
              }}
            />
            <Chip
              label={cropInfo.type}
              sx={{
                background: titleBg,
                color: 'white',
                opacity: 0.9,
                boxShadow: '1px 1px 4px rgba(0,0,0,0.15)',
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ActivityHeader
