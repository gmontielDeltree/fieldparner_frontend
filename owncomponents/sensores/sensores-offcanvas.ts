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
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { GridItemModel } from "@vaadin/grid";
import "../contratistas/contratista-crud";
import "@vaadin/icons";
import { Map, Marker } from "mapbox-gl";
import { Devices, extract_tele } from "./sensores";
import { touchEvent } from "../helpers.js";
import devices_modelos from "./devices_modelos.ts";

export class SensoresClass extends LitElement {
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
  _selected_device: {};

  @state()
  _selected_details: {};

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

        console.info("LATLON", latitud, longitud);
        const marker = new Marker()
          .setLngLat([longitud, latitud])
          .addTo(this.map);

        /** https://stackoverflow.com/questions/31448397/how-to-add-click-listener-on-marker-in-mapbox-gl-js */
        marker.getElement().addEventListener(touchEvent, () => {
          this._selected_device = telemetria;
          this.show();
        });
      });
    }
  }

  async show() {
    let daily_telemetry = await this._devices.devices_publicos_daily_get(
      "20220703"
    );
    console.log("DAYLY TELE", daily_telemetry);

    this._selected_details = await this._devices.get_details(this._selected_device.device_id)
    
    this._offcanvas.show();
  }

  valor(key) {
    return this._selected_device
      ? extract_tele(key, this._selected_device).value
      : "N/A";
  }

  render() {
    // Hay algo seleccionado
    return html`
      <div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvas"
        aria-labelledby="offcanvasLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasLabel">
            ${this._selected_device ? this._selected_details.nombre : null}
          </h5>
          <h6 class="offcanvas-title" id="offcanvasLabel">
            ${this._selected_device ? this._selected_device.tipo : null}
          </h6>

          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            @click=${() => this._offcanvas.hide()}
          ></button>

        </div>
        <div class="offcanvas-body">
          
        <!--Device Detalles-->
        <div>
            ${this._selected_device ? this._selected_device.device_id : null}
        </div>
        

        <!-- Temperatura -->
          ${devices_modelos[this._selected_device?.tipo]?.sensores.includes(
            "temperatura"
          )
            ? html`
                <div class="container-fluid border-primary border-top p-1">
                  <div class="row">
                    <h5>
                      Temperatura
                      <span class="fw-bolder"
                        >${this.valor("temperatura")} ºC</span
                      >
                    </h5>
                  </div>
                  <div class="row">
                    <div class="col-4 text-success">
                      <div class="fw-strong">10 ºC</div>
                      <div class="fw-light">Min</div>
                    </div>

                    <div class="col-4 text-warning">
                      <div class="fw-strong">14 ºC</div>
                      <div class="fw-light">Promedio</div>
                    </div>

                    <div class="col-4 text-danger">
                      <div class="fw-strong">18 ºC</div>
                      <div class="fw-light">Max</div>
                    </div>
                  </div>
                </div>
                 `
            : null}
            <!--/temperatura-->

                    <!-- Humedad -->
          ${devices_modelos[this._selected_device?.tipo]?.sensores.includes(
            "humedad"
          )
            ? html`
                <div class="container-fluid border-primary border-top p-1">
                  <div class="row">
                    <h5>
                      Humedad
                      <span class="fw-bolder"
                        >${this.valor("humedad")} %</span
                      >
                    </h5>
                  </div>
                  <div class="row">
                    <div class="col-4 text-success">
                      <div class="fw-strong">10 %</div>
                      <div class="fw-light">Min</div>
                    </div>

                    <div class="col-4 text-warning">
                      <div class="fw-strong">14 %</div>
                      <div class="fw-light">Promedio</div>
                    </div>

                    <div class="col-4 text-danger">
                      <div class="fw-strong">18 %</div>
                      <div class="fw-light">Max</div>
                    </div>
                  </div>
                </div>
                 `
            : null}
            <!--/humedad-->

            <!-- Presion -->
          ${devices_modelos[this._selected_device?.tipo]?.sensores.includes(
            "presion"
          )
            ? html`
                <div class="container-fluid border-primary border-top p-1">
                  <div class="row">
                    <h5>
                      Presión
                      <span class="fw-bolder"
                        >${this.valor("presion")} hPa</span
                      >
                    </h5>
                  </div>
                  <div class="row">
                    <div class="col-4 text-success">
                      <div class="fw-strong">10 hPa</div>
                      <div class="fw-light">Min</div>
                    </div>

                    <div class="col-4 text-warning">
                      <div class="fw-strong">14 hPa</div>
                      <div class="fw-light">Promedio</div>
                    </div>

                    <div class="col-4 text-danger">
                      <div class="fw-strong">18 hPa</div>
                      <div class="fw-light">Max</div>
                    </div>
                  </div>
                </div>
                 `
            : null}
            <!--/presion-->


        </div>
      </div>
    `;
  }
}

customElements.define("sensores-oc", SensoresClass);
