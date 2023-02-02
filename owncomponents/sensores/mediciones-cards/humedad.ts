import { DailyTelemetryCard } from "../sensores-types";
import { LitElement, html, unsafeCSS, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { valor } from "../sensores";
const {default:ApexCharts} = await import("apexcharts")
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import { touchEvent } from "../../helpers";
import { forEach } from "jszip";
import { add_download_xls_button } from "../excel_boton";

export class HumedadCard extends LitElement {
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
        type: "area",
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
    this_opts.series[0].data = [...nt.humedad];
    this_opts.series[0].name = "Humedad";
    this_opts.title.text = "Humedad";
    this_opts.yaxis[0].title = "Humedad";
    const chart_1 = new ApexCharts(
      this.shadowRoot.getElementById("chart"),
      this_opts
    );
    chart_1.render();

    // Agregar boton de descarga Excel
    add_download_xls_button(this.shadowRoot,this_opts.xaxis.categories, this_opts.series[0].data, this_opts.yaxis[0].title);

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
              <img src="/water-droplet-icon.svg" width="50" height="50" />
              <span class="fw-bolder">${valor(this.card, "humedad")} %</span>
            </h5>
          </div>
          <div class="row">
            <div class="col-4 fw-bolder">
              <div class="fw-strong">${valor(this.card, "humedad_min")} %</div>
              <div class="fw-light">Min</div>
            </div>

            <div class="col-4 fw-bolder">
              <div class="fw-strong">${valor(this.card, "humedad_mean")} %</div>
              <div class="fw-light">Promedio</div>
            </div>

            <div class="col-4 fw-bolder">
              <div class="fw-strong">${valor(this.card, "humedad_max")} %</div>
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

customElements.define("humedad-card", HumedadCard);

declare global {
  interface HTMLElementTagNameMap {
    "humedad-card": HumedadCard;
  }
}
