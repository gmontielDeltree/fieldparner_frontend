import { LitElement, html } from "lit-element";
import { Modal } from "bootstrap";

export class LoadingModal extends LitElement {
  static properties = {
    _modal: {},
    show: {},
  };

  constructor() {
    super();
  }

  //createRenderRoot() {
  //  return this;
  //}

  firstUpdated() {
    console.log("FU", this.show);
    this._modal = new Modal(this.shadowRoot.getElementById("loading-modal"));
    if (this.show) {
      this._modal.show();
    }
  }

  /** willUpdate pasa antes que firstUpdatED */
  willUpdate(props) {
    if (props.has("show")) {
      console.log("WU", this.show);
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
        class="modal fade"
        id="loading-modal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-body mx-auto p-0">
              <img
                src="assets/images/cosechadora_bg.jpg"
                
                alt="..."
                style='min-height: 100%; min-width:100%; background-size:cover;'
              />
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("loading-modal", LoadingModal);
