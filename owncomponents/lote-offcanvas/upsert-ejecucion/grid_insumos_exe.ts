import { css, html, LitElement } from "lit";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";
import {
  Actividad,
  Deposito,
  DetallesAplicacion,
  Ejecucion,
  LineaDosis,
  LineaDosisEjecucion,
} from "../../depositos/depositos-types";
import { motivos_items } from "../../jsons/motivos_items";
import uuid4 from "uuid4";
import { deepcopy } from "../../helpers";
import { translate } from "lit-translate";
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
import "../aux/combo-box-insumos";

@customElement("grid-insumos-exe")
export class GridInsumosExe extends LitElement {
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
  ejecucion: Ejecucion;

  @property()
  depositos: Deposito[];

  @property()
  insumos: Insumo[];

  @property()
  tipo: string;

  @property()
  categorias_iniciales: string[];

  @state()
  linea_de_dosis: LineaDosisEjecucion = {
    dosis: 0,
    insumo: null,
    motivos: [],
    uuid: "nuevo",
    total: 0,
    precio_estimado: 0,
    precio_real: 0,
    deposito_origen: null,
  };

  inicializar_lineas() {
    this.linea_de_dosis = {
      dosis: 0,
      insumo: null,
      motivos: [],
      uuid: "nuevo",
      total: 0,
      precio_real: 0,
      precio_estimado: 0,
      deposito_origen: null,
    };
  }

  borrar(dosis: LineaDosisEjecucion) {
    let dosises = this.ejecucion.detalles.dosis;
    let remanente = dosises.filter(
      (d) => d.uuid !== dosis.uuid
    ) as LineaDosisEjecucion[];
    this.ejecucion.detalles.dosis = remanente;
    this.requestUpdate();
  }

  expanded_items() {
    if (this.ejecucion.detalles.dosis.length === 0) {
      return [this.linea_de_dosis];
    } else {
      return [this.linea_de_dosis, ...this.ejecucion.detalles.dosis];
    }
  }

