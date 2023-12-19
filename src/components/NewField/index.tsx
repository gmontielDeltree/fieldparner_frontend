import React, { useState, useEffect } from "react";

import NewGeometry from "../NewGeometry/index.js";

import { Alert } from "reactstrap";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

interface NewFieldProps {
  map: any;
  draw: MapboxDraw;
  saveGeometry: (data: any) => void;
  onClose: () => void;
}

const NewField: React.FC<NewFieldProps> = ({
  map,
  draw,
  onClose,
  saveGeometry
}) => {
  const [showAlert, setShowAlert] = useState(false);

  const handleSaveGeometry = (data: any) => {
    saveGeometry(data);
    setShowAlert(true);
    onClose();
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  return map ? (
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
          map={map}
          draw={draw}
          handleSaveGeometry={handleSaveGeometry}
          onClose={onClose}
          type="field"
        />
      }
    </>
  ) : (
    <div>No mapa loaded</div>
  );
};

export default NewField;
