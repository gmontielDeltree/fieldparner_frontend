import React from 'react'
import { Avatar, ButtonBase, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'

// Importamos las imágenes directamente
import planAnualIcon from '../../../images/icons/cicle.png'
import preparadoIcon from '../../../images/icons/calendar.png'
import categoryIcon1 from '../../../images/icons/sowing.png'
import categoryIcon2 from '../../../images/icons/application.png'
import categoryIcon3 from '../../../images/icons/harvest.png'
import categoryIcon4 from '../../../images/icons/note.png'
import categoryIcon5 from '../../../images/icons/satellite-view.png'
import categoryIcon6 from '../../../images/icons/ground-sample.png'

interface ActivitiesBarProps {
  selectedCategory: string | null
  selectCategory: (categoryId: string) => void
  selectedCampaign: any
  lot: any
  backUrl: string
}

const ActivitiesBar: React.FC<ActivitiesBarProps> = ({
  selectedCategory,
  selectCategory,
  selectedCampaign,
  lot,
  backUrl,
}) => {
  const navigate = useNavigate()

  const categories = [
    {
      id: 'Planificación del lote',
      icon: planAnualIcon,
      link: `planification-by-lot/${lot.properties.campo_parent_id}/${lot.id}?backUrl=${backUrl}`,
    },
    { id: 'Programar Preparado', icon: preparadoIcon },
    { id: 'Programar Siembra', icon: categoryIcon1 },
    { id: 'Programar Aplicacion', icon: categoryIcon2 },
    { id: 'Programar Cosecha', icon: categoryIcon3 },
    { id: 'Recorrido', icon: categoryIcon4 },
    {
      id: 'Vista de Satelite',
      icon: categoryIcon5,
      link: `/init/overview/satellite/${lot.id}?backUrl=${backUrl}`,
    },
    { id: 'Muestra de suelo', icon: categoryIcon6 },
  ]

  const avatarStyle = (categoryId: string) => ({
    width: 65, // Reducido de 100px a 65px
    height: 65, // Reducido de 100px a 65px
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: selectedCategory === categoryId ? 'scale(1.1)' : 'scale(1)',
    boxShadow:
      selectedCategory === categoryId
        ? '0 8px 24px rgba(0,0,0,0.12)'
        : '0 4px 12px rgba(0,0,0,0.08)',
    borderRadius: '50%',
    margin: '0 12px', // Reducido el margen lateral también
    cursor: 'pointer',
    backgroundColor: '#f5f5f5',
    opacity:
      selectedCampaign ||
      ['Vista de Satelite', 'Recorrido'].includes(categoryId)
        ? 1
        : 0.5,
    filter:
      selectedCampaign ||
      ['Vista de Satelite', 'Recorrido'].includes(categoryId)
        ? 'none'
        : 'grayscale(100%)',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
      backgroundColor: '#f8f8f8',
    },
  })

  return (
    <div
      id="activities-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 16px', // Reducido el padding del contenedor
        overflowX: 'auto',
        backgroundColor: '#fafafa',
        borderRadius: '16px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
        margin: '10px 0',
        '::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {categories.map(({ id, icon, link }) => (
        <Tooltip
          key={id}
          title={id}
          arrow
          placement="top"
          sx={{
            tooltip: {
              backgroundColor: '#333',
              color: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              fontSize: '0.9em', // Reducido ligeramente el tamaño del tooltip
              padding: '6px 12px',
              borderRadius: '8px',
            },
            arrow: {
              color: '#333',
            },
          }}
        >
          <ButtonBase
            onClick={() => (link ? navigate(link) : selectCategory(id))}
            sx={{
              padding: '6px', // Reducido el padding
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Avatar
              alt={id}
              src={icon}
              sx={avatarStyle(id)}
              imgProps={{
                style: {
                  objectFit: 'contain',
                  padding: '-8px', // Padding negativo para que la imagen se extienda más allá del círculo
                  transform: 'scale(1.05)', // Aumentamos aún más el tamaño de la imagen
                  transition: 'all 0.3s ease',
                },
              }}
            />
          </ButtonBase>
        </Tooltip>
      ))}
    </div>
  )
}

export default ActivitiesBar
