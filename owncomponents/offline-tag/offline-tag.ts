import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import gbl_state from "../state.js";
import { StateController } from "@lit-app/state";
import "@vaadin/icon";
import "@vaadin/icons";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

@customElement("offline-tag")
export class OfflineTag extends LitElement {
  private bindingState = new StateController(this, gbl_state);
  
  static override styles = unsafeCSS(bootstrap);

  render() {
    return html`${gbl_state.online
      ? html`<button type="button" class="btn btn-success btn-sm">Online</button>`
      : html`<button type="button" class="btn btn-danger btn-sm">Offline</button>`} `;
  }
}
