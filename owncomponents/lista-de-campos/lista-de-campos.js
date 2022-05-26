import { LitElement, html, css ,unsafeCSS} from "lit";
import { Offcanvas } from "bootstrap";
import area from "@turf/area";
import uuid4 from "uuid4";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";

export class ListaDeCampos extends LitElement {
  static properties = {
    map: {},
    campos:{},
    _detallesOffcanvas: {},
  };

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
    // console.log("EJECUTANDO COMPONENTE")
  }

  firstUpdated() {

    this._detallesOffcanvas = new Offcanvas(this.shadowRoot.getElementById('lista-de-campos-oc'));
    console.log("LDC OC", this._detallesOffcanvas)

  }

  show() {
    console.log("DETALLE", this._detallesOffcanvas)
    this._detallesOffcanvas.show();
  }

  render() {

    let offcanvas_html = html`<div class="offcanvas offcanvas-start" tabindex="-1" id="lista-de-campos-oc" aria-labelledby="offcanvasLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasLabel">Lista de Campos</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      
    </div>
  </div>`;

    return html` ${offcanvas_html} `;
  }
}

customElements.define("lista-de-campos", ListaDeCampos);
