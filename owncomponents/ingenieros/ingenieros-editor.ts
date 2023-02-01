import { Router } from "@vaadin/router";
import { guardar_proveedor } from "./proveedores-funciones";
import { RouterLocation } from "@vaadin/router";
import { Proveedor as Ingeniero } from "./../tipos/proveedores";
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
} from "../depositos/depositos-funciones";
import { Deposito } from "../depositos/depositos-types";
import { get, translate } from "lit-translate";
import { showNotification } from "../helpers/notificaciones";

import { Route, RouteWithRedirect } from "@vaadin/router";
import "../map-picker/map-picker"
import { nuevo_ingeniero, cargar_ingeniero, guardar_ingeniero } from './ingenieros-funciones';

@customElement("ingenieros-editor")
export class IngenierosEditor extends LitElement {
  @property()
  opened: boolean = true;

  @property()
  edit: boolean = false;

  @property()
  location: RouterLocation;

  @state()
  ingeniero: Ingeniero = nuevo_ingeniero();

  @state()
  valido: boolean = false;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("location")) {
      let is_edit = this.location.pathname.includes("edit");

      if (!is_edit) {
        this.ingeniero = nuevo_ingeniero();
      } else {
        //Edit
        cargar_ingeniero(this.location.params.uuid as string).then(
          (ing) => {
            this.ingeniero = ing;
          }
        );
      }
    }


  }

  emit_nuevo() {
    guardar_ingeniero(this.ingeniero)
      .then(() => {
        showNotification(get("ingeniero_guardado"), "success");
        Router.go("/ingenieros");
      })
      .catch((e) => {
        console.log(e);
        showNotification(get("error_al_guardar"), "error");
      });
    //this.dialogOpened = false;
    this.dispatchEvent(
      new CustomEvent("nuevo-ingeniero", { bubbles: true, composed: true })
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
          : translate("nuevo_ingeniero")}
        .opened="${this.opened}"
        no-close-on-esc
        no-close-on-outside-click
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.opened = e.detail.value;
          this.emit_opened_changed();
        }}"
        ${
          dialogRenderer(this.renderDialog, [
            this.opened, this.ingeniero
          ]) /**hay que poner una prop sino no se rerender */
        }
        ${dialogFooterRenderer(this.renderFooter, [this.valido])}
      ></vaadin-dialog>

      <!-- end::snippet[] -->
    `;
  }

  private renderDialog = () => html`
    <vaadin-vertical-layout
      style="align-items: stretch; width: 25rem; max-width: 100%;"
    >
      <vaadin-text-field
        autoselect
        required
        label="${translate("nombre")}"
        .value=${this.ingeniero.nombre}
        @keypress=${() => console.log("keypresssss")}
        @input=${(e) => {
          this.ingeniero.nombre = e.target.value;
          this.validar();
        }}
      ></vaadin-text-field>
      <vaadin-text-field
        autoselect
        label="${translate("direccion")}"
        .value=${this.ingeniero.direccion}
        @input=${(e) => {this.ingeniero.direccion = e.target.value
        this.validar()
        }}
      >
    </vaadin-text-field>
    <map-picker .posicion=${this.ingeniero.posicion} @input=${
      (e)=>{
        this.ingeniero.posicion = e.detail
      }
    }></map-picker>
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
    let c1 = (this.ingeniero.nombre == null ) || (this.ingeniero.nombre === "")
    this.valido = !c1
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ingenieros-editor": IngenierosEditor;
  }
}
