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
import { Field, Lot } from "../interfaces/field";
import { uuidv7 } from "uuidv7";
import area from "@turf/area";
import { useField } from "../hooks";
import DrawGeometry2 from "../components/NewGeometry/DrawGeometry2";

function roundArea(feature) {
  return Math.round((area(feature) / 10000) * 100) / 100;
}

const EditLotePage = () => {
  const navigate = useNavigate();

  const { campoId, loteId } = useParams();
  const { saveField, getField, field, getLotFromField } = useField();
  const [lote, setLote] = useState<Lot>();
  const { updateMapAfterNew } = useOutletContext();

  useEffect(() => {
    if (campoId) {
      getField(campoId);
    }
  }, [campoId]);

  useEffect(() => {
    if(field){
      getLotFromField(field,loteId).then((f)=>setLote(f))
    }
  },[field])

  const handleSaveField = (data) => {

    if(!field){
      alert("ERROR - Field not defined")
      return;
    }

    let geojson = data.geometry[0].features[0];

    let hectareas = roundArea(geojson);
    let nombre = data.field_name

    let lotes_sin_este = field?.lotes.filter((l)=>l.id !== loteId) || []

    let new_lote : Lot = {
      id : lote?.id,
      type: lote?.type,
      geometry  : geojson.geometry,
    properties: {campo_parent_id:campoId, hectareas:hectareas, uuid:loteId,nombre:nombre},
  
    }


    let newFieldDoc: Field = {
      _id: field?._id,
      _rev: field?._rev,
      nombre: field?.nombre,
      campo_geojson: field?.campo_geojson,
      lotes: [...lotes_sin_este,new_lote],
      uuid: field?.uuid,
    };


    //console.log("new field doc", newFieldDoc, field, lote)
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
      {lote && (
        <DrawGeometry2
          handleSaveGeometry={handleSaveField}
          type="lot"
          initialName={lote.properties.nombre}
          initialGeometry={lote}
          edit
        />
      )}
    </Box>
  );
};

export default EditLotePage;
