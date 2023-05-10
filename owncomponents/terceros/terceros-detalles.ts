import { cargar_tercero, nuevo_tercero } from "./terceros-funciones";
import { listar_ejecuciones_por_depo } from "../depositos/depositos-funciones";
import { gbl_state } from "../state";
import { customElement, property, state } from "lit/decorators.js";
import "../modal-generico/modal-generico";
import "../depositos/deposito-transferencias/deposito-nuevo-transferencias";

import { LitElement, PropertyValueMap, html, render, css } from "lit";
import { Router, RouterLocation } from "@vaadin/router";
import { get, translate } from "lit-translate";

import "@vaadin/avatar";
import "@vaadin/button";
import "@vaadin/item";
import "@vaadin/list-box";
import "@vaadin/horizontal-layout";
import "@vaadin/vaadin-lumo-styles/typography";
import "@vaadin/vertical-layout";
import "@vaadin/menu-bar";
import "@vaadin/tooltip";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/notification";
import "@vaadin/vaadin-lumo-styles/vaadin-iconset";

import { Task } from "@lit-labs/task";
import { showNotification } from "../helpers/notificaciones";
import { Tercero } from "../tipos/terceros.ts";

@customElement("terceros-detalles")
export class TercerosDetalles extends LitElement {
  @property()
  openedModal: boolean = true;

  @property()
  location: RouterLocation;

  private item: Tercero = nuevo_tercero();

  private _loadTask = new Task(
    this,
    () => this.loadData(this.location),
    () => [this.location, this.openedModal]
  );

  @state() // Tiene que ser state para forzar rerender
  abrirNuevoDialog: boolean = false;

  @state() // Tiene que ser state para forzar rerender
  abrirEditDialog: boolean = false;

  @state()
  editing: boolean = false;

  // Encadeno promises
  loadData(location: RouterLocation) {
    // Estoy editando o haciendo uno nuevo
    if (location.pathname.includes("edit")) {
      let item_uuid = location.params.uuid as string;
      return cargar_tercero(item_uuid)
        .then((d) => (this.item = d))
        .catch((e) => {
          console.error(e);
          showNotification(get("error_al_cargar"), "error");
        });
    } else {
      this.item = nuevo_tercero();
    }
  }

  render() {
    return html`
      <modal-generico .modalOpened=${this.openedModal} backurl="/terceros">
        <h4 slot="title">${this.item.tipo}</h4>

        <div slot="body">
          <vaadin-tabsheet>
            <vaadin-tabs slot="tabs">
              <vaadin-tab id="es-tab"
                >${translate("transferencias")}
              </vaadin-tab>
            </vaadin-tabs>

            <div tab="es-tab">
              ${this._loadTask.render({
                pending: () => html`${translate("cargando")}`,
                complete: this.terceros_form,
              })}
            </div>
          </vaadin-tabsheet>
        </div>
        <!-- end body -->
        <slot></slot>
      </modal-generico>
    `;
  }

  /* Lo principal */
  terceros_form = () => {
    return html``;
  };
}
