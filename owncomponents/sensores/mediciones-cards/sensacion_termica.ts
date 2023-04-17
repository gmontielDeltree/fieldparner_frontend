import { DailyTelemetryCard } from "../sensores-types";
import { LitElement, html, unsafeCSS, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { valor } from "../sensores";
let ApexCharts;
import("apexcharts").then(({ default: a }) => {
  ApexCharts = a;
});
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import { touchEvent } from "../../helpers";
import { forEach } from "jszip";
import { add_download_xls_button } from "../excel_boton";
import "../chart-component";

let variable = "sensacion_termica";
let titulo = "S. Térmica"
let unidad = '°C'
let icono = "/heat-2-svgrepo-com.svg"
let component_name = "sensacion-termica-card"


export class SensacionTermicaCard extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(bootstrap),
    unsafeCSS(apex_css),
  ];

  @property()
  card: DailyTelemetryCard;

  @property()
  data: any;

  @state()
  _show_chart_only: boolean = false;

  private _min: number;
  private _avg: number;
  private _max: number;
  private _last_value: number;

  willUpdate(props) {
    // Esta es una propiedad derivada de la temp y la humedad
    if (props.has("data")) {


      let ts = this.data.ts;

      // Calcular la serie con los datos base
      let serie : number[] = [];

      let viento = this.data.velocidad || this.data.viento_velocidad

      // 13.12 + 0.6215 T -11.37 V ^0.16 + 0.3965 T V ^0,16
      this.data.temperatura.forEach((t,i) => {
        let v = viento[i]
        let st = 13.12 + 0.6215 * t - 11.37 * (v **(0.16)) + 0.3965 * t * (v ** 0.16)
        serie.push(+(st.toFixed(1)))
      });

      this.data[variable] = serie

      


      // Serie podria ser filtrado por fecha
      this._min =  +(Math.min(...serie).toFixed(1))
      this._max = +(Math.max(...serie).toFixed(1))
      this._avg  = +((serie.reduce((a,b) => a + b, 0) / serie.length).toFixed(1))
      this._last_value = +(serie[serie.length-1].toFixed(1))

      console.log("DATA ST", this.data);
    }
  }

  toggle() {
    this._show_chart_only = !this._show_chart_only;
  }

  render() {
    return html`
      <div class="container-fluid row border-primary border-top p-1 mx-auto">
        <div
          class="row btn btn-primary d-block d-sm-none mx-auto my-1"
          @click=${this.toggle}
        >
          ${!this._show_chart_only ? "Gráfico" : "Datos"}
        </div>
        <div
          class="${this._show_chart_only
            ? "d-none d-sm-block"
            : ""} col-12 col-sm-4 my-auto"
          id="datadiv"
        >
          <div class="row">
            <h5>
              <img src=${icono} width="50" height="50" />
              <span class="fw-bolder">${titulo} ${this._last_value} ${unidad}</span>
            </h5>
          </div>
          <div class="row">
            <div class="col-4 fw-bolder">
              <div class="fw-strong">${this._min} ${unidad}</div>
              <div class="fw-light">Min</div>
            </div>

            <div class="col-4 fw-bolder">
              <div class="fw-strong">${this._avg} ${unidad}</div>
              <div class="fw-light">Promedio</div>
            </div>

            <div class="col-4 fw-bolder">
              <div class="fw-strong">${this._max} ${unidad}</div>
              <div class="fw-light">Max</div>
            </div>
          </div>
        </div>
        <div
          class="${this._show_chart_only
            ? ""
            : "d-none d-sm-block"} col-12 col-sm-8 chart"
        >
          <chart-component
            .variable_name=${variable}
            .data=${this.data}
            .show_chart_only=${this._show_chart_only}
          ></chart-component>
        </div>
      </div>
    `;
  }
}

customElements.define(component_name, SensacionTermicaCard);

declare global {
  interface HTMLElementTagNameMap {
    "sensacion-termica-card": SensacionTermicaCard;
  }
}
