import { LitElement, html, css } from "lit";
import { Offcanvas } from "bootstrap";
import area from '@turf/area'
import uuid4 from "uuid4";

export class ListaDeCampos extends LitElement {
  static properties = {
    map: {},
    offcavas_visible: {},
    _detallesOffcanvas: {},
  };

  constructor() {
    super();
    // console.log("EJECUTANDO COMPONENTE")
    this.offcavas_visible = false;

  }

  render(){
      let button = html`<div class="fixed-bottom"> <button type="button" class="btn btn-primary">Ver Lista de Campos</button> </div>
`

      let offcanvas_html = html ``

      return html`
        ${this.offcavas_visible === false ? button : offcanvas_html}
      `
  }
  
}

customElements.define("lista-de-campos", ListaDeCampos);
