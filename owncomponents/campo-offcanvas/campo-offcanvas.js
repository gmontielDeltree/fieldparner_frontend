import { LitElement, html, css } from "lit";
import { Offcanvas } from "bootstrap";

export class CampoOffcanvas extends LitElement {
  static properties = {
    map: {},
    draw: {},
    db: {},
    _id: {},
    campo_doc: {},
    campo_geojson: {},
    nuevo_lote_callback: {},
    borrar_lote_callback: {},
    guardar_lote_callback: {},
    show_main: {},
    nombre_lote: {},
    _detallesOffcanvas: {},
  };

  constructor() {
    super();
    // console.log("EJECUTANDO COMPONENTE")
    this.show_main = false;
    this.modo = "lote";
  }
  
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Build Offcanvas
    this._detallesOffcanvas = new Offcanvas(
      document.getElementById("offcanvas-campo-detalle")
    );
  }

  hide() {
    this._detallesOffcanvas.hide();
  }

  show() {
    this._detallesOffcanvas.show();
    //tour.start()
    introJs()
      .setOptions({
        steps: [
          {
            intro: "Bienvenido Bipedo!!!",
          },
          {
            element: document.querySelector(".btn-anadir-lote"),
            intro: "Presiona para agregar un nuevo lote",
          },
        ],
      })
      .start();
  }

  enable_siguiente() {
    document
      .getElementById("agregar-lote-siguiente-btn")
      .removeAttribute("disabled");
  }

  nuevo_lote_click() {
    // Mostrar Nueva Geometria - Lote
    document.getElementById("nuevo-lote-ui").show = true;
    this.hide()
  }

  cerrar_modo() {
    console.log("Cerrar Modo Campo");
    // Show Campos
    this.map.setLayoutProperty("lotes", "visibility", "visible");
    // Hide Lotes
    this.map.setLayoutProperty("lotes_internos", "visibility", "none");
    // Hide NDVI
    this.map.setLayoutProperty("ndvi-layer", "visibility", "none");
    // Bordes
    this.map.setLayoutProperty("lotes_border", "visibility", "none");
  }

  hide() {
    this._detallesOffcanvas.hide();
  }

  render() {
    return html`
      <div
        class="offcanvas offcanvas-bottom h-25"
        tabindex="-1"
        id="offcanvas-campo-detalle"
        aria-labelledby="offcanvas-campo-header"
        data-bs-backdrop="false"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvas-campo-header">
            Campo ${this.campo_doc?.nombre}
          </h5>

          <button
            type="button"
            @click=${this.cerrar_modo}
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body small col pt-0">
          <p>Toque en un lote del mapa para ver detalles</p>
          <button
            type="button"
            class="btn btn-success btn-anadir-lote"
            @click=${this.nuevo_lote_click}
          >
            Añadir Lote
          </button>
          <button
            class="btn btn-danger"
            id="eliminar-campo-btn"
            @click=${this.borrar_lote_callback}
          >
            Eliminar Campo
          </button>
        </div>
      </div>

      ${this.map
        ? html`<nueva-geometria-ui
            id='nuevo-lote-ui'
            .tipo='lote'
            .mapa=${this.map} 
            .campo_feature=${this.campo_geojson}
          ></nueva-geometria-ui>`
        : null}
    `;
  }
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

customElements.define("campo-offcanvas", CampoOffcanvas);
