import { LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "@vaadin/dialog";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit.js";
import type { DialogOpenedChangedEvent } from "@vaadin/dialog";
import "@vaadin/grid";
import "@vaadin/horizontal-layout";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/vaadin-lumo-styles/vaadin-iconset.js";
import "@vaadin/tooltip";
import "@vaadin/date-picker";
import { Notification } from "@vaadin/notification";
import { get, translate, translateUnsafeHTML } from "lit-translate";
import gbl_state from "../../state";
import { columnBodyRenderer } from "@vaadin/grid/lit.js";
import {
  Actividad,
  DetallesAplicacion,
  LineaDosis,
} from "../../depositos/depositos-types";
import { Router } from "@vaadin/router";
import { deepcopy } from "../../helpers";
import { base_i18n } from "./date-picker-i18n";
import uuid4 from "uuid4";
import { format, parse } from "date-fns";

@customElement("repetir-aplicacion-dosis")
export class RepetirAplicacionDosis extends LitElement {
  @property()
  campos: any[] = [];

  @property()
  lotes: any[] = [];

  @property()
  actividad: Actividad;

  @state()
  private dialogOpened = true;

  close() {}

  siguiente() {
    let ce = new CustomEvent("repetir-siguiente", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ce);
  }

  atras() {
    let ce = new CustomEvent("repetir-atras", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ce);
  }

  borrar(dosis: LineaDosis) {
    let dosises = (this.actividad.detalles as DetallesAplicacion).dosis;
    let remanente = dosises.filter(
      (d) => d.uuid !== dosis.uuid
    ) as LineaDosis[];
    (this.actividad.detalles as DetallesAplicacion).dosis = remanente;
    this.requestUpdate();
  }

  guardar() {
    // For each lote guardar actividad
    // con uuid cambiado
    // y lote uuid modificado
    // y hectareas
    let activity_docs = this.lotes.map((lote) => {
      let act = deepcopy(this.actividad) as Actividad;
      let nuevo_uuid = uuid4();
      let fecha_para_id = format(
        parse(act.detalles.fecha_ejecucion_tentativa, "yyyy-MM-dd", new Date()),
        "yyyyMMdd"
      );
      act.detalles.hectareas = lote.hectareas;
      act.lote_uuid = lote.lote_uuid;
      act._id = "actividad:" + fecha_para_id + ":" + nuevo_uuid;
      act.uuid = nuevo_uuid
      console.log("Guardando", lote, act);
      delete act._rev //Remover si no no graba
      return act;
    });

    console.log("ActivityDocs",activity_docs)
    gbl_state.db.bulkDocs(activity_docs)

    this.dialogOpened = false;
    this.showNotificationAgregadas();
    Router.go("/");
  }

  showNotificationAgregadas = () => {
    const notification = Notification.show(
      html`
        <vaadin-horizontal-layout theme="spacing" style="align-items: center">
          <vaadin-icon
            icon="vaadin:check-circle"
            style="color: var(--lumo-success-color)"
          ></vaadin-icon>
          <div>
            <b style="color: var(--lumo-success-text-color);"
              >${translate("repetir.notificacion.ok")}</b
            >
            <div
              style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color)"
            >
              ${translateUnsafeHTML("repetir.notificacion.okbody")}
            </div>
          </div>
          <vaadin-button
            theme="tertiary-inline"
            @click="${() => notification.close()}"
            aria-label="Close"
          >
            <vaadin-icon icon="lumo:cross"></vaadin-icon>
          </vaadin-button>
        </vaadin-horizontal-layout>
      `,
      {
        position: "top-center",
      }
    );
  };

  render() {
    return html`
      <vaadin-dialog
        theme="no-padding"
        header-title="Modificar Dosis"
        .opened="${this.dialogOpened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) =>
          (this.dialogOpened = e.detail.value)}"
        ${dialogRenderer(
          () => html`
            <vaadin-horizontal-layout
              theme="spacing padding"
              style="padding-top:0px; justify-content: space-between; align-items:center"
            >
              <span>${this.lotes.length} lotes seleccionados</span>
              <vaadin-date-picker
                label="Fecha de Ejecución"
                value="2022-12-03"
                placeholder="YYYY-MM-DD"
                style="padding-top:0px;"
                .i18n=${base_i18n}
                .value=${this.actividad.detalles.fecha_ejecucion_tentativa}
                @change=${(e) =>
                  (this.actividad.detalles.fecha_ejecucion_tentativa =
                    e.target.value)}
              ></vaadin-date-picker>
            </vaadin-horizontal-layout>

            <vaadin-grid
              .items=${(this.actividad.detalles as DetallesAplicacion).dosis}
              style="width: 600px; max-width: 100%;"
            >
              <vaadin-grid-column
                header="Nombre"
                auto-width
                ${columnBodyRenderer<any>(
                  (item) =>
                    html` <vaadin-vertical-layout
                      style="line-height: var(--lumo-line-height-s);"
                    >
                      <span>${item.insumo.marca_comercial}</span>
                      <span
                        style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);"
                      >
                        ${item.insumo.principio_activo}
                      </span>
                    </vaadin-vertical-layout>`,
                  []
                )}
              ></vaadin-grid-column>

              <vaadin-grid-column
                header="Dosis (por ha.)"
                auto-width
                ${columnBodyRenderer<any>(
                  (item) => html` <vaadin-text-field
                    maxlength="5"
                    value=${item.dosis}
                    @change=${(e) => (item.dosis = +e.target.value)}
                  >
                    <div slot="suffix">${item.insumo.unidad}</div>
                  </vaadin-text-field>`,
                  []
                )}
              ></vaadin-grid-column>
              <vaadin-grid-column
                frozen-to-end
                auto-width
                flex-grow="0"
                ${columnBodyRenderer(
                  (item) => html`
                    <vaadin-button
                      @click=${() => this.borrar(item as LineaDosis)}
                      theme="icon"
                      aria-label="borrar item"
                    >
                      <vaadin-icon icon="lumo:minus"></vaadin-icon>
                      <vaadin-tooltip
                        slot="tooltip"
                        text="Borrar"
                      ></vaadin-tooltip>
                    </vaadin-button>
                  `,
                  []
                )}
              ></vaadin-grid-column>
            </vaadin-grid>
          `,
          (this.actividad.detalles as DetallesAplicacion).dosis
        )}
        ${dialogFooterRenderer(
          () => html`
            <vaadin-button theme="primary" @click="${this.atras}"
              >Atras</vaadin-button
            >
            <vaadin-button theme="primary" @click="${this.guardar}"
              >Guardar</vaadin-button
            >
          `,
          []
        )}
      ></vaadin-dialog>
    `;
  }
}
