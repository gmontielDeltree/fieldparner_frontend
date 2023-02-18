import { cargar_vehiculo, guardar_vehiculo, nuevo_vehiculo } from "./vehiculos-funciones";
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
import { TextField } from "@vaadin/text-field";

import { Task } from "@lit-labs/task";
import { showNotification } from "../helpers/notificaciones";
import { Vehiculo } from '../tipos/vehiculos';
import { fi } from "date-fns/locale";

@customElement("vehiculos-detalles")
export class VehiculosDetalles extends LitElement {
  @property()
  openedModal: boolean = true;

  @property()
  location: RouterLocation;

  private item: Vehiculo = nuevo_vehiculo();

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

  private back_url = 'vehiculos'

  // Encadeno promises
  loadData(location: RouterLocation) {
    // Estoy editando o haciendo uno nuevo
    if (location.pathname.includes("edit")) {
      let item_uuid = location.params.uuid as string;
      return cargar_vehiculo(item_uuid)
        .then((d) => (this.item = d))
        .catch((e) => {
          console.error(e);
          showNotification(get("error_al_cargar"), "error");
        });
    } else {
      this.item = nuevo_vehiculo();
    }
  }

  emit_nuevo() {
    guardar_vehiculo(this.item);
    //this.dialogOpened = false;
    //Back URL

    showNotification(get("guardado"), "success");
    Router.go(this.back_url);
  }

  render() {
    return html`
      <modal-generico .modalOpened=${this.openedModal} backurl="/vehiculos">
        <h4 slot="title">${this.item.tipo}</h4>

        <div slot="body">
          <vaadin-tabsheet>
            <vaadin-tabs slot="tabs">
              <vaadin-tab id="es-tab"
                >${translate("datos")}
              </vaadin-tab>
            </vaadin-tabs>

            <div tab="es-tab">
              ${this._loadTask.render({
                pending: () => html`${translate("cargando")}`,
                complete: this.vehiculos_form,
              })}
            </div>
          </vaadin-tabsheet>
        </div>
        <!-- end body -->

        <vaadin-horizontal-layout
          slot="footer"
          theme="spacing"
          style="justify-content:end;"
          >${this.renderFooter()}</vaadin-horizontal-layout
        >

        <slot></slot>
      </modal-generico>
    `;
  }

  private renderFooter = () => html`
  <vaadin-button
    theme="primary"
    @click="${this.emit_nuevo}"
    ?disabled=${!this.valido}
    >${translate("guardar")}</vaadin-button
  >
`;

  /* Lo principal */
  vehiculos_form = () => {
    return html`
    ${this.text_field('marca')}
    ${this.text_field('modelo')}
    ${this.text_field('ano')}
    ${this.text_field('placa')}
    ${this.text_field('bruto')}
    `;
  };

  // text_field('nombre')
  // text_field<nombre>()
  text_field = <T extends Vehiculo, K extends keyof T>(field : keyof Vehiculo, label?: string)=>{
    return html`
      <vaadin-text-field
        .label=${label ?? field}
        .value=${this.item[field] as string}
        @input=${(e : Event)=>{
          (this.item[field] as string) = (e.target as TextField).value as string
        }}
      ></vaadin-text-field>
    `
  }

  number_field = (key)=>{

  }
}
