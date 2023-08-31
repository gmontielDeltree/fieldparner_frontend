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


const make_data_from_range = (data : IndicesResponse, indice:IndiceEspectral, rango_n:number, hectareas : number)=>{

// [Pixeles del bin, resto]
let d = [data.stats.histogram[0][rango_n], data.stats.valid_pixels-data.stats.histogram[0][rango_n]]

if((hectareas) && (hectareas !==0)){
  d = d.map((p)=> parseFloat( (p/data.stats.valid_pixels * hectareas/10000).toFixed(2) ))
}

return {
            label: "has",
            data: d,
            backgroundColor: ["rgb(255, 99, 132)", "rgb(255, 205, 86)"],
            hoverOffset: 4,
          }
}

@customElement("indices-charts")
export class IndicesCharts extends LitElement {
  @property()
  data: IndicesResponse;

  @property()
  indice: IndiceEspectral;

  @property()
  hectareas_del_lote: number;

  private thr1: Chart;
  private thr2: Chart;
  private thr3: Chart;
  private full: Chart;

  @state()
  initialized: boolean = false;

  /* Muestra rango y resto */
  makeGaugeChart(id:string,title : string,data:any) {
    const chart = new Chart(this.shadowRoot.getElementById(id), {
      type: "doughnut",
      data: {
        labels: [title, "Resto"],
        datasets: [
         data
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
            data: this.data.stats.histogram[0].map(this.to_hectareas) ,
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


 to_hectareas = (g : number) => parseFloat( (g / this.data.stats.valid_pixels * this.hectareas_del_lote / 10000).toFixed(2) )


  willUpdate(prop) {
    if (prop.has("data")) {
      if (!this.initialized) {
        this.thr1 = this.makeGaugeChart("thr1",this.indice.thresholds_labels[0],make_data_from_range(this.data,this.indice,0,this.hectareas_del_lote));
        this.thr2 = this.makeGaugeChart("thr2",this.indice.thresholds_labels[1],make_data_from_range(this.data,this.indice,1,this.hectareas_del_lote));
        this.thr3 = this.makeGaugeChart("thr3",this.indice.thresholds_labels[2],make_data_from_range(this.data,this.indice,2,this.hectareas_del_lote));
        this.full = this.makeFullChart("full");
        this.initialized = true
      }



      this.full.data.datasets[0].data = this.data.stats.histogram[0].map(this.to_hectareas);
      this.full.update();


      this.thr1.data.datasets[0] = make_data_from_range(this.data,this.indice,0,this.hectareas_del_lote);
      this.thr1.update();
    }
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
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
        <canvas id="thr1"></canvas>
        <canvas id="thr2"></canvas>
        <canvas id="thr3"></canvas>
        <canvas id="full"></canvas>
      </div>
    `;
  }
}
