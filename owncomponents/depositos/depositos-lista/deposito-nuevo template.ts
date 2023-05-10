import { RouterLocation } from '@vaadin/router';
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { nuevo_deposito, guardar_deposito } from "../depositos-funciones";
import { Deposito } from "../depositos-types";
import { translate } from "lit-translate";

@customElement("deposito-nuevo")
export class DepositoNuevo extends LitElement {
  @property()
  opened: boolean = false;

  @property()
  location : RouterLocation

  private depo: Deposito = nuevo_deposito();

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
	if(_changedProperties.has('opened')){
		if(this.opened){
			console.log('clear')
			this.depo = nuevo_deposito()
		}
	}
  }

  emit_nuevo() {
    guardar_deposito(this.depo);
    //this.dialogOpened = false;
    this.dispatchEvent(
      new CustomEvent("nuevo-depo", { bubbles: true, composed: true })
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
        header-title=${translate("nuevo_deposito")}
        .opened="${this.opened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.opened = e.detail.value;
          this.emit_opened_changed();
        }}"
        ${dialogRenderer(this.renderDialog, [this.opened]) /**hay que poner una prop sino no se rerender */}
        ${dialogFooterRenderer(this.renderFooter, [])}
      ></vaadin-dialog>

      <!-- end::snippet[] -->
    `;
  }

  private renderDialog = () => html`
    <vaadin-vertical-layout
      style="align-items: stretch; width: 18rem; max-width: 100%;"
    >
      <vaadin-text-field autoselect label="${translate("nombre")}" .value=${this.depo.nombre} @input=${(e)=>this.depo.nombre = e.target.value}></vaadin-text-field>
      <vaadin-text-field autoselect label="${translate("direccion")}" .value=${this.depo.direccion} @input=${(e)=>this.depo.direccion = e.target.value}></vaadin-text-field>
    </vaadin-vertical-layout>
  `;

  private renderFooter = () => html`
    <vaadin-button @click="${this.close}">${translate("cerrar")}</vaadin-button>
    <vaadin-button theme="primary" @click="${this.emit_nuevo}"
      >${translate("guardar")}</vaadin-button
    >
  `;

  private close() {
    this.dispatchEvent(
      new CustomEvent("opened-changed", { detail: {value:false}, bubbles: true, composed: true })
    );
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
