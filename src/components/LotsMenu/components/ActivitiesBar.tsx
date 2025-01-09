import React from 'react'
import { Avatar, ButtonBase, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 16px',
        overflowX: 'auto',
        backgroundColor: '#fafafa',
        borderRadius: '16px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
        margin: '10px 0',
      }}
    >
      {categories.map(({ id, icon, link }) => (
        <Tooltip key={id} title={id} arrow placement="top">
          <div style={{ position: 'relative', margin: '0 12px' }}>
            <ButtonBase
              onClick={() => (link ? navigate(link) : selectCategory(id))}
              sx={{
                padding: '4px',
                borderRadius: '50%',
                backgroundColor:
                  selectedCategory === id ? 'rgba(0,0,0,0.04)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Avatar
                alt={id}
                src={icon}
                sx={{
                  width: 65,
                  height: 65,
                  backgroundColor: '#f5f5f5',
                  transition: 'all 0.2s ease',
                  borderRadius: '50%',
                  opacity:
                    selectedCampaign ||
                    ['Vista de Satelite', 'Recorrido'].includes(id)
                      ? 1
                      : 0.5,
                  filter:
                    selectedCampaign ||
                    ['Vista de Satelite', 'Recorrido'].includes(id)
                      ? 'none'
                      : 'grayscale(100%)',
                  boxShadow:
                    selectedCategory === id
                      ? '0 4px 12px rgba(0,0,0,0.1)'
                      : 'none',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
                imgProps={{
                  style: {
                    objectFit: 'contain',
                    padding: '0px',
                  },
                }}
              />
            </ButtonBase>

            {/* Indicador sutil */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: `translateX(-50%) scaleX(${
                  selectedCategory === id ? 1 : 0
                })`,
                width: '20px',
                height: '2px',
                backgroundColor: '#2563eb',
                borderRadius: '1px',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        </Tooltip>
      ))}
    </div>
  )
}

export default ActivitiesBar
