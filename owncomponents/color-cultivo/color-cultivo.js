import { LitElement, html, unsafeCSS } from "lit";
import { Offcanvas } from "bootstrap";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

export class ColorCultivo extends LitElement {
  static properties = {
    _detallesOffcanvas: {},
    cultivos: {},
  };
  constructor() {
    super();
  }
  static styles = unsafeCSS(bootstrap);

  //createRenderRoot() {
  //  return this;
  //}

  firstUpdated() {
    this._detallesOffcanvas = new Offcanvas(
      this.shadowRoot.getElementById("colores-settings-oc")
    );
  }

  willUpdate(props) {
    //   if(props.has('show')){
    //     if(this.show){
    //         this._detallesOffcanvas?.show()
    //     }else{
    //         this._detallesOffcanvas?.hide()
    //     }
    //   }
  }

  show() {
    this._detallesOffcanvas?.show();
  }

  update_color_settings(color,key){
    this.cultivos[key].color = color
    this.sendEvent('save-settings',null)
    
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
    const item = (name, color, key) => {
      return html`<a
        href="#"
        class="list-group-item list-group-item-action bg-light row"
        aria-current="true"
      >
     <div class='row'>
          <label for="exampleColorInput" class="form-label col-10 col-form-label">${name}</label>
          <input type="color" class="form-control form-control-color col-2" @change=${(e)=>this.update_color_settings(e.target.value,key)} id="exampleColorInput" value=${color} title="Choose your color">
     </div>
               </a>`;
    };

    let offcanvas_html = html`<div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="colores-settings-oc"
      aria-labelledby="offcanvasLabel"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasLabel">Color de Cultivos</h5>
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
          ${this.cultivos
            ? Object.entries(this.cultivos).map(([key, cultivo]) =>
                item(cultivo.nombre, cultivo.color, key)
              )
            : null}
        </div>
      </div>
    </div>`;

    return html` ${offcanvas_html} `;
  }
}

customElements.define("color-cultivo", ColorCultivo);
