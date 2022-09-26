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
import PouchDB from "pouchdb";
import "../contratistas/contratista-crud";
import "@vaadin/icons";
import { Map} from "mapbox-gl";
import { Devices, extract_tele } from "./sensores";
import { touchEvent } from "../helpers";
import devices_modelos from "./devices_modelos.ts";
import { format, formatDistance, formatRelative, subDays } from "date-fns";
import format from "date-fns/format";
import ApexCharts from "apexcharts";
import apex_css from "apexcharts/dist/apexcharts.css";
import { DailyTelemetryCard } from "./sensores-types";
import "./mediciones-cards/temperatura";
import "./mediciones-cards/presion";
import "./mediciones-cards/humedad";
import "./mediciones-cards/viento_velocidad"
import "./mediciones-cards/viento_direccion"
// background-position-y: -60px;
//background-size: 100% auto;
//background-position-y: -60px;
export class SensoresClass extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(bootstrap),
    unsafeCSS(apex_css),
    css`
      .humedad-body {
        background-image: url("sensor-humedad/suelo.webp");
        background-repeat: no-repeat;
        background-position-y: -60px;
      }

      .offcanvas-humedad-body {
        background-image: url("sensor-humedad/blur_bg.webp"),
          linear-gradient(rgba(255, 255, 255, 0), rgb(78, 62, 55));
        background-repeat: no-repeat;
        background-size: 100% 100%;
        background-blend-mode: normal;
      }

      .charts-body {
        background-image: url("sensor-humedad/blur_bg.webp");
        background-position-y: -70px;
      }

      .offcanvas-sensores-body {
        background-image: url("fondodewindows.jpeg");
        background-size: 100% 100%;
        background-repeat: no-repeat;
      }

      .header-blue {
        /* color: #0348d9; */
        background-color: #0348d9;
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
        height: 200px;
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
  _selected_device_card: DailyTelemetryCard = undefined;

  @state()
  _selected_details: any = {};

  @state()
  _devices: Devices = new Devices();

  @state()
  _datapoints: any;

  @state({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
  _offcanvas_humedad: Offcanvas;

  @state()
  _show_chart_only: boolean = false;

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

    this._offcanvas_humedad = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-humedad")
    );
  }

  override async willUpdate(props) {}

  // Ocurre cuando ya se renderizo
  override updated(changedProps) {
    if (changedProps.has("_selected_details")) {
    }
  }

  async show(card: DailyTelemetryCard) {
    if (card) {
      // Ya tengo algo que mostrar
      console.log("MOSTRAR", card)
      await this.updateComplete;
      this._offcanvas.show();
      this._selected_device_card = card;
      this._selected_details = await this._devices.get_details(card.device_id);
      this.load_data_points();

      return;
    }

    // console.log("Selected Device LAST Telemetry", this._selected_device_card);

    // // Obtener la telemetria de todos los devices publicos
    // let hoy = format(new Date(), "yyyyMMdd");
    // let daily_telemetry = await this._devices.devices_publicos_daily_get(hoy);
    // console.log("DAiLY TELE", daily_telemetry);

    // this._selected_details = await this._devices.get_details(
    //   this._selected_device_card.device_id
    // );

    // console.log("Selected Device DETAILS", this._selected_details);
    // this._offcanvas.show();
  }

  valor(key) {
    return this._selected_device_card
      ? extract_tele(key, this._selected_device_card).value || "N/A"
      : "N/A";
  }

  simulated_historical_data(s) {
    let tes = [11, 32, 45, 32, 34, 52, 41];
    let haches = [31, 40, 28, 51, 42, 109, 100];
    if (s === 1) {
      tes = tes.map((t) => Math.round(t / 4));
    } else if (s === 2) {
      tes = tes.map((t) => Math.round(t / 4 - 2.4));
    }

    if (s === 1) {
      haches = haches.map((t) => Math.round(t / 5 + 10));
    } else if (s === 2) {
      haches = haches.map((t) => Math.round(t / 5 + 10) - 3);
    }

    let dates = [
      "2022-08-24T00:00:00.000Z",
      "2022-08-24T01:30:00.000Z",
      "2022-08-24T02:30:00.000Z",
      "2022-08-24T03:30:00.000Z",
      "2022-08-24T04:30:00.000Z",
      "2022-08-24T05:30:00.000Z",
      "2022-08-24T06:30:00.000Z",
    ];
    return { temperatura: [...tes], humedad: [...haches], ts: [...dates] };
  }

  async load_data_points() {
    let nt = await this._devices.get_raw_data_for_charts_generic(
      this._selected_device_card.device_id
    );
    console.log("Data for Charts LDP", nt);
    this._datapoints = nt;
  }

  async renderChart() {
    await this.updateComplete;

    var base_options = {
      series: [
        {
          name: "Humedad",
          data: [31, 40, 28, 51, 42, 109, 100],
        },
        {
          name: "Temperatura",
          data: [11, 32, 45, 32, 34, 52, 41],
        },
      ],
      chart: {
        height: 350,
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2022-08-24T00:00:00.000Z",
          "2022-08-24T01:30:00.000Z",
          "2022-08-24T02:30:00.000Z",
          "2022-08-24T03:30:00.000Z",
          "2022-08-24T04:30:00.000Z",
          "2022-08-24T05:30:00.000Z",
          "2022-08-24T06:30:00.000Z",
        ],
      },
      yaxis: [
        {
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: "#008FFB",
          },
          labels: {
            style: {
              colors: "#000000",
            },
          },
          title: {
            text: "Humedad",
            style: {
              color: "#008FFB",
            },
          },
          tooltip: {
            enabled: true,
          },
        },
        {
          seriesName: "Temperatura",
          opposite: true,
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: "#00E396",
          },
          labels: {
            style: {
              colors: "#00E396",
            },
          },
          title: {
            text: "Temperatura",
            style: {
              color: "#00E396",
            },
          },
        },
      ],

      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
    };

    var options = {
      ...base_options,
      chart: {
        type: "area",
        height: "200px",
        foreColor: "#ffffff",
        //background: '#fff'
      },
      title: {
        text: "Sensor 1",
        align: "left",
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          fontFamily: undefined,
          color: "#ffffff",
        },
      },
    };

    let nt = await this._devices.get_raw_data_for_charts(
      this._selected_device_card.device_id
    );
    console.log(nt);

    let sim1 = this.simulated_historical_data(1);
    options.series[0].data = [...sim1.humedad, ...nt.h1];
    options.xaxis.categories = [...sim1.ts, ...nt.ts];
    options.series[1].data = [...sim1.temperatura, ...nt.t1];

    var chart_1 = new ApexCharts(
      this.shadowRoot.getElementById("chart-1"),
      options
    );

    let op2 = { ...options };

    op2.title.text = "Sensor 2";

    let sim2 = this.simulated_historical_data(2);
    op2.series = [
      {
        name: "Humedad",
        data: [...sim2.humedad, ...nt.h2],
      },
      {
        name: "Temperatura",
        data: [...sim2.temperatura, ...nt.t2],
      },
    ];
    // options.xaxis.categories = sim.ts;
    //options.series[1].data = [...sim1.temperatura];
    var chart_2 = new ApexCharts(
      this.shadowRoot.getElementById("chart-2"),
      op2
    );

    chart_1.render();
    chart_2.render();
  }

  device_tiene(sensor) {
    return devices_modelos[this._selected_details?.tipo]?.sensores.includes(
      sensor
    );
  }

  // if (this.device_tiene("humedad")) {
  //   const this_opts = JSON.parse(JSON.stringify(options));
  //   this_opts.xaxis.categories = [...nt.ts];
  //   this_opts.series[0].data = [...nt.humedad];
  //   this_opts.series[0].name = "Humedad";
  //   this_opts.title.text = "Humedad";
  //   this_opts.yaxis[0].title = "Humedad";
  //   const chart_1 = new ApexCharts(
  //     this.shadowRoot.getElementById("chart-central-2"),
  //     this_opts
  //   );
  //chart_1.render();
  //}

  // if (this.device_tiene("presion")) {
  //   const this_opts = JSON.parse(JSON.stringify(options));
  //   this_opts.xaxis.categories = [...nt.ts];
  //   this_opts.series[0].data = [...nt.presion];
  //   this_opts.series[0].name = "Presion";
  //   this_opts.title.text = "Presion";
  //   this_opts.yaxis[0].title = "Presion";
  //   const chart_1 = new ApexCharts(
  //     this.shadowRoot.getElementById("chart-central-3"),
  //     this_opts
  //   );
  // chart_1.render();

  sensor_renderer(sensor_data, detalles, pos) {
    // Si no es sensor de humedad suelo no renderiza nada
    if (
      !devices_modelos[this._selected_details?.tipo]?.sensores.includes(
        "humedad_suelo"
      )
    ) {
      return null;
    }

    let c = "";
    if (pos === 1) {
      c = "mx-0 p-0 container-fluid row";
    } else if (pos === 2) {
      c = "mx-0 p-0 container-fluid row";
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
              .value=${this._selected_details?.detalles_instalacion?.[
                "profundidad_" + pos
              ]}
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
                .value=${this.valor("suelo_humedad_" + pos)}
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
                .value=${this.valor("suelo_temperatura_" + pos)}
              />
              <span class="input-group-text">°C</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const ifLoadedShow = (nombre_var) => {
      let a1 =
        devices_modelos[this._selected_details?.tipo]?.sensores.includes(
          nombre_var
        );

      let a2 = this._selected_device_card ? true : false;
      //let a3 = this._datapoints ? true : false;

      return a1 && a2;
    };

    // Hay algo seleccionado
    return html`
      <div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        style="width: 100%;"
        id="offcanvas"
        aria-labelledby="offcanvasLabel"
      >
        <div class="offcanvas-header header-blue">
          <h5 class="offcanvas-title" id="offcanvasLabel">
            ${this._selected_device_card ? this._selected_details.nombre : null}
          </h5>
          <h6 class="offcanvas-title" id="offcanvasLabel">
            ${this._selected_device_card ? this._selected_details.tipo : null}
          </h6>

          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            @click=${() => this._offcanvas.hide()}
          ></button>
        </div>
        <div
          class="offcanvas-body p-1 p-0 m-0 offcanvas-sensores-body container-fluid row"
        >
          <div class="col col-12 p-2">
            <!--Device Detalles-->
            <div>
              ID:
              ${this._selected_device_card
                ? this._selected_device_card.device_id
                : null}
              <br />
              Ultimo reporte hace
              ${this._selected_device_card
                ? formatDistance(
                    new Date(this._selected_device_card.ts_last * 1000),
                    new Date(),
                    { addSuffix: true }
                  )
                : null}
            </div>

            <!-- Temperatura -->
            ${ifLoadedShow("temperatura")
              ? html`<temperatura-card
                  .card=${this._selected_device_card}
                  .data=${this._datapoints}
                ></temperatura-card>`
              : null}
            <!--/temperatura-->

            <!-- Humedad -->
            ${ifLoadedShow("humedad")
              ? html`<humedad-card
                  .card=${this._selected_device_card}
                  .data=${this._datapoints}
                />`
              : null}
            <!--/humedad-->

            <!-- Presion -->
            ${ifLoadedShow("presion")
              ? html`<presion-card
                  .card=${this._selected_device_card}
                  .data=${this._datapoints}
                />`
              : null}
            <!--/presion-->

            <!-- Vel Viento -->
              ${ifLoadedShow("viento_velocidad")
              ? html`<viento-velocidad-card
                  .card=${this._selected_device_card}
                  .data=${this._datapoints}
                />`
              : null}
            <!--/vel viento-->

            <!-- Dir Viento -->
              ${ifLoadedShow("viento_direccion")
              ? html`<viento-direccion-card
                  .card=${this._selected_device_card}
                  .data=${this._datapoints}
                />`
              : null}
            <!--/Dir viento-->

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
                      <div class="col-4 text-warning fw-bolder">
                        <div class="fw-strong">0 km/h</div>
                        <div class="fw-light">Min</div>
                      </div>

                      <div class="col-4 text-warning fw-bolder">
                        <div class="fw-strong">6 km/h dirección SE</div>
                        <div class="fw-light">Promedio</div>
                      </div>

                      <div class="col-4 text-warning fw-bolder">
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
              ? html`<div class="mx-auto">
                  <button
                    type="button"
                    @click=${() => {
                      this._offcanvas_humedad.show();
                      this.renderChart();
                    }}
                    class="btn btn-primary mx-auto"
                  >
                    Ver Sensores de Suelo
                  </button>
                </div> `
              : null}
          </div>

          <!--           <div class="container-fluid col col-8">
            <h3></h3>
            <div class="chart-1" id="chart-central-1"></div>
            <div class="chart-2" id="chart-central-2"></div>
            <div class="chart-3" id="chart-central-3"></div>
          </div> -->
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
            ${this._selected_device_card ? this._selected_details.nombre : null}
          </h5>
          <h6 class="offcanvas-title">
            ${this._selected_device_card ? this._selected_details.tipo : null}
          </h6>

          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            @click=${() => this._offcanvas_humedad.hide()}
          ></button>
        </div>

        <div
          class="offcanvas-body p-0 p-0 m-0 container-fluid row offcanvas-humedad-body"
        >
          <div class="row spacer d-none d-md-block"></div>

          <!--Boton-->
          <div class="row  d-block d-md-none mx-auto my-1">
            <div
              class="btn btn-primary btn-sm"
              @click=${() => (this._show_chart_only = !this._show_chart_only)}
            >
              ${!this._show_chart_only ? "Gráficos" : "Datos"}
            </div>
          </div>

          <!--Primero Sensor-->
          <div class="row">
            <div
              class="${this._show_chart_only
                ? "d-none d-md-block"
                : ""} col-12 col-md-4 p-1"
            >
              ${this.sensor_renderer({}, {}, 1)}
            </div>
            <div
              class="${this._show_chart_only
                ? ""
                : "d-none d-md-block"} col-12 col-md-8"
            >
              <div class="chart-1" id="chart-1"></div>
            </div>
          </div>

          <!--Segundo Sensor-->
          <div class="row">
            <div
              class="${this._show_chart_only
                ? "d-none d-md-block"
                : ""} col-12 col-md-4 p-1"
            >
              ${this.sensor_renderer({}, {}, 2)}
            </div>
            <div
              class="${this._show_chart_only
                ? ""
                : "d-none d-md-block"} col-12 col-md-8"
            >
              <div class="chart-2" id="chart-2"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("sensores-oc", SensoresClass);
declare global {
  interface HTMLElementTagNameMap {
    "sensores-oc": SensoresClass;
  }
}
