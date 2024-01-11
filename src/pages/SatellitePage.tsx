import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button, Grid } from "@mui/material";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import center from "@turf/center";
import area from "@turf/area";
import PouchDB from "pouchdb";
import NewField from "../components/NewField";
import { addFieldsToMap } from "../helpers/mapHelpers";
import EditField from "../components/EditField";
import NewsBar from "../components/NewsBar";
import NewLot from "../components/NewLot";
import MapComponent from "../components/Map";
import convex from "@turf/convex";
import LotsMenu from "../components/LotsMenu";
import uuid4 from "uuid4";
import { Feature } from "geojson";
import { useParams } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { machine } from "../../owncomponents/ndvi-offcanvas/indices-machine";
import DeckGL from "@deck.gl/react";
import { LineLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl";
import { styled } from "@mui/material/styles";
import { MapView } from "@deck.gl/core";
import { IndiceSelectorReact } from "../../owncomponents/ndvi-offcanvas/react-port/indice-selector";
import styles from "../../owncomponents/ndvi-offcanvas/react-port/indice-selector.module.css";
import { BitmapLayer } from "@deck.gl/layers";
import axios from "axios";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0,
};

// Data to be used by the LineLayer
const data = [
  {
    sourcePosition: [-35, -37],
    targetPosition: [-35, -38],
  },
];

interface Lot {
  id: string;
  type: string;
  properties: {
    nombre: string;
    campo_parent_id: string;
    uuid: string;
    hectareas: number;
  };
  geometry: {
    coordinates: number[][][];
    type: string;
  };
}

interface Field {
  nombre: string;
  campo_geojson: any;
  uuid: string;
  lotes: Lot[];
  _id: string;
  _rev: string;
}

export const SatelliteMap: React.FC = ({
  viewState,
  onViewStateChange,
  features,
}: any) => {
  
  const [hoverInfo, setHoverInfo] = useState();

  const [layers, setLayers] = useState([
    new BitmapLayer({
      id: "bitmap-layer",
      bounds: [-122.519, 37.7045, -122.355, 37.829],
      image:
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-districts.png",
      // Enable picking
      pickable: true,
      // Update app state
      onHover: (info) => {
        console.log(info);
        setHoverInfo(info);
      },
    }),
  ]);

  const [feature, setFeature] = useState({});
  const [indexResponse, setIndexResponse] = useState({});

  useEffect(() => {
    let baseURL =
      "https://agrotools.qts-ar.com.ar/satimages/indices/ndvi?resource_id=b79f1d2f-b2f2-4657-9df3-2f6c8b06236b&geometry=%5B%5B-60.404107264181775%2C-34.61497160246053%5D%2C%5B-60.40702159038035%2C-34.61752867113945%5D%2C%5B-60.410310129670606%2C-34.61499026748093%5D%2C%5B-60.40745250242564%2C-34.61244245340054%5D%2C%5B-60.404107264181775%2C-34.61497160246053%5D%5D&date=2024-01-08&hist_options={%22bins%22:[-1,0.2,0.3,1]}";
    axios.get(baseURL).then((response) => {
      console.log(response.data);
      setIndexResponse(response.data);
      let fileURL = "https://agrotools.qts-ar.com.ar/satimages" + response.data.png_url;
      updateImage(fileURL,[]);
    });
  }, [feature]);

  const updateImage = (image_url, bbox) => {
    console.log("UPDTE MAGEs", image_url, bbox);
    let nl = new BitmapLayer({
      id: "bitmap-layer",
      bounds: [-122.519, 37.7045, -122.355, 37.829], //bbox;
      image: image_url,
        //"https://agrotools.qts-ar.com.ar/satimages/files/indices/b79f1d2f-b2f2-4657-9df3-2f6c8b06236b_2024-01-08_ndvi.png",
      // Enable picking
      pickable: true,
      // Update app state
      onHover: (info) => setHoverInfo(info),
    });
    setLayers([nl]);
  };

  return (
    <>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        style={{ position: "relative" }}
        viewState={viewState}
        onViewStateChange={onViewStateChange}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
        {hoverInfo && hoverInfo.color && (
          <div
            style={{
              position: "absolute",
              zIndex: 9,
              pointerEvents: "none",
              left: hoverInfo.x,
              top: hoverInfo.y,
            }}
          >
            {JSON.stringify(hoverInfo.color)}
          </div>
        )}
      </DeckGL>

      <IndiceSelectorReact
        className={styles.indiceselector}
        onSelectedFeatureChange={(e) => {
          console.log("Feature Change",e);
          setFeature(e.detail);
        } }
        featureCollection={features}
      ></IndiceSelectorReact>
    </>
  );
};

export const SatellitePage: React.FC = () => {
  const database_name = "campos_randyv7";
  const db = new PouchDB(database_name);
  let { loteId } = useParams();

  const [features, setFeatures] = useState({});
  const [feature_2, setFeature2] = useState({});

  const [viewState, setViewState] = useState({
    longitude: -122,
    latitude: 37,
    zoom: 12,
    pitch: 30,
  });

  const onViewStateChange = useCallback(({ viewState }) => {
    // Save the view state and trigger rerender
    setViewState(viewState);
  }, []);

  // const [state, send, actorRef] = useMachine(machine);

  // useEffect(() => {
  //   const subscription = actorRef.subscribe((snapshot) => {
  //     // simple logging
  //     console.log(snapshot);
  //   });

  //   return subscription.unsubscribe;
  // }, [actorRef]); // note: actor ref should never change

  useEffect(() => {
    let baseURL =
      "https://agrotools.qts-ar.com.ar/satimages/indices/features?bbox=-60.410310129670606,-34.61752867113945,-60.404107264181775,-34.61244245340054&date=2024-01-11";
    axios.get(baseURL).then((response) => {
      setFeatures(response.data);
    });
  }, []);

  return (
    <>
      <Grid container spacing={0}>
        <Grid item xs={6}>
          <SatelliteMap
            viewState={viewState}
            onViewStateChange={onViewStateChange}
            features={features}
          ></SatelliteMap>
        </Grid>
        <Grid item xs={6}>
          <SatelliteMap
            viewState={viewState}
            onViewStateChange={onViewStateChange}
            features={features}
          ></SatelliteMap>
        </Grid>
      </Grid>
    </>
  );
};
