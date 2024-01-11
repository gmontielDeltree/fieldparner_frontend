import React from "react";
import { Card, CardHeader, CardBody, Button } from "reactstrap";

interface EditFieldProps {
  isOpen: boolean;
  field: any;
  onClose: () => void;
  onDelete: () => void;
  onLocate: () => void;
  handleCreateLot: () => void;
}

const EditField: React.FC<EditFieldProps> = ({
  isOpen,
  field,
  onClose,
  onDelete,
  onLocate,
  handleCreateLot
}) => {
  const cardStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: "15%",
    transform: "translateX(-50%)",
    margin: "40px",
    maxWidth: "none",
    width: "30%",
    borderRadius: "10px",
    display: isOpen ? "block" : "none"
  };

  const buttonStyle: React.CSSProperties = {
    marginLeft: "10px",
    marginRight: "10px"
  };

  const handleLocateField = () => {
    onLocate();
  };

  const handleDeleteField = () => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      onDelete();
    }
  };

  return (
    <Card style={cardStyle}>
      <CardHeader>
        {field?.nombre}
        <Button
          color="primary"
          size="sm"
          onClick={handleLocateField}
          style={buttonStyle}
        >
          <i className="bi bi-geo-alt" />
        </Button>
        <Button close onClick={onClose} />
      </CardHeader>
      <CardBody>
        <p style={{ fontWeight: "bold" }}>
          {field?.campo_geojson?.properties?.hectareas} has.
        </p>
        <p style={{ fontWeight: "bold" }}>
          {field?.lotes?.length > 0 ? `${field.lotes.length} lote/s` : null}
        </p>
        <p>
          {field?.lotes?.length > 0
            ? "Toque en un lote del mapa para ver detalles"
            : "Sin Lotes - Agregue uno!!!"}
        </p>
        {
          <Button
            color="success"
            size="sm"
            onClick={handleCreateLot}
            style={buttonStyle}
          >
            Añadir Lote
          </Button>
        }
        <Button
          color="danger"
          size="sm"
          onClick={handleDeleteField}
          style={buttonStyle}
        >
          Eliminar Campo
        </Button>
      </CardBody>
    </Card>
  );
};

export default EditField;
