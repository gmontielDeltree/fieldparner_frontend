import {
  CanvasSource,
  ImageSource,
  Map,
  Popup,
  RasterSource,
  VectorSource,
} from "mapbox-gl";
import { DataTable } from "./../../src/components/DataTable/index";
import { LitElement, PropertyValueMap, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./indice-selector";
import { machine } from "./indices-machine";
import { interpret, actions, createMachine, assign } from "xstate";
import { SelectorController } from "xstate-lit/dist/select-controller";
import { gbl_state } from "../state";
import axios from "axios";
import bbox from "@turf/bbox";
import { coordAll } from "@turf/meta";
import { Router, RouterLocation } from "@vaadin/router";
import { get_lote_doc, layer_visibility } from "../helpers";
import { format } from "date-fns";
import { IndicesResponse, list_of_indexes } from "./indices-types";
import "@shoelace-style/shoelace/dist/components/drawer/drawer.js";
import bboxPolygon from "@turf/bbox-polygon";
import { fromUrl } from "geotiff";
import { plot as Pplot } from "plotty";

const hideMapLayers = async (map) => {
  // Reestablecer Mapa
  layer_visibility(map, "campos", false);
  layer_visibility(map, "campos_border", false);
  layer_visibility(map, "lotes", false);
  layer_visibility(map, "lotes_border", false);
  layer_visibility(map, "nombres_campos", false);
  //layer_visibility(gbl_state.map, "seleccion_lotes", false);
  layer_visibility(map, "seleccion_lotes_fill", false);

  /* Hide NDVI */
  //layer_visibility(gbl_state.map, "ndvi-layer", false);
  layer_visibility(map, "borde_de_este_lote", false);
  layer_visibility(map, "radar-layer", false);
  layer_visibility(map, "frontera_de_este_lote", false);
};

const mostrarTIFEnMapa = async (url: string, map: Map) => {
  const tiff = await fromUrl(url);
  const image = await tiff.getImage();
  const data = await image.readRasters();
  console.log("DATA TIFF", data);

  const canvas = document.createElement("canvas");

  const plot = new Pplot({
    canvas,
    data: data[0],
    width: image.getWidth(),
    height: image.getHeight(),
    domain: [-1, 1],
    colorScale: "viridis",
  });
  plot.render();

  const [gx1, gy1, gx2, gy2] = image.getBoundingBox();
  let coor = [
    [gx1, gy1],
    [gx2, gy1],
    [gx2, gy2],
    [gx1, gy2],
  ].reverse();
  // console.log("COORDINATES",coor)

  try {
    map.addSource("indice-espectral", {
      type: "canvas",
      canvas: canvas,
      coordinates: coor,
    });
  } catch (e) {
    let source = map.getSource("indice-espectral") as CanvasSource;
    source.canvas = canvas;
    source.setCoordinates(coor);
  }

  try {
    map.addLayer({
      id: "indice-espectral",
      type: "raster",
      source: "indice-espectral",
      paint: {
        "raster-fade-duration": 0,
      },
    });
  } catch (e) {
    console.log(e);
  }

  map.on("click", function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["indice-espectral"],
    });

    console.log("cliciicici", features);
    if (!features.length) {
      return;
    }

    var feature = features[0];
    var pixelValue = feature.properties.pixelValue;

    new Popup()
      .setLngLat(e.lngLat)
      .setHTML("Pixel value: " + pixelValue)
      .addTo(map);
  });
};

