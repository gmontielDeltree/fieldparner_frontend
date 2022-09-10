import Modal from "bootstrap/js/dist/modal";
import { LitElement, html, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import uuid4 from "uuid4";
import { normalizar_username } from "../../helpers";
import { Deposito, get_empty_deposito } from "../depositos-types.js";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { isThisQuarter } from "date-fns";

export class DepositoUpsert extends LitElement {
  @property()
  user: any;
  @property()
  draw: MapboxDraw;

  @property({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  modal: Modal;
  @property()
  db: any;
  @property()
  deposito: Deposito = get_empty_deposito();


  firstUpdated() {
    this.modal = new Modal(this.shadowRoot.getElementById("deposito-modal"));
  }

  show() {
    this.modal?.show();
  }

  hide() {
    this.modal?.hide();
  }

  guardar() {
    this.deposito._id = "deposito:" + normalizar_username(this.deposito.nombre);
    this.db.put(this.deposito);
  }

  input_change(e) {
    this.deposito.nombre = e.target.value;
  }

  render() {
    return html`<!-- Button trigger modal -->
      <!-- Modal -->
      <div
        class="modal fade"
        id="deposito-modal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="modelTitleId"
        aria-hidden="true"
      >
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nuevo Deposito</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="input-nombre" class="form-label">Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  .value=${this.deposito.nombre}
                  @input=${this.input_change}
                  name="input-nombre"
                  id="input-nombre"
                  aria-describedby="helpId"
                  placeholder="Nombre"
                />
                <small id="helpId" class="form-text text-muted"
                  >El nombre con el que vas a reconocer al deposito en
                  Agrotools</small
                >
                
               
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                @click=${this.guardar}
                class="btn btn-primary"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div> `;
  }
}

customElements.define("deposito-upsert", DepositoUpsert);
