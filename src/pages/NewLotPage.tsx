import React, { useEffect } from "react";
import NewField from "../components/NewField";
import { Box } from "@mui/material";
import NewField2 from "../components/NewField/NewFields2";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Field } from "../interfaces/field";
import { uuidv7 } from "uuidv7";
import area from "@turf/area";
import { useField } from "../hooks";
import NewGeometry2 from "../components/NewGeometry/NewGeometry2";
import { useSelector } from "react-redux";
import { selectMap } from "../redux/map";
import { addLotesToMap, setFieldAsSelected, showOnlyFieldBordersAndLotes, showOnlyFieldFillAndLotes } from "../helpers/mapHelpers";
import { Lot } from "@types";
import { property } from "lit-element";

function roundArea(feature) {
  return Math.round((area(feature) / 10000) * 100) / 100;
}

export const NewLotPage = () => {
  const navigate = useNavigate();
  const { campoId } = useParams();
  const map = useSelector(selectMap);

  const { updateMapAfterNew } = useOutletContext();
  const { deleteField, saveField } = useField();

  const { field, getField, addLotToField, removeLotFromField } = useField();

  useEffect(() => {
    getField(campoId);
  }, [campoId]);

  useEffect(() => {
    if (field) {
      setFieldAsSelected(map, field._id)
      addLotesToMap(map, field)
      // mostrar solo el perimetro del campo y los otro lotes
      showOnlyFieldBordersAndLotes(map, field._id);
    }

    return () => {
      //showOnlyFieldFillAndLotes(map);
    }
  }, [field]);

  const handleSaveLote = (data: any) => {

    let geojson_from_editor = data.geometry[0].features[0]

    console.log("Save lote", data)
    let uuid = uuidv7()
    let lote: Lot = {
      type: "Feature",
      id: uuid,
      geometry: geojson_from_editor.geometry,
      properties: {
        nombre: data.field_name,
        uuid: uuid,
        campo_parent_id: field?._id || "",
        hectareas: 0,
      }
    }

    lote.properties.hectareas = roundArea(geojson_from_editor)



    // console.log("Save lote", data, lote)
    addLotToField(field, lote).then(() => {
      // Trigger Update
      updateMapAfterNew()
      handleCloseNewField()
    })
  };

  const handleCloseNewField = () => {
    navigate(-1);
  };
  return (
    <Box>
      <NewGeometry2
        handleSaveGeometry={handleSaveLote}
        onClose={handleCloseNewField}
        type="lot"
      />
    </Box>
  );
};
