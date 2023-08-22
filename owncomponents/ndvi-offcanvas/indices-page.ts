import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";
import "./ndvi-selector";
import { machine } from "./indices-machine";
import { interpret, actions, createMachine, assign } from "xstate";
import { SelectorController } from "xstate-lit/dist/select-controller";
import { gbl_state } from "../state";

@customElement("indices-page")
export class IndicesPage extends LitElement {
  actor = interpret(
    machine.withConfig({
      actions: {
        assignFeatures: assign({ featureCollection: (ctx, evt) => evt.data }),
        limpiarMap1y2: ({ context, event, action }) => {},
        updateIndex1: assign({ selectedIndice1: (_, evt) => evt.data }),
        updateDate1: assign({ selectedDate1: (_, evt) => evt.data }),
      },
      services: {
        getFeatures: async () => {
          Promise.resolve([]);
        },
        fetchImagen: async () => {},
      },
    })
  ).start();

  ctx = new SelectorController(this, this.actor, (state) => state.context);
  state = new SelectorController(this, this.actor, (state) => state);

  render() {
    html`
      <indice-selector
        .featureCollection=${this.ctx.value.featureCollection}
        .featureSelected=${this.ctx.value.selectedFeature}
        .selectedIndice=${this.ctx.value.selectedIndice}
        @selectedFeatureChange=${() => console.log("obs changed")}
        @selectedIndexChange=${() => console.log("selectedIndexChanged")}
      ></indice-selector>
    `;
  }
}
