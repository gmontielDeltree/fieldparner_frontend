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
import "@vaadin/grid";
import "@vaadin/vertical-layout";
import "../map-picker/map-picker";
import apex_css from "apexcharts/dist/apexcharts.css?inline";

import gridcss from "flexboxgrid2/flexboxgrid2.css?inline";
import { PriceQuote } from "./precios-types";
import format from "date-fns/format";

@customElement("tabla-precios")
export class TablaPrecios extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(apex_css),
    unsafeCSS(gridcss),
  ];

  @property()
  data: PriceQuote[] = [];

  private processed_data: { date: string; close: number; variation: number }[] =
    [];

  formatear_data = (data: PriceQuote[]) => {
    let max = data.length;
    return data.map((p, i) => {
      let prev_value = (i + 1) < max ? data[i + 1][1] : data[i][1];
      let vars = ((p[1] - prev_value) / prev_value) * 100;
      vars = +vars.toFixed(2);
      return {
        date: format(p[0], "dd-MM-yy"),
        close: p[1],
        variation: vars,
      };
    });
  };

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("data") && this.data) {
      this.processed_data = this.formatear_data(this.data.reverse());
    }
  }

  render() {
    return html`
      <vaadin-vertical-layout theme="spacing">
        <vaadin-grid .items=${this.processed_data} style="height: 33vh;" theme="compact row-stripes">
          <vaadin-grid-column header="Fecha" path="date"></vaadin-grid-column>
          <vaadin-grid-column header="Cierre" path="close"></vaadin-grid-column>
          <vaadin-grid-column
            header="Var %"
            path="variation"
          ></vaadin-grid-column>
        </vaadin-grid>
      </vaadin-vertical-layout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tabla-precios": TablaPrecios;
  }
}
