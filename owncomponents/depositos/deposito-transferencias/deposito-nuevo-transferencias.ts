import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { nuevo_deposito, guardar_deposito, listar_depositos } from "../depositos_funciones";
import { Deposito } from "../depositos-types";
import { translate } from "lit-translate";
import { DepositosTransferencia } from "../../tipos/depositos-transferencias";
import { guardar_transfer, nueva_transfer } from "../transferencias_funciones";
import { base_i18n } from "../../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import { Task, TaskStatus } from "@lit-labs/task";
import { RouterLocation } from '@vaadin/router';

@customElement("deposito-nuevo-transferencias")
export class DepositoNuevoTransferencias extends LitElement {
  @property()
  opened: boolean = false;

  @property()
  edit: boolean = false;

  @property()
  location : RouterLocation;

  @state()
  private depos: Deposito[] = [];

  private trans: DepositosTransferencia = nueva_transfer();
  private _loadTask = new Task(
    this,
    () => listar_depositos(),
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
          ]) /**hay que poner una prop sino no se rerender */
        }
        ${dialogFooterRenderer(this.renderFooter, [])}
      ></vaadin-dialog>

      <!-- end::snippet[] -->
    `;
  }

  private renderDialog = () => html`
    ${this._loadTask.render({
      pending: () => html`${translate("cargando")}`,
      complete: (depos) => html`
        <vaadin-vertical-layout
          style="align-items: stretch; width: 18rem; max-width: 100%;"
        >
          <!-- fecha -->
          <vaadin-date-picker
            label=${translate("fecha")}
            required
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
          <!-- referencia  -->
          <!-- obs  -->
          <vaadin-text-field
            autoselect
            label="${translate("observaciones")}"
            .value=${this.trans.obs}
            @input=${(e) => (this.trans.obs = e.target.value)}
          ></vaadin-text-field>
          <!-- Adjuntos -->
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
