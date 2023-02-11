import { booleanContains } from '@turf/boolean-contains';
import { listar_sensores } from "./../sensores-funciones";
import { customElement, property, state } from "lit/decorators.js";
import { CSSResultGroup, html, LitElement, unsafeCSS } from 'lit';
import { RouterLocation } from "@vaadin/router";
import { map } from "lit/directives/map.js";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { translate } from "lit-translate";
import "@vaadin/button";
import "@vaadin/dialog";
import { Task, TaskStatus } from "@lit-labs/task";
import { DeviceDetalles } from "../sensores-types";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

@customElement("selector-dispositivos")
export class SelectorDispositivos extends LitElement {
  static styles?: CSSResultGroup = unsafeCSS(bootstrap)

  @property()
  location: RouterLocation;

  @property()
  enabled:boolean

  @state()
  dispositivos: DeviceDetalles[];

  @state()
  private dialogOpened = false;

  private _loadTask = new Task(
    this,
    () => this.loadData(this.location.params.uuid),
    () => [this.location, this.dialogOpened]
  );

  loadData(uuid) {
    return listar_sensores().then((dis) => (this.dispositivos = dis));
  }

  emit_selected_changed(d :DeviceDetalles) {
    this.dispatchEvent(new CustomEvent("selected-changed",{detail:{device:d,distancia:0},bubbles:true,composed:true}))
  }

  render() {
    return html`
    ${this.enabled ? null: html`<div class='alert alert-danger'>Las fechas de inicio y final deben ser diferentes entre si.</div>`}
      <vaadin-button theme="success" @click=${() => (this.dialogOpened = true)}
        ?disabled=${!this.enabled}
        >Cargar desde Centrales</vaadin-button>
      <vaadin-dialog
        header-title="${translate("dispositivos")}"
        .opened="${this.dialogOpened}"
        @opened-changed="${(event: DialogOpenedChangedEvent) => {
          this.dialogOpened = event.detail.value;
        }}"
        ${dialogRenderer(this.renderDialog, [this.dispositivos])}
        ${dialogFooterRenderer(this.renderFooter, [])}
      ></vaadin-dialog>
    `;
  }

  private renderDialog = () => html`
    <vaadin-vertical-layout
      style="align-items: stretch; width: 18rem; max-width: 100%;"
    >
      ${this._loadTask.render({
        pending: () => html`${translate("cargando")}`,
        complete: (trans) =>
          map(
            this.dispositivos,
            (d) => html`
              <vaadin-item
                @click=${() => {
                  this.emit_selected_changed(d);
                  this.dialogOpened = false;
                }}
              >
                ${d.nombre}
              </vaadin-item>
            `
          ),
      })}
      <div style='font-weight:bolder;font-size:9px;'>ToDo: Distancias y auto seleccion</div>
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
