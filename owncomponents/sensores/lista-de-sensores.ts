import { LitElement, html, unsafeCSS, render, CSSResultGroup, css } from "lit";
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
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { GridItemModel } from "@vaadin/grid";
import "../contratistas/contratista-crud";
import "@vaadin/icons";
import { Map, Marker } from "mapbox-gl";
import { Devices, extract_tele } from "./sensores";
import { touchEvent } from "../helpers";
import devices_modelos from "./devices_modelos";
import { format, formatDistance, formatRelative, subDays } from "date-fns";
import { DailyTelemetryCard, DeviceDetalles } from "./sensores-types";

const valor = (card, key) => {
  return extract_tele(key, card)?.value || "N/A";
};

/* Busca el uuid del device en 'cards' y devuelve la posicion */
const posicion = (uuid: string, cards: DailyTelemetryCard[]) => {
  let card_del_device = cards.find(
    (d: DailyTelemetryCard) => d.device_id === uuid
  );
  if (card_del_device) {
    return [
      valor(card_del_device, "longitud"),
      valor(card_del_device, "latitud"),
    ] as [number, number];
  }
};
// background-position-y: -60px;
//background-size: 100% auto;
//background-position-y: -60px;
export class ListaSensoresClass extends LitElement {
  static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  @property()
  map: Map;

  @state({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
  _offcanvas: Offcanvas;

  @state()
  _selected_device_card: DailyTelemetryCard = undefined;

  @state()
  _selected_details: any = {};

  @state()
  _devices: Devices = new Devices();

  @state()
  _lista_devices: DeviceDetalles[];

  @state()
  _devices_cards: DailyTelemetryCard[];

  override async firstUpdated() {
    this.shadowRoot
      .getElementById("offcanvas")
      .addEventListener("hidden.bs.offcanvas", (e) => {
        // Se elimina del parent
        let parent = this.parentElement;
        while (parent.firstChild) {
          parent.firstChild.remove();
        }
      });

    this._offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas")
    );

    this._offcanvas.show();

    this._lista_devices =
      (await this._devices.get_all_details()) as DeviceDetalles[];

    let hoy = format(new Date(), "yyyyMMdd");
    this._devices_cards = (await this._devices.get_daily_cards(
      hoy
    )) as DailyTelemetryCard[];
  }

  async show() {
    //this._offcanvas.show()
    this._lista_devices =
      (await this._devices.get_all_details()) as DeviceDetalles[];
  }

  protected render(): unknown {
    const item = (name, id) => {
      return html`<a
        href="#"
        @click=${() => {
          this.map.flyTo({ center: posicion(id, this._devices_cards), zoom:20 });
		  this._offcanvas.hide()
        }}
        class="list-group-item list-group-item-action"
        aria-current="true"
      >
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${name}</h5>
          <small class="small"></small>
        </div>
        <p class="mb-1">ID: ${id}</p>
        <small></small>
      </a>`;
    };

    let offcanvas_html = html`<div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="offcanvas"
      aria-labelledby="offcanvasLabel"
	  data-bs-scroll="true"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasLabel">
          Lista de Dispositivos
        </h5>
        <button
          type="button"
          @click=${() => {
            this._offcanvas.hide();
          }}
          class="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <!-- Spinner-->
        ${this._lista_devices
          ? null
          : html`
              <div class="d-flex align-items-center">
                <strong>Loading...</strong>
                <div class="spinner-grow text-primary ms-auto" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            `}

        <!--Lista-->
        <div class="list-group">
          ${this._lista_devices?.map((d: DeviceDetalles) =>
            item(d.nombre, d.device_id)
          )}
        </div>
      </div>
    </div>`;

    return html` ${offcanvas_html} `;
  }
}

customElements.define("lista-de-sensores", ListaSensoresClass);
declare global {
  interface HTMLElementTagNameMap {
    "lista-de-sensores": ListaSensoresClass;
  }
}
