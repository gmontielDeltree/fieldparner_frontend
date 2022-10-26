import { LitElement, html, CSSResultGroup, css, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import Modal from "bootstrap/js/dist/modal";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

export class LoadingModal extends LitElement {
  static override styles: CSSResultGroup = [
    unsafeCSS(bootstrap),
    css`
      .fondo-bg {
        background-image: url("/assets/images/cosechadora_bg.jpg");
        background-size: 100% auto;
        background-position-y: -300px;
      }
      `,
  ];

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal: Modal;

  @property()
  show: boolean = true;

  override firstUpdated() {
    this._modal = new Modal(this.shadowRoot.getElementById("loading-modal"));
    this.shadowRoot.getElementById("loading-modal").addEventListener('hidden.bs.modal',(e)=>{
                // Se elimina del parent
                let parent = this.parentElement;
                while (parent.firstChild) {
                  parent.firstChild.remove();
                }
    })
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
            <div class="modal-body mx-auto w-100 p-0 fondo-bg">
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
                  src="/assets/images/cosechadora_bg.jpg"
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
