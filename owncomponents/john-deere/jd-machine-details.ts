import { LitElement, PropertyValueMap, html } from "lit";
import "./fp-sidebar";
import { property } from "lit/decorators.js";
import "@vaadin/combo-box";
import { RouterLocation } from "@vaadin/router";
import { Task, TaskStatus } from "@lit-labs/task";
import { gbl_state, nav_back } from "../state";
import { JDMachine } from "./john-deere-types";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";

export class JohnDeereMachineDetails extends LitElement {
  private _loadTask = new Task(
    this,
    () => this.load_details(),
    () => [this.location]
  );

  @property({ attribute: false })
  machine: JDMachine | undefined;

  @property({ type: Object }) location = gbl_state.router.location;

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    let f: SlDialog = this.shadowRoot?.querySelector("#dialog");
    f?.show();
  }

  render() {
    return html`
      <sl-dialog
        @sl-hide=${() => nav_back()}
        label="Dialog"
        id="dialog"
        class="dialog-overview"
      >
        ${this._loadTask.render({
          initial: () => html`Initial`,
          error: () => html`Error`,
          complete: () => html`Detalles`,
        })}
        Horas de Motor: 3.54 Horas

        <sl-button slot="footer" variant="primary">Close</sl-button>
      </sl-dialog>
    `;
  }

  load_details() {}
}

customElements.define("jd-machine-details", JohnDeereMachineDetails);
