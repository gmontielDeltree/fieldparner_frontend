import { translate } from "lit-translate";
import { html } from "lit";
import { RouterLocation } from "@vaadin/router";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../modal-generico/modal-generico";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "./color-cultivo/color-cultivo"

@customElement("settings-modal")
export class SettingsModal extends LitElement {
  @property()
  location: RouterLocation;

  protected render(): unknown {
    return html`
      <modal-generico .modalOpened=${true}>
        <div slot="title">${translate("ajustes")}</div>
        <vaadin-tabsheet slot="body">
          <vaadin-tabs slot="tabs">
            <vaadin-tab id="colores-tab">${translate("colores_cultivos")}</vaadin-tab>
            <!-- <vaadin-tab id="payment-tab">Payment</vaadin-tab> -->
          </vaadin-tabs>

          <div tab="colores-tab"><color-cultivo></color-cultivo></div>
          <div tab="payment-tab">This is the Payment tab content</div>
          <div tab="shipping-tab">This is the Shipping tab content</div>
        </vaadin-tabsheet>
      </modal-generico>
    `;
  }
}
