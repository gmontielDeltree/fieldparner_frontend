import { LeyendaControl } from "./map-controls/leyenda_control";
import { DownloadPngControl } from "./map-controls/download-png-control";
import { DownloadExcelControl } from "./map-controls/download-excel-control";
import {
  geotiff_to_excel,
  hideMapLayers,
  mostrarTIFEnMapa,
  removeEventHandlers,
  removeIndicesLayersSources,
} from "./geotiff-helpers";
import { featureCollection } from "@turf/helpers";
import { DualMap } from "./map-controls/dual-map-control";
import { CanvasSource, Map } from "mapbox-gl";
import { LitElement, PropertyValueMap, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./indice-selector";
import { machine } from "./indices-machine";
import { interpret, assign } from "xstate";
import { SelectorController } from "xstate-lit/dist/select-controller";
import { gbl_dualmap, gbl_state } from "../state";
import axios from "axios";
import bbox from "@turf/bbox";
import { coordAll } from "@turf/meta";
import { RouterLocation } from "@vaadin/router";
import { get_lote_doc } from "../helpers";
import { format } from "date-fns";
import { IndicesResponse, list_of_indexes } from "./indices-types";
import "@shoelace-style/shoelace/dist/components/drawer/drawer.js";
import "./indices-charts";
import area from "@turf/area";
import { showNotification } from "../helpers/notificaciones";
import "./indices-histograma";

@customElement("indices-page")
export class IndicesPage extends LitElement {
  @property()
  location: RouterLocation = gbl_state.router.location;

  static styles = css`
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
      })
      .withConfig({
        actions: {
          showSingleMap: () => (gbl_dualmap.dualmap = false),
          showDualMap: () => (gbl_dualmap.dualmap = true),
          selectLastFeature1: assign({
            selectedFeature1: (ctx, evt) => {
              return {
                feature: ctx.featureCollection.features[0],
                indice: ctx.selectedIndice1,
              };
            },
            selectedFeature2: (ctx, evt) => {
              return {
                feature: ctx.featureCollection.features[0],
                indice: ctx.selectedIndice2,
              };
            },
          }),
          centerMapOnFeature1: (ctx) =>
            gbl_state.map.fitBounds(bbox(ctx.geojson), {
              padding: { top: 50, bottom: 100 },
            }),
          assignMapStuff: assign({
            mapStuff: () => [
              /* Dual Map */
              new DualMap({
                onClick: () => {
                  this.actor.send({ type: "TOGGLE" });
                },
              }),
              /* Excel map 1 - OJO USANDO this.ctx*/
              new DownloadExcelControl({
                onClick: () => {
                  this.actor.send({ type: "DOWNLOAD_XLS", data: 1 });
                },
              }),
              /* Excel map 2*/
              new DownloadExcelControl({
                onClick: () => {
                  this.actor.send({ type: "DOWNLOAD_XLS", data: 2 });
                },
              }),
              /* PNG map 1*/
              new DownloadPngControl({
                onClick: () => {
                  this.actor.send({ type: "DOWNLOAD_PNG", data: 1 });
                },
              }),
              /* PNG map 2*/
              new DownloadPngControl({
                onClick: () => {
                  this.actor.send({ type: "DOWNLOAD_PNG", data: 2 });
                },
              }),
              new LeyendaControl(),
              new LeyendaControl(),
            ],
          }),
          addMapStuff: (ctx) => {
            gbl_state.map.addControl(ctx.mapStuff[0]);
            gbl_state.map.addControl(ctx.mapStuff[1]);
            gbl_state.map2.addControl(ctx.mapStuff[2]);
            gbl_state.map.addControl(ctx.mapStuff[3]);
            gbl_state.map2.addControl(ctx.mapStuff[4]);
            gbl_state.map.addControl(ctx.mapStuff[5], "top-left");
            gbl_state.map2.addControl(ctx.mapStuff[6], "top-left");
          },
          removeMapStuff: (ctx) => {
            gbl_state.map.removeControl(ctx.mapStuff[0]);
            gbl_state.map.removeControl(ctx.mapStuff[1]);
            gbl_state.map2.removeControl(ctx.mapStuff[2]);
            gbl_state.map.removeControl(ctx.mapStuff[3]);
            gbl_state.map2.removeControl(ctx.mapStuff[4]);
            gbl_state.map.removeControl(ctx.mapStuff[5]);
            gbl_state.map2.removeControl(ctx.mapStuff[6]);
          },
          assignLoteId: assign({
            lote_id: (ctx, evt) => this.location.params.uuid,
          }),
          assignFeatures: assign({
            featureCollection: (ctx, evt) => evt.data.data,
          }),
          assignGeojson: assign({ geojson: (ctx, evt) => evt.data }),
          limpiarMap1y2: () => {
            hideMapLayers(gbl_state.map);
          },
          updateIndex1: assign({ selectedIndice1: (_, evt) => evt.data.indice }),
          updateFeature1: assign({ selectedFeature1: (_, evt) => evt.data }),
          updateIndex2: assign({ selectedIndice2: (_, evt) => evt.data.indice }),
          updateFeature2: assign({ selectedFeature2: (_, evt) => evt.data }),
          updateMap1: (ctx, evt) => {
            let response: IndicesResponse = evt.data.data;
            mostrarTIFEnMapa(
              import.meta.env.VITE_COGS_SERVER_URL + response.tiff_url,
              gbl_state.map,
              ctx.selectedIndice1.colormap,
            );
            ctx.mapStuff[5].setDomain(ctx.selectedIndice1.domain);
            ctx.mapStuff[5].setColormap(ctx.selectedIndice1.colormap_fn);
          },
          updateMap2: (ctx, evt) => {
            let response: IndicesResponse = evt.data.data;
            mostrarTIFEnMapa(
              import.meta.env.VITE_COGS_SERVER_URL + response.tiff_url,
              gbl_state.map2,
              ctx.selectedIndice2.colormap
            );
            ctx.mapStuff[6].setDomain(ctx.selectedIndice2.domain);
            ctx.mapStuff[6].setColormap(ctx.selectedIndice2.colormap_fn);
          },
          notificarError: (ctx, evt) => {
            showNotification("Error", "error");
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
          downloadPNG: (ctx, evt) => {
            let map = evt.data === 1 ? gbl_state.map : gbl_state.map2;
            let canvas_src = map.getSource("indice-espectral") as CanvasSource;
            var img = canvas_src.getCanvas().toDataURL("image/png");
            let link = document.createElement("a");
            link.download = "map.png";
            link.href = img;
            link.click();
            URL.revokeObjectURL(link.href);
          },
          downloadXLS: (ctx, evt) => {
            let mapa_index = evt.data;
            let tiff_partial_url =
              mapa_index === 1 ? ctx.data1.tiff_url : ctx.data2.tiff_url;
            let tiff_url =
              import.meta.env.VITE_COGS_SERVER_URL + tiff_partial_url;
            let indice_name =
              mapa_index === 1
                ? ctx.selectedIndice1.value
                : ctx.selectedIndice2.value;
            geotiff_to_excel(tiff_url, indice_name);
          },
          removeHandlers:(ctx,evt)=>{
            removeEventHandlers(gbl_state.map)
            removeEventHandlers(gbl_state.map2)
          },
          deleteMapSourcesLayers: (ctx,evt)=>{
            removeIndicesLayersSources(gbl_state.map2)
            removeIndicesLayersSources(gbl_state.map)
          }
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
            let date = ctx.selectedFeature1.feature.properties.date;
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
                JSON.stringify(geometry)
              )}&date=${date}&hist_options=${hist_options}`;
            // console.log("fetchImageURL", url);
            return await axios.get(url);
          },
          fetchImagen: async (ctx, evt) => {
             console.log("fetchImage", evt);
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
                JSON.stringify(geometry)
              )}&date=${date}&hist_options=${hist_options}`;
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

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log("Cerrando Indices...");
    this.actor.send({ type: "CERRAR" });
  }

  render() {
    // Aliases
    let estado = this.state.value;
    let ctx = this.ctx.value;

    const inDualMode = () => {
      return estado.loaded === "pantallaDividida";
    };

    const loading = () => {
      return html`<div
        style="display:flex; justify-content:center; align-items:center; width: 100%;height: 100%;position: absolute;background:#fffc;z-index: 9;"
      >
        <span>Loading</span>
      </div>`;
    };
    // https://css-irl.info/finding-an-elements-nearest-relative-positioned-ancestor/#:~:text=By%20typing%20%24_%20into%20the%20console%20we%20can,the%20element.%20Then%3A%20getComputedStyle%28%24_%29.position%20retrieves%20its%20position%20value

    return html`
      ${estado === "empty" || estado === "withGeojson"
        ? loading()
        : html`
            <div
              class="overlay-charts"
              style="position:absolute;display: flex;width:100%;justify-content: space-between;"
            >
              <indices-charts
                style="top:1rem;right:${inDualMode()
                  ? "calc(50% + 4rem);"
                  : "4rem;"}"
                .data=${ctx.data1}
                .indice=${ctx.selectedIndice1}
                .date=${ctx.selectedFeature1.feature.properties.date}
                .hectareas_del_lote=${area(ctx.geojson)}
              ></indices-charts>
              
              <indices-charts
                style="top:1rem;right:4rem;${inDualMode()
                  ? ""
                  : "display:none;"}"
                .data=${ctx.data2}
                .indice=${ctx.selectedIndice2}
                .date=${ctx.selectedFeature2.feature.properties.date}
                .hectareas_del_lote=${area(ctx.geojson)}
              ></indices-charts>

              <indices-histograma
                style="top: 20rem;position: absolute;left: 1rem;"
                .lote_id=${ctx.lote_id}
                .indice=${ctx.selectedIndice1}
                .feature=${ctx.selectedFeature1.feature}
                .geojson=${ctx.geojson}
              ></indices-histograma>

              <indices-histograma
                style="top: 20rem;position: absolute;left:calc(50% + 1rem); ${inDualMode()
                  ? ""
                  : "display:none;"}"
                .lote_id=${ctx.lote_id}
                .indice=${ctx.selectedIndice2}
                .feature=${ctx.selectedFeature2.feature}
                .geojson=${ctx.geojson}
              ></indices-histograma>

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
                @selectedIndexChange=${(e) =>{
                                    console.log("selectedIndexChanged",e)
                                    this.actor.send({
                                        type:"SELECTED_INDICE_1_CHANGED",
                                        data:{feature:ctx.selectedFeature1.feature, indice:e.detail}                                      
                                      })
                                  }
                }
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
                      @selectedIndexChange=${(e) =>{
                        console.log("selectedIndexChanged",e)
                        this.actor.send({
                          type:"SELECTED_INDICE_2_CHANGED",
                          data:{feature:ctx.selectedFeature1.feature, indice:e.detail}                                      
                        })
                        
                      }}
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
