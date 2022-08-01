import { LitElement, html, unsafeCSS, render } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/custom-field";
import "@vaadin/grid";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import Modal from "bootstrap/js/dist/modal";
import lista_de_labores from "./labores.json";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import {Insumo, get_empty_insumo} from './insumos-types'
import { isThisSecond } from "date-fns";



export class InsumoCrud extends LitElement {
  @property()
  db: PouchDB.Database;

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal: Modal;

  @property()
  insumo: Insumo = get_empty_insumo();

  @state()
  _editing: boolean = false;

  static override styles = unsafeCSS(bootstrap);

  override firstUpdated() {
    this._modal = new Modal(this.shadowRoot.getElementById("modal"));
  }

  show() {
    this._modal.show();
  }

  nuevo() {
    this.insumo = get_empty_insumo();
    this._editing = false;
    this._modal.show();
  }


  edit(c : Insumo){
    this._editing = true;
    this.insumo = {...c}; 
    this._modal.show()
  }


  /**
   * Cambia el _selected_labor solo si lo seleccionado es algo definido.
   * Evita que @selected-item-changed sobreescriba @custom-value-set
   * @param e
   */
  selected_item_changed(e: CustomEvent) {

  }
  /**
   * Configura las columnas del Form vaadin
   */
  responsiveSteps = [
    // Use one column by default
    { minWidth: 0, columns: 1 },
    // Use two columns, if layout's width exceeds 500px
    { minWidth: "500px", columns: 2 },
  ];

  private guardar_insumo = () => {
  
  };

 

  render() {
    return html`<!-- Modal -->
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
                ${this._editing ? "Editando Insumo" : "Nuevo Insumo"}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <vaadin-form-layout .responsiveSteps="${this.responsiveSteps}">
                <vaadin-text-field
                  label="Marca Comercial"
                  .value=${this.insumo.marca_comercial}
                  @change=${(e: any) => {
                    //this.insumo.marca_comercial = e.target.value;
                    this.insumo = { ...this.insumo, marca_comercial : e.target.value };
                  }}
                ></vaadin-text-field>
                <vaadin-text-field
                  label="Principio Activo"
                  .value=${this.insumo.principio_activo}
                  @change=${(e: any) => {
                    //this.insumo.principio_activo = e;
                    this.insumo = { ...this.insumo, principio_activo:e.target.value };
                  }}
                ></vaadin-text-field>
                <!-- Stretch the username field over 2 columns -->
                <vaadin-text-field
                  label="Tipo"
                  .value=${this.insumo.tipo}
                  @change=${(e: any) => {
                    //this.insumo.datos_generales.direccion = e.target.value;
                    this.insumo = { ...this.insumo, tipo:e.target.value };
                  }}
                ></vaadin-text-field>

                <vaadin-text-field
                  label="Subtipo"
                  .value=${this.insumo.subtipo}
                  @change=${(e: any) => {
                    //this.insumo.datos_generales.telefono = e.target.value;
                    this.insumo = { ...this.insumo, subtipo:e.target.value  };
                  }}
                ></vaadin-text-field>

                <vaadin-email-field
                  label="Un."
                  name="email"
                  .value=${this.insumo.unidad}
                  @change=${(e: any) => {
                    //this.insumo.datos_generales.email = e.target.value;
                    this.insumo = { ...this.insumo, unidad:e.target.value };
                  }}
                  error-message="Por favor, ingrese una dirección valida"
                  clear-button-visible
                ></vaadin-email-field>
              </vaadin-form-layout>

              
            </div> <!-- End Modal Body -->
            
            <div class="modal-footer">
              ${this._editing
                ? html`<button type="button" class="btn btn-danger">
                    Eliminar
                  </button>`
                : null}

              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.guardar_insumo}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

customElements.define("insumo-crud", InsumoCrud);

declare global {
  interface HTMLElementTagNameMap {
    "insumo-crud": InsumoCrud;
  }
}
