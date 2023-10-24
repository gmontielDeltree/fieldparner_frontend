import Map from "react-map-gl";
import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React from "react";
import { useAppSelector } from "../../hooks";

const mapStyle: mapboxgl.Style = {
  version: 8,
  sources: {
    worldImagery: {
      type: "raster",
      tiles: [
        //"http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga"
        //"https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "worldImagery",
      type: "raster",
      source: "worldImagery",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
  // glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
};

export interface TemplateLayoutProps {
  viewMap?: boolean;
  children: React.ReactNode;
}

const open = true; //TODO: agregar en uiSlice el estado open
const drawerWidth = "245px"; //Ancho del sidebar en px;
export const TemplateLayout: React.FC<TemplateLayoutProps> = ({
  viewMap,
  children,
}) => {
  const { openSideBar } = useAppSelector((state) => state.ui);

  return (
    <>
      <Box
        component="div"
        // display="inline-block"
        sx={{
          width: viewMap ? "60%" : "100%",
          height: "100%",
          // maxWidth: 800,
          p: 1,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
        </LocalizationProvider>
      </Box>
      {viewMap && (
        <Box
          key="box-map-container"
          component="div"
          display="inline-block"
          sx={{
            position: "relative",
            width: `calc(40% + ${open ? "0px" : "240px"})`,
            height: "100%",
          }}
        >
          <Map
            key="map-fieldpartner"
            initialViewState={{
              longitude: -59.2965,
              latitude: -35.1923,
              zoom: 14,
            }}
            mapboxAccessToken="pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw"
            style={{
              width: "100%",
              margin: 0,
              position: "absolute",
              top: 0,
              bottom: 0,
            }}
            mapStyle={mapStyle}
          />
        </Box>
      )}
    </>
  );
};
