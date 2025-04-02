import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import DrawIcon from '@mui/icons-material/Draw'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'

interface GeometryPromptModalProps {
  isOpen: boolean
  toggle: () => void
  onDraw: () => void
  onUpload: (file: File) => void
}

const GeometryPromptModal: React.FC<GeometryPromptModalProps> = ({
  isOpen,
  toggle,
  onDraw,
  onUpload,
}) => {
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.kml') || file.name.endsWith('.kmz'))) {
      onUpload(file)
    }
  }

  const modalStyle: React.CSSProperties = {
    maxWidth: '500px',
    margin: '90px auto',
  }

  const headerStyle: React.CSSProperties = {
    borderBottom: '1px solid #E5E7EB',
    padding: '20px 24px',
  }

  const bodyStyle: React.CSSProperties = {
    padding: '24px',
  }

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  }

  const buttonBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    justifyContent: 'center',
    width: '100%',
  }

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#2563EB',
    border: 'none',
    color: 'white',
  }

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#F3F4F6',
    border: '1px solid #E5E7EB',
    color: '#374151',
  }

  const dropzoneStyle: React.CSSProperties = {
    border: `2px dashed ${isDragging ? '#2563EB' : '#E5E7EB'}`,
    borderRadius: '8px',
    padding: '24px',
    marginTop: '16px',
    backgroundColor: isDragging ? '#EFF6FF' : '#F9FAFB',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  }

  const footerStyle: React.CSSProperties = {
    borderTop: '1px solid #E5E7EB',
    padding: '16px 24px',
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} style={modalStyle}>
      <ModalHeader toggle={toggle} style={headerStyle}>
        {t('geometryPromptHeader')}
      </ModalHeader>
      <ModalBody style={bodyStyle}>
        <div style={buttonContainerStyle}>
          <Button style={primaryButtonStyle} onClick={onDraw}>
            <DrawIcon style={{ fontSize: '1.25rem' }} />
            {t('drawOnMap')}
          </Button>

          <div
            style={dropzoneStyle}
            onClick={handleFileUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadFileIcon
              style={{
                fontSize: '2rem',
                color: '#2563EB',
                marginBottom: '8px',
              }}
            />
            <div>{t('dropzoneText')}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              {t('orClickToSelect')}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".kml,.kmz"
            style={{ display: 'none' }}
          />
        </div>
      </ModalBody>
      <ModalFooter style={footerStyle}>
        <Button style={secondaryButtonStyle} onClick={toggle}>
          <CloseIcon style={{ fontSize: '1rem' }} />
          {t('close')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default GeometryPromptModal