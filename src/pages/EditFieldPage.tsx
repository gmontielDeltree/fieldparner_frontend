import React, { useEffect, useState } from "react";
import NewField from "../components/NewField";
import { Box } from "@mui/material";
import NewField2 from "../components/NewField/NewFields2";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { Field } from "../interfaces/field";
import { uuidv7 } from "uuidv7";
import area from "@turf/area";
import { useField } from "../hooks";
import DrawGeometry2 from "../components/NewGeometry/DrawGeometry2";

function roundArea(feature) {
  return Math.round((area(feature) / 10000) * 100) / 100;
}

const EditFieldPage = () => {
  const navigate = useNavigate();

  const { campoId } = useParams();
  const [campo, setCampo] = useState();
  const { saveField, getField, field } = useField();
  const { updateMapAfterNew } = useOutletContext();

  useEffect(() => {
    if (campoId) {
      getField(campoId);
    }
  }, [campoId]);

  const handleSaveField = (data) => {
    let geojson = data.geometry[0].features[0];

    geojson.properties.hectareas = roundArea(geojson);

    let newFieldDoc: Field = {
      _id: field?._id,
      _rev: field?._rev,
      nombre: data.field_name,
      campo_geojson: geojson,
      lotes: field?.lotes,
      uuid: field?.uuid,
    };

    saveField(newFieldDoc).then(() => {
      // Trigger Update
      updateMapAfterNew();
      navigate(-1);
    });
  };

  const handleCloseNewField = () => {
    navigate(-1);
  };
  return (
    <Box>
      {field && (
        <DrawGeometry2
          handleSaveGeometry={handleSaveField}
          type="field"
          initialName={field.nombre}
          initialGeometry={field.campo_geojson}
          edit
        />
      )}
    </Box>
  );
};

export default EditFieldPage;
