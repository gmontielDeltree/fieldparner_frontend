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
              {field?.campo_geojson?.properties?.hectareas} has.
            </span>
            {field?.lotes?.length > 0 && (
              <span style={badgeStyle}>
                {field.lotes.length} lote{field.lotes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <p
            style={{
              color: '#6B7280',
              fontSize: '0.875rem',
              margin: '16px 0',
            }}
          >
            {field?.lotes?.length > 0
              ? 'Toque en un lote del mapa para ver detalles'
              : 'Sin Lotes - Agregue uno!!!'}
          </p>

          <div style={buttonsContainerStyle}>
            {field?.lotes?.length === 0 && (
              <Button
                style={actionButtonStyle}
                onClick={() => handleCreateUniqueLot(field)}
              >
                <LayersIcon style={{ fontSize: '1rem' }} />
                Crear Lote Unico
              </Button>
            )}

            <Button style={actionButtonStyle} onClick={handleCreateLot}>
              <AddIcon style={{ fontSize: '1rem' }} />
              Añadir Lote
            </Button>

            <Button style={actionButtonStyle} onClick={handleEditField}>
              <EditIcon style={{ fontSize: '1rem' }} />
              Editar Campo
            </Button>

            <Button
              style={deleteButtonStyle}
              onClick={() => setDeleteModalOpen(true)}
            >
              <DeleteIcon style={{ fontSize: '1rem' }} />
              Eliminar Campo
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)}>
        <ModalHeader toggle={() => setDeleteModalOpen(false)}>
          ¿Está seguro?
        </ModalHeader>
        <ModalBody>
          Esta acción no se puede deshacer. Esto eliminará permanentemente este
          campo.
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            color="danger"
            onClick={() => {
              onDelete()
              setDeleteModalOpen(false)
            }}
          >
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default EditField
