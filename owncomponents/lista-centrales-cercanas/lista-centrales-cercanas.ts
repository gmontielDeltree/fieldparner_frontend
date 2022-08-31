import { LitElement, html, unsafeCSS, render, CSSResultGroup } from "lit";
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
import Modal from "bootstrap/js/dist/modal";
import lista_de_labores from "./labores.json";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { Contratista, empty_contratista, Labor } from "./contratista-types";
import { ContratistaCrud } from "./contratista-crud";
import { GridItemModel } from "@vaadin/grid";
import "../contratistas/contratista-crud";
import "@vaadin/icons";
import "@vaadin/upload";
import "@vaadin/dialog";
import { read, writeFile, utils } from "xlsx";
import { i18n_upload } from "../i18n/vaadin";
import { Upload } from "@vaadin/upload";
import "@vaadin/menu-bar";
import { Devices } from "../sensores/sensores";

export class ListaCentralesCercanas extends LitElement {
  @state()
  _centrales: any;

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal: Modal;

  @property()
  db: PouchDB.Database;

  @property()
  posicion: number[];

  @property()
  fecha: String;

  @state()
  _daily_telemetry = [];

  @state()
  _devices : Devices = new Devices()

  static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  override firstUpdated() {
    if (this._modal === undefined) {
      this._modal = new Modal(this.shadowRoot.getElementById("modal"));
      this.shadowRoot.getElementById("modal").addEventListener('hidden.bs.modal', event => {
	// Se elimina del parent
	 let parent = this.parentElement
	  while (parent.firstChild) {
	 	parent.firstChild.remove()
	    }
      })
      this._modal.show()
    }
  }

  show() {
    // Quizas lo muestro antes del first update
    if (this._modal !== undefined) {
	this._modal.show();
    }
 

    this.get_centrales_cercanas(this.posicion, this.fecha);
  }

  async get_centrales_cercanas(posicion : number[], fecha :string) {
	// Por ahora get todas las centrales
	this._daily_telemetry = await this._devices.get_daily_cards(fecha);
	console.log("EEEEEEEEEE",this._daily_telemetry);
  }

  render() {
    return html`
      <div
        class="modal fade"
        id="modal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                Meteorología ${this.fecha}
              </h5>
            </div>
            <div class="modal-body">
              <div class="list-group">
                ${this._daily_telemetry.map((dc) => {
                  html`<a
                    href="#"
                    class="list-group-item list-group-item-action active"
                    aria-current="true"
                  >
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">kk</h5>
                      <small>3 </small>
                    </div>
                    <p class="mb-1">Some placeholder content in a paragraph.</p>
                    <small>And some small print.</small>
                  </a>`;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("centrales-cercanas-lista", ListaCentralesCercanas);

declare global {
  interface HTMLElementTagNameMap {
    "centrales-cercanas-lista": ListaCentralesCercanas;
  }
}
