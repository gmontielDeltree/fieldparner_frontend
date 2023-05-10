import { LitElement, html, unsafeCSS, render, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/vertical-layout";
import "@vaadin/custom-field";
import "@vaadin/grid";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import Modal from "bootstrap/js/dist/modal";
import lista_de_labores from "./labores.json";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { Contratista, empty_contratista, Labor } from "./contratista-types";
import { ContratistaCrud } from "./contratista-crud";
import { GridItemModel } from "@vaadin/grid";
import "../contratistas/contratista-crud";
import "@vaadin/icons";
import "@vaadin/upload";
import "@vaadin/dialog";
import { i18n_upload } from "../i18n/vaadin";
import { Upload } from "@vaadin/upload";
import "@vaadin/menu-bar";
import { Devices } from "../sensores/sensores";
import { DailyTelemetryCard } from "../sensores/sensores-types";
import { extract_tele } from "../sensores/sensores";
import { format, isFuture, parse } from "date-fns";
import { Actividad } from "../depositos/depositos-types";
import distance from "@turf/distance";

const valor = (card, key) => {
  return extract_tele(key, card)?.value || "N/A";
};

const calcular_distancia_al_campo = (
  posicion: number[],
  card: DailyTelemetryCard
) => {
  let central_posicion = [valor(card, "longitud"), valor(card, "latitud")];
  let distancia = distance(posicion, central_posicion, { units: "kilometers" });

  if(distancia <=1){
    distancia = distance(posicion, central_posicion, { units: "meters" });
    return distancia.toFixed(0) + " mts. del centro";
  }

  return distancia.toFixed(2) + " km";
};

const valor_unidad = (card, key) => {
  let point = extract_tele(key, card);
  let result = point ? "" + point.value + " " + point.unit : "No Disponible";
  return result;
};

export class ListaCentralesCercanas extends LitElement {
  @state()
  _centrales: any;

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal: Modal;

  @property()
  db: PouchDB.Database;

  @property()
  posicion: number[];

  @property()
  fecha: string;

  @state()
  _daily_telemetry: DailyTelemetryCard[] = [];

  @state()
  _devices: Devices = new Devices();

  @state()
  _detalles: any[] = [];

  static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  override firstUpdated() {
    if (this._modal === undefined) {
      this._modal = new Modal(this.shadowRoot.getElementById("modal"));
      this.shadowRoot
        .getElementById("modal")
        .addEventListener("hidden.bs.modal", (event) => {
          // Se elimina del parent
          let parent = this.parentElement;
          parent.firstChild.remove();
          // while (parent.firstChild) {
          //   parent.
          //   parent.firstChild.remove;
          //   parent.firstChild.
          // }
        });
      this._modal.show();
    }
  }

  show() {
    // Quizas lo muestro antes del first update
    if (this._modal !== undefined) {
      this._modal.show();
    }

    this.get_centrales_cercanas(this.posicion, this.fecha);
  }

  async get_centrales_cercanas(posicion: number[], fecha_str_1: string) {
    let fecha = format(
      parse(fecha_str_1, "yyyy-MM-dd", new Date()),
      "yyyyMMdd"
    );
    // Por ahora get todas las centrales
    this._daily_telemetry = await this._devices.get_daily_cards(fecha);
    this._daily_telemetry = this._daily_telemetry.filter((dt) => dt);
    // console.log("EEEEEEEEEE", fecha_str_1, this._daily_telemetry);
    // console.log("EEEEEEEEEEss", await this._devices.get_all_details());
    this._detalles = await this._devices.get_all_details();
  }

  ver_detalles_del_dia(daily_card: DailyTelemetryCard) {
    this._modal.hide();

    this.dispatchEvent(
      new CustomEvent("ver-telemetria-del-dia", {
        detail: daily_card,
        bubbles: true,
        composed: true,
      })
    );
  }

  detalles_de(uuid) {
    return this._detalles.find((d) => d.device_id === uuid);
  }

  render() {
    let lista_centrales = html`<div class="list-group">
      ${this._daily_telemetry?.map((dc: DailyTelemetryCard) => {
        //let detalles = await this._devices.get_details(dc.device_id)

        return html`<a
          class="list-group-item list-group-item-action"
          aria-current="true"
          @click=${() => this.ver_detalles_del_dia(dc)}
        >
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1 text-primary">
              ${this.detalles_de(dc.device_id)?.nombre || ""}
            </h5>
            <small class="text-muted"
              >Ubicada a ${calcular_distancia_al_campo(this.posicion, dc)} del
              lote</small
            >
          </div>
          <small>ID Dispositivo: ${dc.device_id}</small>
          <p class="mb-1">Promedios</p>

          <div class="container-fluid row">
            <div class="col">${valor_unidad(dc, "temperatura_mean")}</div>
            <div class="col">${valor_unidad(dc, "humedad_mean")}</div>
            <div class="col">${valor_unidad(dc, "presion_mean")}</div>
          </div>
        </a>`;
      })}
    </div>`;

    let future_msg = html`
      <div>Esta actividad esta planificada para ${this.fecha}.</div>
    `;

    let body = isFuture(parse(this.fecha, "yyyy-MM-dd", new Date()))
      ? future_msg
      : lista_centrales;

    return html`
      <div
        class="modal fade"
        id="modal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title" id="exampleModalLabel">
                Meteorología ${this.fecha}
                <small class="text-muted">Lista de Centrales</small>
              </h6>

              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">${body}</div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("centrales-cercanas-lista", ListaCentralesCercanas);

declare global {
  interface HTMLElementTagNameMap {
    "centrales-cercanas-lista": ListaCentralesCercanas;
  }
}
