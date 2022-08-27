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
import ApexCharts from 'apexcharts'
import apex_css from "apexcharts/dist/apexcharts.css"

export class SensoresClass extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(bootstrap),
    unsafeCSS(apex_css),
    css`
      .humedad-body {
        background-image: url("sensor-humedad/suelo.webp");
        background-position-y: -60px;
      }

      .offcanvas-humedad-body {
        background-image: url('sensor-humedad/blur_bg.webp');
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
        background-image: url("sensor-humedad/sensor-humedad-suelo.webp");
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

      .chart-1 {
        height:200px;
      }

      .spacer {
        height: 110px;
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

  @state({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
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


  simulated_historical_data(s){
    let tes = [11, 32, 45, 32, 34, 52, 41];
    let haches = [31, 40, 28, 51, 42, 109, 100];
    if(s===1){
      tes = tes.map(t => Math.round(t / 4 ));
    }else if(s===2){
      tes = tes.map(t => Math.round( t / 4 - 2.4));
    }

    if(s===1){
      haches = haches.map(t =>  Math.round(t / (5) + 10));
    }else if(s===2){
      haches = haches.map(t =>  Math.round(t / (5) + 10) - 3);
    }

    let dates= ["2022-08-24T00:00:00.000Z", "2022-08-24T01:30:00.000Z", "2022-08-24T02:30:00.000Z", "2022-08-24T03:30:00.000Z", "2022-08-24T04:30:00.000Z", "2022-08-24T05:30:00.000Z", "2022-08-24T06:30:00.000Z"]
    return {temperatura : [...tes], humedad: [...haches], ts:[...dates]}
  }


  async renderChart() {
    await this.updateComplete;

    var base_options = {
      series: [{
      name: 'Humedad',
      data: [31, 40, 28, 51, 42, 109, 100]
    }, {
      name: 'Temperatura',
      data: [11, 32, 45, 32, 34, 52, 41]
    }],
      chart: {
      height: 350,
      type: 'area'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      type: 'datetime',
      categories: ["2022-08-24T00:00:00.000Z", "2022-08-24T01:30:00.000Z", "2022-08-24T02:30:00.000Z", "2022-08-24T03:30:00.000Z", "2022-08-24T04:30:00.000Z", "2022-08-24T05:30:00.000Z", "2022-08-24T06:30:00.000Z"]
    },
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#008FFB'
        },
        labels: {
          style: {
            colors: '#008FFB',
          }
        },
        title: {
          text: "Humedad",
          style: {
            color: '#008FFB',
          }
        },
        tooltip: {
          enabled: true
        }
      },
      {
        seriesName: 'Temperatura',
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#00E396'
        },
        labels: {
          style: {
            colors: '#00E396',
          }
        },
        title: {
          text: "Temperatura",
          style: {
            color: '#00E396',
          }
        },
      }
    ],

    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm'
      },
    },
    };

    var options = {...base_options,
      chart: {
        type: 'area',
        height: '200px',
        foreColor: '#ffffff'
        //background: '#fff'
      },
      title: {
        text: "Sensor 1",
        align: 'left',
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize:  '14px',
          fontWeight:  'bold',
          fontFamily:  undefined,
          color:  '#ffffff'
        },
    }
    }


    let nt = await this._devices.get_raw_data_for_charts()
    console.log(nt)

    let sim1 = this.simulated_historical_data(1)
    options.series[0].data = [...sim1.humedad,...nt.h1];
     options.xaxis.categories = [...sim1.ts,...nt.ts];
   options.series[1].data = [...sim1.temperatura,...nt.t1];

    var chart_1 = new ApexCharts(this.shadowRoot.getElementById("chart-1"), options);
    
    let op2 = {...options};

    op2.title.text = "Sensor 2";

    let sim2 = this.simulated_historical_data(2)
    op2.series = [{
      name: 'Humedad',
      data: [...sim2.humedad,...nt.h2]
    }, {
      name: 'Temperatura',
      data: [...sim2.temperatura,...nt.t2]
    }]
    // options.xaxis.categories = sim.ts;
    //options.series[1].data = [...sim1.temperatura];
    var chart_2 = new ApexCharts(this.shadowRoot.getElementById("chart-2"), op2);

    chart_1.render();
    chart_2.render();
    
    
  }

  sensor_renderer(sensor_data,detalles,pos) {

    // Si no es sensor de humedad suelo no renderiza nada
    if(!devices_modelos[this._selected_details?.tipo]?.sensores.includes(
      "humedad_suelo"
    )){
      return null;
    }


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
                  .value=${this._selected_details?.detalles_instalacion?.['profundidad_' + pos]}
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
                    .value=${this.valor('suelo_humedad_' + pos)}
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
                    .value=${this.valor('suelo_temperatura_' + pos)}
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
            ? html`<div class='mx-auto'><button
                type="button"
                @click=${() => {
                  this._offcanvas_humedad.show();
                  this.renderChart();
                }}
                class="btn btn-primary mx-auto"
              >
                Ver Sensores de Suelo
              </button></div> `
            : null}
        </div>
      </div>

      <div
        class="offcanvas offcanvas-start"
        style="width: 100%;"
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
        <div class="offcanvas-body p-0 container-fluid row offcanvas-humedad-body">
          <div class="col col-4 p-1 humedad-body">
          ${this.sensor_renderer({},{},1)}
          ${this.sensor_renderer({},{},2)}
          </div>


          <div class="container-fluid col col-8">
            <h3></h3>
          <div class="spacer" spacer></div>
            <div class='chart-1' id='chart-1'></div>
            <div class='chart-2' id='chart-2'></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("sensores-oc", SensoresClass);
