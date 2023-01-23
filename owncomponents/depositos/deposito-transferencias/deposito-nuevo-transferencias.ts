import { format, isDate } from "date-fns";
import { cargar_depo } from "./../depositos_funciones";
import { LineaTransferencia } from "./../../tipos/depositos-transferencias";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../modal-generico/modal-generico";
import "@vaadin/button";
import "@vaadin/vaadin-lumo-styles/typography";
import "@vaadin/icon";
import "@vaadin/vaadin-lumo-styles/vaadin-iconset.js";

import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/number-field";
import "@vaadin/text-area";
import "@vaadin/vertical-layout";
import "@vaadin/horizontal-layout";
import "@vaadin/combo-box";
import "@vaadin/upload";
import "@vaadin/date-picker";

import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { listar_depositos } from "../depositos_funciones";
import { Deposito } from "../depositos-types";
import { translate } from "lit-translate";
import { DepositosTransferencia } from "../../tipos/depositos-transferencias";
import { guardar_transfer, nueva_transfer } from "../transferencias_funciones";
import { base_i18n } from "../../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import { Task, TaskStatus } from "@lit-labs/task";
import { Router, RouterLocation } from "@vaadin/router";

import { Insumo, get_lista_insumos } from "../../insumos/insumos-types";
import { gbl_state } from "../../state";

import { uuid4 } from "uuid4";
import { deepcopy } from "../../helpers";
import { map } from "lit/directives/map.js";

@customElement("deposito-nuevo-transferencias")
export class DepositoNuevoTransferencias extends LitElement {
  private opened: boolean = true;

  @property()
  edit: boolean = false;

  @property()
  location: RouterLocation;

  @state()
  insumosOpened: boolean = false;

  @state()
  private depos: Deposito[] = [];

  @state()
  private valido: boolean;

  private insumos: Insumo[] = [];
  private destino_fixed: boolean = false;
  private origen_fixed: boolean = false;

  linea_insumo: LineaTransferencia = {
    uuid: uuid4(),
    insumo: null,
    cantidad: 0,
    precio: 0,
    obs: "",
  };

  private trans: DepositosTransferencia = nueva_transfer();

  private _loadTask = new Task(
    this,
    () => this.loadData(),
    () => [this.location, this.opened]
  );

