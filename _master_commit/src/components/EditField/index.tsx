import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import LayersIcon from '@mui/icons-material/Layers'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'

interface EditFieldProps {
  isOpen: boolean
  field: any
  onClose: () => void
  onDelete: () => void
  onLocate: (field: any) => void
  handleCreateLot: () => void
  handleCreateUniqueLot: (field: any) => void
  handleEditField: (field: any) => void
}

const EditField: React.FC<EditFieldProps> = ({
  isOpen,
  field,
  onClose,
  onDelete,
  onLocate,
  handleCreateLot,
  handleCreateUniqueLot,
  handleEditField,
}) => {
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)

  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 10,
    left: '2%',
    zIndex: 3,
    margin: '40px',
    width: '30vw',
    minWidth: '300px',
    maxWidth: '450px',
    borderRadius: '12px',
    display: isOpen ? 'block' : 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(209, 213, 219, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    backgroundColor: '#E5E7EB',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginRight: '8px',
  }

  const buttonBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    margin: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    fontSize: '0.875rem',
  }

  const actionButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#ffffff',
    border: '1px solid #E5E7EB',
    color: '#374151',
  }

  const deleteButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#FEE2E2',
    border: '1px solid #FEE2E2',
    color: '#DC2626',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #E5E7EB',
  }

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
  }

  const buttonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px',
  }

  return (
    <>
      <Card style={cardStyle}>
        <CardHeader style={headerStyle}>
          <h5 style={titleStyle}>
            <LayersIcon style={{ color: '#2563EB', fontSize: '1.25rem' }} />
            {field?.nombre}
          </h5>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              color="link"
              size="sm"
              onClick={() => onLocate(field)}
              style={{ padding: '4px' }}
            >
              <LocationOnIcon style={{ color: '#2563EB' }} />
            </Button>
            <Button
              color="link"
              size="sm"
              onClick={onClose}
              style={{ padding: '4px' }}
            >
              <CloseIcon style={{ color: '#6B7280' }} />
            </Button>
          </div>
        </CardHeader>
        <CardBody style={{ padding: '20px' }}>
          <div>
            <span style={badgeStyle}>
              {field?.campo_geojson?.properties?.hectareas} {t('hectares')}
            </span>
            {field?.lotes?.length > 0 && (
              <span style={badgeStyle}>
                {field.lotes.length} {field.lotes.length === 1 ? t('lotSingular') : t('lotPlural')}
              </span>
            )}
          </div>

          {field?.lotes?.length > 0 ? (
            <p
              style={{
                color: '#6B7280',
                fontSize: '0.875rem',
                margin: '16px 0',
              }}
            >
              {t('tapLotOnMapForDetails')}
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                margin: '16px 0',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FEF3C7',
                borderLeft: '4px solid #F59E0B',
                borderRadius: '8px',
                color: '#92400E',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '12px', flexShrink: 0 }}
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              {t('noLotsAddOne')}
            </div>
          )}

          <div style={buttonsContainerStyle}>
            {field?.lotes?.length === 0 && (
              <Button
                style={actionButtonStyle}
                onClick={() => handleCreateUniqueLot(field)}
              >
                <LayersIcon style={{ fontSize: '1rem' }} />
                {t('createSingleLot')}
              </Button>
            )}

            <Button style={actionButtonStyle} onClick={handleCreateLot}>
              <AddIcon style={{ fontSize: '1rem' }} />
              {t('addLot')}
            </Button>

            <Button style={actionButtonStyle} onClick={handleEditField}>
              <EditIcon style={{ fontSize: '1rem' }} />
              {t('editField')}
            </Button>

            <Button
              style={deleteButtonStyle}
              onClick={() => setDeleteModalOpen(true)}
            >
              <DeleteIcon style={{ fontSize: '1rem' }} />
              {t('deleteField')}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal
        centered
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen(false)}
      >
        <ModalHeader toggle={() => setDeleteModalOpen(false)}>
          {t('confirmDeletion')}
        </ModalHeader>
        <ModalBody>
          {t('fieldDeletionWarning')}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            color="danger"
            onClick={() => {
              onDelete();
              setDeleteModalOpen(false);
            }}
          >
            {t('delete')}
          </Button>
        </ModalFooter>
      </Modal>

    </>
  )
}

export default EditField