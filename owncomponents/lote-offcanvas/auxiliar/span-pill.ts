import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/combo-box";
import { comboBoxRenderer } from "@vaadin/combo-box/lit.js";
import type { ComboBoxLitRenderer } from "@vaadin/combo-box/lit.js";
import type { ComboBoxFilterChangedEvent } from "@vaadin/combo-box";
import { Insumo } from "../../insumos/insumos-types";
import { LineaDosis } from "../../depositos/depositos-types";
import { translate } from "lit-translate";
import { badge } from "@vaadin/vaadin-lumo-styles/badge";
import { map } from "lit/directives/map.js";

@customElement("span-pill")
export class SpanPill extends LitElement {

  static override styles = [badge,css`
  .pill {
    font-size: 10px;
    font-family: "Readex Pro", sans-serif;
    padding: 0.5em 1em;
    margin: 0.25em;
    border-radius: 1em;
    border: none;
    outline: none;
    background: #dddddd;
    cursor: pointer;
  }
  
  .pill:not(.pill--selected):hover {
    background: #cccccc;
  }
  
  .pill--selected {
    background: var(--bg-color);
    color: #ffffff;
  }`];

  render() {
    return html`
        <span class='pill pill--selected'>
            <slot></slot>
        </span>
    `;
  }


}

declare global {
    interface HTMLElementTagNameMap {
      "span-pill": SpanPill;
    }
  }