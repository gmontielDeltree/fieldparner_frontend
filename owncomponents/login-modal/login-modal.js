import { LitElement, html } from "lit-element";
import { Modal } from "bootstrap";
import createAuth0Client from '@auth0/auth0-spa-js';
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

    this.addEventListener('auth0-cliet-build', async (e)=>{
        let c = e.detail.auth0Client
        console.log("AUTH0 Client", e.detail.auth0Client)
        let isauth = await c.isAuthenticated();
        console.log("isa",isauth)
        if(isauth){
            let u = await c.getUser()
            this.username = u.name
            console.log("El usuario esta auth:",this.username)
        }

    })
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
              
                <auth0-login domain='dev-xa9-5ghc.us.auth0.com' clientid='gQx1JtypOHAcCgGBr0ukd3YDQM5k8FtW'></auth0-login>
            </div>
            <div class="modal-footer"></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("login-modal", LoginModal);
