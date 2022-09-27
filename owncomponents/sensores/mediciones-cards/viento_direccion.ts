import { LitElement, html, unsafeCSS, render, CSSResultGroup, css } from "lit";
import { property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { DailyTelemetryCard } from "../sensores-types";
import { valor } from "../sensores";
import ApexCharts from "apexcharts";
import apex_css from "apexcharts/dist/apexcharts.css";
// import Plotly from "plotly.js";

const matriz_de_vientos = (ts, dir: number[], vel: number[]) => {
  // Supongo que la muestras estan estan espaciadas a intervalos regulares
  let l_total = vel.length;

  // 'Unir' dir y vel
  let muestras = [];
  for (let i = 0; i < vel.length; i++) {
    muestras.push({ vel: vel[i], dir: dir[i] });
  }

  let rangos_vel = [0, 5, 10, 15, 20, 30, 40, Infinity];
  let rangos_dir = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  ].map((a) => a * (360 / 16));

  let result = {};

  for (let i = 1; i < rangos_vel.length; i++) {
    let limite_inf = rangos_vel[i - 1];
    let limite_sup = rangos_vel[i];

    console.log("RANGO VEL", limite_inf, limite_sup);
    // Velocidades en el rango
    let bin = muestras.filter((d) => {
      return d.vel > limite_inf && d.vel < limite_sup;
    });

    result["" + limite_sup] = [];

    for (let z = 1; z < rangos_dir.length; z++) {
      let limite_dir_inf = rangos_dir[z - 1];
      let limite_dir_sup = rangos_dir[z];

      let bin2 = bin.filter((d) => {
        return d.dir > limite_dir_inf && d.dir < limite_dir_sup;
      });

      console.log(limite_dir_inf, limite_dir_sup, bin2);
      let fraccion = (bin2.length / l_total) * 100;
      result["" + limite_sup].push(fraccion);
    }
  }

  return result;
};

