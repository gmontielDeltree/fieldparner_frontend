import { LitElement, html, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/custom-field";
import "@vaadin/grid"
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";
import lista_de_labores from "./labores.json"

export class ContratistaCrud extends LitElement {
  @property()
  db = {};

  @state()
  modal: Modal;

  @property()
  contratista: any = { labores: [{labor:"Sin Labores"}], datos_generales: { email: "" } };

  static override styles = unsafeCSS(bootstrap);

  override firstUpdated() {
    this.modal = new Modal(this.shadowRoot.getElementById("modal"));
  }

  show() {
    this.modal.show();
  }

  agregar_labor(){

  }
  
  responsiveSteps = [
    // Use one column by default
    { minWidth: 0, columns: 1 },
    // Use two columns, if layout's width exceeds 500px
    { minWidth: "500px", columns: 2 },
  ];

  items = lista_de_labores;

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
                Nuevo Contratista
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
                <vaadin-text-field label="Nombre"></vaadin-text-field>
                <vaadin-text-field label="CUIT"></vaadin-text-field>
                <!-- Stretch the username field over 2 columns -->
                <vaadin-text-field label="Dirección"></vaadin-text-field>

                <vaadin-text-field label="Teléfono"></vaadin-text-field>

                <vaadin-email-field
                  label="Email"
                  name="email"
                  .value=${this.contratista.datos_generales.email}
                  error-message="Por favor, ingrese una dirección valida"
                  clear-button-visible
                ></vaadin-email-field>
              </vaadin-form-layout>

              <vaadin-custom-field
                label="Labores"
                helper-text="¿Que es lo que puede hacer este contratista?"
              >
                <vaadin-horizontal-layout theme="spacing" label="dad">
                  <vaadin-combo-box
                  allow-custom-value
                    item-label-path="labor"
                    item-value-path="labor"
                    style="flex: 1;"
                    .items="${this.items}"
                  ></vaadin-combo-box>
                  <vaadin-button @click=${this.agregar_labor} theme="primary" tabindex="0" role="button"
                    >Agregar Labor</vaadin-button
                  >
                </vaadin-horizontal-layout>
              </vaadin-custom-field>

<div>
              <vaadin-grid
                .items="${this.contratista.labores}"
                all-rows-visible
              >
                <vaadin-grid-column
                  path="labor"
                  auto-width
                ></vaadin-grid-column>
        
              </vaadin-grid>
  </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger">Eliminar</button>

              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button type="button" class="btn btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

customElements.define("contratista-crud", ContratistaCrud);
