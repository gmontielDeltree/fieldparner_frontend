import { Router } from "@vaadin/router";
import { RouterLocation } from "@vaadin/router";
import {
  unsafeCSS,
  CSSResultGroup,
  html,
  LitElement,
  PropertyValueMap,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { get, translate } from "lit-translate";
import { showNotification } from "../helpers/notificaciones";
import { Route, RouteWithRedirect } from "@vaadin/router";
import "../map-picker/map-picker";
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import { add_download_xls_button } from "../sensores/excel_boton";
import ApexCharts from "apexcharts";
import { createRef, ref } from "lit/directives/ref.js";

import { Task, TaskStatus } from "@lit-labs/task";

@customElement("analisis-precios")
export class AnalisisPrecios extends LitElement {
  static override styles: CSSResultGroup = [unsafeCSS(apex_css)];
  @property()
  opened: boolean = true;

  @property()
  mercado: any;

  @property()
  selected_product: any;

  @state()
  valido: boolean = false;

  private _loadTask = new Task(
    this,
    () => this.load_data(),
    () => []
  );

  private mercados: any[] = [
    { nombre: "Cámara Arbitral de Rosario", value: "car" },
  ];
  private products: any[] = [
    { nombre: "Soja (pesos)", value: "soja" },
    { nombre: "Trigo (pesos)", value: "trigo" },
    { nombre: "Maiz (pesos)", value: "maiz" },
    { nombre: "Girasol (pesos)", value: "girasol" },
    { nombre: "Sorgo (pesos)", value: "sorgo" },
  ];
  private chart: ApexCharts;

  chartRef = createRef();

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("location")) {
    }
  }

  // Ocurre cuando ya se renderizo
  override updated(changedProps) {
    console.log("ChartRef", this.chartRef);
    if (this.shadowRoot.getElementById("chart")) {
      this.renderCentralChart();
    }
  }

  async renderCentralChart() {
    await this.updateComplete;
    this.shadowRoot.getElementById("chart").textContent = "";

    var options = {
      series: [
        {
          data: [
            //[1327359600000,30.95]
          ],
        },
      ],
      chart: {
        id: "area-datetime",
        type: "area",
        height: 350,
        zoom: {
          autoScaleYaxis: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
        style: "hollow",
      },
      xaxis: {
        type: "datetime",
        min: new Date("01 Mar 2012").getTime(),
        tickAmount: 6,
        categories: [],
      },
      tooltip: {
        x: {
          format: "dd MMM yyyy",
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100],
        },
      },
      yaxis: [
        {
          title: {
            text: "Price",
          },
          tooltip: {
            enabled: true,
          },
        },
      ],
      noData: {
        text: "Loading...",
      },
    };

    this.chart = new ApexCharts(
      this.shadowRoot.querySelector("#chart"),
      options
    );
    this.chart.render();

    // Agregar boton de descarga Excel
    add_download_xls_button(
      this.shadowRoot,
      options.xaxis.categories,
      options.series[0].data,
      options.yaxis[0].title
    );
  }

  updateChart(data) {
    this.chart.updateSeries([
      {
        name: "Price",
        data: data,
      },
    ]);
  }

  load_data() {
    fetch('/prices/car/soja/precios.csv').then((result)=>{
      console.log(result.body);
      return result.body
    }).then((b)=>{
      console.log("B",b)
    })
  }

  render() {
    return html`
      <modal-generico .modalOpened=${this.opened} backurl="/">
        <div slot="title">${translate("precios")}</div>
        <div slot="body">
          <vaadin-vertical-layout theme="spacing">
            <vaadin-horizontal-layout theme="spacing">
              <vaadin-combo-box
                style="width:20em"
                .label=${get("mercado")}
                .items=${this.mercados}
                .selectedItem=${this.mercados[0]}
                .itemLabelPath=${"nombre"}
                @selected-item-changed=${(e) => {
                  this.mercado = e.detail.value;
                  this.load_data();
                }}
              >
              </vaadin-combo-box>
              <vaadin-combo-box
                .label=${get("productos")}
                .items=${this.products}
                .itemLabelPath=${"nombre"}
                @selected-item-changed=${(e) => {
                  this.selected_product = e.detail.value;
                  this.load_data();
                }}
              >
              </vaadin-combo-box>
            </vaadin-horizontal-layout>
            <div
              id="chart"
              style="width:100%; height:400px;"
              ${ref(this.chartRef)}
            ></div>
          </vaadin-vertical-layout>
          ${this._loadTask.render({
            pending: () => html`${translate("cargando")}`,
            complete: (vehiculos) => html``,
          })}
          <slot></slot>
        </div>
      </modal-generico>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "analisis-precios": AnalisisPrecios;
  }
}
