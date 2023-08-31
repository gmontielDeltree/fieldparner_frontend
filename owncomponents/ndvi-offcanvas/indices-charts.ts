import { LitElement, PropertyValueMap, css, html } from "lit";

import { customElement, property, state } from "lit/decorators.js";
// import { Chart } from "chart.js";
import { Chart, registerables } from "chart.js";
import { IndiceEspectral, IndicesResponse } from "./indices-types";
Chart.register(...registerables);

const ranges_to_bin_names = (ranges : number[])=>{
 
  let a = ranges.slice(0,-1)
  let b = ranges.slice(1);

  let bin_names = a.map((v,i)=>"" + v + "-" + b[i] )
  return bin_names
}

@customElement("indices-charts")
export class IndicesCharts extends LitElement {
  @property()
  data: IndicesResponse;

  @property()
  indice: IndiceEspectral;

  private thr1: Chart;
  private thr2: Chart;
  private thr3: Chart;
  private full: Chart;

  @state()
  initialized: boolean = false;

  makeGaugeChart(id) {
    const chart = new Chart(this.shadowRoot.getElementById(id), {
      type: "doughnut",
      data: {
        labels: ["Red", "Yellow"],
        datasets: [
          {
            label: "My First Dataset",
            data: [300, 50],
            backgroundColor: ["rgb(255, 99, 132)", "rgb(255, 205, 86)"],
            hoverOffset: 4,
          },
        ],
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
            text: "Custom Chart Title",
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
            label: "Proporcion",
            data: this.data.stats.histogram[0] ,
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
            text: "Custom Chart Title",
          },
        },
      },
    });
    return chart;
  }

  willUpdate(prop) {
    if (prop.has("data")) {
      if (!this.initialized) {
        this.thr1 = this.makeGaugeChart("thr1");
        this.thr2 = this.makeGaugeChart("thr2");
        this.thr3 = this.makeGaugeChart("thr3");
        this.full = this.makeFullChart("full");
        this.initialized = true
      }

      this.full.data.datasets[0].data = this.data.stats.histogram[0];
      
      this.full.update();
    }
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {}

  static override styles = css`
    :host {
      position: absolute;
      width: 10rem;
      background-color: white;
      border-radius: 1rem;
      padding: 1rem;
      z-index: 12;
    }
  `;

  render() {
    return html`
      <div class="container">
        <canvas id="thr1"></canvas>
        <canvas id="thr2"></canvas>
        <canvas id="thr3"></canvas>
        <canvas id="full"></canvas>
      </div>
    `;
  }
}
