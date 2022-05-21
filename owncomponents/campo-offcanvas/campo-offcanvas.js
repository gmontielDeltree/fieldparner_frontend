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
  };
  // Styles are scoped to this element: they won't conflict with styles
  // on the main page or in other components. Styling API can be exposed
  // via CSS custom properties.
  static styles = css`
    :host {
      display: inline-block;
      padding: 10px;
      background: lightgray;
    }
    .planet {
      color: var(--planet-color, blue);
    }
  `;

  _detallesOffcanvas = {};
  _step1 = {};
  _step2 = {};

  constructor() {
    super();
    // console.log("EJECUTANDO COMPONENTE")
    this.show_main = false;
  }

  firstUpdated() {
    this._detallesOffcanvas = new Offcanvas(
      document.getElementById("offcanvas-campo-detalle")
    );
    this._step1 = new Offcanvas(
      document.getElementById("offcanvas-lote-paso-1")
    );
    this._step2 = new Offcanvas(
      document.getElementById("offcanvas-lote-paso-2")
    );
  }

  createRenderRoot() {
    return this;
  }

  hide() {
    this._detallesOffcanvas.hide();
  }

  show() {
    this._step1.hide();
    this._step2.hide();
    this._detallesOffcanvas.show();
    this.show_main = true
  }

  lote_paso_1() {
    // Hide Campo Detalle

    // Hide Step2
    this._step2.hide();

    // Show Step1
    this._step1.show();

    this._detallesOffcanvas.hide();
  }

  lote_paso_2() {
    // Hide Campo Detalle
    this._detallesOffcanvas.toggle();
    // Show Step2
    this._step2.show();

    // hide Step1
    this._step1.hide();
  }

  enable_siguiente() {
    document
      .getElementById("agregar-lote-siguiente-btn")
      .removeAttribute("disabled");
  }

  nuevo_lote_click() {
    //(this.nuevo_lote_callback)()
    document.getElementById("nuevo-lote-ui").campo = "";
    document.getElementById("nuevo-lote-ui").show = true;
    //this.lote_paso_1();
  }

  guardar_lote_click() {
    this.guardar_lote_callback();
  }

  cerrar_modo() {
    console.log("Cerrar Modo Campo");
    if (this.draw.getMode() === "draw_polygon") {
      this.draw.changeMode("simple_select");
    }
    this.draw.deleteAll();

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
    this._step1.hide();
    this._step2.hide();
    this._detallesOffcanvas.hide();
  }
  // The render() method is called any time reactive properties change.
  // Return HTML in a string template literal tagged with the `html`
  // tag function to describe the component's internal DOM.
  // Expressions can set attribute values, property values, event handlers,
  // and child nodes/text.
  render() {
    return html`
      <div
        class="offcanvas offcanvas-bottom h-25 ${this.show_main ? "show" : ""}"
        tabindex="-1"
        id="offcanvas-campo-detalle"
        aria-labelledby="offcanvas-campo-header"
        data-bs-backdrop="false"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvas-campo-header">Campo ${this.campo_doc?.nombre}</h5>

          <button
            type="button"
            @click=${this.cerrar_modo}
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body small col pt-0">
          <!--                     <div class="row no-wrap" id='campo-ndvi'></div>
                    <div class="row" id='campo-cultivo'></div>
                    <div class="row mb-2" id='campo-img-preview'>
                    </div>
                    <div class="row" id='campo-audio-players'></div>
                    <div class="row" id='campo-problemas'></div>
                    <div class="row" id='campo-campo'></div> -->
          <p>Toque en un lote del mapa para ver detalles</p>
          <button
            type="button"
            class="btn btn-success"
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
      
      <!-- Primera paso --Add Lote -->
      <div
        class="offcanvas offcanvas-bottom"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabindex="-1"
        id="offcanvas-lote-paso-1"
        aria-labelledby="offcanvasBottomLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvas-1-title"></h5>

          <div class="d-grid gap-2">
            <button
              id="agregar-lote-siguiente-btn"
              type="button"
              class="btn btn-success"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvas-lote-paso-2"
              aria-controls="offcanvasCampoForm"
              disabled
            >
              Siguiente
            </button>
          </div>
          <button
            type="button"
            id="map-edit-btn"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body small">
          <div class="d-grid gap-2">
            <button
              class="btn btn-primary"
              @click=${this.cerrar_modo}
              id="salir-edicion-btn"
              data-bs-dismiss="offcanvas"
              type="button"
            >
              Salir del Modo de Edición
            </button>
          </div>
        </div>
      </div>

      <!--Campo Form-->
      <div
        class="offcanvas offcanvas-bottom h-50"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabindex="-1"
        id="offcanvas-lote-paso-2"
        aria-labelledby="offcanvasBottomLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">Nuevo Lote</h5>

          <button
            type="button"
            id="map-edit-btn"
            @click=${this.cerrar_modo}
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">
          <form>
            <div class="row mb-1">
              <label for="inputNombreLote" class="col-4 col-form-label"
                >Nombre del Lote</label
              >
              <div class="col-8">
                <input
                  type="text"
                  @change=${(e) => (this.nombre_lote = e.target.value)}
                  value="${this.nombre_lote}"
                  class="form-control"
                  id="inputNombreLote"
                />
              </div>
            </div>

            <div class="d-grid gap-2">
              <button
                class="btn btn-primary btn-success"
                id="guardar-lote-btn"
                @click=${this.guardar_lote_click}
                type="button"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

      ${this.map ? html`<nueva-geometria-ui id="nuevo-lote-ui" .tipo="lote" .mapa=${this.map} .campo_feature=${this.campo_geojson}></nueva-geometria-ui>` : null}
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
