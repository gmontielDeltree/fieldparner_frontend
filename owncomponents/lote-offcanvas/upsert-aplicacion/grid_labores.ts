import { css, html, LitElement } from "lit";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";
import {
  Actividad,
  DetallesAplicacion,
  LineaDosis,
  LineaLabor,
} from "../../depositos/depositos-types";
import { motivos_items } from "../../jsons/motivos_items";
import uuid4 from "uuid4";
import { deepcopy } from "../../helpers";
import { get, translate } from "lit-translate";
import { customElement, property, state } from "lit/decorators.js";
import { Insumo } from "../../insumos/insumos-types";
import "@vaadin/grid";
import "@vaadin/grid/vaadin-grid-tree-column.js";
import "@vaadin/grid/vaadin-grid-selection-column.js";
import "@vaadin/horizontal-layout";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/vaadin-lumo-styles/vaadin-iconset.js";
import "@vaadin/tooltip";
import "@vaadin/date-picker";
import "@vaadin/number-field";
import "@vaadin/multi-select-combo-box";
import "@vaadin/text-area";
import "@vaadin/form-layout";
import "@vaadin/form-layout/vaadin-form-item";
import { Grid, GridColumn, GridItemModel } from "@vaadin/grid";
import { ComboBox } from "@vaadin/combo-box";

@customElement("grid-labores")
export class GridLabores extends LitElement {
  static override styles = css`
    .high-rating {
      background-color: #b1ffb7;
    }

    .low-rating {
      background-color: #ffd9d9;
    }

    .font-weight-bold {
      font-weight: bold;
    }
  `;

  @property()
  actividad: Actividad;

  @property()
  labores: Labor[];

  @state()
  linea_de_labor: LineaLabor = {
    labor: null,
    uuid: "nuevo",
    costo: 0,
    observacion: "",
  };

  inicializar_lineas() {
    this.linea_de_labor = {
      labor: null,
      uuid: "nuevo",
      costo: 0,
      observacion: "",
    };
  }

  borrar(dosis: LineaLabor) {
    let dosises = this.actividad.detalles.costo_labor;
    let remanente = dosises.filter(
      (d) => d.uuid !== dosis.uuid
    ) as LineaLabor[];
    this.actividad.detalles.costo_labor = remanente;
    this.requestUpdate();
  }

  expanded_items() {
    if (this.actividad.detalles.costo_labor.length === 0) {
      return [this.linea_de_labor];
    } else {
      return [this.linea_de_labor, ...this.actividad.detalles.costo_labor];
    }
  }

  render() {
    return html`<vaadin-grid
      id="da-grid"
      .items=${this.expanded_items()}
      style="align-self: center;"
      all-rows-visible
      theme="compact row-stripes"
    >
      <vaadin-grid-column
        header="${translate("labor")}"
        frozen
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaLabor>((item) => {
          console.log("render item", item);
          return item.uuid === "nuevo"
            ? html`
                <vaadin-combo-box
                  id="combo-box"
                  item-label-path="labor"
                  item-value-path="uuid"
                  class=${item.uuid === "nuevo" ? "high-rating" : ""}
                  style="width:20em"
                  placeholder="${translate("seleccione_labor")}"
                  .items=${this.labores}
                  .selected-item=${this.linea_de_labor.labor}
                  @selected-item-changed=${(e) => {
                    this.linea_de_labor.labor = e.detail.value;
                  }}
                ></vaadin-combo-box>
              `
            : html`<vaadin-vertical-layout
                style="line-height: var(--lumo-line-height-s);"
              >
                <span>${item.labor.labor}</span>
              </vaadin-vertical-layout>`;
        }, this.actividad.detalles.dosis)}
      ></vaadin-grid-column>

      <vaadin-grid-column
        header="Costo"
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaLabor>(
          (item) => html`
            <vaadin-number-field
              value="${item.costo}"
              style="width:10em;"
              theme="align-right"
              class=${item.uuid === "nuevo" ? "high-rating" : ""}
              @change=${(e) => (item.costo = +e.target.value)}
            >
              <div slot="prefix">USD</div>
            </vaadin-number-field>
          `,
          []
        )}
      ></vaadin-grid-column>

      <vaadin-grid-column
        header="${translate("comentario")}"
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaLabor>((item) => {
          return html` <vaadin-text-field
            style="width:20em"
            class=${item.uuid === "nuevo" ? "high-rating" : ""}
            value=${item.observacion}
            @input=${(e) => {
              item.observacion = "" + e.target.value;
              this.requestUpdate();
            }}
          />`;
        }, [])}
      ></vaadin-grid-column>

      <vaadin-grid-column
        frozen-to-end
        auto-width
        resizable
        ${columnBodyRenderer<LineaLabor>(
          (item) =>
            item.uuid === "nuevo"
              ? html`
                  <vaadin-button
                    class=${item.uuid === "nuevo" ? "high-rating" : ""}
                    @click=${() => {
                      if (
                        this.linea_de_labor.labor === null ||
                        this.linea_de_labor.labor.labor === ""
                      ) {
                        alert(get("debe_ingresar_una_labor"));
                        return;
                      }
                      let nuevo = deepcopy(this.linea_de_labor) as LineaLabor;
                      nuevo.uuid = uuid4();
                      this.actividad.detalles.costo_labor.push(nuevo);
                      this.actividad.detalles.costo_labor = deepcopy(
                        this.actividad.detalles.costo_labor
                      );
                      this.inicializar_lineas();
                      (
                        this.shadowRoot.querySelector("#combo-box") as ComboBox
                      ).clear();
                      this.requestUpdate();
                      (
                        this.shadowRoot.getElementById("da-grid") as Grid
                      ).recalculateColumnWidths();
                    }}
                    theme="icon"
                    aria-label="agregar item"
                  >
                    <vaadin-icon icon="lumo:plus"></vaadin-icon>
                    <vaadin-tooltip
                      slot="tooltip"
                      text="Agregar"
                    ></vaadin-tooltip>
                  </vaadin-button>
                `
              : html`
                  <vaadin-button
                    @click=${() => this.borrar(item as LineaLabor)}
                    theme="icon"
                    aria-label="borrar item"
                  >
                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                    <vaadin-tooltip
                      slot="tooltip"
                      text="Borrar"
                    ></vaadin-tooltip>
                  </vaadin-button>
                `,
          []
        )}
      ></vaadin-grid-column>
    </vaadin-grid>`;
  }
}

function truncar(x) {
  return +x.toPrecision(4);
}
