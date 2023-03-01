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

let ApexCharts;
import("apexcharts").then(({ default: a }) => {
  ApexCharts = a;
});

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

  private mercados: any[];
  private products: any[];
  private chart: ApexCharts;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("location")) {
    }
  }

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

    this.chart = new ApexCharts(document.querySelector("#chart"), options);
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
    /*
    "data": [
  {
    "x": timestamp,
    "y": value
  },
  .
  .
  {
    "x": timestamp,
    "y": value
  },
]
*/
    this.chart.updateSeries([
      {
        name: "Price",
        data: data,
      },
    ]);
  }

  render() {
    return html`
      <modal-generico .modalOpened=${this.opened} backurl="/">
        <div slot="title">${translate("precios")}</div>
        <div slot="body">
          <vaadin-vertical-layout>
            <vaadin-horizontal-layout>
              <vaadin-combo-box
                .label=${get("mercado")}
                .items=${this.mercados}
              >
              </vaadin-combo-box>
              <vaadin-combo-box
                .label=${get("productos")}
                .items=${this.products}
              >
              </vaadin-combo-box>
            </vaadin-horizontal-layout>
            <div id="chart" style="width:100%; height:400px;"></div>
          </vaadin-vertical-layout>

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
