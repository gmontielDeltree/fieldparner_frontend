import React from 'react'
import { IconButton, Box, Typography, Chip, Portal } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Field } from '../../interfaces/field'

interface FieldInfoPopupProps {
  field: Field | null
  position: { x: number; y: number }
  onClose: () => void
  onLotSelect: (lot: any, field: Field) => void
}

const FieldInfoPopup: React.FC<FieldInfoPopupProps> = ({
  field,
  position,
  onClose,
  onLotSelect,
}) => {
  if (!field) return null

  return (
    <Portal>
      <div
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          zIndex: 9999,
          maxWidth: '400px',
          maxHeight: '600px',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography
            variant="h6"
            style={{ color: '#334155', fontWeight: 600 }}
          >
            {field.nombre}
          </Typography>
          <IconButton size="small" onClick={onClose} style={{ padding: '4px' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
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
              <path d="M21 3H3v18h18V3zM9 3v18M3 9h18M3 15h18" />
            </svg>
            <Typography style={{ color: '#2563eb', fontWeight: 600 }}>
              Información del Campo
            </Typography>
          </div>
          <Box
            sx={{
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '16px',
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: '#475569', marginBottom: '8px' }}
            >
              Hectáreas totales:{' '}
              <strong>
                {field.campo_geojson.properties.hectareas.toFixed(2)} ha
              </strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569' }}>
              Cantidad de lotes: <strong>{field.lotes.length}</strong>
            </Typography>
          </Box>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
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
              <path d="M3 3h18v18H3zM12 8v8M8 12h8" />
            </svg>
            <Typography style={{ color: '#2563eb', fontWeight: 600 }}>
              Lotes
            </Typography>
          </div>

          {field.lotes.map((lote, index) => (
            <Box
              key={index}
              sx={{
                background: '#eff6ff',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '8px',
                border: '1px solid rgba(37, 99, 235, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: '#dbeafe',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => onLotSelect(lote, field)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <Typography sx={{ fontWeight: 600, color: '#1e40af' }}>
                  {lote.properties.nombre}
                </Typography>
                <Chip
                  label={`${lote.properties.hectareas.toFixed(2)} ha`}
                  size="small"
                  sx={{
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#1e40af',
                    fontWeight: 500,
                  }}
                />
              </div>

              {lote.properties.cultivo && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                  >
                    <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                  </svg>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {lote.properties.cultivo}
                  </Typography>
                </div>
              )}
            </Box>
          ))}
        </div>
      </div>
    </Portal>
  )
}

export default FieldInfoPopup
