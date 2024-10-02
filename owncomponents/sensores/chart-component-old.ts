import { LitElement, html, unsafeCSS, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { valor } from "./sensores";
let ApexCharts;
import("apexcharts").then(({ default: a }) => {
  ApexCharts = a;
});
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import { add_download_xls_button } from "./excel_boton";

export class ChartComponent extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(bootstrap),
    unsafeCSS(apex_css),
  ];

  @property()
  variable_name: string;

  @property()
  data: any;

  @property()
  show_chart_only: boolean = false;

  private chart_1 : ApexCharts

  // Ocurre cuando ya se renderizo
  override updated(changedProps) {
    if (changedProps.has("data")) {
      console.log("RENDER CHART")

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
    this_opts.series[0].data = [...nt[this.variable_name]];
    this_opts.series[0].name = this.variable_name.toUpperCase();
    this_opts.title.text = this.variable_name.toLocaleUpperCase();
    this_opts.yaxis[0].title = this.variable_name.toLocaleUpperCase();

    this.chart_1 = new ApexCharts(
      this.shadowRoot.getElementById("chart"),
      this_opts
    );
    this.chart_1.render();

    // Agregar boton de descarga Excel
    add_download_xls_button(
      this.shadowRoot,
      this_opts.xaxis.categories,
      this_opts.series[0].data,
      this_opts.yaxis[0].title
    );
  }

  toggle() {
    this.show_chart_only = !this.show_chart_only;
  }

  render() {
    return html`
      <div class="container-fluid row p-1 mx-auto">
        <!--Spinner-->
        ${this.data
          ? ""
          : html`<div
              class="${this.show_chart_only
                ? ""
                : "d-none d-sm-block"} col-12 col-sm-12 d-flex align-items-center"
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
          class="${this.show_chart_only
            ? ""
            : "d-none d-sm-block"} col-12 col-sm-12 chart"
          id="chart"
        ></div>
      </div>
    `;
  }
}

customElements.define("chart-component", ChartComponent);

declare global {
  interface HTMLElementTagNameMap {
    "chart-component": ChartComponent;
  }
}
