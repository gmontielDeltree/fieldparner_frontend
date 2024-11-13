import React from 'react'
import { Avatar, ButtonBase, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'

// Importamos las imágenes directamente
import planAnualIcon from '../../../images/icons/iconoplanificacionanual.webp'
import preparadoIcon from '../../../images/icons/IconodePlanificaciondesuelo.png'
import categoryIcon1 from '../../../images/icons/sembradora_act.webp'
import categoryIcon2 from '../../../images/icons/pulverizadora_act.webp'
import categoryIcon3 from '../../../images/icons/cosechadora_act.webp'
import categoryIcon4 from '../../../images/icons/iconodenotas_act.webp'
import categoryIcon5 from '../../../images/icons/iconosatelite.webp'
import categoryIcon6 from '../../../images/icons/suelo_act.webp'

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
    width: 50,
    height: 50,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    transform: selectedCategory === categoryId ? 'scale(1.2)' : 'scale(1)',
    boxShadow:
      selectedCategory === categoryId ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
    borderRadius: '50%',
    margin: '0 15px',
    cursor: 'pointer',
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
      transform: 'scale(1.2)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  })

  return (
    <div id="activities-bar">
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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              fontSize: '1em',
            },
            arrow: {
              color: '#333',
            },
          }}
        >
          <ButtonBase
            onClick={() => (link ? navigate(link) : selectCategory(id))}
          >
            <Avatar alt={id} src={icon} sx={avatarStyle(id)} />
          </ButtonBase>
        </Tooltip>
      ))}
    </div>
  )
}

export default ActivitiesBar
