import {
  analisis_suelo_adjuntar,
  analisis_suelo_remover_adjunto,
  borrar_analisis_suelo,
  guardar_analisis_suelo,
  nuevo_analisis_suelo,
  validate_analisis_suelo,
} from "./analisis-suelo-funciones";
import { Router } from "@vaadin/router";
import { RouterLocation } from "@vaadin/router";
import { Proveedor } from "./../tipos/proveedores";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import "../modal-generico/modal-generico";
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
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import { AnalisisSuelo } from "../tipos/analisis-suelo";
import { base_i18n } from "../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import {
  createMenuDots,
  url_param,
  get_campo_detalles_by_uuid,
  get_lote_detalles_by_uuid,
} from "../helpers";
import { gbl_state } from "../state";
import { cargar_analisis_suelo } from "./analisis-suelo-funciones";
import { Campo } from "../tipos/campos";

import { Task, TaskStatus } from "@lit-labs/task";

@customElement("analisis-suelo-editor")
export class AnalisisSueloEditor extends LitElement {
  @property()
  location: RouterLocation;

  @state()
  ana: AnalisisSuelo = nuevo_analisis_suelo();

  static styles = [
    css`
      tbody {
        background-color: #ebebf2;align-items: center;
      }
    `,
  ];

  private caraterizaciones = [];
  private texturas = [];
  private valido: boolean = false;
  private backUrl;

  private _loadTask = new Task(
    this,
    () => this.loadData(),
    () => [this.location]
  );

  async loadData() {
    if (this.location.params.uuid) {
      // Edit
      this.ana = await cargar_analisis_suelo(
        this.location.params.uuid as string
      );
      this.backUrl = `/campo/${this.ana.lote.properties.campo_parent_id}/lote/${this.ana.lote.properties.nombre}`;
    } else {
      let lote_uuid = url_param(this.location, "lote_uuid");
      let lote_doc = await get_lote_detalles_by_uuid(lote_uuid);
      let campo_id = lote_doc.properties.campo_parent_id;
      let campo_detalles = await get_campo_detalles_by_uuid(campo_id);
      this.ana.campo = campo_detalles as Campo;
      this.ana.lote = lote_doc;

      let lote_name = lote_doc.properties.nombre;
      this.backUrl = `/campo/${campo_id}/lote/${lote_name}`;
    }
  }

  render() {
    return html`
      ${this._loadTask.render({
        pending: () => html`${translate("cargando")}`,
        complete: (_) => html`
          <modal-generico .modalOpened=${true}>
            <div slot="title">
              ${translate("analisis_suelo")} -
              ${this.ana.lote.properties.nombre}
            </div>
            <div slot="menu">
              <vaadin-menu-bar
                .items="${this.menu_items}"
                @item-selected=${this.menu_click}
                theme="icon"
              >
                <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
              </vaadin-menu-bar>
            </div>
            <vaadin-tabsheet slot="body">
              <slot
                @uploaded=${(e) => {
                  console.log("FILE UPLOADED EVENT", e);
                  this.fillAnalisis(e.detail);
                }}
              ></slot>
              <vaadin-tabs slot="tabs">
                <vaadin-tab id="laboratorio-tab"
                  >${translate("laboratorio")}</vaadin-tab
                >
                <vaadin-tab id="suelo-tab"
                  >${translate("caracteristicas_del_suelo")}</vaadin-tab
                >
                <vaadin-tab id="variables-tab"
                  >${translate("variables")}</vaadin-tab
                >
                <vaadin-tab id="adjuntos-tab"
                  >${translate("adjuntos")}</vaadin-tab
                >
              </vaadin-tabs>

              <div tab="laboratorio-tab">
                ${this.laboratorio_form(this.ana)}
              </div>
              <div tab="suelo-tab">${this.suelo_form(this.ana)}</div>
              <div tab="variables-tab">${this.variables_form(this.ana)}</div>
              <div tab="adjuntos-tab">${this.adjuntos_form(this.ana)}</div>
            </vaadin-tabsheet>

            ${this.footer()}
          </modal-generico>
        `,
      })}
    `;
  }

