import React from "react";
import Map from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "reactstrap";

export const FieldsPage: React.FC = () => {
  const mapStyle: mapboxgl.Style = {
    version: 8,
    sources: {
      worldImagery: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: "worldImagery",
        type: "raster",
        source: "worldImagery",
        minzoom: 0,
        maxzoom: 20
      }
    ]
  };

  return (
    <>
      <Map
        key="map-fieldpartner"
        initialViewState={{
          longitude: -59.2965,
          latitude: -35.1923,
          zoom: 14
        }}
        mapboxAccessToken="pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw"
        style={{
          width: "100vw",
          height: "100vh",
          margin: 0
        }}
        mapStyle={mapStyle}
      />
      <Button
        color="primary"
        style={{
          position: "absolute",
          bottom: 20,
          right: 20
        }}
        onClick={() => {
          console.log("Add field called");
        }}
      >
        Add Field
      </Button>
    </>
  );
};
