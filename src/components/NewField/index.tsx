import React, { useState } from "react";
import NewGeometry from "../NewGeometry/index.js";
import { Alert } from "reactstrap";

interface NewFieldProps {
  saveGeometry: (data: any) => void;
  onClose: () => void;
}

const NewField: React.FC<NewFieldProps> = ({ onClose, saveGeometry }) => {
  const [showAlert, setShowAlert] = useState(false);

  const handleSaveGeometry = (data: any) => {
    saveGeometry(data);
    setShowAlert(true);
    onClose();
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  return (
    <>
      {showAlert && (
        <Alert
          color="success"
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            zIndex: 1000
          }}
        >
          Campo guardado exitosamente!
        </Alert>
      )}
      {
        <NewGeometry
          handleSaveGeometry={handleSaveGeometry}
          onClose={onClose}
          type="field"
        />
      }
    </>
  );
};

export default NewField;
