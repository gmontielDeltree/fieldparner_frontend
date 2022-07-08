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
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { Offcanvas } from "bootstrap";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { GridItemModel } from "@vaadin/grid";
import "../contratistas/contratista-crud";
import "@vaadin/icons";
import "mapbox-gl";
import { Map, Marker } from "mapbox-gl";
import { Devices, extract_tele } from "./sensores";

export class SensoresClass extends LitElement {
  static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  @property()
  map: Map;

  @state()
  _offcanvas: Offcanvas;

  @state()
  _selected_device : {};

  @state()
  _devices: Devices = new Devices();

  override async firstUpdated() {
    this._offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas")
    );
  }

  override async willUpdate(props) {
    if (props.has("map")) {
      // Obtener telemtria y agregar al mapa
      let devices_last_telemetry = await this._devices.devices_publicos_get();
      console.log("LAST TELEMETRY", devices_last_telemetry);

      devices_last_telemetry.map((telemetria) => {
        let latitud = extract_tele("latitud", telemetria).value;
        let longitud = extract_tele("longitud", telemetria).value;

        console.info('LATLON', latitud, longitud)
        const marker = new Marker()
          .setLngLat([longitud, latitud])
          .addTo(this.map);

        /** https://stackoverflow.com/questions/31448397/how-to-add-click-listener-on-marker-in-mapbox-gl-js */
        marker.getElement().addEventListener("click", () => {
          this._selected_device = telemetria;
          this.show()
        });

      });

      
    }
  }

  async show() {
    let daily_telemetry = await this._devices.devices_publicos_daily_get("20220703");
    console.log("DAYLY TELE", daily_telemetry)
    this._offcanvas.show();

  }


  render() {
    return html`
      <div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvas"
        aria-labelledby="offcanvasLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasLabel">${this._selected_device ? this._selected_device.deviceId : null}</h5>
          <h6 class="offcanvas-title" id="offcanvasLabel">${this._selected_device ? this._selected_device.tipo : null}</h6>
          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            @click=${()=>this._offcanvas.hide()}
          ></button>
        </div>
        <div class="offcanvas-body">
        <vaadin-text-field label="Temperatura" .value=${this._selected_device ? extract_tele("temperatura",this._selected_device).value : null} readonly></vaadin-text-field>
        <vaadin-text-field label="Humedad" .value=${this._selected_device ? extract_tele("humedad",this._selected_device).value : null} readonly></vaadin-text-field>
        <vaadin-text-field label="Presión" .value=${this._selected_device ? extract_tele("presion",this._selected_device).value : null} readonly></vaadin-text-field>
        <vaadin-text-field label="Presión" .value=${this._selected_device ? extract_tele("presion",this._selected_device).value : null} readonly></vaadin-text-field>
        </div>
      </div>
    `;
  }
}

customElements.define("sensores-oc", SensoresClass);
