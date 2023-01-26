import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { nuevo_deposito, guardar_deposito } from "../depositos_funciones";
import { Deposito } from "../depositos-types";
import { get, translate } from "lit-translate";
import { showNotification } from "../../helpers/notificaciones";

@customElement("deposito-nuevo")
export class DepositoNuevo extends LitElement {
  @property()
  opened: boolean = false;

  @property()
  edit: boolean = false;

  @property()
  depo_to_edit : Deposito;

  private depo: Deposito = nuevo_deposito();

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
	if(_changedProperties.has('opened') && !this.edit){
		if(this.opened){
			this.depo = nuevo_deposito()
		}
	}

	if(_changedProperties.has('depo_to_edit') && this.edit){
		if(this.depo_to_edit){
			this.depo = this.depo_to_edit
		}
	}
  }

  emit_nuevo() {
    guardar_deposito(this.depo).then(()=>{
      showNotification(get('deposito_guardado'),'success')
    }).catch((e)=>{
      console.log(e)
      showNotification(get('error_al_guardar'),'error')
    })
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
        header-title=${this.edit ? translate("edit") : translate("nuevo_deposito")}
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
      <vaadin-text-field autoselect label="${translate("nombre")}" .value=${this.depo.nombre} @keypress=${()=>console.log("keypresssss")} @input=${(e)=>this.depo.nombre = e.target.value}></vaadin-text-field>
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


}
