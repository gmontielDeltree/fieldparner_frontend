
import { LitElement, html, unsafeCSS, render, CSSResultGroup, css } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/vertical-layout";
import "@vaadin/custom-field";
import "@vaadin/grid";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { GridItemModel } from "@vaadin/grid";
import "../contratistas/contratista-crud";
import "@vaadin/icons";
import { Map, Marker } from "mapbox-gl";
import { Devices, extract_tele } from "./sensores";
import { touchEvent } from "../helpers.js";
import devices_modelos from "./devices_modelos.ts";
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import format from 'date-fns/format'

export class SensorHumedadSueloClass extends LitElement {
  static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  @property()
  map: Map;

  @state({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
  _offcanvas: Offcanvas;

  @state()
  _selected_device: any = undefined;

  @state()
  _selected_details: any = {};

  @state()
  _devices: Devices = new Devices();

  override async firstUpdated() {
    this._offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas")
    );
  }

  
  render(){
 // Hay algo seleccionado
    return html`
      <div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvas"
        aria-labelledby="offcanvasLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasLabel">
            ${this._selected_device ? this._selected_details.nombre : null}
          </h5>
          <h6 class="offcanvas-title" id="offcanvasLabel">
            ${this._selected_device ? this._selected_details.tipo : null}
          </h6>

          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            @click=${() => this._offcanvas.hide()}
          ></button>
        </div>
        <div class="offcanvas-body">
     

        </div>
      </div>
      `

  }

}
customElements.define("sensor-humedad-suelo-oc", SensorHumedadSueloClass);