import React, { useState, useCallback, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import DeckGL from "@deck.gl/react";
import { Map, MapRef } from "react-map-gl";
import { IndiceSelectorReact } from "../../../owncomponents/ndvi-offcanvas/react-port/indice-selector";
import styles from "./indice-selector.module.css";
import { BitmapLayer } from "@deck.gl/layers";
import axios from "axios";
import bbox from "@turf/bbox";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { useControl } from "react-map-gl";
import { list_of_indexes } from "../../../owncomponents/ndvi-offcanvas/indices-types";
import { MenuItem, Select, Button, TextField, Grid, Chip, Paper } from "@mui/material";
import { PropertyValueMap } from "lit";
import { DatePicker, MobileDatePicker } from "@mui/x-date-pickers";
import { features } from "process";
import { format, isEqual, parse, toDate } from "date-fns";

import { styled } from "@mui/material/styles";
import { Splash } from "./Splash";
import { GeoJsonLayer } from "@deck.gl/layers";
import { MaskExtension } from "@deck.gl/extensions";
import { readPixelsToArray } from "@luma.gl/core";
import { IndiceChartsReact } from "../../../owncomponents/ndvi-offcanvas/react-port/indices-charts";
import { SatelliteCharts } from "./SatelliteCharts";
import { SatelliteResumen } from "./SatelliteResumen";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw";

const datesFromFeatures = (featureCol) => {
  let dates = featureCol.features.map((f) =>
    parse(f.properties.date, "yyyy-MM-dd", new Date())
  );
  return dates;
};

const isInvalid = (datea: Date, validDates: Date[]) => {
  let valid = validDates.find((d) => isEqual(d, datea.toDate()));
  return valid !== undefined ? true : false;
};

function DeckGLOverlay(
  props: MapboxOverlayProps & {
    interleaved?: boolean;
  }
) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export const SatelliteMap: React.FC = ({
  viewState,
  onViewStateChange,
  onDualToggle,
  features,
  lote,
}: any) => {
  const mapRef = useRef<MapRef>();

  const [origin, setOrigin] = useState(false);

  const onMove = useCallback((evt) => {
    onViewStateChange({ ...evt });
  }, []);

  const onMoveStart = useCallback((evt) => {
    setOrigin(true);
  }, []);

  const onMoveEnd = useCallback((evt) => {
    setOrigin(false);
  }, []);

  const [hoverInfo, setHoverInfo] = useState();
  const [loading, setLoading] = useState(true);

  const [layers, setLayers] = useState([]);

  const [indice, setIndice] = useState(list_of_indexes[0]);

  const [selectedDate, setSelectedDate] = useState();

  const [indiceRequestResponse, setIndiceRequestResponse] = useState();

  // parse(features.features[0].properties.date, "yyyy-MM-dd", new Date())

  const newBitmapLayer = (
    url: string,
    bbox: Number[],
    pickable: boolean,
    maskId: string,
    id: string
  ) => {
    let options = {
      id: id,
      bounds: bbox,
      image: url,
      extensions: [new MaskExtension()],
      maskId: maskId,
    };

    if (pickable) {
      options.pickable = pickable;
      // Update app state
      options.onHover = (info) => {
        if (info.bitmap) {
          const pixelColor = readPixelsToArray(info.layer.props.image, {
            sourceX: info.bitmap.pixel[0],
            sourceY: info.bitmap.pixel[1],
            sourceWidth: 1,
            sourceHeight: 1,
          });
          // console.log("Color at picked pixel:", pixelColor, info);
          let indexValue = parseFloat(
            ((pixelColor[0] * 2) / 255 - 1).toFixed(2)
          );
          setHoverInfo({
            x: info.devicePixel[0],
            y: info.devicePixel[1],
            color: indexValue,
          });
        } else {
          setHoverInfo({ ...info });
        }
      };
    }
    return new BitmapLayer(options);
  };

  useEffect(() => {
    if (selectedDate && indice && lote) {
      let resourceId = lote.id;
      let date = format(selectedDate, "yyyy-MM-dd");
      let histogramOptions = { bins: indice.thresholds };

      console.log(
        "Fetching Observation Card",
        lote,
        resourceId,
        date,
        histogramOptions,
        indice
      );

      let body = { resourceId, date, histogramOptions, lote: lote, indice };
      let baseURL = import.meta.env.VITE_COGS_SERVER_URL + "/indices/request";
      axios.post(baseURL, body).then((response) => {
        console.log(response.data);
        let pngURL = response.data.png_url;
        setIndiceRequestResponse(response.data);
        updateImage(
          import.meta.env.VITE_COGS_SERVER_URL + pngURL,
          bbox(lote),
          lote
        );
        // PNG URL

        // Update layers
      });
    }
  }, [selectedDate, indice]);

  const updateImage = (image_url: string, bbox: Number[], maskGeojson) => {
    let mask_layer = new GeoJsonLayer({
      id: "geofence",
      data: maskGeojson,
      operation: "mask",
    });

    let coloredLayer = newBitmapLayer(
      image_url,
      bbox,
      false,
      "geofence",
      "bitmap-layer"
    );
    let valueLayer = newBitmapLayer(
      image_url.replace(".png", "_greyscale.png"),
      bbox,
      true,
      "geofence",
      "value-layer"
    );

    let nl: BitmapLayer = [mask_layer, valueLayer, coloredLayer];
    setLayers(nl);
  };

  useEffect(() => {
    if (lote) {
      const [minLng, minLat, maxLng, maxLat] = bbox(lote);
      console.log(
        "FIT TO BOUNDS ? ",
        lote,
        mapRef,
        minLng,
        minLat,
        maxLng,
        maxLat
      );

      mapRef?.current?.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 1000 }
      );
    }
  }, [lote]);

  const onLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleIndiceChange = (e) => {
    console.log("HANDLE INDICE", e);
    let indice = list_of_indexes.find((i) => i.name === e.target.value);
    setIndice(indice);
  };

  const [mousePos, setMousePos] = useState({});

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <Grid container style={{ height: "100%", position: "relative" }}>
        <Grid item xs={12} style={{ height: "100%" }}>
          <Map
            ref={mapRef}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12?optimize=true"
            {...viewState}
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            onLoad={onLoad}
            onMove={onMove}
            onMoveStart={onMoveStart}
          >
            <DeckGLOverlay layers={[layers]} />
          </Map>
        </Grid>

        <Paper
          style={{
            position: "absolute",
            top: "30px",
            marginLeft: "10px",
            display: "flex",
            gap: "10px",
            backgroundColor: "#1976d2",
            padding: "10px",
            color: "white",
            zIndex: 2,
          }}
        >
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={indice.name}
            label="Indice"
            onChange={handleIndiceChange}
          >
            {list_of_indexes.map((i) => {
              return (
                <MenuItem key={i.name} value={i.name}>
                  {i.name}
                </MenuItem>
              );
            })}
          </Select>

          {features && (
            <MobileDatePicker
              label="Fecha"
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue.toDate());
              }}
              shouldDisableDate={(e) =>
                isInvalid(e, datesFromFeatures(features))
              }
              disableFuture
            />
          )}
        </Paper>

        <div
          style={{
            position: "absolute",
            zIndex: 2,
            top: "30px",
            right: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Button variant="contained">Excel</Button>
          <Button variant="contained">PNG</Button>
          <Button variant="contained" onClick={() => onDualToggle()}>
            Dual
          </Button>
        </div>

        {selectedDate && indiceRequestResponse && (
          <>
            <Paper
              style={{
                position: "absolute",
                zIndex: 5,
                top: "30%",
                right: "3%",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                backgroundColor: "#1976d299"
              }}
            >
              <SatelliteCharts
               data={indiceRequestResponse}
               indice={indice}
               date={indiceRequestResponse.date}
               hectareas_del_lote={
                 indiceRequestResponse.area_mts_squared / 10000
               }
              ></SatelliteCharts>
            </Paper>
            <div style={{
                position: "absolute",
                zIndex: 5,
                top: "35%",
                left: "3%",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}>
              <SatelliteResumen></SatelliteResumen>
            </div>
          </>
        )}

        {loading && <Splash />}
      </Grid>

      {hoverInfo && hoverInfo.color && (
        <div
          style={{
            position: "absolute",
            zIndex: 2,
            pointerEvents: "none",
            left: mousePos.x,
            top: mousePos.y - 30,
          }}
        >
          <Chip label={hoverInfo.color} color="primary" />
        </div>
      )}
    </>
  );
};
