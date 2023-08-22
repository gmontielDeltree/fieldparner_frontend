import { LitElement, html } from "lit";
import { customElement } from "lit/decorators";
import "./ndvi-selector";
import { indices_machine } from "./indices-machine";
import { interpret, actions, createMachine } from "xstate";
import { SelectorController } from "xstate-lit/dist/select-controller";

@customElement("indices-page")
export class IndicesPage extends LitElement {
  actor = interpret(
    indices_machine.withConfig({
      actions: {},
      services: {
        fetchFeatures: async () => {
          Promise.resolve([]);
        },
      },
    })
  ).start();

  ctx = new SelectorController(this, this.actor, (state) => state.context);
  state = new SelectorController(this, this.actor, (state) => state);

  render() {
    html`
      <indice-selector
        .featureCollection=${this.ctx.value.featureCollection}
        @selectedChange=${() => console.log("obs changed")}
      ></indice-selector>
    `;
  }
}
