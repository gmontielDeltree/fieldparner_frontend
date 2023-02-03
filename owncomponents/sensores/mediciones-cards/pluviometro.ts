import { LitElement, PropertyValueMap } from "lit";
import { customElement } from "lit/decorators.js";

import { DailyTelemetryCard } from "../sensores-types";
import { LitElement, html, unsafeCSS, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { valor } from "../sensores";
let ApexCharts;
import('apexcharts').then(({default:a})=>{
  ApexCharts=a
})
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import { base_url } from "../../helpers";
import { add_download_xls_button } from "../excel_boton";

import PouchDB from "pouchdb";

import { Task, TaskStatus } from "@lit-labs/task";

const tipos_periodos = [
  { nombre: "Anual", value: "anual" },
  { nombre: "Mensual", value: "mensual" },
  { nombre: "Diario", value: "diario" },
  { nombre: "Todo el Tiempo", value: "alltime" },
];

const lista_meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const lista_dias_por_mes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const lista_anos = [
  2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033,
];

@customElement("pluviometro-card")
export class PluviometroCard extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(bootstrap),
    unsafeCSS(apex_css),
  ];

  @property()
  deveui: string;

  @state()
  data: any;

  @state()
  _show_chart_only: boolean = false;

  @state()
  _periodo: string = "2022";

  @state()
  _tipo_periodo: { nombre: string; value: string } = tipos_periodos[0];

  @state()
  selectedYear: number;

  @state()
  selectedMonth: string;

  @state()
  selectedDay: number;

  private _loadDataTask = new Task(
    this,
    async ([deveui, periodo, tipos_periodo]) => {
      let db = new PouchDB(base_url + "processed_device_telemetry");
      let results = await db.get(deveui + ":pluviometro:anual:2022");
      console.log("LOAD DATA TASK", results);
      return results;
    },
    () => [this.deveui, this._periodo, this._tipo_periodo]
  );

  async renderCentralChart() {
    await this.updateComplete;
    this.shadowRoot.getElementById("chart").textContent = "";

    let categorias;
    let titulo;

    if (this._tipo_periodo.value === "anual") {
      categorias = ["Enero", "Febrero", "Marzo"];
      titulo = "Precipitacion por hora";
    } else if (this._tipo_periodo.value === "mensual") {
      categorias = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      ];
      titulo = "Precipitacion por dia";
    } else if (this._tipo_periodo.value === "diario") {
      categorias = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24,
      ];
      titulo = "Precipitacion por hora";
    }

    let data = [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2];

    var options = {
      series: [
        {
          name: "Precipitación",
          data: data,
        },
      ],
      chart: {
        height: 350,
        type: "bar",
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          dataLabels: {
            position: "top", // top, center, bottom
          },
        },
      },
      colors: ['#00E396'],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val + "mm";
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"],
        },
      },

      xaxis: {
        categories: categorias,
        position: "top",
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: "gradient",
            gradient: {
              colorFrom: "#f25d00",//"#D8E3F0",
              colorTo: "#BED1E6",
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val) {
            return val + "%";
          },
        },
      },
      title: {
        text: titulo,
        floating: true,
        offsetY: 330,
        align: "center",
        style: {
          color: "#444",
        },
      },
    };

    const chart_1 = new ApexCharts(
      this.shadowRoot.getElementById("chart"),
      options
    );
    chart_1.render();

    // Agregar boton de descarga Excel
    add_download_xls_button(
      this.shadowRoot,
      options.xaxis.categories,
      options.series[0].data,
      options.yaxis[0].title
    );
  }

  toggle() {
    this._show_chart_only = !this._show_chart_only;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {}

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.log("WILLUPDATE", _changedProperties, this._loadDataTask.status);
    if (this._loadDataTask.status === TaskStatus.COMPLETE) {
      this.renderCentralChart();
    }
  }

  render() {
    return html`
      <div
        class="container-fluid row border-primary border-top p-1 mx-auto"
        id="contenedor"
      >
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
              <img src="/rain-svgrepo-com.svg" width="50" height="50" />
              Hoy 4 mm
            </h5>
          </div>
          <div class="row">
            <div class="col-4 fw-bolder">
              <div class="fw-strong">5 mm</div>
              <div class="fw-light">Este mes</div>
            </div>

            <div class="col-4 fw-bolder">
              <div class="fw-strong">152 mm</div>
              <div class="fw-light">Este año</div>
            </div>
          </div>
        </div>
        <!--Spinner-->
        ${this._loadDataTask.status === TaskStatus.COMPLETE
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
        >
          <div class="toolbar bg-light">
            <vaadin-combo-box
              id="tipo-periodo-combo"
              label="Periodo"
              item-label-path="nombre"
              item-value-path="value"
              .selectedItem=${this._tipo_periodo}
              .items="${tipos_periodos}"
              @selected-item-changed=${(e) => {
                this._tipo_periodo = e.detail.value;
              }}
            ></vaadin-combo-box>

            <vaadin-combo-box
              label="Año"
              style="width: 6em;"
              .items="${lista_anos}"
              .selectedItem="${this.selectedYear}"
              @selected-item-changed="${(e) =>
                (this.selectedYear = e.detail.value)}"
            ></vaadin-combo-box>
            <vaadin-combo-box
              label="Mes"
              style="width: 9em;"
              .items="${lista_meses}"
              .selectedItem="${this.selectedMonth}"
              .disabled="${!this.selectedYear}"
              @selected-item-changed="${(e) =>
                (this.selectedMonth = e.detail.value)}"
            ></vaadin-combo-box>
            <vaadin-combo-box
              label="Dia"
              style="width: 5em;"
              .items="${lista_dias_por_mes}"
              .selectedItem="${this.selectedDay}"
              .disabled="${!this.selectedYear || !this.selectedMonth}"
              @selected-item-changed="${(e) =>
                (this.selectedDay = e.detail.value)}"
            ></vaadin-combo-box>
          </div>

          <div id="chart"></div>
        </div>
      </div>
    `;
  }
}
