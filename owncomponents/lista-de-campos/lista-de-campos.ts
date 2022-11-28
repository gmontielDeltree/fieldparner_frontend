import { LitElement, html, css, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import Offcanvas from "bootstrap/js/dist/offcanvas.js";
import area from "@turf/area";
import uuid4 from "uuid4";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import centroid from "@turf/centroid";
import { LngLatLike, Map } from "mapbox-gl";
import { Router } from "@vaadin/router";
import {StateController} from '@lit-app/state'
import gbl_state from '../state.js'

import { translate } from "lit-translate";
import bbox from "@turf/bbox";

export class ListaDeCampos extends LitElement {
 // @property()
 // map: Map;

  //@property()
  //campos: any;

  @state({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  _detallesOffcanvas: Offcanvas;

  static styles = unsafeCSS(bootstrap);

  bindState = new StateController(this, gbl_state)

  constructor() {
    super();
    // console.log("EJECUTANDO COMPONENTE")
  }

  firstUpdated() {
    this._detallesOffcanvas = new Offcanvas(
      this.shadowRoot.getElementById("lista-de-campos-oc")
    );

    this.shadowRoot
      .getElementById("lista-de-campos-oc")
      .addEventListener("hidden.bs.offcanvas", () => {
        this._detallesOffcanvas.dispose();
        Router.go("/");
      });

   // let e = new CustomEvent("dame-map-db", { bubbles: true });
   // this.dispatchEvent(e);
    this._detallesOffcanvas.show();
  }

  show() {
    console.log("DETALLE", gbl_state.campos);
    this._detallesOffcanvas.show();
  }

  ir_a(feature) {
    gbl_state.map.fitBounds(bbox(feature),{padding: {top: 66, bottom:5, left: 0, right: 0}});
    // gbl_state.map.flyTo({
    //   center: centroid(feature).geometry.coordinates as LngLatLike,
    //   zoom: 15,
    // });
    this._detallesOffcanvas.hide();
  }

  render() {
    const item = (name, hectareas, lotes, geojson) => {
      return html`<a
        href="#"
        @click=${() => {
          this.ir_a(geojson);
        }}
        class="list-group-item list-group-item-action"
        aria-current="true"
      >
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${name}</h5>
          <small class="small">${hectareas} has</small>
        </div>
        <p class="mb-1">${lotes} Lotes</p>
        <small></small>
      </a>`;
    };

    let offcanvas_html = html`<div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="lista-de-campos-oc"
      aria-labelledby="offcanvasLabel"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasLabel">${translate("ldcampos.titulo")}</h5>
        <button
          type="button"
          @click=${() => {
            this._detallesOffcanvas.hide();
          }}
          class="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <div class="list-group">
          ${gbl_state.campos?.rows.map((campo) =>
            item(
              campo.doc.nombre,
              campo.doc.campo_geojson.properties.hectareas,
              campo.doc.lotes.length,
              campo.doc.campo_geojson
            )
          )}
        </div>
      </div>
    </div>`;

    return html` ${offcanvas_html} `;
  }
}

customElements.define("lista-de-campos", ListaDeCampos);
