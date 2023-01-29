import { Router } from "@vaadin/router";
import { guardar_proveedor } from "./../depositos/proveedores_funciones";
import { RouterLocation } from "@vaadin/router";
import { Proveedor } from "./../tipos/proveedores";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import {
  nuevo_deposito,
  guardar_deposito,
} from "../depositos/depositos_funciones";
import { Deposito } from "../depositos/depositos-types";
import { get, translate } from "lit-translate";
import { showNotification } from "../helpers/notificaciones";
import {
  cargar_proveedor,
  nuevo_proveedor,
} from "../depositos/proveedores_funciones";
import { Route, RouteWithRedirect } from "@vaadin/router";

@customElement("proveedores-editor")
export class ProveedoresEditor extends LitElement {
  @property()
  opened: boolean = true;

  @property()
  edit: boolean = false;

  @property()
  location: RouterLocation;

  @state()
  proveedor: Proveedor = nuevo_proveedor();

  @state()
  valido: boolean = false;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("location")) {
      let is_edit = this.location.pathname.includes("edit");

      if (!is_edit) {
        this.proveedor = nuevo_proveedor();
      } else {
        //Edit
        cargar_proveedor(this.location.params.uuid as string).then(
          (proveedor) => {
            this.proveedor = proveedor;
          }
        );
      }
    }


  }

  emit_nuevo() {
    guardar_proveedor(this.proveedor)
      .then(() => {
        showNotification(get("proveedor_guardado"), "success");
        Router.go("/proveedores");
      })
      .catch((e) => {
        console.log(e);
        showNotification(get("error_al_guardar"), "error");
      });
    //this.dialogOpened = false;
    this.dispatchEvent(
      new CustomEvent("nuevo-proveedor", { bubbles: true, composed: true })
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
          : translate("nuevo_proveedor")}
        .opened="${this.opened}"
        no-close-on-esc
        no-close-on-outside-click
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.opened = e.detail.value;
          this.emit_opened_changed();
        }}"
        ${
          dialogRenderer(this.renderDialog, [
            this.opened, this.proveedor
          ]) /**hay que poner una prop sino no se rerender */
        }
        ${dialogFooterRenderer(this.renderFooter, [this.valido])}
      ></vaadin-dialog>

      <!-- end::snippet[] -->
    `;
  }

  private renderDialog = () => html`
    <vaadin-vertical-layout
      style="align-items: stretch; width: 18rem; max-width: 100%;"
    >
      <vaadin-text-field
        autoselect
        required
        label="${translate("nombre")}"
        .value=${this.proveedor.nombre}
        @keypress=${() => console.log("keypresssss")}
        @input=${(e) => {
          this.proveedor.nombre = e.target.value;
          this.validar();
        }}
      ></vaadin-text-field>
      <vaadin-text-field
        autoselect
        label="${translate("direccion")}"
        .value=${this.proveedor.direccion}
        @input=${(e) => {this.proveedor.direccion = e.target.value
        this.validar()
        }}
      >
    <vaadin-button @click=${this.pick_desde_mapa}>Mapa</vaadin-button>
    </vaadin-text-field>
    </vaadin-vertical-layout>
  `;

  private renderFooter = () => html`
    <vaadin-button @click="${this.close}">${translate("cerrar")}</vaadin-button>
    <vaadin-button
      theme="primary"
      @click="${this.emit_nuevo}"
      ?disabled=${!this.valido}
      >${translate("guardar")}</vaadin-button
    >
  `;

  private close() {
    this.opened = false;
    this.emit_opened_changed();
    Router.go("/proveedores");

    // this.dispatchEvent(
    //   new CustomEvent("opened-changed", { detail: {value:false}, bubbles: true, composed: true })
    // );
  }

  pick_desde_mapa(){
    this.opened = false
    this.dispatchEvent(new CustomEvent('open-map-picker', {bubbles:true,composed:true}))
  }

  validar() {
    // Nombre es nulo o igual a de ""
    let c1 = (this.proveedor.nombre == null ) || (this.proveedor.nombre === "")
    this.valido = !c1
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "proveedores-editor": ProveedoresEditor;
  }
}
