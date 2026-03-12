import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import { useTranslation } from 'react-i18next'

interface LotActionsProps {
  selectedCategory: string | null
  backToActivites: () => void
  handleEditLote: () => void
  handleDeleteLote: () => void
  toggle: () => void
}

const LotActions: React.FC<LotActionsProps> = ({
  selectedCategory,
  backToActivites,
  handleEditLote,
  handleDeleteLote,
  toggle,
}) => {
  const { t } = useTranslation()

  return (
    <div>
      {selectedCategory && (
        <IconButton aria-label="back to activities" onClick={backToActivites}>
          <ArrowBackIcon />
        </IconButton>
      )}

      {!selectedCategory && (
        <>
          <Tooltip
            title={t('Editar Lote')}
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
            <IconButton onClick={handleEditLote}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={t('Eliminar Lote')}
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
            <IconButton onClick={handleDeleteLote}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      <IconButton aria-label="close" onClick={toggle}>
        <CloseIcon />
      </IconButton>
    </div>
  )
}

export default LotActions