import { add_download_xls_button } from "../excel_boton";
import { forEach } from "jszip";
export class VientoDireccionCard extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(bootstrap),
    unsafeCSS(apex_css),
  ];

  @property()
  card: DailyTelemetryCard;

  @property()
  data: any;

  @state()
  _show_chart_only: boolean = false;

  // Ocurre cuando ya se renderizo
  override updated(changedProps) {
    if (changedProps.has("data")) {
      if (this.shadowRoot.getElementById("chart")) {
        this.renderCentralChart();
      }
    }
  }

  async renderCentralChart() {
    await this.updateComplete;
    this.shadowRoot.getElementById("chart").textContent = "";
    var base_options = {
      colors: ["#F44336", "#E91E63", "#9C27B0"],
      series: [
        {
          name: "",
          data: [],
        },
      ],
      chart: {
        height: 300,
        type: "area",
        animations: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [],
        labels: {
          style: {
            colors: "#000000",
          },
        },
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
              color: "#eb2a1c",
            },
          },
          tooltip: {
            enabled: true,
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
        type: "scatter",
        height: "180px",
        foreColor: "#ffffff",
        //background: '#fff'
        animations: {
          enabled: false,
        },
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

    let nt = this.data;
    //console.log("Data for Charts TEE", nt);

    const this_opts = JSON.parse(JSON.stringify(options));
    this_opts.xaxis.categories = [...nt.ts];
    this_opts.series[0].data = [...nt.direccion];
    this_opts.series[0].name = "Viento - Dirección";
    this_opts.title.text = "Viento - Dirección";
    this_opts.yaxis[0].title = "Viento - Dirección";
    const chart_1 = new ApexCharts(
      this.shadowRoot.getElementById("chart"),
      this_opts
    );
    //chart_1.render();

    // console.log("MATRIX", );

    let matriz = matriz_de_vientos(nt.ts, nt.direccion, nt.velocidad);

    let puntos_cardinales = [
      "North",
      "NNE",
      "NE",
      "ENE",
      "East",
      "ESE",
      "SE",
      "SSE",
      "South",
      "SSW",
      "SW",
      "WSW",
      "West",
      "WNW",
      "NW",
      "NNW",
    ];

    var data = [
      {
        r:matriz['5'],
        theta: puntos_cardinales,
        name: "0-5 km/h",
        marker: { color: "rgb(106,81,163)" },
        type: "barpolar",
      },
      {
        r: matriz['10'],
        theta: puntos_cardinales,
        name: "8-11 m/s",
        marker: { color: "rgb(158,154,200)" },
        type: "barpolar",
      },
      {
        r: matriz['15'],
        theta: puntos_cardinales,
        name: "5-8 m/s",
        marker: { color: "rgb(203,201,226)" },
        type: "barpolar",
      },
      {
        r: matriz['20'],
        theta: puntos_cardinales,
        name: "< 5 m/s",
        marker: { color: "rgb(242,240,247)" },
        type: "barpolar",
      },
    ];

    var layout = {
      title: "Wind Speed Distribution in Laurel, NE",
      font: { size: 16 },
      legend: { font: { size: 16 } },
      polar: {
        barmode: "overlay",
        bargap: 0,
        radialaxis: { ticksuffix: "%", angle: 45, dtick: 20 },
        angularaxis: { direction: "clockwise" },
      },
    };

    // Plotly.newPlot(this.shadowRoot.getElementById("chart"), data, layout)

 
 

    add_download_xls_button(
      this.shadowRoot,
      this_opts.xaxis.categories,
      this_opts.series[0].data,
      this_opts.yaxis[0].title
    );
  }

  toggle() {
    this._show_chart_only = !this._show_chart_only;
  }

  render() {
    return html`
      <div class="container-fluid row border-primary border-top p-1 mx-auto">
        <div
          class="row btn btn-primary d-block d-sm-none mx-auto my-1"
          @click=${this.toggle}
        >
          ${!this._show_chart_only ? "Gráfico" : "Datos"}
        </div>
        <div
          class="${this._show_chart_only
            ? "d-none d-sm-block"
            : ""} col-12 col-sm-4 my-auto"
          id="datadiv"
        >
          <div class="row">
            <h5>
              <img src="windrose-svgrepo-com.svg" width="50" height="50" />
              <span class="fw-bolder"
                >${valor(this.card, "viento_velocidad")} º</span
              >
            </h5>
          </div>
          <div class="row">
            <div class="col-4 text-warning fw-bolder">
              <div class="fw-strong">
                ${valor(this.card, "viento_velocidad_min")} º
              </div>
              <div class="fw-light">Min</div>
            </div>

            <div class="col-4 text-warning fw-bolder">
              <div class="fw-strong">
                ${valor(this.card, "viento_velocidad_mean")} º
              </div>
              <div class="fw-light">Promedio</div>
            </div>

            <div class="col-4 text-warning fw-bolder">
              <div class="fw-strong">
                ${valor(this.card, "viento_velocidad_max")} º
              </div>
              <div class="fw-light">Max</div>
            </div>
          </div>
        </div>
        <!--Spinner-->
        ${this.data
          ? ""
          : html`<div
              class="${this._show_chart_only
                ? ""
                : "d-none d-sm-block"} col-12 col-sm-8 d-flex align-items-center"
            >
              <strong>Cargando Datos...</strong>
              <div
                class="spinner-grow text-danger ms-auto"
                role="status"
                aria-hidden="true"
              ></div>
            </div>`}

        <!--Chart-->
        <div
          class="${this._show_chart_only
            ? ""
            : "d-none d-sm-block"} col-12 col-sm-8 chart"
          id="chart"
        ></div>
      </div>
    `;
  }
}

customElements.define("viento-direccion-card", VientoDireccionCard);

declare global {
  interface HTMLElementTagNameMap {
    "viento-direccion-card": VientoDireccionCard;
  }
}
