import React from 'react'
import { Box, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { keyframes } from '@emotion/react'

interface ActivityHeaderProps {
  isEditing: boolean
  translatedActivityType: string
  ActivityIcon: React.ReactNode
  titleBg: string
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  isEditing,
  translatedActivityType,
  ActivityIcon,
  titleBg,
}) => {
  const floating = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `

  return (
    <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
      {ActivityIcon}{' '}
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 'bold',
          mt: 2,
          background: titleBg,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '1px 1px 4px rgba(0,0,0,0.15)',
          animation: isEditing ? `${floating} 3s ease-in-out infinite` : 'none',
        }}
      >
        {isEditing ? (
          <>
            <EditIcon
              sx={{
                verticalAlign: 'middle',
                mr: 1,
                animation: `${floating} 3s ease-in-out infinite`,
              }}
            />
            Editar {translatedActivityType}
          </>
        ) : (
          `Programar ${translatedActivityType}`
        )}
      </Typography>
    </Box>
  )
}

export default ActivityHeader
