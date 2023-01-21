import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import "@vaadin/combo-box";
import "@vaadin/upload";

import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import {
  nuevo_deposito,
  guardar_deposito,
  listar_depositos,
} from "../depositos_funciones";
import { Deposito } from "../depositos-types";
import { translate } from "lit-translate";
import { DepositosTransferencia } from "../../tipos/depositos-transferencias";
import { guardar_transfer, nueva_transfer } from "../transferencias_funciones";
import { base_i18n } from "../../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import { Task, TaskStatus } from "@lit-labs/task";
import { RouterLocation } from "@vaadin/router";

import { get_lista_insumos } from "../../insumos/insumos-types";
import { gbl_state } from '../../state';

@customElement("deposito-nuevo-transferencias")
export class DepositoNuevoTransferencias extends LitElement {
  @property()
  opened: boolean = false;

  @property()
  edit: boolean = false;

  @property()
  location: RouterLocation;

  @state()
  insumosOpened: boolean = false;

  @state()
  private depos: Deposito[] = [];

  private trans: DepositosTransferencia = nueva_transfer();
  private _loadTask = new Task(
    this,
    () => listar_depositos(),
    () => [this.location, this.opened]
  );

  private _loadInsumosTask = new Task(
    this,
    () => get_lista_insumos(gbl_state.db),
    () => [this.location, this.opened]
  );

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("opened")) {
      if (this.opened) {
        console.log("clear");
        this.trans = nueva_transfer();
      }
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
    this.dispatchEvent(
      new CustomEvent("nueva-trans", { bubbles: true, composed: true })
    );
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
      <vaadin-dialog
        header-title=${this.edit
          ? translate("edit")
          : translate("nueva_transferencia")}
        .opened="${this.opened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.opened = e.detail.value;
          this.emit_opened_changed();
        }}"
        ${
          dialogRenderer(this.renderDialog, [
            this.opened,
            this._loadTask.status,
          ]) /**hay que poner una prop sino no se rerender */
        }
        ${dialogFooterRenderer(this.renderFooter, [])}
      ></vaadin-dialog>

      <!-- insumo dialog -->
      <vaadin-dialog
        header-title=${translate("insumo")}
        .opened="${this.insumosOpened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.insumosOpened = e.detail.value;
          this.emit_opened_changed();
        }}"
        ${
          dialogRenderer(this.renderInsumoDialog, [
            this.insumosOpened,
            this._loadTask.status,
          ]) /**hay que poner una prop sino no se rerender */
        }
        ${dialogFooterRenderer(this.renderInsumoFooter, [])}
      ></vaadin-dialog>

      <!-- end::snippet[] -->
    `;
  }

  private renderDialog = () => html`
    ${this._loadTask.render({
      pending: () => html`${translate("cargando")}`,
      complete: (depos) => html`
        <vaadin-vertical-layout
          style="align-items: stretch; width: 30rem; max-width: 100%;"
        >
          <!-- fecha -->
          <vaadin-date-picker
            label=${translate("fecha")}
            required
            allowed-char-pattern="[]"
            placeholder="YYYY-MM-DD"
            .i18n=${base_i18n}
            theme="helper-above-field"
            .value=${this.trans.fecha}
            @change=${(e) => (this.trans.fecha = e.target.value)}
          ></vaadin-date-picker>
          <!-- origen -->

          <vaadin-combo-box
            label="${translate("origen")}"
            item-label-path="nombre"
            item-value-path="uuid"
            helper-text=${""}
            required
            error-message=${translate("campo_requerido")}
            colspan="2"
            .selectedItem=${this.trans.deposito_origen}
            .items="${depos}"
            @selected-item-changed=${(e) => {
              this.trans.deposito_origen = e.detail.value;
            }}
          ></vaadin-combo-box>
          <!-- destino -->
          <vaadin-combo-box
            label="${translate("destino")}"
            item-label-path="nombre"
            item-value-path="uuid"
            helper-text=${""}
            required
            error-message=${translate("campo_requerido")}
            colspan="2"
            .selectedItem=${this.trans.deposito_destino}
            .items="${depos}"
            @selected-item-changed=${(e) => {
              this.trans.deposito_destino = e.detail.value;
            }}
          ></vaadin-combo-box>
          <!-- insumos -->
            <vaadin-button @click=${
              () => {
                this.opened = false
                this.insumosOpened = true
              }
            }>
            ${translate("agregar")}
          </vaadin-button>
          <!-- referencia  -->
          <vaadin-text-field
            autoselect
            label="${translate("referencia")}"
            .value=${this.trans.referencia}
            helper-text=${translate("la_referencia_es_un_indicador")}
            @input=${(e) => (this.trans.referencia = e.target.value)}
          ></vaadin-text-field>
          <!-- obs  -->
          <vaadin-text-field
            autoselect
            label="${translate("observaciones")}"
            .value=${this.trans.obs}
            @input=${(e) => (this.trans.obs = e.target.value)}
          ></vaadin-text-field>
          <!-- Adjuntos -->
          <vaadin-upload></vaadin-upload>
        </vaadin-vertical-layout>
      `,
    })}
  `;

  private renderFooter = () => html`
    <vaadin-button @click="${this.close}">${translate("cerrar")}</vaadin-button>
    <vaadin-button theme="primary" @click="${this.emit_nuevo}"
      >${translate("guardar")}</vaadin-button
    >
  `;

  private close() {
    this.dispatchEvent(
      new CustomEvent("opened-changed", {
        detail: { value: false },
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderInsumoDialog = () => html`
  ${this._loadInsumosTask.render({
    pending: () => html`${translate("cargando")}`,
    complete: (items) => html`
      <vaadin-vertical-layout
        style="align-items: stretch; width: 30rem; max-width: 100%;"
      >
        <!-- fecha -->
        <vaadin-date-picker
          label=${translate("fecha")}
          required
          allowed-char-pattern="[]"
          placeholder="YYYY-MM-DD"
          .i18n=${base_i18n}
          theme="helper-above-field"
          .value=${this.trans.fecha}
          @change=${(e) => (this.trans.fecha = e.target.value)}
        ></vaadin-date-picker>
        <!-- origen -->

        <vaadin-combo-box
          label="${translate("origen")}"
          item-label-path="nombre"
          item-value-path="uuid"
          helper-text=${""}
          required
          error-message=${translate("campo_requerido")}
          colspan="2"
          .selectedItem=${this.trans.deposito_origen}
          .items="${items}"
          @selected-item-changed=${(e) => {
            this.trans.deposito_origen = e.detail.value;
          }}
        ></vaadin-combo-box>
        <!-- destino -->
        <vaadin-combo-box
          label="${translate("destino")}"
          item-label-path="nombre"
          item-value-path="uuid"
          helper-text=${""}
          required
          error-message=${translate("campo_requerido")}
          colspan="2"
          .selectedItem=${this.trans.deposito_destino}
          .items="${items}"
          @selected-item-changed=${(e) => {
            this.trans.deposito_destino = e.detail.value;
          }}
        ></vaadin-combo-box>
        <!-- insumos -->

        <!-- referencia  -->
        <vaadin-text-field
          autoselect
          label="${translate("referencia")}"
          .value=${this.trans.referencia}
          helper-text=${translate("la_referencia_es_un_indicador")}
          @input=${(e) => (this.trans.referencia = e.target.value)}
        ></vaadin-text-field>
        <!-- obs  -->
        <vaadin-text-field
          autoselect
          label="${translate("observaciones")}"
          .value=${this.trans.obs}
          @input=${(e) => (this.trans.obs = e.target.value)}
        ></vaadin-text-field>
        <!-- Adjuntos -->
        <vaadin-upload></vaadin-upload>
      </vaadin-vertical-layout>
    `,
  })}
`;

  private renderInsumoFooter = () => html`
    <vaadin-button @click="${this.close}">${translate("cerrar")}</vaadin-button>
    <vaadin-button theme="primary" @click="${this.emit_nuevo}"
      >${translate("guardar")}</vaadin-button
    >
  `;

  static styles = css`
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
}
