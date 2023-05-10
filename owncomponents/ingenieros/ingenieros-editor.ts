import { Ingeniero } from "./../tipos/ingenieros";
import { Router } from "@vaadin/router";
import { guardar_proveedor } from "./proveedores-funciones";
import { RouterLocation } from "@vaadin/router";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import "@vaadin/email-field";
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
import "../map-picker/map-picker";
import {
  nuevo_ingeniero,
  cargar_ingeniero,
  guardar_ingeniero,
} from "./ingenieros-funciones";

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

  @state()
  lista_invalidos: string[] = ["nombre"];

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("location")) {
      let is_edit = this.location.pathname.includes("edit");

      if (!is_edit) {
        this.ingeniero = nuevo_ingeniero();
      } else {
        //Edit
        cargar_ingeniero(this.location.params.uuid as string).then((ing) => {
          this.ingeniero = ing;
        });
      }
    }
  }

  emit_nuevo() {
    // Check y validar
    if(this.ingeniero.nombre === ""){
      showNotification(get('ingrese_un_nombre'),'error')
      return
    }
    guardar_ingeniero(this.ingeniero)
      .then(() => {
        showNotification(get("ingeniero_guardado"), "success");
        window.history.back();
        //Router.go("/");
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
          : translate("nuevo_personal")}
        .opened="${this.opened}"
        no-close-on-esc
        no-close-on-outside-click
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.opened = e.detail.value;
          this.emit_opened_changed();
        }}"
        ${
          dialogRenderer(this.renderDialog, [
            this.opened,
            this.ingeniero,
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
        invalid
        label="${translate("nombre")}"
        pattern="^(?!s*$).+"
        .value=${this.ingeniero.nombre}
        @keypress=${() => console.log("keypresssss")}
        @invalid-changed=${(e) => {
          let es_invalido = e.detail.value;
          this.validar("nombre", es_invalido);
        }}
        @input=${(e) => {
          this.ingeniero.nombre = e.target.value;
        }}
      ></vaadin-text-field>
      <vaadin-text-field
        autoselect
        label="${translate("direccion")}"
        .value=${this.ingeniero.direccion}
        @input=${(e) => {
          this.ingeniero.direccion = e.target.value;
        }}
      >
      </vaadin-text-field>
      <vaadin-text-field
        autoselect
        pattern="^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$"
        label="${translate("telefono")}"
        .value=${this.ingeniero.telefono}
        @invalid-changed=${(e) => {
          let es_invalido = e.detail.value;
          this.validar("telefono", es_invalido);
        }}
        @input=${(e) => {
          this.ingeniero.telefono = e.target.value;
        }}
      ></vaadin-text-field>
      <vaadin-email-field
        label="Email address"
        name="email"
        value="julia.scheider@email.com"
        error-message="Enter a valid email address"
        clear-button-visible
        .value=${this.ingeniero.email}
        @input=${(e) => {
          this.ingeniero.email = e.target.value;
        }}
      ></vaadin-email-field>
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
    Router.go("/personal");

    // this.dispatchEvent(
    //   new CustomEvent("opened-changed", { detail: {value:false}, bubbles: true, composed: true })
    // );
  }

  pick_desde_mapa() {
    this.opened = false;
    this.dispatchEvent(
      new CustomEvent("open-map-picker", { bubbles: true, composed: true })
    );
  }

  validar(variable: string, es_invalido: boolean) {
    if (es_invalido) {
      if (!this.lista_invalidos.includes(variable)) {
        this.lista_invalidos = [...this.lista_invalidos, variable];
      }
    } else {
      if (this.lista_invalidos.includes(variable)) {
        this.lista_invalidos = this.lista_invalidos.filter((s) => s !== variable);
      }
    }
    this.valido = this.lista_invalidos.length === 0;
    console.log(variable + " es invalido?", es_invalido,this.lista_invalidos);

    // Nombre es nulo o igual a de ""
    //let c1 = (this.ingeniero.nombre == null ) || (this.ingeniero.nombre === "")
    //this.valido = !c1
    //this.validador = [...this.validador, ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ingenieros-editor": IngenierosEditor;
  }
}
