import { LitElement, PropertyValueMap, css, html } from "lit";

import { customElement, property, state } from "lit/decorators.js";
// import { Chart } from "chart.js";
import { Chart, registerables } from "chart.js";
import { IndiceEspectral, IndicesResponse } from "./indices-types";
import * as d3 from 'd3';
Chart.register(...registerables);

const ranges_to_bin_names = (ranges: number[]) => {
  let a = ranges.slice(0, -1);
  let b = ranges.slice(1);

  let bin_names = a.map((v, i) => "" + v + "-" + b[i]);
  return bin_names;
};

const make_data_from_range = (
  data: IndicesResponse,
  indice: IndiceEspectral,
  rango_n: number,
  hectareas: number
) => {
  // [Pixeles del bin, resto]
  let d = [
    data.stats.histogram[0][rango_n],
    data.stats.valid_pixels - data.stats.histogram[0][rango_n],
  ];

  if (hectareas && hectareas !== 0) {
    d = d.map((p) =>
      parseFloat(
        (((p / data.stats.valid_pixels) * hectareas) / 10000).toFixed(2)
      )
    );
  }

  return {
    label: "has",
    data: d,
    backgroundColor: [indice.colormap_fn(data.stats.histogram[1][rango_n+1]), "#e0e0d100"],
    hoverOffset: 4,
  };
};

@customElement("indices-charts")
export class IndicesCharts extends LitElement {
  @property()
  data: IndicesResponse;

  @property()
  indice: IndiceEspectral;

  @property()
  hectareas_del_lote: number;

  @property()
  date: string;

  private thr: Chart[] = [];
  private full: Chart;

  @state()
  initialized: boolean = false;

  /* Muestra rango y resto */
  makeGaugeChart(id: string, title: string, data: any) {

    let html_el = this.shadowRoot.getElementById(id)

    const chart = new Chart(html_el, {
      type: "doughnut",
      data: {
        labels: [title, "Resto"],
        datasets: [data],
      },
      options: {
        rotation: -90,
        circumference: 180,
        plugins: {
          legend: {
            maxHeight: 30,
          },
          title: {
            display: true,
            text: title,
          },
        },
      },
    });

    return chart;
  }

  makeFullChart(id) {
    const chart = new Chart(this.shadowRoot.getElementById(id), {
      type: "doughnut",
      data: {
        labels: this.indice.thresholds_labels,
        datasets: [
          {
            label: "Has.:",
            data: this.data.stats.histogram[0].map(this.to_hectareas),
            backgroundColor: [
              "rgb(255, 99, 132)",
              "rgb(54, 162, 235)",
              "rgb(255, 205, 86)",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        cutout: "50%",
        title: "full",
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Total",
          },
        },
      },
    });
    return chart;
  }

  to_hectareas = (g: number) =>
    parseFloat(
      (
        ((g / this.data.stats.valid_pixels) * this.hectareas_del_lote) /
        10000
      ).toFixed(2)
    );

  willUpdate(prop) {
    if(prop.has("indice")){
      this.initialized = false
    }
    if (prop.has("data")) {
      if (!this.initialized) {

        this.thr.forEach((c)=>c.destroy())
        this.thr = []

        this.indice.thresholds_labels.forEach((label, i) => {
          this.thr.push(
            this.makeGaugeChart(
              "thr-" + label,
              label,
              make_data_from_range(
                this.data,
                this.indice,
                i,
                this.hectareas_del_lote
              )
            )
          );
        });

        if(this.full !== undefined){
          this.full.destroy()
        }
        this.full = this.makeFullChart("full");
        this.initialized = true;
      }

      /* Updates */
      {
        this.full.data.datasets[0].data = this.data.stats.histogram[0].map(
          this.to_hectareas
        );
        this.full.update();

        this.thr.forEach((chart, i) => {
          chart.data.datasets[0] = make_data_from_range(
            this.data,
            this.indice,
            i,
            this.hectareas_del_lote
          );
          chart.update()
        });
      }
    }
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {}

  static override styles = css`
    :host {
      position: absolute;
      width: 10rem;
      background-color: lightseagreen;
      border-radius: 1rem;
      padding: 1rem;
      z-index: 12;
    }
  `;

  render() {
    return html`
      <div class="container">
        <div>${this.date}</div>
        ${this.indice.thresholds_labels.map((label)=>{
          return html`<canvas id="thr-${label}"></canvas>`
        
        })}
        <canvas id="full"></canvas>
      </div>
    `;
  }
}
