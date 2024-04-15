import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import EditField from "../components/EditField";
import { dbContext } from "../services";
import { useField } from "../hooks";
import { useSelector } from "react-redux";
import { selectMap } from "../redux/map";
import bbox from "@turf/bbox";
import {
  addLotesToMap,
  clearLotesFromMap,
  setFieldAsSelected,
  unsetFieldAsSelected,
} from "../helpers/mapHelpers";
import { uuidv7 } from "uuidv7";
import { Field, Lot } from "../interfaces/field";

export const FieldPage = () => {
  const { campoId } = useParams();
  const navigate = useNavigate();
  const map = useSelector(selectMap);

  const { updateMapAfterNew } = useOutletContext();
  const { deleteField, saveField } = useField();

  const { field, getField } = useField();

  useEffect(() => {
    getField(campoId);
  }, [campoId]);

  useEffect(() => {
    if (field) {
      // Mostrar el campo seleccionado
      setFieldAsSelected(map, field._id);
      // Fit to it
      handleLocateField(field);
      // Mostrar los lotes del campo
      addLotesToMap(map, field);
    }
  }, [field]);

  useEffect(() => {
    return () => {
      try {
        clearLotesFromMap(map);
        unsetFieldAsSelected(map);
      } catch (e) {
        console.log("TODO:", e);
      }
    };
  }, [map]);

  const handleLocateField = (field) => {
    if (field && map) {
      const fieldGeoJSON = field.campo_geojson;
      if (fieldGeoJSON && fieldGeoJSON.geometry) {
        map.fitBounds(bbox(fieldGeoJSON), {
          padding: { left: 50, top: 30, bottom: 30 },
        });
      }
    }
  };

  const handleCreateUniqueLot = (campo_doc: Field) => {
    let id = uuidv7();
    let lote: Lot = {
      id: id,
      type: "Feature",
      properties: {
        nombre: campo_doc.nombre,
        campo_parent_id: campo_doc._id,
        hectareas: campo_doc.campo_geojson.properties.hectareas,
        uuid: id,
      },
      geometry: campo_doc.campo_geojson.geometry,
    };
    campo_doc.lotes.push(lote);

    saveField(campo_doc)
      .then(() => {
        console.log("save lote unico");
        getField(campoId);
      })
      .catch(() => console.log("ERROR"));
  };

  const handleDeleteField = async () => {
    if (field) {
      deleteField(field).then(() => {
        updateMapAfterNew();
        navigate(-1);
      });
    }
  };

  const handleCreateLot = (data: any) => {
    navigate("new-lot");
    console.log("create lot", data);
    // let id = uuidv7();
    // let lote: Lot = {
    //   id: id,
    //   type: "Feature",
    //   properties: {
    //     nombre: campo_doc.nombre,
    //     campo_parent_id: campo_doc._id,
    //     hectareas: campo_doc.campo_geojson.properties.hectareas,
    //     uuid: id,
    //   },
    //   geometry: campo_doc.campo_geojson.geometry,
    // };
    // campo_doc.lotes.push(lote);

    // (saveField(campo_doc))
    //   .then(() => {
    //     console.log("save lote unico");
    //     getField(campoId)
    //   })
    //   .catch(() => console.log("ERROR"));
  };

  if (!field) {
    return null;
  }

  return (
    <EditField
      isOpen={true}
      field={field}
      onClose={() => {
        // removeLotsFromMap(map, selectedField.Lotes);
        //   setSelectedField(null);
        navigate("/init/overview/fields");
      }}
      onDelete={handleDeleteField}
      onLocate={handleLocateField}
      handleCreateLot={handleCreateLot}
      handleCreateUniqueLot={handleCreateUniqueLot}
    />
  );
};