  laboratorio_form = (item: AnalisisSuelo) => {
    return html`
      <vaadin-vertical-layout
        theme="spacing padding"
        style="width:100%;justify-content:center;background-color: #ebebf2;align-items: center;"
        class='tbody'
      >
        <vaadin-horizontal-layout theme="spacing">
          <vaadin-text-field
            readonly
            label="ID"
            helper-text=${translate("autogenerado")}
            value=${item.uuid}
            theme="align-right"
          ></vaadin-text-field>
          <vaadin-date-picker
            label=${translate("fecha")}
            placeholder="YYYY-MM-DD"
            error-message="Debe seleccionar una fecha valida"
            .i18n=${base_i18n}
            theme="helper-above-field"
            .value=${item.fecha}
            @change=${(e) => (item.fecha = e.target.value)}
          ></vaadin-date-picker>
        </vaadin-horizontal-layout>

        <vaadin-horizontal-layout theme="spacing">
          <vaadin-text-field
            label=${translate("laboratorio")}
            value=${item.laboratorio}
            @input=${(e) => {
              item.laboratorio = e.target.value;
            }}
            theme="align-right"
          ></vaadin-text-field>
          <vaadin-text-field
            label=${translate("ref_doc_laboratorio")}
            value=${item.referencia_laboratorio}
            @input=${(e) => {
              item.referencia_laboratorio = e.target.value;
            }}
            theme="align-right"
          ></vaadin-text-field>
        </vaadin-horizontal-layout>

        <vaadin-horizontal-layout theme="spacing" t>
          <vaadin-text-field
            label=${translate("responsable_tecnico")}
            value=${item.nombre_responsable}
            @input=${(e) => {
              item.nombre_responsable = e.target.value;
            }}
            theme="align-right"
          ></vaadin-text-field>
          <vaadin-text-field
            label=${translate("matricula")}
            value=${item.matricula_responsable}
            @input=${(e) => {
              item.matricula_responsable = e.target.value;
            }}
            theme="align-right"
          ></vaadin-text-field>
        </vaadin-horizontal-layout>
      </vaadin-vertical-layout>
    `;
  };

  suelo_form = (ana: AnalisisSuelo) => {
    return html`
      <vaadin-vertical-layout theme="spacing" style="width:100%;background-color: #ebebf2;align-items: center;">
        <vaadin-text-field
          label=${translate("caracterizacion")}
          value=${ana.caracterizacion}
          @input=${(e) => {
            ana.caracterizacion = e.target.value;
          }}
          theme="align-right"
        ></vaadin-text-field>
        <vaadin-text-field
          label=${translate("textura")}
          value=${ana.textura}
          @input=${(e) => {
            ana.textura = e.target.value;
          }}
          theme="align-right"
        ></vaadin-text-field>
        <!-- <vaadin-combo-box
          label=${translate("caracterizacion")}
          .items=${this.caraterizaciones}
          .selectedItem=${ana.caracterizacion}
          @selected-item-changed=${(e) => {
          ana.caracterizacion = e.detail.value;
        }}
        ></vaadin-combo-box>
        <vaadin-combo-box
          label=${translate("textura")}
          .items=${this.texturas}
          .selectedItem=${ana.textura}
          @selected-item-changed=${(e) => {
          ana.textura = e.detail.value;
        }}
        ></vaadin-combo-box> -->
        <vaadin-number-field
          theme="align-right"
          label=${translate("profundidad")}
          value=${ana.profundidad}
          @input=${(e) => {
            ana.profundidad = e.target.value;
          }}
        >
          <div slot="suffix">cm</div></vaadin-number-field
        >
      </vaadin-vertical-layout>
    `;
  };

