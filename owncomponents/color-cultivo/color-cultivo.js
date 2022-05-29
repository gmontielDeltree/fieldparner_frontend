import { LitElement, html , unsafeCSS} from "lit-element";
import { Offcanvas } from "bootstrap";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

export class ColorCultivo extends LitElement {
  static properties = {
      _detallesOffcanvas:{},
      cultivos:{},
      show:{}
  };
  constructor() {
    super();
  }
  static styles = unsafeCSS(bootstrap);

  //createRenderRoot() {
  //  return this;
  //}

  firstUpdated() {
    this._detallesOffcanvas = new Offcanvas(this.shadowRoot.getElementById('colores-settings-oc'))

  }

  willUpdate(props){
    //   if(props.has('show')){
    //     if(this.show){
    //         this._detallesOffcanvas?.show()
    //     }else{
    //         this._detallesOffcanvas?.hide()
    //     }
    //   }
  }

  show(){
    this._detallesOffcanvas?.show()
  }

  render() {
    const item = (name,color) => {
      return html`<a
        href="#"
        class="list-group-item list-group-item-action bg-primary text-light"
        aria-current="true"
      >
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${name}</h5>
          <small class="small">${color}</small>
        </div>
        <p class="mb-1"></p>
        <small></small>
      </a>`;
    };

    let offcanvas_html = html`<div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="colores-settings-oc"
      aria-labelledby="offcanvasLabel"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasLabel">Color Cultivo</h5>
        <button
          type="button"
          @click=${() => {
            this._detallesOffcanvas.hide();
          }}
          class="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <div class="list-group">
          ${this.cultivos?.map((cultivo) =>
            item(
              cultivo.nombre,
              cultivo.color,
            )
          )}
        </div>
      </div>
    </div>`;

    return html` ${offcanvas_html} `;
  }
}

customElements.define("color-cultivo", ColorCultivo);
