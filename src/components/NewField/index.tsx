import React, { useState, useEffect } from "react";
import area from "@turf/area";
import convex from "@turf/convex";
import bbox from "@turf/bbox";
import NewGeometry from "../NewGeometry/index.js";
import { Feature, GeoJsonObject } from "geojson";
import uuid4 from "uuid4";
import { Alert } from "reactstrap";

interface NewFieldProps {
  map: any;
  draw: any;
  db_fields: any;
  onClose: () => void;
}

const NewField: React.FC<NewFieldProps> = ({
  map,
  draw,
  db_fields,
  onClose
}) => {
  const [showAlert, setShowAlert] = useState(false);

  let geometryData;
  const handleSaveGeometry = (data: any) => {
    console.log("Event: guardar_nueva_geometria triggered");
    console.log("guardar_nueva_geometria", data);
    if (data.geometry) {
      geometryData = data.geometry[0];
    } else {
      geometryData = data;
    }

    let campo_geojson: Feature | null = null;
    if (geometryData.features.length > 1) {
      campo_geojson = convex(geometryData.features);
    } else {
      campo_geojson = geometryData.features[0];
    }

    let nombre =
      data.field_name || geometryData.features[0]?.properties?.name || "";
    let uuid = uuid4();
    if (campo_geojson && campo_geojson.properties) {
      campo_geojson.properties.hectareas =
        Math.round((area(campo_geojson) / 10000) * 100) / 100;
    }

    let lotes: any[] = [];
    if (geometryData.features.length > 1) {
      lotes = geometryData.features.features;
      lotes.forEach((lote: any) => {
        lote.properties.nombre = lote.properties?.name;
        lote.properties.uuid = uuid4();
        lote.id = lote.properties.uuid;
        lote.properties.campo_parent_id = "campos_" + nombre;
        lote.properties.hectareas =
          Math.round((area(lote) / 10000) * 100) / 100;
        lote.properties.actividades = [];
      });
    }

    db_fields.put(
      {
        _id: "campos_" + nombre,
        nombre: nombre,
        campo_geojson: campo_geojson,
        uuid: uuid,
        lotes: lotes
      },
      (err: any, result: any) => {
        if (!err) {
          console.log("Successfully posted a Campo!");

          if (map.getLayer("newGeometryLayerFill")) {
            map.removeLayer("newGeometryLayerFill");
          }
          if (map.getLayer("newGeometryLayerLine")) {
            map.removeLayer("newGeometryLayerLine");
          }
          if (map.getLayer("newGeometryLayerName")) {
            map.removeLayer("newGeometryLayerName");
          }
          if (map.getSource("newGeometry")) {
            map.removeSource("newGeometry");
          }

          if (map.getSource("newGeometry")) {
            map.getSource("newGeometry").setData(campo_geojson);
          } else {
            map.addSource("newGeometry", {
              type: "geojson",
              data: campo_geojson
            });
          }

          map.addLayer({
            id: "newGeometryLayerFill",
            type: "fill",
            source: "newGeometry",
            paint: {
              "fill-color": "#FF0000",
              "fill-opacity": 0.4
            }
          });

          map.addLayer({
            id: "newGeometryLayerLine",
            type: "line",
            source: "newGeometry",
            paint: {
              "line-color": "#FF0000",
              "line-width": 2
            }
          });

          map.addLayer({
            id: "newGeometryLayerName",
            type: "symbol",
            source: "newGeometry",
            layout: {
              "text-field": nombre.toUpperCase(),
              "text-anchor": "center",
              "text-offset": [0, 0.1],
              "text-size": 18
            },
            paint: {
              "text-color": "#000000"
            }
          });

          const boundingBox = bbox(campo_geojson);
          map.fitBounds([
            [boundingBox[0], boundingBox[1]],
            [boundingBox[2], boundingBox[3]]
          ]);

          setShowAlert(true);
          draw.deleteAll();
          onClose();

          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        } else {
          console.log(err);
        }
      }
    );
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
          type="field"
        />
      }
    </>
  ) : (
    <div>No mapa loaded</div>
  );
};

export default NewField;