  loadData() {
    return listar_depositos()
      .then((d) => (this.depos = d))
      .then(() => get_lista_insumos(gbl_state.db))
      .then((i) => (this.insumos = i));
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("location")) {
      // Cuando se abre en efecto
      if (this.location.params.direccion === "in") {
        console.log("Transfer In");
        this.trans = nueva_transfer();
        // Cargar destino
        cargar_depo(this.location.params.uuid as string).then(
          (s) => (this.trans.deposito_destino = s)
        );
        this.destino_fixed = true;
      } else if (this.location.params.direccion === "out") {
        console.log("Transfer Out");
        this.trans = nueva_transfer();
        // Cargar destino
        cargar_depo(this.location.params.uuid as string).then(
          (s) => (this.trans.deposito_origen = s)
        );
        this.origen_fixed = true;
      }
    } else {
      console.log("Transfer Generic");
    }
  }

  lista_candidatos(
    depos: boolean,
    proveedores: boolean,
    contratistas: boolean
  ) {
    return depos;
  }

  emit_nuevo() {
    guardar_transfer(this.trans);
    //this.dialogOpened = false;
    //Back URL
    this.dispatchEvent(
      new CustomEvent("nueva-trans", { bubbles: true, composed: true })
    );

    Router.go(gbl_state.router.urlForPath('deposito/:uuid',{...this.location.params}))
  }

  emit_opened_changed() {
    this.dispatchEvent(
      new CustomEvent("opened-changed", {
        detail: { value: this.opened },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <!-- tag::snippet[] -->
      <modal-generico
        .modalOpened=${this.opened}
        backurl="${gbl_state.router.urlForPath("/deposito/:uuid", {
          uuid: this.location.params.uuid,
        })}"
      >
        <div slot="title">${translate("nueva_transferencia")}</div>

        <div slot="body">
          ${this._loadTask.render({
            pending: () => html`${translate("cargando")}`,
            complete: (_) => html`
              <vaadin-horizontal-layout theme="spacing">
                <vaadin-vertical-layout
                  style="align-items: stretch; max-width: 40%;"
                >
                  <vaadin-horizontal-layout theme="spacing">
                    <!-- fecha -->
                    <vaadin-date-picker
                      label=${translate("fecha")}
                      required
                      allowed-char-pattern="[]"
                      max="${format(new Date(), "yyyy-MM-dd")}"
                      placeholder="YYYY-MM-DD"
                      .i18n=${base_i18n}
                      theme="helper-above-field"
                      .value=${this.trans.fecha}
                      @change=${(e) => {
                        this.trans.fecha = e.target.value;
                        this.validate();
                      }}
                    ></vaadin-date-picker>

                    <!-- referencia  -->
                    <vaadin-text-field
                      autoselect
                      label="${translate("referencia")}"
                      .value=${this.trans.referencia}
                      helper-text=${translate("la_referencia_es_un_indicador")}
                      @input=${(e) => (this.trans.referencia = e.target.value)}
                    ></vaadin-text-field>
                  </vaadin-horizontal-layout>

                  <!-- origen -->

                  <vaadin-combo-box
                    ?readonly=${this.origen_fixed}
                    label="${translate("origen")}"
                    item-label-path="nombre"
                    item-value-path="uuid"
                    helper-text=${""}
                    required
                    error-message=${translate("campo_requerido")}
                    colspan="2"
                    .selectedItem=${this.trans.deposito_origen}
                    .items="${this.depos}"
                    @selected-item-changed=${(e) => {
                      this.trans.deposito_origen = e.detail.value;
                      this.validate();
                    }}
                  ></vaadin-combo-box>
                  <!-- destino -->
                  <vaadin-combo-box
                    ?readonly=${this.destino_fixed}
                    label="${translate("destino")}"
                    item-label-path="nombre"
                    item-value-path="uuid"
                    helper-text=${""}
                    required
                    error-message=${translate("campo_requerido")}
                    colspan="2"
                    .selectedItem=${this.trans.deposito_destino}
                    .items="${this.depos}"
                    @selected-item-changed=${(e) => {
                      this.trans.deposito_destino = e.detail.value;
                      this.validate();
                    }}
                  ></vaadin-combo-box>

                  <!-- obs  -->
                  <vaadin-text-area
                    autoselect
                    label="${translate("observaciones")}"
                    .value=${this.trans.obs}
                    @input=${(e) => (this.trans.obs = e.target.value)}
                  ></vaadin-text-area>
                  <!-- Adjuntos -->
                  <vaadin-upload></vaadin-upload>
                </vaadin-vertical-layout>

                <vaadin-vertical-layout
                  theme="padding"
                  style="border: 1px solid var(--lumo-primary-color);border-radius: var(--lumo-border-radius-l);"
                >
                  <div>${translate("lista_insumos")}</div>
                  <vaadin-horizontal-layout
                    style="align-items:end"
                    theme="spacing"
                  >
                    <vaadin-combo-box
                      id="insumo1"
                      label=${translate("insumo")}
                      style="width:16em"
                      colspan="2"
                      item-label-path="marca_comercial"
                      item-value-path="uuid"
                      .items=${this.insumos}
                      .selectedItem=${this.linea_insumo.insumo}
                      @selected-item-changed=${(e) => {
                        this.linea_insumo.insumo = e.detail.value;
                        this.linea_insumo.precio =
                          this.linea_insumo.insumo?.precio || 0;
                        this.requestUpdate();
                      }}
                    ></vaadin-combo-box>

                    <vaadin-number-field
                      label=${translate("cantidad")}
                      .value=${+this.linea_insumo.cantidad}
                      @input=${(e) => {
                        this.linea_insumo.cantidad = +e.target.value;
                        this.requestUpdate();
                      }}
                    ></vaadin-number-field>

                    <vaadin-number-field
                      label=${translate("precio_unitario")}
                      .value=${this.linea_insumo.precio}
                      @input=${(e) => {
                        this.linea_insumo.precio = +e.target.value;
                        this.requestUpdate();
                      }}
                    ></vaadin-number-field>

                    <vaadin-number-field
                      label=${translate("total")}
                      readonly
                      .value=${this.linea_insumo.precio *
                      this.linea_insumo.cantidad}
                    ></vaadin-number-field>

                    <vaadin-button
                      @click=${() => {
                        this.trans.lineas.push(deepcopy(this.linea_insumo));
                        this.linea_insumo = {
                          uuid: uuid4(),
                          insumo: null,
                          cantidad: 0,
                          precio: 0,
                          obs: "",
                        };
                        this.validate()
                        this.requestUpdate();
                      }}
                    >
                      <vaadin-icon icon="lumo:plus" />
                    </vaadin-button>
                  </vaadin-horizontal-layout>

                  ${map(
                    this.trans.lineas,
                    (linea: LineaTransferencia) => html`
                      <vaadin-item>
                        ${linea.insumo.marca_comercial} ${linea.cantidad}
                        ${linea.precio}
                      </vaadin-item>
                    `
                  )}
                </vaadin-vertical-layout>
              </vaadin-horizontal-layout>
            `,
          })}
        </div>

        <vaadin-horizontal-layout
          slot="footer"
          theme="spacing"
          style="justify-content:end;"
          >${this.renderFooter()}</vaadin-horizontal-layout
        >
      </modal-generico>
    `;
  }

  private renderFooter = () => html`
    <!-- <vaadin-button @click="${this.close}">${translate(
      "cerrar"
    )}</vaadin-button> -->
    <vaadin-button
      theme="primary"
      @click="${this.emit_nuevo}"
      ?disabled=${!this.valido}
      >${translate("guardar")}</vaadin-button
    >
  `;

  private close() {
    // back URL
    this.dispatchEvent(
      new CustomEvent("opened-changed", {
        detail: { value: false },
        bubbles: true,
        composed: true,
      })
    );
  }

  private validate() {
    //return true;
    console.log(this.trans.deposito_destino && this.trans.deposito_origen);
    // Destino y Origen definidos
    let c1 = this.trans.deposito_destino && this.trans.deposito_origen;
    // fecha
    let c2 = this.trans.fecha && this.trans.fecha !== "";
    // al menos una linea
    let c3 = this.trans.lineas && this.trans.lineas.length > 0;
    console.log("Validacion", c1, c2, c3);
    this.valido = c1 && c2 && c3;
  }

  // static styles = css`
  //   /* Center the button within the example */
  //   :host {
  //     position: fixed;
  //     top: 0;
  //     right: 0;
  //     bottom: 0;
  //     left: 0;
  //     display: flex !important;
  //     align-items: center;
  //     justify-content: center;
  //   }
  // `;
}
