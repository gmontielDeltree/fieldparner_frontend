import { LitElement, html, css, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import Offcanvas from "bootstrap/js/dist/offcanvas.js";
import area from "@turf/area";
import uuid4 from "uuid4";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import centroid from "@turf/centroid";
import { LngLatLike, Map } from "mapbox-gl";
import { Router } from "@vaadin/router";
import { StateController } from "@lit-app/state";
import gbl_state from "../state.js";

import { translate } from "lit-translate";
import bbox from "@turf/bbox";
import { MagrisReporte } from "./magris-types";
import { Task, TaskStatus } from "@lit-labs/task";
import { base_url } from "../helpers.js";
import PouchDB from "pouchdb";
import { format, isBefore, parseISO } from "date-fns";

export class MagrisExtension extends LitElement {
  // @property()
  // map: Map;

  //@property()
  //campos: any;

  @state()
  reportes: MagrisReporte[];

  db: PouchDB.Database = new PouchDB(base_url + "tolva");

  private _loadTask = new Task(
    this,
    async () => {
      let docs = await this.db.allDocs();
      let repos = docs.rows as unknown as MagrisReporte[];
      repos.sort((a, b) => (isBefore(parseISO(a.ts), parseISO(b.ts)) ? -1 : 1));
      this.reportes = repos;
      console.log(this.reportes);
    },
    () => []
  );

  private _detallesOffcanvas: Offcanvas;

  static styles = [
    unsafeCSS(bootstrap),
    css`
      .list-group > div:nth-of-type(1) {
        border: 1px solid;
        border-color: red;
        position: relative;
      }

      label {
        position: absolute;
        top: -6px;
        z-index: 1;
        left: 2em;
        background-color: #da1717;
        padding: 0 5px;
      }
    `,
  ];

  bindState = new StateController(this, gbl_state);

  firstUpdated() {
    this._detallesOffcanvas = new Offcanvas(
      this.shadowRoot.getElementById("lista-de-campos-oc")
    );

    this.shadowRoot
      .getElementById("lista-de-campos-oc")
      .addEventListener("hidden.bs.offcanvas", () => {
        this._detallesOffcanvas.dispose();
      });

    this._detallesOffcanvas.show();
  }

  show() {
    this._detallesOffcanvas.show();
  }

  render() {
    const item = (reporte: MagrisReporte, i: number) => {
      let id_equipo = +reporte.id.split(":")[1];
      let start_ts = +reporte.id.split(":")[2] * 1000;
      let end_ts = +reporte.id.split(":")[3] * 1000;

      return html`<div
        class="btn btn-secondary"
        @click=${() => Router.go("/magris/" + reporte.id)}
        style="margin:1rem; padding:1rem"
      >
        ${i === 0 ? html`<label>Último Subido</label>` : null} Equipo
        ${id_equipo} - Desde ${format(new Date(start_ts), "dd-MM-yy HH:mm:ss")}
        - Hasta ${format(new Date(end_ts), "dd-MM-yy HH:mm:ss")}
      </div>`;
    };

    let offcanvas_html = html`<div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="lista-de-campos-oc"
      aria-labelledby="offcanvasLabel"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasLabel">Logs</h5>
        <button
          type="button"
          @click=${() => {
            this._detallesOffcanvas.hide();
            Router.go("/");
          }}
          class="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <div class="list-group">
          ${this._loadTask.render({
            pending: () => html`${translate("cargando")}`,
            complete: (_) => html`${this.reportes.map(item)} `,
          })}
        </div>
      </div>
    </div>`;

    return html` ${offcanvas_html} `;
  }
}

customElements.define("magris-extension", MagrisExtension);
