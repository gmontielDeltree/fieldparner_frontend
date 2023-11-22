import React, { useState, useEffect } from "react";
import area from "@turf/area";
import convex from "@turf/convex";
import bbox from "@turf/bbox";
import NewGeometry from "../NewGeometry/index.js";
import { Feature, GeoJsonObject } from "geojson";
import uuid4 from "uuid4";
import { Alert } from "reactstrap";

interface NewLotProps {
  map: any;
  draw: any;
  db_fields: any;
  original_field_name: any;
  onClose: () => void;
}

const NewLot: React.FC<NewLotProps> = ({
  map,
  draw,
  db_fields,
  original_field_name,
  onClose
}) => {
  const [showAlert, setShowAlert] = useState(false);

  const handleSaveGeometry = (data: any) => {
    console.log("Event: add_lot_to_field triggered");
    console.log("add_lot_to_field", data);

    const lotGeometry = data.geometry[0].features[0].geometry;
    const lotName = data.field_name;
    const fieldId = "campos_" + original_field_name;

    db_fields.get(fieldId, (err: any, field: any) => {
      if (err) {
        console.log("Error retrieving field:", err);
        return;
      }

      const lotUuid = uuid4();

      const lotAreaHectares =
        Math.round((area(lotGeometry) / 10000) * 100) / 100;

      const newLot = {
        id: lotUuid,
        type: "Feature",
        properties: {
          nombre: lotName,
          campo_parent_id: fieldId,
          uuid: lotUuid,
          hectareas: lotAreaHectares
        },
        geometry: lotGeometry
      };

      field.lotes = [...field.lotes, newLot];
      db_fields.put(
        {
          ...field,
          _id: fieldId,
          lotes: field.lotes
        },
        (error: any, result: any) => {
          if (!error) {
            console.log("Successfully added a new Lot to Campo!");

            setShowAlert(true);
            onClose();

            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
          } else {
            console.log(error);
          }
        }
      );
    });
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
