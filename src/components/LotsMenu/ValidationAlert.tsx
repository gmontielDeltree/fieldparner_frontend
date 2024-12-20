import React from 'react'
import { Modal, Button } from 'reactstrap'
import WarningIcon from '@mui/icons-material/Warning'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

interface ValidationAlertProps {
  isOpen: boolean
  onClose: () => void
  currentStep: string
  requiredFields: string[]
}

const ValidationAlert: React.FC<ValidationAlertProps> = ({
  isOpen,
  onClose,
  currentStep,
  requiredFields,
}) => {
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    marginTop: '40px',
    zIndex: 1050,
    width: '100%',
    maxWidth: '500px',
    background: 'transparent',
  }

  const contentStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF4949 100%)',
    color: 'white',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
  }

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  }

  const bodyStyle: React.CSSProperties = {
    padding: '24px',
    color: '#374151',
    backgroundColor: 'white',
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: '1rem',
    marginBottom: '20px',
    color: '#4B5563',
    lineHeight: '1.5',
  }

  const highlightText: React.CSSProperties = {
    color: '#FF4949',
    fontWeight: 600,
  }

  const listTitleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '8px',
  }

  const listItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: '#374151',
    border: '1px solid #F3F4F6',
    transition: 'all 0.2s ease',
    cursor: 'default',
  }

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 500,
    fontSize: '0.95rem',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF4949 100%)',
    border: 'none',
    color: 'white',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(255, 73, 73, 0.2)',
    width: '100%',
    maxWidth: '200px',
  }

  const footerStyle: React.CSSProperties = {
    padding: '20px 24px',
    backgroundColor: 'white',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
  }

  const mainContentStyle: React.CSSProperties = {
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      contentClassName="border-0 shadow-none bg-transparent"
      modalClassName="border-0 bg-transparent"
      className="modal-dialog-centered"
    >
      <div style={mainContentStyle}>
        <div style={headerStyle}>
          <h5 style={titleStyle}>
            <WarningIcon style={{ fontSize: '1.5rem' }} />
            Campos Incompletos
          </h5>
          <Button
            color="link"
            size="sm"
            onClick={onClose}
            style={{ padding: '8px', color: 'white', opacity: 0.9 }}
          >
            <CloseIcon style={{ fontSize: '1.25rem' }} />
          </Button>
        </div>

        <div style={bodyStyle}>
          <p style={descriptionStyle}>
            Para continuar con "<span style={highlightText}>{currentStep}</span>
            ", necesitamos que completes los siguientes campos:
          </p>
          <h6 style={listTitleStyle}>
            <ErrorOutlineIcon
              style={{ color: '#FF4949', fontSize: '1.25rem' }}
            />
            Campos requeridos:
          </h6>
          <ul style={listStyle}>
            {requiredFields.map((field, index) => (
              <li key={index} style={listItemStyle}>
                <WarningIcon style={{ fontSize: '1rem', color: '#FF4949' }} />
                {field}
              </li>
            ))}
          </ul>
        </div>

        <div style={footerStyle}>
          <Button style={buttonStyle} onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ValidationAlert
