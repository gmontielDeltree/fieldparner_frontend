import React, { useEffect, useState } from "react";
import LotsMenu from "../components/LotsMenu";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectMap } from "../redux/map";
import { useField } from "../hooks";
import { addLotesToMap, setFieldAsSelected } from "../helpers/mapHelpers";
import bbox from '@turf/bbox';

export const LotPage = () => {
  const { campoId, loteId } = useParams();
  const navigate = useNavigate();
  const map = useSelector(selectMap);

  const { field, getField } = useField();
  const [lote, setLote ] = useState();
  useEffect(() => {
    getField(campoId);
  }, [campoId]);

  useEffect(() => {
    if (field) {
      let lotes = field.lotes;
      let ellote = lotes.find((l) => l.properties.uuid === loteId);
      setLote(ellote);
    }
  }, [field]);

  useEffect(()=>{
    if(field){
      // Mostrar el campo seleccionado
      setFieldAsSelected(map,field._id)
      // Fit to it
      handleLocateField(field)
      // Mostrar los lotes del campo
      addLotesToMap(map, field)
    }
  },[field])


  

  const handleLocateField = (field) => {
    if (field && map) {
      const fieldGeoJSON = field.campo_geojson;
      if (fieldGeoJSON && fieldGeoJSON.geometry) {
        const coordinates = fieldGeoJSON.geometry.coordinates[0][0];
        const [longitude, latitude] = coordinates;
        map.fitBounds(bbox(fieldGeoJSON),{padding:{left:50,top:30,bottom:30}});
      }
    }
  };

  if (!lote) return null;

  return (
    <LotsMenu
      lot={lote}
      field={field}
      isOpen={true}
      toggle={() => navigate(-1)}
    />
  );
};
