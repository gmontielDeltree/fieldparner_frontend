import React, { useState, useCallback, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Grid } from "@mui/material";
import PouchDB from "pouchdb";
import { useParams } from "react-router-dom";
import axios from "axios";
import { get_lote_doc } from "../../owncomponents/helpers";
import bbox from "@turf/bbox";
import { format } from "date-fns";
import centroid from "@turf/centroid";
import { SatelliteMap } from "../components/Satellite/SatelliteMap";

export const SatellitePage: React.FC = () => {
  const database_name = "campos_randyv7";
  const db = dbContext.fields // new PouchDB(database_name); 
  let { loteId } = useParams();

  const [lote, setLote] = useState();
  const [features, setFeatures] = useState();
  const [dualMode, setDualMode] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: -122,
    latitude: 37,
    zoom: 12,
    pitch: 30,
  });

  const onViewStateChange = useCallback(({ viewState }) => {
    // Save the view state and trigger rerender
    // console.log("ViewStateChanged",viewState)
    setViewState(viewState);
  }, []);

  useEffect(() => {
    if (loteId) {
      get_lote_doc(db, loteId).then((e) => {
        console.log(loteId, e);
        setLote(e);
      });
    }
  }, [loteId]);

  useEffect(() => {
    if (lote) {
      let date = format(new Date(), "yyyy-MM-dd");
      let bboxStr = bbox(lote).join(",");
      let url =
        import.meta.env.VITE_COGS_SERVER_URL +
        `/indices/features?bbox=${bboxStr}&date=${date}`;

      axios.get(url).then((response) => {
        setFeatures(response.data);
      });
    }
  }, [lote]);

  return (
    <>

      <Grid container spacing={0}>
        <Grid item xs={dualMode ? 6 : 12}>

          <SatelliteMap
            viewState={viewState}
            onViewStateChange={onViewStateChange}
            features={features}
            lote={lote}
            onDualToggle={()=>setDualMode(!dualMode)}
              dualMode={dualMode}
          ></SatelliteMap>
        </Grid>
        {dualMode ? (
          <Grid item xs={6}>
             <SatelliteMap
              viewState={viewState}
              onViewStateChange={onViewStateChange}
              features={features}
              lote={lote}
              onDualToggle={()=>setDualMode(!dualMode)}
              dualMode={dualMode}
            ></SatelliteMap> 
          </Grid>
        ) : null}
      </Grid>

    </>
  );
};
