import { LitElement, PropertyValueMap } from "lit";
import { customElement } from "lit/decorators.js";

import { DailyTelemetryCard } from "../sensores-types";
import { LitElement, html, unsafeCSS, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { valor } from "../sensores";
let ApexCharts;
import("apexcharts").then(({ default: a }) => {
  ApexCharts = a;
});
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import { add_download_xls_button } from "../excel_boton";

import PouchDB from "pouchdb";

import { Task, TaskStatus } from "@lit-labs/task";
import { de } from "date-fns/locale";
import { get_pluviometro_daily_value } from "../sensores-funciones";
import {
  get_timeseries_by_name,
  get_timeseries_by_name_agregated,
} from "../sensores-funciones";

const tipos_periodos = [
  { nombre: "Anual", value: "ano" },
  { nombre: "Mensual", value: "mes" },
  { nombre: "Diaria", value: "dia" },
  { nombre: "Horaria", value: "hora" },
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

  @property()
  fecha_seleccionada: string = "20230417"; //yyyymmdd

  @state()
  data: any;

  @state()
  _show_chart_only: boolean = false;

  @state()
  _periodo: string = "2022";

  @state()
  _tipo_periodo: { nombre: string; value: string } = tipos_periodos[1];

  @state()
  selectedYear: number;

  @state()
  selectedMonth: string;

  @state()
  selectedDay: number;

  @state()
  lluvia_de_la_fecha: number = 0;

  private chart_1: ApexCharts;

  private _loadDataTask = new Task(
    this,
    async ([deveui, periodo, tipo_periodo, fecha]) => {
      this.load_data(deveui, tipo_periodo.value ?? "dia", fecha);
    },
    () => [
      this.deveui,
      this._periodo,
      this._tipo_periodo,
      this.fecha_seleccionada,
    ]
  );

  load_data = async (deveui, agregacion, fecha) => {
    console.log("Load Data", agregacion);
    let data = await get_timeseries_by_name_agregated(
      deveui,
      "pluviometro",
      Date.now() / 1000 - 3600 * 24 * 60,
      Date.now() / 1000,
      agregacion
    );
    this.chart_1.updateSeries(data);

    this.lluvia_de_la_fecha = await get_pluviometro_daily_value(deveui, fecha);
  };

  async renderCentralChart() {
    await this.updateComplete;
    this.shadowRoot.getElementById("chart").textContent = "";

    let categorias;
    let titulo;

    titulo = "Precipitacion";

    categorias = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24,
    ];

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
      colors: ["#00E396"],
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
        type: "category",
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
              colorFrom: "#f25d00", //"#D8E3F0",
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

    this.chart_1 = new ApexCharts(
      this.shadowRoot.getElementById("chart"),
      options
    );
    this.chart_1.render();

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
  ): void {
    // Render el grafico por primera vez
    this.renderCentralChart();
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.log("WILLUPDATE", _changedProperties, this._loadDataTask.status);
    if (this._loadDataTask.status === TaskStatus.COMPLETE) {
    }
  }

  render() {
    return html`
      <div
        class="container-fluid row border-primary border-top p-1 mx-auto"
        id="contenedor"
      >
        <div
          class="${this._show_chart_only
            ? "d-none "
            : "col-11 col-sm-11 my-auto"} "
          id="datadiv"
        >
          <div class="row">
            <h5>
              <img src="/rain-svgrepo-com.svg" width="50" height="50" />
              Hoy ${this.lluvia_de_la_fecha} mm.
            </h5>
          </div>
          <!-- <div class="row">
            <div class="col-4 fw-bolder">
              <div class="fw-strong">5 mm</div>
              <div class="fw-light">Este mes</div>
            </div>

            <div class="col-4 fw-bolder">
              <div class="fw-strong">152 mm</div>
              <div class="fw-light">Este año</div>
            </div>
          </div> -->
        </div>
        <!--Spinner-->
        ${this._loadDataTask.status === TaskStatus.COMPLETE
          ? ""
          : html`<div
              class="${this._show_chart_only
                ? ""
                : "d-none d-sm-block"} col-11 col-sm-11 d-flex align-items-center"
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
          class="${this._show_chart_only ? "col-11 col-sm-11" : "d-none"}  chart"
        >
          <div class="toolbar">
            <vaadin-combo-box
              id="tipo-periodo-combo"
              label="Agrupación"
              item-label-path="nombre"
              item-value-path="value"
              .selectedItem=${this._tipo_periodo}
              .items="${tipos_periodos}"
              @selected-item-changed=${(e) => {
                this._tipo_periodo = e.detail.value;
              }}
            ></vaadin-combo-box>

            <!-- <vaadin-combo-box
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
            ></vaadin-combo-box> -->
          </div>

          <div id="chart"></div>

        </div>

        <div
            class="col-1 my-1"
            style="display:flex; align-items: center;"
            @click=${this.toggle}
          >
            <span class="btn btn-warning mx-auto">
              ${!this._show_chart_only ? ">" : "<"}
            </span>
          </div>
      </div>
    `;
  }
}
