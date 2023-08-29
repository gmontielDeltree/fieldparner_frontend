import { LitElement, PropertyValueMap, html, css } from "lit";

import { property, customElement, query } from "lit/decorators.js";
// import { Chart } from "chart.js";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

@customElement("indices-charts")
export class IndicesCharts extends LitElement {
  @property()
  data: any;

  private thr1;
  private thr2;
  private thr3;
  private full;

  makeGaugeChart(id) {
    const chart = new Chart(this.shadowRoot.getElementById(id), {
      type: "doughnut",
      data: {
        labels: ["Red", "Yellow"],
        datasets: [
          {
            label: "My First Dataset",
            data: [300, 50],
            backgroundColor: [
              "rgb(255, 99, 132)",
              "rgb(255, 205, 86)",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: { rotation: -90, circumference: 180, plugins: {
	legend: {
		maxHeight:30
	},
	title: {
	  display: true,
	  text: "Custom Chart Title",
	},
      }, },
    });

    return chart;
  }

  makeFullChart(id) {
    const chart = new Chart(this.shadowRoot.getElementById(id), {
      type: "doughnut",
      data: {
        labels: ["Red", "Blue", "Yellow"],
        datasets: [
          {
            label: "My First Dataset",
            data: [300, 50, 100],
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
		display:false
          },
          title: {
            display: true,
            text: "Custom Chart Title",
          },
        },
      },
    });
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.thr1 = this.makeGaugeChart("thr1");
    this.thr2 = this.makeGaugeChart("thr2");
    this.thr3 = this.makeGaugeChart("thr3");
    this.full = this.makeFullChart("full");
  }

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
