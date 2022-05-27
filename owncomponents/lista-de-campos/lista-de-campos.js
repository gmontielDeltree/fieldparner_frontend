import { LitElement, html, css, unsafeCSS } from "lit";
import { Offcanvas } from "bootstrap";
import area from "@turf/area";
import uuid4 from "uuid4";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import centroid from "@turf/centroid";

export class ListaDeCampos extends LitElement {
  static properties = {
    map: {},
    campos: {},
    map: {},
    _detallesOffcanvas: {},
  };

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
    // console.log("EJECUTANDO COMPONENTE")
  }

  firstUpdated() {
    this._detallesOffcanvas = new Offcanvas(
      this.shadowRoot.getElementById("lista-de-campos-oc")
    );
    console.log("LDC OC", this._detallesOffcanvas);
  }

  show() {
    console.log("DETALLE", this.campos);
    this._detallesOffcanvas.show();
  }

  ir_a(feature){
    this.map.flyTo({
      center: centroid(feature).geometry.coordinates,
      zoom: 10,
    })
  }

  render() {
    const item = (name, hectareas, lotes, geojson) => {return html`<a
      href="#"
      @click=${()=>{this.ir_a(geojson)}}
      class="list-group-item list-group-item-action bg-primary text-light"
      aria-current="true"
    >
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${name}</h5>
        <small class="small">${hectareas} has</small>
      </div>
      <p class="mb-1">${lotes} Lotes</p>
      <small></small>
    </a>`}

    let offcanvas_html = html`<div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="lista-de-campos-oc"
      aria-labelledby="offcanvasLabel"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasLabel">Lista de Campos</h5>
        <button
          type="button"
          @click=${()=>{this._detallesOffcanvas.hide()}}
          class="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <div class="list-group">
          ${this.campos?.rows.map((campo)=>
            item(campo.doc.nombre, campo.doc.campo_geojson.properties.hectareas, campo.doc.lotes.length, campo.doc.campo_geojson)
          )}
        </div>
      </div>
    </div>`;

    return html` ${offcanvas_html} `;
  }
}

customElements.define("lista-de-campos", ListaDeCampos);