  render() {
    return html`<vaadin-grid
      id="da-grid"
      .items=${this.expanded_items()}
      style="align-self: center;"
      all-rows-visible
      theme="compact no-border row-stripes"
    >
      <vaadin-grid-column
        header="Nombre"
        width="18em"
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaDosisEjecucion>((item) => {
          console.log("render item", item);
          return item.uuid === "nuevo"
            ? html`
                <combo-box-insumos
                  id="combo-insumo"
                  .insumos=${this.insumos}
                  .categorias_iniciales=${this.categorias_iniciales}
                  .selectedItem=${this.linea_de_dosis.insumo}
                  @selected-item-changed=${(e) => {
                    this.linea_de_dosis.insumo = e.detail.value;
                    this.linea_de_dosis.precio_estimado =
                      this.linea_de_dosis.insumo?.precio || 0;
                    this.linea_de_dosis.precio_real =
                      this.linea_de_dosis.insumo?.precio || 0;
                    this.requestUpdate();
                  }}
                >
                </combo-box-insumos>
              `
            : html`<vaadin-vertical-layout
                style="line-height: var(--lumo-line-height-s);"
              >
                <span>${item.insumo.marca_comercial}</span>
                <span
                  style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);"
                >
                  ${item.insumo.principio_activo}
                </span>
              </vaadin-vertical-layout>`;
        }, this.ejecucion.detalles.dosis)}
      ></vaadin-grid-column>

      <!-- <vaadin-grid-column auto-width></vaadin-grid-column> -->

      <vaadin-grid-column
        header=${translate("dosificacion")}
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaDosisEjecucion>((item) => {
          return html` <vaadin-number-field
              autoselect
            style="width:10em"
            class=${item.uuid === "nuevo" ? "high-rating" : ""}
            value=${item.dosis}
            @change=${(e) => (item.dosis = +e.target.value)}
            @input=${(e) => {
              item.dosis = +e.target.value;
              item.total = truncar(
                item.dosis * this.ejecucion.detalles.hectareas
              );
              this.requestUpdate();
            }}
          >
            <div slot="suffix">${abrv(item.insumo?.unidad) || ""}/Ha</div>
          </vaadin-number-field>`;
        }, [])}
      ></vaadin-grid-column>

      <vaadin-grid-column
        header="Total"
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaDosisEjecucion>(
          (item) => html` <vaadin-number-field
              autoselect
            style="width:10em"
            value=${item.total}
            class=${item.uuid === "nuevo" ? "high-rating" : ""}
            @change=${(e) => (item.total = +e.target.value)}
            @input=${(e) => {
              item.total = +e.target.value;
              item.dosis = truncar(
                item.total / this.ejecucion.detalles.hectareas
              );
              this.requestUpdate();
            }}
          >
            <div slot="suffix">${abrv(item.insumo?.unidad) || ""}</div>
          </vaadin-number-field>`,
          []
        )}
      ></vaadin-grid-column>

      ${this.tipo === "aplicacion"
        ? html`
            <vaadin-grid-column
              header="Motivos"
              auto-width
              flex-grow="0"
              resizable
              ${columnBodyRenderer<LineaDosisEjecucion>(
                (item) => html`<vaadin-multi-select-combo-box
                  item-label-path="nombre"
                  item-id-path="id"
                  style="width:15em;"
                  class=${item.uuid === "nuevo" ? "high-rating" : ""}
                  .items=${motivos_items}
                  .selectedItems=${item.motivos}
                  @selected-items-changed=${(e) => {
                    item.motivos = e.target.selectedItems;
                  }}
                ></vaadin-multi-select-combo-box>`,
                []
              )}
            ></vaadin-grid-column>
          `
        : null}

      <vaadin-grid-column
        header="Precio"
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaDosisEjecucion>(
          (item) => html`
            <vaadin-number-field
              autoselect
              value="${item.precio_real}"
              style="width:10em;"
              class=${item.uuid === "nuevo" ? "high-rating" : ""}
              @change=${(e) => (item.precio_real = +e.target.value)}
            >
              <div slot="suffix">
                ${item.insumo?.unidad ? "USD/" + abrv(item.insumo.unidad) : ""}
              </div>
            </vaadin-number-field>
          `,
          []
        )}
      ></vaadin-grid-column>

      <vaadin-grid-column
        header="${translate("deposito")}"
        auto-width
        ${columnBodyRenderer<LineaDosisEjecucion>(
          (item) => html`
            <vaadin-combo-box
              class=${item.uuid === "nuevo" ? "high-rating" : ""}
              item-label-path="nombre"
              item-value-path="uuid"
              helper-text=""
              style="width: 100%;"
              .selectedItem=${item.deposito_origen}
              .items=${this.depositos}
              @selected-item-changed=${(e) => {
                item.deposito_origen = e.detail.value;
              }}
            ></vaadin-combo-box>
          `
        )}
      >
      </vaadin-grid-column>

      <vaadin-grid-column
        frozen-to-end
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaDosisEjecucion>(
          (item) =>
            item.uuid === "nuevo"
              ? html`
                  <vaadin-button
                    class=${item.uuid === "nuevo" ? "high-rating" : ""}
                    @click=${() => {
                      if (this.linea_de_dosis.insumo === null) {
                        alert(translate("debe_ingresar_un_insumo"));
                        return;
                      }
                      let nuevo = deepcopy(
                        this.linea_de_dosis
                      ) as LineaDosisEjecucion;
                      nuevo.uuid = uuid4();
                      this.ejecucion.detalles.dosis.push(nuevo);
                      this.ejecucion.detalles.dosis = deepcopy(
                        this.ejecucion.detalles.dosis
                      );
                      this.inicializar_lineas();
                      //this.shadowRoot.querySelector("#combo-insumo").clear();
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
                    @click=${() => this.borrar(item as LineaDosisEjecucion)}
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

declare global {
  interface HTMLElementTagNameMap {
    "grid-insumos-exe": GridInsumosExe;
  }
}

function truncar(x) {
  return +x.toPrecision(4);
}

function abrv(unidad: string) {
  if (!unidad) {
    return "";
  }

  if (unidad.length > 8) {
    return unidad.substring(0, 5) + "..";
  } else {
    return unidad;
  }
}

// <vaadin-grid
//   .items=${(
//     actividad.detalles as DetallesAplicacion
//   ).dosis}
//   style="width: 100%; max-width: 100%; align-self: center;"
//   all-rows-visible
// >
//   <vaadin-grid-column
//     header="Nombre"
//     auto-width
//     ${columnBodyRenderer<LineaDosis>((item) => {
//       console.log("render item", item);
//       return html`<vaadin-vertical-layout
//         style="line-height: var(--lumo-line-height-s);"
//       >
//         <span>${item.insumo.marca_comercial}</span>
//         <span
//           style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);"
//         >
//           ${item.insumo.principio_activo}
//         </span>
//       </vaadin-vertical-layout>`;
//     }, actividad.detalles.dosis)}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     header="Dosis (por ha.)"
//     auto-width
//     ${columnBodyRenderer<any>(
//       (item) => html` <vaadin-text-field
//         maxlength="5"
//         value=${item.dosis}
//         @change=${(e) =>
//           (item.dosis = +e.target.value)}
//       >
//         <div slot="suffix">
//           ${item.insumo.unidad}/Ha
//         </div>
//       </vaadin-text-field>`,
//       []
//     )}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     header="Total"
//     auto-width
//     ${columnBodyRenderer<LineaDosis>(
//       (item) => html` <vaadin-text-field
//         maxlength="5"
//         value=${item.total}
//         @change=${(e) =>
//           (item.total = +e.target.value)}
//       >
//         <div slot="suffix">${item.insumo.unidad}</div>
//       </vaadin-text-field>`,
//       []
//     )}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     header="Motivos"
//     auto-width
//     ${columnBodyRenderer<LineaDosis>(
//       (item) => html`<vaadin-multi-select-combo-box
//         item-label-path="nombre"
//         item-id-path="id"
//         .items=${motivos_items}
//         .selectedItems=${item.motivos}
//       ></vaadin-multi-select-combo-box>`,
//       []
//     )}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     header="Precio"
//     auto-width
//     ${columnBodyRenderer<LineaDosis>(
//       (item) => html`<vaadin-number-field
//         value="${item.precio_estimado}"
//         @change=${(e) =>
//           (item.precio_estimado = +e.target.value)}
//       >
//         <div slot="suffix">
//           ${item.insumo?.unidad
//             ? "USD/" + item.insumo.unidad
//             : ""}
//         </div></vaadin-number-field
//       >`,
//       []
//     )}
//   ></vaadin-grid-column>

//   <vaadin-grid-column
//     frozen-to-end
//     auto-width
//     flex-grow="0"
//     ${columnBodyRenderer(
//       (item) => html`
//         <vaadin-button
//           @click=${() =>
//             this.borrar(item as LineaDosis)}
//           theme="icon"
//           aria-label="borrar item"
//         >
//           <vaadin-icon
//             icon="vaadin:trash"
//           ></vaadin-icon>
//           <vaadin-tooltip
//             slot="tooltip"
//             text="Borrar"
//           ></vaadin-tooltip>
//         </vaadin-button>
//       `,
//       []
//     )}
//   ></vaadin-grid-column>
// </vaadin-grid>
