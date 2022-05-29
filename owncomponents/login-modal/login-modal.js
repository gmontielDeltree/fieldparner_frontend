/**Es importante tener en cuenta las animaciones cuando se muestran / ocultan
 * rapidamente los modales, puesto que no se ejecuta el ocultamiento si aun no termina
 * el "show"
 */
import { LitElement, html } from "lit-element";
import { Modal } from "bootstrap";

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
    console.log("FU", this.show)
    this._modal = new Modal(this.shadowRoot.getElementById("login-modal"));
    if(this.show){
      this._modal.show()
    }else{
      this._modal.hide()
    }
  }

  /** willUpdate pasa antes que firstUpdatED */
  willUpdate(props) {
    
    if (props.has("show")) {
      console.log("WU",this.show,this._modal)
      if (this.show) {
        this._modal?.show(); //La primera vez _modal no esta definido
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
        class="modal"
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
            </div>
            <div class="modal-body mx-auto">
             <button class="btn btn-success" @click=${()=>this.sendEvent('login-click',null)} > Sign In </button> 
            </div>
            <div class="modal-footer"></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("login-modal", LoginModal);
