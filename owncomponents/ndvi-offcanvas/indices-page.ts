import { LitElement, PropertyValueMap, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./indice-selector";
import { machine } from "./indices-machine";
import { interpret, actions, createMachine, assign } from "xstate";
import { SelectorController } from "xstate-lit/dist/select-controller";
import { gbl_state } from "../state";
import axios from "axios";
import bbox from "@turf/bbox";
import {coordAll} from "@turf/meta"
import { Router, RouterLocation } from "@vaadin/router";
import { get_lote_doc } from "../helpers";
import { format } from "date-fns";
import { list_of_indexes } from "./indices-types";
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';



function arrayToBase64(array : [number,number][]) {
  // Convert the array of arrays to a byte array.
  let byteArray = new Float64Array(array.length * 2);
  
  for (let i = 0; i < array.length; i++) {
    byteArray[i * 2] = array[i][0];
    byteArray[i * 2 + 1] = array[i][1];
  }


  // Encode the byte array to base64.
  let base64String = btoa(byteArray);

  // Remove any padding characters.
  base64String = base64String.replace(/=+$/, '');

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
  `

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
          assignLoteId: assign({lote_id:(ctx,evt)=>(()=>this.location.params.uuid)()}),
          assignFeatures: assign({ featureCollection: (ctx, evt) => evt.data.data }),
          assignGeojson:assign({geojson:(ctx,evt)=>evt.data}),
          limpiarMap1y2: () => {},
          updateIndex1: assign({ selectedIndice1: (_, evt) => evt.data }),
          updateFeature1: assign({ selectedFeature1: (_, evt) => evt.data }),
          updateMap1: () => {},
          notificarError: (ctx, evt)=>{console.log("error",evt.data)},
        },
        services: {
          getGeojson: async (ctx,evt)=>{
            console.log("Lote", ctx.lote_id)
            console.log("ctx",ctx)
            let lote = await get_lote_doc(gbl_state.db,ctx.lote_id)
            return lote
          },
          getFeatures: async (ctx, evt) => {
            console.log("getFeatures");
            let date = format(new Date(),"yyyy-MM-dd");
            let bbox_str = bbox(ctx.geojson).join(",");
            let url =
              import.meta.env.VITE_COGS_SERVER_URL +
              `/indices/features?bbox=${bbox_str}&date=${date}`;
            console.log("url ",url)
            return await axios.get(url);
          },
          fetchImagen: async (ctx, evt) => {
            console.log("fetchImage",evt)
            let date = evt.data.feature.properties.date
            console.log("COOR", coordAll(ctx.geojson))
            let geometry = (coordAll(ctx.geojson))
            let resource_id = ctx.lote_id
            let indice = evt.data.indice.value

            let url = import.meta.env.VITE_COGS_SERVER_URL +
            `/indices/${indice}?resource_id=${resource_id}&geometry=${encodeURIComponent(JSON.stringify(geometry))}&date=${date}`;
            console.log("fetchImageURL",url)
            return await axios.get(url)
          },
          
        },
      })
  );
    

  ctx = new SelectorController(this, this.actor, (state) => state.context);
  state = new SelectorController(this, this.actor, (state) => state.value);

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
      this.actor.start()
  }
  
  render() {

    return html`
      ${this.state.value === "Empty"
        ? "loading"
        : html`
        <div>
          <sl-drawer label="" contained class="drawer-contained" open placement="bottom" style="--size: 23%;">
          <indice-selector
              .featureCollection=${this.ctx.value.featureCollection}
              .featureSelected=${this.ctx.value.selectedFeature1}
              .selectedIndice=${this.ctx.value.selectedIndice1}
              @selectedFeatureChange=${(e: CustomEvent) => {
                console.log("Selected Feature 1 evt")
                this.actor.send({type:"SELECTED_FEATURE_1", data:e.detail});
              }}
              @selectedIndexChange=${() => console.log("selectedIndexChanged")}
            ></indice-selector>
          </sl-drawer>
        </div>
            
          `}
    `;
  }
}
