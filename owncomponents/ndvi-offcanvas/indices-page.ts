import { featureCollection } from "@turf/helpers";
import { DualMap } from "./dual-map-control";
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
import { gbl_dualmap, gbl_state } from "../state";
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
import { features } from "process";
import area from "@turf/area";

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
    :host {
      display: flex;
      flex-grow: 1;
    }

    .drawer-contained::part(header) {
      color: tomato;
      display: none;
    }
    .drawer-contained::part(body) {
      background-color: darkkhaki;
      padding: 1rem;
    }
    #footer {
      display: flex;
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      z-index: 100;
      /* background-color:red; */
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
        featureCollection: featureCollection([]),
        dualmapControl: {},
      })
      .withConfig({
        actions: {
          showSingleMap: () => (gbl_dualmap.dualmap = false),
          showDualMap: () => (gbl_dualmap.dualmap = true),
          selectLastFeature1: assign({
            selectedFeature1: (ctx, evt) => ctx.featureCollection.features[0],
          }),
          centerMapOnFeature1: (ctx) => gbl_state.map.fitBounds(bbox(ctx.geojson),{padding:{top:50,bottom:100}}),
          addDualMapControl: (ctx) => {
            gbl_state.map.addControl(ctx.dualmapControl);
          },
          assignDualMapControl: assign({
            dualmapControl: () =>
              new DualMap({
                onClick: () => {
                  console.log("BUUU", gbl_dualmap.dualmap);
                  this.actor.send({ type: "TOGGLE" });
                },
              }),
          }),
          removeDualMapControl: (ctx) =>
            gbl_state.map.removeControl(ctx.dualmapControl),

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
              "winter",
            );
          },
          updateMap2: (ctx, evt) => {
            let response: IndicesResponse = evt.data.data;
            mostrarTIFEnMapa(
              import.meta.env.VITE_COGS_SERVER_URL + response.tiff_url,
              gbl_state.map2,
              "winter",
            );
          },
          notificarError: (ctx, evt) => {
            console.log("error", evt.data);
          },
          assignData1: assign({
            data1: (ctx, evt) => {
              return evt.data.data;
            },
          }),
          assignData2: assign({
            data2: (ctx, evt) => {
              return evt.data.data;
            },
          }),
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
          fetchImagenInicial: async (ctx, evt) => {
            // console.log("fetchImage", evt);
            let date = ctx.selectedFeature1.properties.date;
            // console.log("COOR", coordAll(ctx.geojson));
            let geometry = coordAll(ctx.geojson);
            let resource_id = ctx.lote_id;
            let indice = ctx.selectedIndice1.value;

            let hist_options = JSON.stringify({
              bins: ctx.selectedIndice1.thresholds,
            });
            let url =
              import.meta.env.VITE_COGS_SERVER_URL +
              `/indices/${indice}?resource_id=${resource_id}&geometry=${encodeURIComponent(
                JSON.stringify(geometry),
              )}&date=${date}&hist_options=${hist_options}`;
            // console.log("fetchImageURL", url);
            return await axios.get(url);
          },
          fetchImagen: async (ctx, evt) => {
            // console.log("fetchImage", evt);
            let date = evt.data.feature.properties.date;
            // console.log("COOR", coordAll(ctx.geojson));
            let geometry = coordAll(ctx.geojson);
            let resource_id = ctx.lote_id;
            let indice = evt.data.indice.value;

            let hist_options = JSON.stringify({
              bins: evt.data.indice.thresholds,
            });
            let url =
              import.meta.env.VITE_COGS_SERVER_URL +
              `/indices/${indice}?resource_id=${resource_id}&geometry=${encodeURIComponent(
                JSON.stringify(geometry),
              )}&date=${date}&hist_options=${hist_options}`;
            // console.log("fetchImageURL", url);
            return await axios.get(url);
          },
        },
      }),
  );

  ctx = new SelectorController(this, this.actor, (state) => state.context);

  state = new SelectorController(this, this.actor, (state) => state.value);

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    this.actor.start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log("DISCONENECCCC AWAY");
    this.actor.send({type:"CERRAR"})
    //gbl_dualmap.dualmap = false;
  }

  render() {
    // Aliases
    let estado = this.state.value;
    let ctx = this.ctx.value;

    const inDualMode = () => {
      return estado["loaded"] === "pantallaDividida";
    };


    const loading = ()=>{
      return html `<div
            class="d-flex justify-content-center align-items-center"
            style="width: 100%;height: 100%;position: absolute;background:#fffc;z-index: 9;"
          >
            <span>Loading</span>
          </div>`
    }
    // https://css-irl.info/finding-an-elements-nearest-relative-positioned-ancestor/#:~:text=By%20typing%20%24_%20into%20the%20console%20we%20can,the%20element.%20Then%3A%20getComputedStyle%28%24_%29.position%20retrieves%20its%20position%20value

    return html`
      ${estado === "empty" || estado === "withGeojson"
        ? loading
        : html`
            <div
              class="overlay-charts"
              style="position:absolute;display: flex;width:100%;justify-content: space-between;"
            >
              <indices-charts
                style="top:4rem;right:${inDualMode() ? "calc(50% + 4rem);": "4rem;"}"
                .data=${ctx.data1}
                .indice=${ctx.selectedIndice1}
                .hectareas_del_lote=${area(ctx.geojson)}
              ></indices-charts>
              <indices-charts
                style="top:4rem;right:4rem;${inDualMode()
                  ? ""
                  : "display:none;"}"
                .data=${ctx.data2}
                .indice=${ctx.selectedIndice2}
                .hectareas_del_lote=${area(ctx.geojson)}
              ></indices-charts>
            </div>

            <div id="footer">
              <indice-selector
                .featureCollection=${ctx.featureCollection}
                .featureSelected=${ctx.selectedFeature1}
                .selectedIndice=${ctx.selectedIndice1}
                style="${inDualMode() ? "width:50%" : "width:100%"}"
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

              ${inDualMode()
                ? html`
                    <indice-selector
                      style="width:50%"
                      .featureCollection=${ctx.featureCollection}
                      .featureSelected=${ctx.selectedFeature2}
                      .selectedIndice=${ctx.selectedIndice2}
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
            </div>
          `}
      ${estado === "loadNuevaImagen1" || estado === "loadNuevaImagen2"
        ? loading()
        : null}
    `;
  }
}
