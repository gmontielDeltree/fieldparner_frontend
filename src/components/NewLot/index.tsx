import React, { useState, useEffect } from "react";
import area from "@turf/area";
import convex from "@turf/convex";
import bbox from "@turf/bbox";
import NewGeometry from "../NewGeometry/index.js";
import { Feature, GeoJsonObject } from "geojson";

import { Alert } from "reactstrap";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

interface NewLotProps {
  map: any;
  draw: MapboxDraw;
  handleSaveGeometryLot: (data: any) => void;
}

const NewLot: React.FC<NewLotProps> = ({
  map,
  draw,
  handleSaveGeometryLot
}) => {
  const [showAlert, setShowAlert] = useState(false);

  const handleSaveGeometry = (data: any) => {
    handleSaveGeometryLot(data);
    setShowAlert(true);

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
          type="lot"
        />
      }
    </>
  ) : (
    <div>No mapa loaded</div>
  );
};

export default NewLot;
