import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { translate } from "lit-translate";
import { RouterLocation } from "@vaadin/router";

let read, writeFile, utils;
import("xlsx").then((mod) => {
  read = mod.read;
  writeFile = mod.writeFile;
  utils = mod.utils;
});

@customElement("analisis-suelo-import-export")
export class AnalisisSueloImportExport extends LitElement {
  @property()
  location: RouterLocation;

  static override styles = css`
    /* Center the button within the example */
    :host {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex !important;
      align-items: center;
      justify-content: center;
    }
  `;

  @state()
  private dialogOpened = true;

  importer_handle = async (event) => {
    if (event.data.action !== "load-excel-analisis") {
      return;
    }
    const data = await event.data.analisis;
    console.log("OnMessageExcel", event, data);

    // Validacion de la estructura.
    
    this.dispatchEvent(
	new CustomEvent("uploaded", {
	  detail: data,
	  bubbles: true,
	  composed: true,
	})
      );
      this.close();
      window.history.back();
  };

  // https://lit.dev/docs/components/events/#adding-event-listeners-to-other-elements
  connectedCallback() {
    super.connectedCallback();
    navigator.serviceWorker.addEventListener("message", this.importer_handle);
  }

  disconnectedCallback() {
    navigator.serviceWorker.removeEventListener(
      "message",
      this.importer_handle
    );
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <vaadin-dialog
        header-title="${translate("importar_excel")}"
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
      <div><a href='/templates-xlsx/analisis_suelo.xlsx' download>
	Descargar la plantilla para importar!!!!
      </a></div>
      <vaadin-upload target="/upload-analisis-suelo"></vaadin-upload>
    </vaadin-vertical-layout>
  `;

  private renderFooter = () => html`
    <vaadin-button @click="${this.close}">Cancel</vaadin-button>
    <vaadin-button theme="primary" @click="${this.guardar}"
      >${translate("importar")}</vaadin-button
    >
  `;

  private guardar() {
    this.dispatchEvent(
      new CustomEvent("uploaded", {
        detail: {},
        bubbles: true,
        composed: true,
      })
    );
    this.close();
    window.history.back();
  }

  private close() {
    this.dialogOpened = false;
  }
}
