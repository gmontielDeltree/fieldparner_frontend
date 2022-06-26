import { LitElement, html, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";

export class ContratistaCrud extends LitElement {
  @property()
  db = {};

  @state()
  modal: Modal;

  @property()
  contratista: any = {};

  static override styles = unsafeCSS(bootstrap);

  override firstUpdated() {
    this.modal = new Modal(this.shadowRoot.getElementById("modal"));
  }

  show() {
    this.modal.show();
  }

  responsiveSteps = [
    // Use one column by default
    { minWidth: 0, columns: 1 },
    // Use two columns, if layout's width exceeds 500px
    { minWidth: "500px", columns: 2 },
  ];

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
                  label="Email address"
                  name="email"
                  value="julia.scheider@email.com"
                  error-message="Please enter a valid email address"
                  clear-button-visible
                ></vaadin-email-field>
              </vaadin-form-layout>
              <vaadin-horizontal-layout theme="spacing">
                <vaadin-combo-box
                  item-label-path="displayName"
                  item-value-path="id"
                  style="flex: 1;"
                  has-value=""
                  ></vaadin-combo-box>
                <vaadin-button theme="primary" tabindex="0" role="button"
                  >Send invite</vaadin-button
                >
              </vaadin-horizontal-layout>

              <vaadin-grid .items="${this.invitedPeople}" all-rows-visible>
                <vaadin-grid-column
                  header="Name"
                  path="displayName"
                  auto-width
                ></vaadin-grid-column>
                <vaadin-grid-column path="email"></vaadin-grid-column>
                <vaadin-grid-column path="address.phone"></vaadin-grid-column>
                <vaadin-grid-column
                  header="Manage"
                  .renderer="${this.manageRenderer}"
                ></vaadin-grid-column>
              </vaadin-grid>
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
