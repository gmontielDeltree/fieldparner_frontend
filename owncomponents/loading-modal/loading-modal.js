import { LitElement, html } from "lit";
import { Modal } from "bootstrap";

export class LoadingModal extends LitElement {
  static properties = {
    _modal: {},
    show: {},
  };

  constructor() {
    super();
    this.show = true;
  }

  //createRenderRoot() {
  //  return this;
  //}

  firstUpdated() {
    this._modal = new Modal(this.shadowRoot.getElementById("loading-modal"));
    if (this.show) {
      this._modal.show();
    } else {
      this._modal.hide();
    }
  }

  /** willUpdate pasa antes que firstUpdatED */
  willUpdate(props) {
    if (props.has("show")) {
      if (this.show) {
        this._modal?.show(); //La primera vez _modal no esta definido
      } else {
        this._modal?.hide();
      }
    }
  }

  sendEvent = (name, details) => {
    let event = new CustomEvent(name, {
      detail: details,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  };

  render() {
    return html`
      <div
        class="modal"
        id="loading-modal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-body mx-auto w-100 p-0">
              <div>
                <div
                  class="spinner-border text-danger"
                  style="
                        position: fixed;
                        top: 10%;
                        left: 10%;
                    "
                  role="status"
                >
                  <span class="visually-hidden">Cargando...</span>
                </div>

                <img
                  src="assets/images/cosechadora_bg.jpg"
                  alt="..."
                  style="height: 100%; width:100%; object-fit:cover;"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("loading-modal", LoadingModal);
