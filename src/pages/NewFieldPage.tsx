import React from "react";
import NewField from "../components/NewField";
import { Box } from "@mui/material";
import NewField2 from "../components/NewField/NewFields2";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Field } from "../interfaces/field";
import { uuidv7 } from "uuidv7";
import area from "@turf/area";
import { useField } from "../hooks";



function roundArea(feature) {
  return Math.round((area(feature) / 10000) * 100) / 100;
}


const NewFieldPage = () => {
  const navigate = useNavigate();

  const {saveField} = useField();
  const {updateMapAfterNew} = useOutletContext();

  const handleSaveField = (data) => {
    let uuid = uuidv7()
    let geojson = data.geometry[0].features[0]

    geojson.properties.hectareas = roundArea(geojson);

    let newFieldDoc : Field  = {
      _id : "campos_"+uuid,
      nombre:data.field_name,
      campo_geojson:geojson,
      lotes:[],
      uuid : uuid
    }


    saveField(newFieldDoc).then(()=>{
      // Trigger Update
      updateMapAfterNew()
    })


  };

  const handleCloseNewField = () => {
    navigate(-1);
  };
  return (
    <Box>
      <NewField2
        saveGeometry={handleSaveField}
        onClose={handleCloseNewField}
      />
    </Box>
  );
};

export default NewFieldPage;
