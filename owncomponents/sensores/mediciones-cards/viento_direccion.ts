import { LitElement, html, unsafeCSS, render, CSSResultGroup, css } from "lit";
import { property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { DailyTelemetryCard } from "../sensores-types";
import { valor } from "../sensores";
import ApexCharts from "apexcharts";
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import "../rosad3";
import { add_download_xls_button } from "../excel_boton";
import { forEach } from "jszip";

let puntos_cardinales = [
  "    N",
  "    NNE",
  "    NE",
  "    ENE",
  "    E",
  "    ESE",
  "    SE",
  "    SSE",
  "    S",
  "    SSW",
  "    SW",
  "    WSW",
  "    W",
  "    WNW",
  "    NW",
  "    NNW",
];

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

  /* Resultado del proceso */
  let result = [];

  /* Nombre de las columnas */
  let columns = ["angle"];

  for (let i = 1; i < rangos_dir.length; i++) {
    let limite_dir_inf = rangos_dir[i - 1];
    let limite_dir_sup = rangos_dir[i];

    //console.log("RANGO VEL", limite_inf, limite_sup);
    // Velocidades en el rango
    let bin_direccion = muestras.filter((d) => {
      return d.dir > limite_dir_inf && d.dir < limite_dir_sup;
    });

    //result[i-1] = [];

    let total_eje_vel = 0;
    let fila = {};
    fila["angle"] = puntos_cardinales[i - 1];

    for (let z = 1; z < rangos_vel.length; z++) {
      let limite_vel_inf = rangos_vel[z - 1];
      let limite_vel_sup = rangos_vel[z];

      let bin_vel = bin_direccion.filter((d) => {
        return d.vel > limite_vel_inf && d.vel < limite_vel_sup;
      });

      // console.log(limite_dir_inf, limite_dir_sup, bin2);
      let fraccion = (bin_vel.length / l_total) * 100;
      total_eje_vel += fraccion;
      fila["" + limite_vel_inf + "-" + limite_vel_sup] = fraccion;

      // Incluir el nombre de la columna si no esta incluida ya
      if (!columns.includes("" + limite_vel_inf + "-" + limite_vel_sup)) {
        columns.push("" + limite_vel_inf + "-" + limite_vel_sup);
      }
    }

    fila["total"] = total_eje_vel;
    result.push(fila);
  }

  result.unit = "km/h";
  result.columns = columns;
  return result;
};


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

  @state()
  _matriz_de_vientos: any;

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
    //this.shadowRoot.getElementById("chart").textContent = "";
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
    
    // const chart_1 = new ApexCharts(
    //   this.shadowRoot.getElementById("chart"),
    //   this_opts
    // );
    //chart_1.render();

    let matriz = matriz_de_vientos(nt.ts, nt.direccion, nt.velocidad);
    console.log("MATRIX", matriz);
    this._matriz_de_vientos = matriz;

    // add_download_xls_button(
    //   this.shadowRoot,
    //   this_opts.xaxis.categories,
    //   this_opts.series[0].data,
    //   this_opts.yaxis[0].title
    // );
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
                >${valor(this.card, "direccion")} º</span
              >
            </h5>
          </div>
          <div class="row">
            <div class="col-4 fw-bolder">
              <div class="fw-strong">
                ${valor(this.card, "viento_direccion_min")} º
              </div>
              <div class="fw-light">Min</div>
            </div>

            <div class="col-4 fw-bolder">
              <div class="fw-strong">
                ${valor(this.card, "viento_direccion_mean")} º
              </div>
              <div class="fw-light">Promedio</div>
            </div>

            <div class="col-4 fw-bolder">
              <div class="fw-strong">
                ${valor(this.card, "viento_direccion_max")} º
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
        >
        ${this._matriz_de_vientos
            ? html`<rosa-de-vientos class='mx-auto' .data=${this._matriz_de_vientos} />`
            : null}
      </div>



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
