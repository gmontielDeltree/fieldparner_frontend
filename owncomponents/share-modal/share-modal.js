import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { normalizar_username } from "../helpers";
import Modal from "bootstrap/js/dist/modal.js";

export class ShareModal extends LitElement {
  static properties = {
    modal: {hasChanged(newVal, oldVal) {
      return false;
    }},
    share_list: {},
    owner: {},
    campo_doc: {},
    input_value: {},
  };

  constructor() {
    super();
    this.share_list = [];
  }

  static styles = unsafeCSS(bootstrap);

  //createRenderRoot() {
  //  return this;
  //}

  firstUpdated() {
    this.modal = new Modal(this.shadowRoot.getElementById("modal-share"));
  }

  start() {
    this.modal.show();
  }

  share() {
    let event = new CustomEvent("share-campo", {
      detail: { share_with: this.share_list, campo_doc: this.campo_doc },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
    this.modal.hide()
    
  }

  agregar_click(e){
    let hack = [...this.share_list]
    hack.push(normalizar_username(this.input_value))
    this.share_list = hack
  }

  render() {
    // <!-- Modal -->
    return html`<div
      class="modal fade"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabindex="-1"
      id="modal-share"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">
              Compartir Campo
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body mx-auto">
            <label for="username" class="form-label"
              >Ingrese el nombre los usuarios o e-mail.</label
            >
            <div class="input-group mb-3">
              <input
                type="text"
                id="username"
                class="form-control"
                @input=${(e) => (this.input_value = e.target.value)}
                placeholder="Recipient's username"
                aria-label="Recipient's username"
                aria-describedby="button-addon2"
              />
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click=${this.agregar_click}
                id="button-addon2"
              >
                Agregar
              </button>
            </div>

            <ol class="list-group list-group-numbered">
              ${this.share_list.map((user) => {
                return html`<li class="list-group-item">${user}</li>`;
              })}
            </ol>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" @click=${this.share}>
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }
}

customElements.define("share-modal", ShareModal);