const mostrarPNGEnMapa = (url: string, bounds: number[][], map: Map) => {
  console.log("bounds", bounds, url);
  try {
    map.addSource("indice-espectral", {
      type: "vector",
      tiles: [
        import.meta.env.VITE_COGS_SERVER_URL +
          url.replace("png", "mvt").replace("http", "https"),
      ],
      minzoom: 6,
      maxzoom: 14,
    });
  } catch (e) {
    let source = map.getSource("indice-espectral") as VectorSource;
    source.setUrl(url.replace("png", "mvt").replace("http", "https"));
  }

  try {
    map.addLayer({
      id: "indice-espectral-layer",
      type: "line",
      source: "indice-espectral",
      "source-layer": "default",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#ff69b4",
        "line-width": 1,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

function arrayToBase64(array: [number, number][]) {
  // Convert the array of arrays to a byte array.
  let byteArray = new Float64Array(array.length * 2);

  for (let i = 0; i < array.length; i++) {
    byteArray[i * 2] = array[i][0];
    byteArray[i * 2 + 1] = array[i][1];
  }

  // Encode the byte array to base64.
  let base64String = btoa(byteArray);

  // Remove any padding characters.
  base64String = base64String.replace(/=+$/, "");

  return base64String;
}

@customElement("indices-page")
export class IndicesPage extends LitElement {
  @property()
  location: RouterLocation = gbl_state.router.location;

  static override styles = css`
    .drawer-contained::part(header) {
      color: tomato;
      display: none;
    }
    .drawer-contained::part(body) {
      background-color: darkkhaki;
      padding: 1rem;
    }
  `;

  @state()
  actor = interpret(
    machine
      .withContext({
        lote_id: "",
        geojson: {},
        selectedFeature1: {},
        selectedFeature2: {},
        selectedIndice1: list_of_indexes[0],
        selectedIndice2: list_of_indexes[0],
        featureCollection: {},
      })
      .withConfig({
        actions: {
          assignLoteId: assign({
            lote_id: (ctx, evt) => (() => this.location.params.uuid)(),
          }),
          assignFeatures: assign({
            featureCollection: (ctx, evt) => evt.data.data,
          }),
          assignGeojson: assign({ geojson: (ctx, evt) => evt.data }),
          limpiarMap1y2: () => {
            hideMapLayers(gbl_state.map);
          },
          updateIndex1: assign({ selectedIndice1: (_, evt) => evt.data }),
          updateFeature1: assign({ selectedFeature1: (_, evt) => evt.data }),
          updateMap1: (ctx, evt) => {
            let response: IndicesResponse = evt.data.data;
            mostrarTIFEnMapa(
              import.meta.env.VITE_COGS_SERVER_URL + response.tiff_url,
              gbl_state.map
            );
          },
          notificarError: (ctx, evt) => {
            console.log("error", evt.data);
          },
        },
        services: {
          getGeojson: async (ctx, evt) => {
            console.log("Lote", ctx.lote_id);
            console.log("ctx", ctx);
            let lote = await get_lote_doc(gbl_state.db, ctx.lote_id);
            return lote;
          },
          getFeatures: async (ctx, evt) => {
            console.log("getFeatures");
            let date = format(new Date(), "yyyy-MM-dd");
            let bbox_str = bbox(ctx.geojson).join(",");
            let url =
              import.meta.env.VITE_COGS_SERVER_URL +
              `/indices/features?bbox=${bbox_str}&date=${date}`;
            console.log("url ", url);
            return await axios.get(url);
          },
          fetchImagen: async (ctx, evt) => {
            console.log("fetchImage", evt);
            let date = evt.data.feature.properties.date;
            console.log("COOR", coordAll(ctx.geojson));
            let geometry = coordAll(ctx.geojson);
            let resource_id = ctx.lote_id;
            let indice = evt.data.indice.value;

            let url =
              import.meta.env.VITE_COGS_SERVER_URL +
              `/indices/${indice}?resource_id=${resource_id}&geometry=${encodeURIComponent(
                JSON.stringify(geometry)
              )}&date=${date}`;
            console.log("fetchImageURL", url);
            return await axios.get(url);
          },
        },
      })
  );

  ctx = new SelectorController(this, this.actor, (state) => state.context);
  state = new SelectorController(this, this.actor, (state) => state.value);

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.actor.start();
  }

  render() {
    return html`
      ${this.state.value === "Empty"
        ? "loading"
        : html`
            <div>
              <sl-drawer
                label=""
                contained
                class="drawer-contained"
                open
                placement="bottom"
                style="--size: 23%;"
              >
                <indice-selector
                  .featureCollection=${this.ctx.value.featureCollection}
                  .featureSelected=${this.ctx.value.selectedFeature1}
                  .selectedIndice=${this.ctx.value.selectedIndice1}
                  @selectedFeatureChange=${(e: CustomEvent) => {
                    console.log("Selected Feature 1 evt");
                    this.actor.send({
                      type: "SELECTED_FEATURE_1",
                      data: e.detail,
                    });
                  }}
                  @selectedIndexChange=${() =>
                    console.log("selectedIndexChanged")}
                ></indice-selector>
              </sl-drawer>
            </div>
          `}
    `;
  }
}
