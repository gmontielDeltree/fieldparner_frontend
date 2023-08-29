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
import {
  showCanvasOnMap,
  showPopupOnMove,
  tif_identify,
} from "./geotiff-helpers";
import "./indices-charts";

const hideMapLayers = async (map: Map) => {
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
  layer_visibility(map, "borde_de_este_lote", true);
  layer_visibility(map, "radar-layer", false);
  layer_visibility(map, "frontera_de_este_lote", false);
};

const mostrarTIFEnMapa = async (url: string, map: Map, colormap: string) => {
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
    colorScale: colormap,
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

  showCanvasOnMap(map, canvas, coor, "indice-espectral");

  showPopupOnMove(map, (lng, lat) => tif_identify(lng, lat, image, data));
};

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
          updateIndex2: assign({ selectedIndice1: (_, evt) => evt.data }),
          updateFeature2: assign({ selectedFeature1: (_, evt) => evt.data }),
          updateMap1: (ctx, evt) => {
            let response: IndicesResponse = evt.data.data;
            mostrarTIFEnMapa(
              import.meta.env.VITE_COGS_SERVER_URL + response.tiff_url,
              gbl_state.map,
              "winter"
            );
          },
          updateMap2: (ctx, evt) => {
            let response: IndicesResponse = evt.data.data;
            mostrarTIFEnMapa(
              import.meta.env.VITE_COGS_SERVER_URL + response.tiff_url,
              gbl_state.map2,
              "winter"
            );
          },
          notificarError: (ctx, evt) => {
            console.log("error", evt.data);
          },
        },
        services: {
          getGeojson: async (ctx, evt) => {
            // console.log("Lote", ctx.lote_id);
            // console.log("ctx", ctx);
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
            // console.log("fetchImage", evt);
            let date = evt.data.feature.properties.date;
            // console.log("COOR", coordAll(ctx.geojson));
            let geometry = coordAll(ctx.geojson);
            let resource_id = ctx.lote_id;
            let indice = evt.data.indice.value;

            let url =
              import.meta.env.VITE_COGS_SERVER_URL +
              `/indices/${indice}?resource_id=${resource_id}&geometry=${encodeURIComponent(
                JSON.stringify(geometry)
              )}&date=${date}`;
            // console.log("fetchImageURL", url);
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
                <vaadin-button
                  @click=${() => this.actor.send({ type: "TOGGLE" })}
                  >TOGGLE</vaadin-button
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

                ${this.state.value["Loaded"] === "PantallaDividida"
                  ? html`
                      <indice-selector
                        .featureCollection=${this.ctx.value.featureCollection}
                        .featureSelected=${this.ctx.value.selectedFeature2}
                        .selectedIndice=${this.ctx.value.selectedIndice2}
                        @selectedFeatureChange=${(e: CustomEvent) => {
                          console.log("Selected Feature 2 evt");
                          this.actor.send({
                            type: "SELECTED_FEATURE_2",
                            data: e.detail,
                          });
                        }}
                        @selectedIndexChange=${() =>
                          console.log("selectedIndexChanged")}
                      ></indice-selector>
                    `
                  : null}
              </sl-drawer>
            </div>
            <div class="overlay-charts" style="position:absolute;z-index:999;">
              <indices-charts style="top:10rem;left:40rem;"></indices-charts>
            </div>
          `}
      ${this.state.value === "loadNuevaImagen1" ||
      this.state.value === "loadNuevaImagen2"
        ? html` <div
            class="d-flex justify-content-center align-items-center"
            style="width: 100%;height: 100%;position: absolute;background:#fffc;z-index: 9;"
          >
            <span>Loading</span>
          </div>`
        : null}
    `;
  }
}
