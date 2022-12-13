import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import "@vaadin/grid";
import type {
  GridDataProviderCallback,
  GridDataProviderParams,
} from "@vaadin/grid";
import "@vaadin/grid/vaadin-grid-tree-column.js";
import "@vaadin/grid/vaadin-grid-selection-column.js";
import "@vaadin/horizontal-layout";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";

@customElement("repetir-aplicacion-selector")
export class RepetirAplicacionSelector extends LitElement {
  @property()
  campos: any[] = [];

  @state()
  private dialogOpened = true;

  @state({
    hasChanged: (o, v) => false,
  })
  lotes_selected : any [] = []

  todos_los_lotes() {
    let lineas = [];
    this.campos.forEach((element) => {
      let lotes = element.lotes;
      let nombres = lotes.map((lote) => {
        return {
          campo: element.nombre,
          lote: lote.properties.nombre,
          lote_uuid: lote.id,
          hectareas: lote.properties.hectareas
        };
      });
      lineas = [...lineas, ...nombres];
    });
    return lineas;
  }

  close() {}

  siguiente() {
    let ce = new CustomEvent("repetir-siguiente", {
      detail:this.lotes_selected,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ce);
  }

  render() {
    return html`
      <vaadin-dialog
        theme="no-padding"
        header-title="Seleccion Lotes"
        .opened="${this.dialogOpened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) =>
          (this.dialogOpened = e.detail.value)}"
        ${dialogRenderer(
          () => html`
            <vaadin-grid
              @selected-items-changed=${(e) => {
                this.lotes_selected = e.target.selectedItems
              }}
              .items="${this.todos_los_lotes()}"
              style="width: 500px; max-width: 100%;"
            >
              <vaadin-grid-selection-column></vaadin-grid-selection-column>
              <vaadin-grid-column
                header="Name"
                ${columnBodyRenderer<any>(
                  (item) => html`${item.campo} - ${item.lote}`,
                  []
                )}
              ></vaadin-grid-column>
            </vaadin-grid>
          `,
          this.todos_los_lotes()
        )}
        ${dialogFooterRenderer(
          () => html`
            <vaadin-button theme="primary" @click="${this.siguiente}"
              >Siguiente</vaadin-button
            >
          `,
          []
        )}
      ></vaadin-dialog>
    `;
  }
}
