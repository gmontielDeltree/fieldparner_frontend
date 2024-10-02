import { DailyTelemetryCard } from "../sensores-types";
import { LitElement, html, unsafeCSS, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
let ApexCharts;
import("apexcharts").then(({ default: a }) => {
  ApexCharts = a;
});
import apex_css from "apexcharts/dist/apexcharts.css?inline";
import "../chart-component";

let variable = "punto_de_rocio";
let titulo = "P. Rocio";
let unidad = "°C";
let icono = "/dew-svgrepo-com.svg";
let component_name = "punto-de-rocio-card";

export class PuntoDeRocioCard extends LitElement {
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
      let serie: number[] = [];
      let humedad = this.data.humedad;
      let temperatura = this.data.temperatura;

      // 13.12 + 0.6215 T -11.37 V ^0.16 + 0.3965 T V ^0,16
      temperatura.forEach((t, i) => {
        let h = humedad[i];
        let pc = ((h / 100) ** (1 / 8)) * (112 + 0.9 * t) + 0.1 * t - 112;
        serie.push(+pc.toFixed(1));
      });

      this.data[variable] = serie;

      // Serie podria ser filtrado por fecha
      this._min = +Math.min(...serie).toFixed(1);
      this._max = +Math.max(...serie).toFixed(1);
      this._avg = +(serie.reduce((a, b) => a + b, 0) / serie.length).toFixed(1);
      this._last_value = +serie[serie.length - 1].toFixed(1);

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
          class="${this._show_chart_only
            ? "d-none"
            : "col-11 col-sm-11 my-auto"} "
          id="datadiv"
        >
          <div class="row">
            <h5>
              <img src=${icono} width="50" height="50" />
              <span class="fw-bolder"
                >${titulo} ${this._last_value} ${unidad}</span
              >
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
            ? "col-11 col-sm-11"
            : "d-none"} chart"
        >
          <chart-component
            .variable_name=${variable}
            .data=${this.data}
            .show_chart_only=${this._show_chart_only}
          ></chart-component>
        </div>
        <div
          class="col-1 my-1"
          style="display:flex; align-items: center;"
          @click=${this.toggle}
        >
        <span class="btn btn-warning mx-auto">
          ${!this._show_chart_only ? ">" : "<"}
          </span>
        </div>
      </div>
    `;
  }
}

customElements.define(component_name, PuntoDeRocioCard);

declare global {
  interface HTMLElementTagNameMap {
    "punto-de-rocio-card": PuntoDeRocioCard;
  }
}
