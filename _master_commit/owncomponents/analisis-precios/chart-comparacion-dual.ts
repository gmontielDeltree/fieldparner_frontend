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
import startOfYear from "date-fns/startOfYear";
import subYears from "date-fns/subYears";

@customElement("chart-comparacion-dual")
export class ChartComparacionDual extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(apex_css),
    unsafeCSS(gridcss),
  ];

  @property()
  data_1: PriceQuote[] = [];

  @property()
  data_2: PriceQuote[] = [];

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
    if (_changedProperties.has("data_1") || _changedProperties.has("data_2")) {
      this.updateChart(this.data_1, this.data_2);
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
          name: "A",
          data: this.data_1,
        },
        {
          name: "B",
          data: this.data_2,
        },
      ],
      chart: {
        id: "area-datetime",
        type: "line",
        height: 200,
        animations: {
          enabled: false,
        },
        zoom: {
          autoScaleYaxis: true,
        },
      },
      colors: ["#77B6EA", "#545454"],
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
        style: "hollow",
      },
      xaxis: {
        type: "datetime",
        min: startOfYear(new Date().getTime()).getTime(),
        tickAmount: 6,
        categories: [],
        labels: {
          format: "dd MMM",
        },
      },
      tooltip: {
        x: {
          format: "dd MMM",
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
      stroke: {
        width: 3,
      },
      title: {
        text: "Precio en Rosario y Chicago",
        align: "left",
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          fontFamily: undefined,
          color: "#263238",
        },
      },
    };

    this.chart = new ApexCharts(
      //   this.shadowRoot.querySelector("#chart"),
      chart_el,
      options
    );
    await this.chart.render();
  }

  updateChart(data_1: PriceQuote[], data_2: PriceQuote[]) {
    if (this.chart === undefined) {
      return;
    }

    this.chart.updateSeries([
      {
        name: "A",
        data: data_1,
      },
      {
        name: "B",
        data: data_2,
      },
    ]);

    this.chart.zoomX(
      startOfYear(new Date().getTime()).getTime(),
      new Date().getTime()
    );

    add_download_xls_button(this.shadowRoot, [], data_1, "Precios");
  }

  render() {
    return html`
      <vaadin-vertical-layout theme="spacing" style="width:100%">
        <div
          id="chart"
          style="width:100%; height:100%;"
          ${ref(this.chartRef)}
        ></div>
      </vaadin-vertical-layout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chart-comparacion-dual": ChartComparacionDual;
  }
}
