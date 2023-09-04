import { LitElement, html, render, css } from "lit";
import { property, state, customElement } from "lit/decorators.js";
import { IndiceEspectral, IndicesResponse } from "./indices-types";
import { Feature } from "@turf/helpers";
import { Task } from "@lit-labs/task";
import axios from "axios";
import { coordAll } from "@turf/meta";
import * as d3 from "d3";
import area from "@turf/area";
import "@shoelace-style/shoelace/dist/components/details/details.js";
import { r2 } from "../helpers";

function generateArray(range, n) {
  // range is an array of two numbers representing the lower and upper limits of the range
  // n is an integer number representing the length of the output array
  // check if the input is valid
  if (
    !Array.isArray(range) ||
    range.length !== 2 ||
    !Number.isInteger(n) ||
    n < 1
  ) {
    return null;
  }
  // get the min and max values from the range array
  let min = Math.min(range[0], range[1]);
  let max = Math.max(range[0], range[1]);
  // calculate the step size to get n numbers within the range
  let step = (max - min) / (n - 1);
  // use Array.from() with a map function to generate the output array
  let output = Array.from({ length: n }, (value, index) => min + index * step);
  return output;
}

const ranges_to_bin_names = (ranges: number[]) => {
  let a = ranges.slice(0, -1);
  let b = ranges.slice(1);

  let bin_names = a.map((v, i) => "" + r2(v) + "..." + r2(b[i]));
  return bin_names;
};

@customElement("indices-histograma")
export class IndicesHistograma extends LitElement {
  @property()
  indice: IndiceEspectral;

  @property()
  lote_id: string;

  /**
   * La feature/observacion seleccionada.
   */
  @property()
  feature: Feature;

  /**
   * El lote
   */
  @property()
  geojson: Feature;

  static styles = css`
    :host {
      z-index: 3;
      --colorcito: #20b2aa;
      width:15%;
    }

    .details::part(header) {
      background-color: var(--colorcito);
    }
  `;

  private fetchTask = new Task(
    this,
    async (feature) => {
      // console.log("fetchImage", evt);
      let date = this.feature.properties.date;
      // console.log("COOR", coordAll(ctx.geojson));
      let geometry = coordAll(this.geojson);
      let resource_id = this.lote_id;
      let indice = this.indice.value;

      let hist_options = JSON.stringify({
        bins: generateArray(this.indice.domain, 10),
      });
      let url =
        import.meta.env.VITE_COGS_SERVER_URL +
        `/indices/${indice}?resource_id=${resource_id}&date=${date}&hist_options=${hist_options}&geometry=${encodeURIComponent(
          JSON.stringify(geometry)
        )}`;

      return await axios.get(url);
    },
    () => [this.feature]
  );

  render() {
    return this.fetchTask.render({
      pending: () => html`pending`,
      error: () => null,
      complete: ({ data }: { data: IndicesResponse }) => {
        console.log("DATA.....", data);
        let min_d = this.indice.domain[0];
        let k_color = this.indice.domain[1] - this.indice.domain[0];
        let area_m2 = area(this.geojson);

        let range_names = ranges_to_bin_names(data.stats.histogram[1]);
        return html`
          <sl-details class="details" style="z-index:3;" summary="Histograma">
            ${data.stats.histogram[0].map((r, i) => {
              console.log("punto", r);
              let color =  this.indice.colormap_fn(
                (data.stats.histogram[1][i + 1] - min_d) / k_color
              );

              let area_has = ((r / data.stats.valid_pixels) * area_m2) / 10000;

              return html`
                <div
                  style="display:flex;justify-content: space-between; align-items:center;"
                >
                  <div style="display:flex; align-items:center;">
                    <div
                      style="background-color:${color};width:24px;height:24px;"
                    ></div>
                    <div style="margin-left:1rem">${range_names[i]}</div>
                  </div>
                  <div style="margin-left:1rem;font-weight:bold;">
                    ${r2(area_has)} has.
                  </div>
                </div>
              `;
            }).reverse()}
          </sl-details>
        `;
      },
    });
  }
}
