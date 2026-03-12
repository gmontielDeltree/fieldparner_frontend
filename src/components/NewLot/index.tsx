import React, { useState, useEffect } from "react";
import NewGeometry from "../NewGeometry/index.js";
import { Alert } from "reactstrap";

interface NewLotProps {
  handleSaveGeometryLot: (data: any) => void;
}

const NewLot: React.FC<NewLotProps> = ({ handleSaveGeometryLot }) => {
  const [showAlert, setShowAlert] = useState(false);

  const handleSaveGeometry = (data: any) => {
    handleSaveGeometryLot(data);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleOnClose = () => {
    setShowAlert(false);
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
          onClose={handleOnClose}
          handleSaveGeometry={handleSaveGeometry}
          type="lot"
        />
      }
    </>
  );
};

export default NewLot;
