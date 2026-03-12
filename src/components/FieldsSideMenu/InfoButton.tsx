import React from 'react'
import { IconButton } from '@mui/material'
import { Field } from '../../interfaces/field'

interface InfoButtonProps {
  field: Field
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const InfoButton: React.FC<InfoButtonProps> = ({ field, onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        background: 'rgba(37, 99, 235, 0.1)',
        borderRadius: '12px',
        padding: '8px',
        marginRight: '8px',
        '&:hover': {
          background: 'rgba(37, 99, 235, 0.2)',
        },
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </IconButton>
  )
}

export default InfoButton
