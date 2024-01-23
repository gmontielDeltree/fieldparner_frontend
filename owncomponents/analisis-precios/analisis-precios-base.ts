import {
  unsafeCSS,
  CSSResultGroup,
  html,
  LitElement,
  PropertyValueMap,
} from "lit";
import { customElement, state } from "lit/decorators.js";

import "@vaadin/combo-box";
import "@vaadin/vertical-layout";
import { get, translate } from "lit-translate";
import "../map-picker/map-picker";
import apex_css from "apexcharts/dist/apexcharts.css?inline";

import gridcss from "flexboxgrid2/flexboxgrid2.css?inline";
import "./chart-precio";
import "./chart-comparacion-dual";
import "./chart-comparacion-interanual";
import "./chart-precio-dolares-ar";
import "./tabla-precios";
import { nav_back } from "../state";
import { fetch_precios, price_tickers } from "./precios-functions";
import "../modal-generico/modal-generico";
import { css } from "lit-element";

const solo_exchange = (tickers, ex) => {
  return tickers.filter((t) => t.exchange === ex);
};

@customElement("analisis-precios")
export class AnalisisPrecios extends LitElement {
  static override styles = [
    unsafeCSS(apex_css),
    unsafeCSS(gridcss),
    css`
      vaadin-tabsheet::part(content) {
       overflow: hidden;
      }
    `,
  ];

  @state()
  selected_ticker_1 = price_tickers[0];

  @state()
  selected_ticker_2 = price_tickers[5];

  @state()
  data_1 = [];

  @state()
  data_2 = [];

  @state()
  ars = [];

  @state()
  brl = [];

  @state()
  pyg = [];

  selected_item_1_changed = (e) => {
    this.selected_ticker_1 = e.detail.value;
    this.selected_ticker_2 = price_tickers.find(
      (r) => r.value == e.detail.value.cbot_eq
    );
    fetch_precios(e.detail.value.value).then((data) => (this.data_1 = data));
  };

  selected_item_2_changed = (e) => {
    fetch_precios(e.detail.value.value).then((data) => (this.data_2 = data));
  };

  load_currencies() {
    fetch_precios("arsusd").then((data) => (this.ars = data));
    fetch_precios("brlusd").then((data) => (this.brl = data));
    fetch_precios("pygusd").then((data) => (this.pyg = data));
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.load_currencies();
  }

  render() {
    return html`
      <div class="container" style="width: 100%;">
        <vaadin-tabsheet style="overflow:unset;">
            <vaadin-tabs slot="tabs">
              <vaadin-tab id="dashboard-tab">Precios</vaadin-tab>
              <vaadin-tab id="payment-tab">Monedas</vaadin-tab>  
              <vaadin-button style="margin-left:auto" @click=${()=>{
                this.dispatchEvent(new CustomEvent('onClose', {bubbles:true,composed:true}))
              }}>X</vaadin-button>
            </vaadin-tabs>
          
     

          <div tab="dashboard-tab">
            <div class="row" style="margin:3px;">
              <div class="col-xs-4">
                <vaadin-combo-box
                  class="row"
                  style="width:100%"
                  placeholder=${get("seleccione_un_producto")}
                  .label=${get("Precios Rosario")}
                  .items=${solo_exchange(price_tickers, "rosario")}
                  .selectedItem=${this.selected_ticker_1}
                  .itemLabelPath=${"nombre"}
                  .helper-text=${get("seleccione_un_item_para_mostrar")}
                  @selected-item-changed=${this.selected_item_1_changed}
                >
                </vaadin-combo-box>
                <chart-precio class="row" .data=${this.data_1}></chart-precio>
              </div>
              <div class="col-xs-4">
                <tabla-precios .data=${this.data_1}></tabla-precios>
              </div>
              <div class="col-xs-4">
                <char-comparacion-interanual
                  .data=${this.data_1}
                ></char-comparacion-interanual>
              </div>
            </div>
            <div class="row" style="margin:3px;">
              <div class="col-xs-4">
                <vaadin-combo-box
                  class="row"
                  style="width:100%"
                  placeholder=${get("seleccione_un_producto")}
                  .label=${get("Precios Chicago")}
                  .items=${solo_exchange(price_tickers, "cbot")}
                  .selectedItem=${this.selected_ticker_2}
                  .itemLabelPath=${"nombre"}
                  .helper-text=${get("seleccione_un_item_para_mostrar")}
                  @selected-item-changed=${this.selected_item_2_changed}
                >
                </vaadin-combo-box>
                <chart-precio class="row" .data=${this.data_2}></chart-precio>
              </div>
              <div class="col-xs-4">
                <tabla-precios .data=${this.data_2}></tabla-precios>
              </div>
              <div class="col-xs-4">
                <char-comparacion-interanual
                  .data=${this.data_2}
                ></char-comparacion-interanual>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12">
                <chart-comparacion-dual
                  .data_1=${this.data_1}
                  .data_2=${this.data_2}
                ></chart-comparacion-dual>
              </div>
            </div>
          </div>
          <div tab="payment-tab">
            <div class="row">
              <div class="col-xs-12">
                ${this.ars.length > 0 &&
                this.brl.length > 0 &&
                this.pyg.length > 0
                  ? html`
                      <chart-precio-dolares-ar
                        class="row"
                        .data=${this.ars}
                        title="ARS/USD Oficial"
                      ></chart-precio-dolares-ar>
                      <chart-precio-dolares-ar
                        class="row"
                        .data=${this.brl}
                        title="Real/USD"
                        color="#00FF00"
                      ></chart-precio-dolares-ar>
                      <chart-precio-dolares-ar
                        class="row"
                        .data=${this.pyg}
                        title="Guaraní/USD"
                        color="#FF0088"
                      ></chart-precio-dolares-ar>
                    `
                  : null}
              </div>
            </div>
          </div>
        </vaadin-tabsheet>
      </div>
    `;
  }
}

// declare global {
//   interface HTMLElementTagNameMap {
//     "analisis-precios": AnalisisPrecios;
//   }
// }
