import React, { useEffect, useState } from "react";
import LotsMenu from "../components/LotsMenu";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectMap } from "../redux/map";
import { useField } from "../hooks";
import {
  addLotesToMap,
  setFieldAsSelected,
  setLoteAsSelected,
  unsetLoteAsSelected,
} from "../helpers/mapHelpers";
import bbox from "@turf/bbox";

export const LotPage = () => {
  const { campoId, loteId } = useParams();
  const navigate = useNavigate();
  const map = useSelector(selectMap);

  const { field, getField } = useField();
  const [lote, setLote] = useState();
  useEffect(() => {
    getField(campoId);
  }, [campoId, loteId]);

  useEffect(() => {
    if (field) {
      let lotes = field.lotes;
      let ellote = lotes.find((l) => l.properties.uuid === loteId);
      setLote(ellote);
    }
  }, [field]);

  useEffect(() => {
    if (field) {
      // Mostrar el campo seleccionado
      setFieldAsSelected(map, field._id);
      // Select
      setLoteAsSelected(map, loteId);
      // Fit to it
      handleLocateLot(lote);
      // Mostrar los lotes del campo
      addLotesToMap(map, field);
    }

    return () => {
      try {
        unsetLoteAsSelected(map);
      } catch (e) {
        console.log("TODO: solve undefined ref", e);
      }
    };
  }, [field, lote]);

  const handleLocateLot = (lote) => {
    if (lote && map) {
      const fieldGeoJSON = lote;
      if (fieldGeoJSON && fieldGeoJSON.geometry) {
        let ancho_del_offcanvas_en_vh = 60 + 5; // en vh
        let ancho_del_offcanvas_en_px =
          (ancho_del_offcanvas_en_vh * document.documentElement.clientWidth) /
          100;
        map.fitBounds(bbox(fieldGeoJSON), {
          padding: {
            left: ancho_del_offcanvas_en_px + 10,
            right: 10,
            top: 30,
            bottom: 30,
          },
          pitch: 45,
        });
      }
    }
  };

  if (!lote) return null;

  return (
    <LotsMenu
      lot={lote}
      field={field}
      isOpen={true}
      toggle={() => navigate(`/init/overview/fields/${field?._id}`)}
    />
  );
};
