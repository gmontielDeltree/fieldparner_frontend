import { css, html, LitElement } from "lit";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";
import {
  Actividad,
  DetallesAplicacion,
  LineaDosis,
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
import "../auxiliar/combo-box-insumos";

@customElement("grid-insumos")
export class GridInsumos extends LitElement {
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
  insumos: Insumo[];

  @property()
  tipo: string;

  @property()
  categorias_iniciales: string[];

  @property()
  motivos_sugeridos_iniciales: any;

  @state()
  linea_de_dosis: LineaDosis = {
    dosis: 0,
    insumo: null,
    motivos: [],
    uuid: "nuevo",
    total: 0,
    precio_estimado: 0,
  };

  inicializar_lineas() {
    this.linea_de_dosis = {
      dosis: 0,
      insumo: null,
      motivos: [],
      uuid: "nuevo",
      total: 0,
      precio_estimado: 0,
    };
  }

  borrar(dosis: LineaDosis) {
    let dosises = this.actividad.detalles.dosis;
    let remanente = dosises.filter(
      (d) => d.uuid !== dosis.uuid
    ) as LineaDosis[];
    this.actividad.detalles.dosis = remanente;
    this.requestUpdate();
  }

  expanded_items() {
    if(this.motivos_sugeridos_iniciales){
      this.linea_de_dosis.motivos = this.motivos_sugeridos_iniciales
    }
    if ((this.actividad.detalles as DetallesAplicacion).dosis.length === 0) {
      return [this.linea_de_dosis];
    } else {
      return [
        this.linea_de_dosis,
        ...(this.actividad.detalles as DetallesAplicacion).dosis,
      ];
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
        ${columnBodyRenderer<LineaDosis>((item) => {
          console.log("render item", item);
          return item.uuid === "nuevo"
            ? html`
                <combo-box-insumos
                  id="combo-insumo"
                  .insumos=${this.insumos}
                  .categorias_iniciales=${this.categorias_iniciales}
                  .linea_de_dosis=${item}
                  .selectedItem=${this.linea_de_dosis.insumo}
                  @selected-item-changed=${(e) => {
                    this.linea_de_dosis.insumo = e.detail.value;
                    this.linea_de_dosis.dosis = this.linea_de_dosis.insumo.dosis_sugerida;
                    this.linea_de_dosis.precio_estimado =
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
        }, this.actividad.detalles.dosis)}
      ></vaadin-grid-column>

      <vaadin-grid-column auto-width></vaadin-grid-column>

      <vaadin-grid-column
        header=${translate("dosificacion")}
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaDosis>((item) => {
          return html` <vaadin-number-field
            style="width:10em"
            autoselect
            class=${item.uuid === "nuevo" ? "high-rating" : ""}
            value=${item.dosis}
            @change=${(e) => (item.dosis = +e.target.value)}
            .min=${item.insumo?.dosis_min ?? -Infinity}
            .max=${item.insumo?.dosis_max ?? Infinity}
            helper-text=${item.uuid === "nuevo" && item.insumo
            ?
            "min: "+ (item.insumo?.dosis_min ?? "NA") +",max: " + (item.insumo?.dosis_max ?? "NA") : ""}
            @input=${(e) => {
              item.dosis = +e.target.value;
              console.log("DOSAGE",item.insumo.dosis_sugerida)
              item.total = truncar(
                item.dosis * this.actividad.detalles.hectareas
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
        ${columnBodyRenderer<LineaDosis>(
          (item) => html` <vaadin-number-field
            style="width:10em"
            autoselect
            value=${item.total}
            class=${item.uuid === "nuevo" ? "high-rating" : ""}
            @change=${(e) => (item.total = +e.target.value)}
            @input=${(e) => {
              item.total = +e.target.value;
              item.dosis = truncar(
                item.total / this.actividad.detalles.hectareas
              );
              this.requestUpdate();
            }}
          >
            <div slot="suffix">${abrv(item.insumo?.unidad) || ""}</div>
          </vaadin-number-field>`,
          []
        )}
      ></vaadin-grid-column>

      ${(this.tipo === "aplicacion")
        ? html`
            <vaadin-grid-column
              header="Motivos"
              auto-width
              flex-grow="0"
              resizable
              ${columnBodyRenderer<LineaDosis>(
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
        ${columnBodyRenderer<LineaDosis>(
          (item) => html`
            <vaadin-number-field
            autoselect
              value="${item.precio_estimado}"
              style="width:10em;"
              class=${item.uuid === "nuevo" ? "high-rating" : ""}
              @change=${(e) => (item.precio_estimado = +e.target.value)}
            >
              <div slot="suffix">
                ${item.insumo?.unidad ? "USD/" + abrv(item.insumo.unidad) : ""}
              </div>
            </vaadin-number-field>
          `,
          []
        )}
      ></vaadin-grid-column>

      <vaadin-grid-column auto-width> </vaadin-grid-column>

      <vaadin-grid-column
        frozen-to-end
        auto-width
        flex-grow="0"
        resizable
        ${columnBodyRenderer<LineaDosis>(
          (item) =>
            item.uuid === "nuevo"
              ? html`
                  <vaadin-button
                    class=${item.uuid === "nuevo" ? "high-rating" : ""}
                    @click=${() => {
                      if (this.linea_de_dosis.insumo === null) {
                        alert(get("debe_ingresar_un_insumo"));
                        return;
                      }
                      if (this.linea_de_dosis.dosis < this.linea_de_dosis.insumo.dosis_min) {
                        alert(get("la dosis debe estar entre min y max"));
                        return;
                      }
                      if (this.linea_de_dosis.dosis > this.linea_de_dosis.insumo.dosis_max) {
                        alert(get("la dosis debe estar entre min y max"));
                        return;
                      }
                      let nuevo = deepcopy(this.linea_de_dosis) as LineaDosis;
                      nuevo.uuid = uuid4();
                      this.actividad.detalles.dosis.push(nuevo);
                      this.actividad.detalles.dosis = deepcopy(
                        this.actividad.detalles.dosis
                      );
                      this.inicializar_lineas();
                      this.shadowRoot.querySelector("#combo-insumo").clear();
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
                    @click=${() => this.borrar(item as LineaDosis)}
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
