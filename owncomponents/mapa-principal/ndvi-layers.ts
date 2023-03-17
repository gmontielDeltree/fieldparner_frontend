import { get } from "lit-translate";
import { Feature } from "@turf/helpers";
import { Router } from "@vaadin/router";
import mapboxgl, { CanvasSource } from "mapbox-gl";
import { emptyGJ, touchEvent } from "../helpers";

export const ndvi_layers_init = (map) => {
  /* Borde de lote */
  map.addSource("borde_de_este_lote", {
    type: "geojson",
    data: emptyGJ,
  });

  map.addLayer({
    id: "borde_de_este_lote",
    type: "fill",
    source: "borde_de_este_lote",
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": "#FFFFFF",
      "fill-outline-color": "#FF0000",
      "fill-opacity": 0,
    },
  });

  map.addLayer({
    id: "frontera_de_este_lote",
    type: "line",
    source: "borde_de_este_lote",
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "rgb(60, 183, 251)",
      "line-width": 4,
    },
  });

  let empty_canvas = document.createElement("canvas");
  empty_canvas.width = 2;
  empty_canvas.height = 2;
  /* Radar */
  map.addSource("canvas-source", {
    type: "canvas",
    canvas: empty_canvas,
    coordinates: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  });

  let c  = map.getSource("canvas-source") as CanvasSource
  c.pause();

  map.addLayer(
    {
      id: "radar-layer",
      type: "raster",
      source: "canvas-source",
      layout: {
        visibility: "none",
      },
      paint: {
        "raster-fade-duration": 0,
      },
    },
    "borde_de_este_lote"
  );
};
