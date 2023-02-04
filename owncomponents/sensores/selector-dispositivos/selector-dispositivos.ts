import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement } from "lit";
import { RouterLocation } from "@vaadin/router";
import { map } from "lit/directives/map";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { translate } from "lit-translate";

@customElement("selector-dispositivos")
export class SelectorDispositivos extends LitElement {
  @property()
  location: RouterLocation;

  @state()
  dispositivos: Object[];

  @state()
  private dialogOpened = true;

  loadData(){

  }

  emit_selected_changed() {

 }
 
  render() {
    return html`
      <vaadin-dialog
        header-title="${translate("dispositivos")}"
        .opened="${this.dialogOpened}"
        @opened-changed="${(event: DialogOpenedChangedEvent) => {
          this.dialogOpened = event.detail.value;
        }}"
        ${dialogRenderer(this.renderDialog, [])}
        ${dialogFooterRenderer(this.renderFooter, [])}
      ></vaadin-dialog>
    `;
  }

  private renderDialog = () => html`
    <vaadin-vertical-layout
      style="align-items: stretch; width: 18rem; max-width: 100%;"
    >
      ${map(
        this.dispositivos,
        (d) => html`
          <div
            @click=${() => {
              this.emit_selected_changed();
              this.dialogOpened = false;
              window.history.back();
            }}
          >
            ${d.nombre}
          </div>
        `
      )}
    </vaadin-vertical-layout>
  `;

  private renderFooter = () => html`
    <vaadin-button @click="${this.close}">Cancel</vaadin-button>
    <vaadin-button theme="primary" @click="${this.close}">Add</vaadin-button>
  `;

  private close() {
    this.dialogOpened = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "selector-dispositivos": SelectorDispositivos;
  }
}
