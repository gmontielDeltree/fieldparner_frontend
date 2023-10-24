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
    { nombre: "Cámara Arbitral de Rosario", value: "car" }
  ];
  private products: any[] = [
    { nombre: "Rosario - Soja (pesos)", value: "soja" },
    { nombre: "Rosario - Trigo (pesos)", value: "trigo" },
    { nombre: "Rosario - Maiz (pesos)", value: "maiz" },
    { nombre: "Rosario - Girasol (pesos)", value: "girasol" },
    { nombre: "Rosario - Sorgo (pesos)", value: "sorgo" },
    { nombre: "Chicago (CBOT) - Soja Front Month (usd)", value: "chicago_soybeans" },
    { nombre: "Chicago (CBOT) - Trigo Front Month (usd)", value: "chicago_wheat" },
    { nombre: "Chicago (CBOT) - Maiz Front Month (usd)", value: "chicago_corn" },
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
  }

  updateChart(data) {
    
    this.chart.updateSeries([
      {
        name: "Price",
        data: data,
      },
    ]);
    this.chart.zoomX(
      new Date("3 Dec 2022").getTime(),
      new Date().getTime()
    );

    add_download_xls_button(
      this.shadowRoot,
      [],
      data,
      "Precios"
    );
  }

  load_data(sp) {
    fetch("/prices/car/" + sp.value + "/precio.json")
      .then((result) => {
        console.log(result.body);
        return result.json();
      })
      .then((b) => {
        console.log("B", b);
        this.updateChart(b);
        // Agregar boton de descarga Excel

      });
  }

  render() {
    return html`
      <modal-generico .modalOpened=${this.opened} backurl="/">
        <div slot="title">${translate("precios")}</div>
        <div slot="body">
          <vaadin-vertical-layout theme="spacing">
            <vaadin-horizontal-layout theme="spacing">
              <!-- <vaadin-combo-box
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
              </vaadin-combo-box> -->
              <vaadin-combo-box
                style='width:25em'
                placeholder=${get('seleccione_un_producto')}
                .label=${get("productos")}
                .items=${this.products}
                .itemLabelPath=${"nombre"}
                .helper-text=${get("seleccione_un_item_para_mostrar")}
                @selected-item-changed=${(e) => {
                  this.selected_product = e.detail.value;
                  this.load_data(this.selected_product);
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
