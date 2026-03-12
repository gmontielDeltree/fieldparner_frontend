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
import endOfYear from "date-fns/endOfYear";
import startOfYear from "date-fns/startOfYear";
import getYear from "date-fns/getYear";
import subYears from "date-fns/subYears";
import { PriceQuote } from "./precios-types";

const filter_by_year = (
  data: [number, number][],
  y: number,
  add_1_year: boolean = false
) => {
  let start = startOfYear(new Date(y, 8, 2, 11, 55, 0)).getTime();
  let end = endOfYear(new Date(y, 8, 2, 11, 55, 0)).getTime();
  let filtered = data.filter(
    (p: [number, number]) => p[0] < end && p[0] > start
  );

  let to_return = add_1_year
    ? filtered.map((m) => [m[0] + 1000 * 60 * 60 * 24 * 365, m[1]])
    : filtered;
  return to_return;
};

@customElement("char-comparacion-interanual")
export class ChartComparacionInteranual extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(apex_css),
    unsafeCSS(gridcss),
  ];

  @property()
  data: PriceQuote[] = [];

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
          name: "This Year",
          data: filter_by_year(this.data, getYear(new Date())),
        },
        {
          name: "Prev Year",
          data: filter_by_year(this.data, getYear(new Date()) - 1, true),
        },
      ],
      chart: {
        id: "area-datetime",
        type: "area",
        height: "100%",
        // height: 200,
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
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100],
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
      title: {
        text: "Año actual y anterior",
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

  updateChart(data: PriceQuote[]) {
    if (this.chart === undefined) {
      return;
    }

    this.chart.updateSeries([
      {
        name: "This Year",
        data: filter_by_year(this.data, getYear(new Date())),
      },
      {
        name: "Prev Year",
        data: filter_by_year(this.data, getYear(new Date()) - 1, true),
      },
    ]);

    this.chart.zoomX(
      startOfYear(new Date().getTime()).getTime(),
      new Date().getTime()
    );

    add_download_xls_button(this.shadowRoot, [], data, "Precios");
  }

  render() {
    return html`
      <vaadin-vertical-layout theme="spacing" style="width:100%">
        <div
          id="chart"
          style="width:100%; height:30vh;"
          ${ref(this.chartRef)}
        ></div>
      </vaadin-vertical-layout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chart-comparacion-interanual": ChartComparacionInteranual;
  }
}
