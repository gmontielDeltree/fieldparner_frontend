import { tipos_combustible } from "./../jsons/tipos_equipos";
import { TipoVehiculo } from "./../tipos/vehiculos";
import {
  cargar_vehiculo,
  guardar_vehiculo,
  nuevo_vehiculo,
} from "./vehiculos-funciones";
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
import { Vehiculo } from "../tipos/vehiculos";
import { ComboBoxSelectedItemChangedEvent } from "@vaadin/combo-box";
import { tipos_equipos } from "../jsons/tipos_equipos";
import { DatePickerChangeEvent } from "@vaadin/date-picker";
import { base_i18n } from "../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import { NumberField } from "@vaadin/number-field";

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

  private back_url = "equipos";

  // Encadeno promises
  loadData(location: RouterLocation) {
    // Estoy editando o haciendo uno nuevo
    if (location.params.uuid) {
      if (location.pathname.includes("edit")) {
        this.editing = true;
      }
      let item_uuid = location.params.uuid as string;
      return cargar_vehiculo(item_uuid)
        .then((d) => (this.item = d))
        .catch((e) => {
          console.error(e);
          showNotification(get("error_al_cargar"), "error");
        });
    } else {
      this.item = nuevo_vehiculo();
      this.editing = true;
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
      <modal-generico .modalOpened=${this.openedModal} backurl="/equipos">
        <div slot="title">
          <div>${this.item.tipo}</div>
        </div>

        <div slot="body">
          <vaadin-tabsheet>
            <vaadin-tabs slot="tabs">
              <vaadin-tab id="es-tab">${translate("datos")} </vaadin-tab>
            </vaadin-tabs>

            <div tab="es-tab">
              ${this._loadTask.render({
                pending: () => html`${translate("cargando")}`,
                complete: this.vehiculos_form,
              })}
            </div>

            ${!this.editing
              ? html`<vaadin-button
                  theme="primary success"
                  slot="suffix"
                  @click=${() => (this.editing = true)}
                  >${translate("edit")}</vaadin-button
                >`
              : null}
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

  private renderFooter = () =>
    this.editing
      ? html`
          <vaadin-button theme="primary" @click="${this.emit_nuevo}"
            >${translate("guardar")}</vaadin-button
          >
        `
      : null;

  /* Lo principal */
  vehiculos_form = () => {
    return html`
      ${this.combo_box("tipo_vehiculo", tipos_equipos, "nombre")}
      ${this.text_field("marca")} ${this.text_field("modelo")}
      ${this.combo_box("ano",this.years, "Año")} 
      ${this.text_field("placa", "Patente")}
      ${this.number_field("tara","kg")} ${this.number_field("neto","kg")}
      ${this.combo_box("tipo_combustible", tipos_combustible, "nombre")}
      ${this.number_field("capacidad_combustible",'l')}
      ${this.text_field("unidad_medida")} ${this.text_field("conectividad")}
      ${this.text_field("propietario")}
      ${this.date_picker("ultimo_mantenimiento")} 
      <!-- ${this.text_field("seguro")} -->
      ${this.text_field("seguro_compania", get("seguro_compania"))}
      ${this.text_field("seguro_tipo_de_cobertura")}
      ${this.text_field("seguro_numero_de_poliza")}
      ${this.date_picker("seguro_fecha_de_inicio")}
      ${this.date_picker("seguro_fecha_de_vencimiento")}
      <!-- ${this.text_field("")} -->

      ${this.item.tipo_vehiculo.key === "pulverizadora"
        ? this.pulverizadora_fields()
        : null}
    `;
  };

  // text_field('nombre')
  // text_field<nombre>()
  text_field = <T extends Vehiculo, K extends keyof T>(
    field: keyof Vehiculo,
    label?: string
  ) => {
    return html`
      <vaadin-text-field
        .label=${label ?? get(field)}
        ?readonly=${!this.editing}
        .value=${this.item[field] as string}
        @input=${(e: Event) => {
          (this.item[field] as string) = (e.target as TextField)
            .value as string;
        }}
      ></vaadin-text-field>
    `;
  };

  combo_box = <T extends Vehiculo, K extends keyof T>(
    field: keyof Vehiculo,
    items,
    label_path: string,
    label?: string
  ) => {
    return html`
      <vaadin-combo-box
        .label=${label ?? get(field)}
        ?readonly=${!this.editing}
        .itemLabelPath=${label_path}
        .selectedItem=${this.item[field]}
        .items=${items}
        @selected-item-changed=${(e: ComboBoxSelectedItemChangedEvent<any>) => {
          (<any>this.item[field]) = e.detail.value;
          this.requestUpdate()
        }}
      ></vaadin-combo-box>
    `;
  };

  date_picker = <T extends Vehiculo, K extends keyof T>(
    field: keyof Vehiculo,
    label?: string
  ) => {
    return html`
      <vaadin-date-picker
        .label=${label ?? get(field)}
        ?readonly=${!this.editing}
        .i18n=${base_i18n}
        .value=${<string>this.item[field]}
        @change=${(e: DatePickerChangeEvent) => {
          (<any>this.item[field]) = e.target.value;
        }}
      ></vaadin-date-picker>
    `;
  };


  number_field = <T extends Vehiculo, K extends keyof T>(
    field: keyof Vehiculo,
    suffix: string,
    label?: string

  ) => {
    return html`
      <vaadin-number-field
        .label=${label ?? get(field)}
        ?readonly=${!this.editing}
        .value=${this.item[field] as string}
        @input=${(e: Event) => {
          (this.item[field] as number) = (e.target as NumberField).value as unknown as number;
        }}
      ><div slot='suffix'>${suffix}</div></vaadin-number-field>
    `;
  };


  pulverizadora_fields = ()=>{
    return html`
    ${this.number_field("distancia_entre_picos","cm")}
    ${this.number_field("ancho","m")}
    `
  }

  private years = Array.from({ length: 100 }, (_, k) => new Date().getFullYear() - 99 + k);

}
