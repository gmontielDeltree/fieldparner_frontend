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
import { format, formatDistance, formatRelative, subDays } from "date-fns";
import format from "date-fns/format";

export class SensoresClass extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(bootstrap),
    css`
      .humedad-body {
        background-image: url("sensor-humedad/suelo.png");
        background-position-y: -60px;
      }
      .profundidad {
        left: 10px;
        background-color: whitesmoke;
        width: 80px;
      }
      .profundidad-1 {
        top: 300px;
      }
      .profundidad-2 {
        top: 500px;
      }

      .humedad {
        left: 310px;
        background-color: whitesmoke;
        width: 80px;
      }
      .humedad-1 {
        top: 300px;
      }
      .humedad-2 {
        top: 500px;
      }

      .temperatura {
        left: 310px;
        background-color: whitesmoke;
        width: 80px;
      }
      .temperatura-1 {
        top: 400px;
      }
      .temperatura-2 {
        top: 600px;
      }

      .sensor-imagen {
        background-image: url("sensor-humedad/sensor-humedad-suelo.png");
        background-size: 100%;
        background-repeat: no-repeat;
        background-position: center;
      }

      .sensor-1 {
        position: relative;
        top: 150px;
      }

      .sensor-2 {
        position: relative;
        top: 180px;
      }

      .segundo-sensor {
        top: 500px;
      }
    `,
  ];

  @property()
  map: Map;

  @state({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
  _offcanvas: Offcanvas;

  @state()
  _selected_device: any = undefined;

  @state()
  _selected_details: any = {};

  @state()
  _devices: Devices = new Devices();

  @state()
  _offcanvas_humedad: Offcanvas;

  override async firstUpdated() {
    this._offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas")
    );

    this._offcanvas_humedad = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-humedad")
    );
  }

  override async willUpdate(props) {
    if (props.has("map")) {
      // Obtener telemtria y agregar al mapa
      let devices_last_telemetry = await this._devices.devices_publicos_get();
      //console.log("LAST TELEMETRY", devices_last_telemetry);

      devices_last_telemetry.map((telemetria) => {
        try {
          let latitud = extract_tele("latitud", telemetria).value;
          let longitud = extract_tele("longitud", telemetria).value;

          const el = document.createElement("div");
          el.className = "marker";

          el.style.backgroundImage = `url('centralmeteorologica.png')`;
          el.style.backgroundSize = "cover";
          el.style.width = `90px`;
          el.style.height = `70px`;
          //el.style.backgroundSize = '100%';
          el.style.cursor = "pointer";

          //console.info("LATLON", latitud, longitud);
          const marker = new Marker({ anchor: "bottom", element: el })
            .setLngLat([longitud, latitud])
            .addTo(this.map);

          /** https://stackoverflow.com/questions/31448397/how-to-add-click-listener-on-marker-in-mapbox-gl-js */
          marker.getElement().addEventListener(touchEvent, () => {
            this._selected_device = telemetria;
            this.show();
          });
        } catch (e) {
          console.info("Error Al hacer el marcador de dispositivo");
        }
      });
    }
  }

  async show() {
    console.log("Selected Device LAST Telemetry", this._selected_device);

    // Obtener la telemetria de todos los devices publicos
    let hoy = format(new Date(), "yyyyMMdd");
    let daily_telemetry = await this._devices.devices_publicos_daily_get(hoy);
    console.log("DAiLY TELE", daily_telemetry);

    this._selected_details = await this._devices.get_details(
      this._selected_device.device_id
    );

    console.log("Selected Device DETAILS", this._selected_details);
    this._offcanvas.show();
  }

  valor(key) {
    return this._selected_device
      ? extract_tele(key, this._selected_device).value
      : "N/A";
  }



  sensor_renderer(sensor_data,pos) {
    let c = ""
    if(pos === 1){
      c = "sensor-1 mx-0 p-0 container-fluid row"
      }else if(pos===2){
        c ="sensor-2 mx-0 p-0 container-fluid row"
    }
    return html`
          <div class=${c}>
            <div class="col col-4 my-auto" profundidad>
              <label
                for="exampleInputEmail1"
                style="color: #00ff29;"
                class="form-label fw-bold"
                >Profundidad</label
              >

              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  id="basic-url"
                  aria-describedby="basic-addon3"
                />
                <span class="input-group-text">cm.</span>
              </div>
            </div>

            <div class="col col-4 sensor-imagen"></div>
            <div class="col col-4">
              <div class="row my-auto" humedad>
                <label
                  for="exampleInputEmail1"
                  style="color: #00ff29;"
                  class="form-label fw-bold"
                  >Humedad Volumétrica</label
                >

                <div class="input-group mb-3">
                  <input
                    type="number"
                    class="form-control"
                    id="basic-url"
                    aria-describedby="basic-addon3"
                    disabled
                  />
                  <span class="input-group-text">%Vol</span>
                </div>
              </div>

              <div class="row my-auto" temperatura>
                <label
                  for="exampleInputEmail1"
                  style="color: #00ff29;"
                  class="form-label fw-bold"
                  >Temperatura</label
                >

                <div class="input-group mb-3">
                  <input
                    type="number"
                    class="form-control"
                    id="basic-url"
                    aria-describedby="basic-addon3"
                    disabled
                  />
                  <span class="input-group-text">°C</span>
                </div>
              </div>
            </div>
          </div>
    `

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
            ${this._selected_device ? this._selected_details.tipo : null}
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
            ID:
            ${this._selected_device ? this._selected_device.device_id : null}
            <br />
            Ultimo reporte hace
            ${this._selected_device
              ? formatDistance(
                  new Date(this._selected_device.ts_last * 1000),
                  new Date(),
                  { addSuffix: true }
                )
              : null}
          </div>

          <!-- Temperatura -->
          ${devices_modelos[this._selected_details?.tipo]?.sensores.includes(
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
                      <div class="fw-strong">
                        ${this.valor("temperatura_min")} ºC
                      </div>
                      <div class="fw-light">Min</div>
                    </div>

                    <div class="col-4 text-warning">
                      <div class="fw-strong">
                        ${this.valor("temperatura_mean")} ºC
                      </div>
                      <div class="fw-light">Promedio</div>
                    </div>

                    <div class="col-4 text-danger">
                      <div class="fw-strong">
                        ${this.valor("temperatura_max")} ºC
                      </div>
                      <div class="fw-light">Max</div>
                    </div>
                  </div>
                </div>
              `
            : null}
          <!--/temperatura-->

          <!-- Humedad -->
          ${devices_modelos[this._selected_details?.tipo]?.sensores.includes(
            "humedad"
          )
            ? html`
                <div class="container-fluid border-primary border-top p-1">
                  <div class="row">
                    <h5>
                      Humedad
                      <span class="fw-bolder">${this.valor("humedad")} %</span>
                    </h5>
                  </div>
                  <div class="row">
                    <div class="col-4 text-success">
                      <div class="fw-strong">
                        ${this.valor("humedad_min")} %
                      </div>
                      <div class="fw-light">Min</div>
                    </div>

                    <div class="col-4 text-warning">
                      <div class="fw-strong">
                        ${this.valor("humedad_mean")} %
                      </div>
                      <div class="fw-light">Promedio</div>
                    </div>

                    <div class="col-4 text-danger">
                      <div class="fw-strong">
                        ${this.valor("humedad_max")} %
                      </div>
                      <div class="fw-light">Max</div>
                    </div>
                  </div>
                </div>
              `
            : null}
          <!--/humedad-->

          <!-- Presion -->
          ${devices_modelos[this._selected_details?.tipo]?.sensores.includes(
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
                      <div class="fw-strong">
                        ${this.valor("presion_min")} hPa
                      </div>
                      <div class="fw-light">Min</div>
                    </div>

                    <div class="col-4 text-warning">
                      <div class="fw-strong">
                        ${this.valor("presion_mean")} hPa
                      </div>
                      <div class="fw-light">Promedio</div>
                    </div>

                    <div class="col-4 text-danger">
                      <div class="fw-strong">
                        ${this.valor("presion_max")} hPa
                      </div>
                      <div class="fw-light">Max</div>
                    </div>
                  </div>
                </div>
              `
            : null}
          <!--/presion-->

          <!-- Viento -->
          ${devices_modelos[this._selected_details?.tipo]?.sensores.includes(
            "viento"
          )
            ? html`
                <div class="container-fluid border-primary border-top p-1">
                  <div class="row">
                    <h5>
                      Viento
                      <span class="fw-bolder"
                        >${this.valor("velocidad")} km/h</span
                      >
                    </h5>
                  </div>
                  <div class="row">
                    <div class="col-4 text-success">
                      <div class="fw-strong">0 km/h</div>
                      <div class="fw-light">Min</div>
                    </div>

                    <div class="col-4 text-warning">
                      <div class="fw-strong">6 km/h dirección SE</div>
                      <div class="fw-light">Promedio</div>
                    </div>

                    <div class="col-4 text-danger">
                      <div class="fw-strong">16 km/h dirección SE</div>
                      <div class="fw-light">Max</div>
                    </div>
                  </div>
                </div>
              `
            : null}
          <!--/viento-->

          <!-- Humedad Suelo-->
          ${devices_modelos[this._selected_details?.tipo]?.sensores.includes(
            "humedad_suelo"
          )
            ? html`<button
                type="button"
                @click=${() => {
                  this._offcanvas_humedad.show();
                }}
                class="btn btn-primary"
              >
                Ver Sensores de Suelo
              </button> `
            : null}
        </div>
      </div>

      <div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvas-humedad"
        aria-labelledby="offcanvasLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">
            ${this._selected_device ? this._selected_details.nombre : null}
          </h5>
          <h6 class="offcanvas-title">
            ${this._selected_device ? this._selected_details.tipo : null}
          </h6>

          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            @click=${() => this._offcanvas_humedad.hide()}
          ></button>
        </div>
        <div class="offcanvas-body p-1 humedad-body">
          ${this.sensor_renderer({},1)}
          ${this.sensor_renderer({},2)}
        </div>
      </div>
    `;
  }
}

customElements.define("sensores-oc", SensoresClass);
