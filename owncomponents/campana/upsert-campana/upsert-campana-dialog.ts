import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, state, property } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { get, translate } from "lit-translate";
import { base_i18n } from "../../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import { deepcopy } from "../../helpers";
import { isBefore, isWithinInterval, parseISO } from "date-fns";

@customElement("upsert-campana-dialog")
export class UpsertCampanaDialog extends LitElement {
  @property()
  dialogOpened: boolean = false;

  @property()
  campana_to_edit: Campana;

  @property()
  edit: boolean = false;

  // Para chequear que no se solapen
  @property()
  campanas: Campana[];

  private campana: Campana;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("dialogOpened")) {
      if (this.dialogOpened) {
        // Se va a abrir el dialog
        if (this.edit) {
          console.log("Editando Campaña");
          this.campana = deepcopy(this.campana_to_edit);
        } else {
          console.log("Nueva Campaña");
          this.campana = { nombre: "", inicio: "", fin: "" };
        }
      }
    }
  }

  render() {
    let titulo = !this.edit
      ? translate("nueva_campana")
      : translate("editar_campana");

    return html`
      <!-- tag::snippet[] -->
      <vaadin-dialog
        header-title="${titulo}"
        .opened="${this.dialogOpened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.dialogOpened = e.detail.value;
          this.dispatchEvent(
            new CustomEvent("opened-changed", {
              detail: e.detail,
              bubbles: true,
              composed: true,
            })
          );
        }}"
        ${dialogRenderer(this.renderDialog, [])}
        ${dialogFooterRenderer(this.renderFooter, [])}
      ></vaadin-dialog>
      <!-- end::snippet[] -->
    `;
  }

  private renderDialog = () => html`
    <vaadin-vertical-layout
      style="align-items: stretch; width: 25rem; max-width: 100%;"
    >
      <vaadin-text-field
        label=${translate("nombre")}
        .value=${this.campana.nombre}
        @input=${(e) => (this.campana.nombre = e.target.value)}
      ></vaadin-text-field>
      <vaadin-horizontal-layout style="justify-content:space-between">
        <vaadin-date-picker
          label=${translate("fecha_inicio")}
          placeholder="YYYY-MM-DD"
          error-message="Debe seleccionar una fecha igual valida"
          .i18n=${base_i18n}
          theme="helper-above-field"
          .value=${this.campana.inicio}
          @change=${(e) => (this.campana.inicio = e.target.value)}
        ></vaadin-date-picker>

        <vaadin-date-picker
          label=${translate("fecha_fin")}
          placeholder="YYYY-MM-DD"
          error-message="Debe seleccionar una fecha valida"
          .i18n=${base_i18n}
          theme="helper-above-field"
          .value=${this.campana.fin}
          @change=${(e) => (this.campana.fin = e.target.value)}
        ></vaadin-date-picker>
      </vaadin-horizontal-layout>

      ${this.edit ? html`
      <vaadin-button theme="secondary error" style="margin-inline-end: auto;" @click=${() => this.borrar_campana()}>
          ${translate('borrar_campana')}
      </vaadin-button>` : null}
    </vaadin-vertical-layout>
  `;

  private renderFooter = () => html`
    <vaadin-button @click="${this.close}">Cancel</vaadin-button>
    <vaadin-button theme="primary" @click="${this.guardar}"
      >${translate("guardar")}</vaadin-button
    >
  `;

  private close() {
    this.dialogOpened = false;
  }

  private guardar() {
    // Checks
    let errors = [];
    if (this.campana.nombre === "") {
      errors.push(get("debe_ingresar_un_nombre"));
    }

    if (this.campana.fin === "" || this.campana.inicio === "") {
      errors.push(get("debe_ingresar_fechas_inicio_fin"));
    }

    if (this.campana.fin !== "" && this.campana.inicio !== "") {
      if(isBefore(parseISO(this.campana.fin), parseISO(this.campana.inicio))){
        errors.push(get("el_fin_debe_ser_posterior_al_inicio"));
      }
    }

    if (this.campana.fin !== "" && this.campana.inicio !== "") {
      let campanas_solapadas_con_fin = this.campanas.filter((campana) => {
        if(campana._id === this.campana._id){
          return false;
        }
        if (campana.inicio !== "" && campana.fin !== "") {
          return isWithinInterval(parseISO(this.campana.fin), {
            start: parseISO(campana.inicio),
            end: parseISO(campana.fin),
          });
        } else {
          return false;
        }
      });

      let campanas_solapadas_con_inicio = this.campanas.filter((campana) => {
        if(campana._id === this.campana._id){
          return false;
        }
        if (campana.inicio !== "" && campana.fin !== "") {
          return isWithinInterval(parseISO(this.campana.inicio), {
            start: parseISO(campana.inicio),
            end: parseISO(campana.fin),
          });
        } else {
          return false;
        }
      });

      if (campanas_solapadas_con_fin.length > 0) {
        errors.push(get("existe_campanas_solapadas_con_la_fecha_de_fin"));
        campanas_solapadas_con_fin.forEach((o) => {
          errors.push("- " + o.nombre);
        });
      }

      if (campanas_solapadas_con_inicio.length > 0) {
        errors.push(get("existe_campanas_solapadas_con_la_fecha_de_inicio"));
        campanas_solapadas_con_inicio.forEach((o) => {
          errors.push("- " + o.nombre);
        });
      }
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    this.dispatchEvent(
      new CustomEvent("save-campana", {
        detail: deepcopy(this.campana),
        bubbles: true,
        composed: true,
      })
    );
    this.dialogOpened = false;
  }


  borrar_campana(){
    this.dispatchEvent(
      new CustomEvent("borrar-campana", {
        detail: deepcopy(this.campana),
        bubbles: true,
        composed: true,
      })
    );
    this.dialogOpened = false;
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
