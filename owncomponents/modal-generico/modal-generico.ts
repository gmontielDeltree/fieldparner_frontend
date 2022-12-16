import { LitElement, html, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { Modal } from "bootstrap";

export class ModalGenerico extends LitElement {
  @property()
  size;

  @property()
  titulo: any = {};

  @state()
  modal: Modal;

  static override styles = unsafeCSS(bootstrap);

  override firstUpdated() {
    this.modal = new Modal(this.shadowRoot.getElementById("modal"));
  }

  show() {
    this.modal.show();
  }

  render() {
    return html`<!-- Modal -->
      <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">${this.title}</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <slot></slot>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" class="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

customElements.define("modal-generico", ModalGenerico);
