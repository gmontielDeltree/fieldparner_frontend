import {
  unsafeCSS,
  CSSResultGroup,
  html,
  LitElement,
  PropertyValueMap,
} from "lit";
import { customElement, property } from "lit/decorators.js";

import "@vaadin/button";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import "../map-picker/map-picker";
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import { add_download_xls_button } from "../../src/components/Sensors/excel_boton";
import ApexCharts from "apexcharts";
import { createRef, ref } from "lit/directives/ref.js";

import gridcss from "flexboxgrid2/flexboxgrid2.css?inline";
import { PriceQuote } from "./precios-types";
import subYears from "date-fns/subYears";

@customElement("chart-precio")
export class ChartPrecio extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(apex_css),
    unsafeCSS(gridcss),
  ];

  @property()
  data: PriceQuote[] = [];

  @property()
  title: string;

  private chart: ApexCharts;
  chartRef = createRef();

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.log("ChartRef", this.chartRef);
    if (this.shadowRoot?.getElementById("chart")) {
      this.renderCentralChart();
    }
  }
  // Ocurre cuando ya se renderizo
  override updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ) {
    if (_changedProperties.has("data")) {
      this.updateChart(this.data);
    }
  }

  async renderCentralChart() {
    await this.updateComplete;

    let chart_el = this.shadowRoot?.getElementById("chart");
    if (chart_el) {
      chart_el.textContent = "";
    }

    var options = {
      series: [
        {
          data: this.data,
        },
      ],
      chart: {
        id: "area-datetime",
        type: "area",
        height: "100%",
        zoom: {
          autoScaleYaxis: true,
        },
        animations: {
          enabled: false,
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
        min: subYears(new Date().getTime(), 1).getTime(),
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
          decimalsInFloat: 2,
          title: {
            text: this.title ?? "Price",
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
      //   this.shadowRoot.querySelector("#chart"),
      chart_el,
      options
    );
    await this.chart.render();
  }

  updateChart(data: PriceQuote[]) {
    if (this.chart === undefined) {
      return;
    }

    this.chart.updateSeries([
      {
        name: "Price",
        data: data,
      },
    ]);

    this.chart.zoomX(
      subYears(new Date().getTime(), 1).getTime(),
      new Date().getTime()
    );

    add_download_xls_button(this.shadowRoot, [], data, "Precios");
  }

  render() {
    return html`
      <vaadin-vertical-layout theme="spacing" style="width:100%">
        <div
          id="chart"
          style="width:100%; height:25vh;"
          ${ref(this.chartRef)}
        ></div>
      </vaadin-vertical-layout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chart-precio": ChartPrecio;
  }
}
