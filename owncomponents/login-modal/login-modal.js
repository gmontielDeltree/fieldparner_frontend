import { LitElement, html } from "lit-element";
import { Modal } from "bootstrap";
import './auth0-login-button.js'

export class LoginModal extends LitElement {
  static properties = {
    _modal: {},
    show: {},
    authenticated:{},
    username:{}
  };

  constructor() {
    super();
  }

  //createRenderRoot() {
  //  return this;
  //}

  firstUpdated() {
    this._modal = new Modal(this.shadowRoot.getElementById("login-modal"));
    this._modal.show();
    this.show = true
    console.log("MODAL DOE");
   
  }

  willUpdate(props) {
    if (props.has("show")) {
      if (this.show) {
        this._modal?.show();
      } else {
        this._modal?.hide();
      }
    }
  }

sendEvent = (name,details) => {
  let event = new CustomEvent(name, {
    detail: details,
    bubbles: true,
    composed: true,
  });
  this.dispatchEvent(event);
}

  render() {
    return html`
      <div
        class="modal fade show"
        id="login-modal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                Agrotools SignIn
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body mx-auto">
             <button @click=${()=>this.sendEvent('login-click',null)} > Sign In </button> 
            </div>
            <div class="modal-footer"></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("login-modal", LoginModal);