  variables_form = (ana: AnalisisSuelo) => {
    return html`
      <vaadin-vertical-layout theme="spacing" style="background-color: #ebebf2;align-items: center;">
        <vaadin-horizontal-layout theme="spacing">
          ${this.variable_input(ana, "carbono_organico", "%")}
          ${this.variable_input(ana, "materia_organica", "%")}
          ${this.variable_input(ana, "pH", "")}
        </vaadin-horizontal-layout>
        <vaadin-horizontal-layout theme="spacing">
          ${this.variable_input(ana, "fosforo_bray", "ppm")}
          ${this.variable_input(ana, "fosforo_ii", "ppm")}
          ${this.variable_input(ana, "fosforo_iii", "ppm")}
        </vaadin-horizontal-layout>
        <vaadin-horizontal-layout theme="spacing">
          ${this.variable_input(ana, "calcio", "ppm")}
          ${this.variable_input(ana, "potasio", "ppm")}
          ${this.variable_input(ana, "sodio", "ppm")}
        </vaadin-horizontal-layout>
        <vaadin-horizontal-layout theme="spacing">
          ${this.variable_input(ana, "azufre", "ppm")}
          ${this.variable_input(ana, "zinc_zn", "ppm")}
          ${this.variable_input(ana, "nitratos_no3", "ppm")}
        </vaadin-horizontal-layout>
        <vaadin-horizontal-layout theme="spacing">
          ${this.variable_input(ana, "sulfatos_s_so4", "ppm")}
          ${this.variable_input(ana, "nitratos_n_n03", "ppm")}
          ${this.variable_input(ana, "nitrogeno_total", "ppm")}
        </vaadin-horizontal-layout>
        <vaadin-horizontal-layout theme="spacing">
          ${this.variable_input(ana, "humedad", "%")}
          ${this.variable_input(ana, "conductividad_electrica", "mS/m")}
        </vaadin-horizontal-layout>
      </vaadin-vertical-layout>
    `;
  };

  adjuntos_form(ana: AnalisisSuelo) {
    return html`
      <vaadin-vertical-layout style="align-self:stretch">
        ${ana.attachments
          ? ana.attachments.map(
              (att) => html`
                <vaadin-horizontal-layout
                  style="width:100%; align-items:center; justify-content:space-between"
                  theme="spacing"
                >
                  <div>${att.filename}</div>
                  <div>
                    <!-- Grupo botones -->

                    <vaadin-button
                      @click=${() => {
                        fetch(
                          "/attachments?file=" +
                            encodeURIComponent(att.filename)
                        )
                          .then((r) => {
                            return r.blob();
                          })
                          .then((data) => {
                            // Download Fetch
                            var a = document.createElement("a");
                            a.href = window.URL.createObjectURL(data);
                            a.download = att.filename;
                            a.click();
                          });
                      }}
                    >
                      <vaadin-icon icon="lumo:download"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button
                      @click=${() => {
                        analisis_suelo_remover_adjunto(ana, att.uuid);
                      }}
                      ><vaadin-icon icon="vaadin:trash"></vaadin-icon
                    ></vaadin-button>
                  </div>
                </vaadin-horizontal-layout>
              `
            )
          : html`${translate("sin_adjuntos")}`}
      </vaadin-vertical-layout>

      <vaadin-upload
        target="/attachments"
        .files=${
          [] /* Previene que se agregen los archivos debajo del control*/
        }
        @upload-success=${(e) => {
          console.log("successevent", e);
          analisis_suelo_adjuntar(ana, e.detail.file);
          this.requestUpdate();
        }}
      ></vaadin-upload>
    `;
  }

  variable_input = (item, key, unit) => {
    return html`
      <vaadin-number-field
        theme="small"
        theme="align-right"
        label=${translate(key)}
        value=${item[key]}
        @input=${(e) => {
          item[key] = e.target.value;
        }}
      >
        <div slot="suffix">${unit}</div>
      </vaadin-number-field>
    `;
  };

  footer = () => {
    return html`<vaadin-horizontal-layout slot="footer" style='justify-content:right;'>
      <vaadin-button
        theme="primary"
        @click="${() => {
          if ((this.valido = validate_analisis_suelo(this.ana))) {
            guardar_analisis_suelo(this.ana);
            Router.go(this.backUrl);
          } else {
            // invalido
          }
        }}"
        >${translate("guardar")}</vaadin-button
      >
    </vaadin-horizontal-layout>`;
  };

  private menu_items = [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: get("importar_excel"),
          callback: () => {
            Router.go(
              gbl_state.router.urlForPath("/analisissuelo/add/importar")
            );
            console.log("Nuevo");
          },
        },
      ],
    },
  ];

  menu_click({ detail }) {
    /* Si tiene un callback, lo ejecuto */
    if (detail.value.callback) {
      detail.value.callback();
      return;
    }
  }

  fillAnalisis(data: { variable: string; valor: any }[]) {
    const v = (d, variable) => d.find((p) => p.variable === variable).valor;
    this.ana.azufre = v(data, "Azufre (ppm)");
    this.ana.zinc_zn = v(data, "Zinc (Zn – ppm)");
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "analisis-suelo-editor": AnalisisSueloEditor;
  }
}
