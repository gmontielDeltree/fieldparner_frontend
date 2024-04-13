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
import { showOnlyFieldBordersAndLotes, showOnlyFieldFillAndLotes } from "../helpers/mapHelpers";

function roundArea(feature) {
  return Math.round((area(feature) / 10000) * 100) / 100;
}

export const NewLotPage = () => {
  const navigate = useNavigate();
  const { campoId } = useParams();
  const map = useSelector(selectMap);

  const { updateMapAfterNew } = useOutletContext();
  const { deleteField, saveField } = useField();

  const { field, getField } = useField();

  useEffect(() => {
    getField(campoId);
  }, [campoId]);

  useEffect(() => {
    if (field) {
      // mostrar solo el perimetro del campo y los otro lotes
      showOnlyFieldBordersAndLotes(map, field._id);
    }

    return () => {
      //showOnlyFieldFillAndLotes(map);
    }
  }, [field]);

  const handleSaveLote = (data) => {
    console.log("Save lote", data)
    // let uuid = uuidv7();
    // let geojson = data.geometry[0].features[0];

    // geojson.properties.hectareas = roundArea(geojson);

    // let newFieldDoc: Field = {
    //   _id: "campos_" + uuid,
    //   nombre: data.field_name,
    //   campo_geojson: geojson,
    //   lotes: [],
    //   uuid: uuid,
    // };

    // saveField(newFieldDoc).then(() => {
    //   // Trigger Update
    //   updateMapAfterNew();
    // });
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
