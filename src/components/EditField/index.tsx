import React from "react";
import { Card, CardHeader, CardBody, Button } from "reactstrap";
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Import the LocationOn icon

interface EditFieldProps {
  isOpen: boolean;
  field: any;
  onClose: () => void;
  onDelete: () => void;
  onLocate: (field: any) => void;
  handleCreateLot: () => void;
  handleCreateUniqueLot: (field: any) => void;
  handleEditField: (field: any) => void;
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
  const cardStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: "15%",
    transform: "translateX(-50%)",
    margin: "40px",
    maxWidth: "none",
    width: "30%",
    borderRadius: "10px",
    display: isOpen ? "block" : "none",
  };

  const buttonStyle: React.CSSProperties = {
    marginLeft: "10px",
    marginRight: "10px",
  };

  const handleLocateField = () => {
    onLocate(field);
  };

  const handleDeleteField = () => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      onDelete();
    }
  };
  const cardHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  return (
    <Card style={cardStyle}>
      <CardHeader style={cardHeaderStyle}>
        <span>{field?.nombre}</span>
        <div>
          <Button
            color="primary"
            size="sm"
            onClick={handleLocateField}
            style={buttonStyle}
          >
            <LocationOnIcon />
          </Button>

          <Button close onClick={onClose} />
        </div>
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
        {field?.lotes?.length === 0 && (
          <Button
            color="success"
            size="sm"
            onClick={() => handleCreateUniqueLot(field)}
            style={buttonStyle}
          >
            Crear Lote Unico
          </Button>
        )}

        <Button
          color="success"
          size="sm"
          onClick={handleCreateLot}
          style={buttonStyle}
        >
          Añadir Lote
        </Button>

        {/* {field.lotes.length === 0 && */}
        {/*   <Button */}
        {/*     color="success" */}
        {/*     size="sm" */}
        {/*     onClick={handleEditField} */}
        {/*     style={buttonStyle} */}
        {/*   > */}
        {/*     Editar Campo */}
        {/*   </Button> */}
        {/* } */}

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
