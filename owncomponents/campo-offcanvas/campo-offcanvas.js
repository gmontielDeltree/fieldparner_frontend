import { LitElement, html, css } from "lit";
import { Offcanvas } from "bootstrap";
import area from '@turf/area'
import uuid4 from "uuid4";

export class CampoOffcanvas extends LitElement {
  static properties = {
    map: {},
    draw: {},
    campos_db: {},
    campo_doc: {},
    show_main: {},
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

    this.addEventListener('cerrargeometria', (e) => {
      console.log("cerrar_nueva_geometria")
      this._detallesOffcanvas.show()
    })

    this.addEventListener("guardargeometria", (e) => {
      console.log("guardar_nueva_geometria", e.detail.feature);
      this.show = false;
      this._detallesOffcanvas.show()

      let lote_geojson = e.detail.feature
      let nombre = e.detail.nombre
      let thisCampoId = this.campo_doc["_id"]

      console.log("THISSSSS",this.campo_doc)

      // Props adicionales del lote
      lote_geojson.properties.nombre = nombre
      lote_geojson.properties.campo_parent_id = thisCampoId;
      let this_lote_id = uuid4();
      lote_geojson.properties.uuid = this_lote_id;
      lote_geojson.properties.hectareas =
        Math.round((area(lote_geojson) / 10000) * 100) / 100;
      lote_geojson.id = this_lote_id;
      

      this.campos_db.get(thisCampoId).then((doc) => {
        console.log("Lote GeoJSON", lote_geojson);
        doc.lotes.push(lote_geojson);
        // Save Lote en campo doc
        this.campos_db.put(doc).then(()=>console.log("Lote Grabado"));
      })
    })

  }

  hide() {
    this._detallesOffcanvas.hide();
  }

  show() {
    this._detallesOffcanvas.show();
    //tour.start()
    introJs()
      .setOptions({
        "dontShowAgain": true,
        nextLabel : "Siguiente",
        doneLabel: "Fin",
        prevLabel: "Anterior",
        disableInteraction: false,
        steps: [
          {
            intro: "Has seleccionado un campo",
          },
          {
            element: document.querySelector(".btn-anadir-lote"),
            intro: "Presiona aqui si quieres agregar un nuevo lote",
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
    this.map.setLayoutProperty("campos", "visibility", "visible");
    // Hide Lotes
    this.map.setLayoutProperty("lotes", "visibility", "none");
    // Hide NDVI
    this.map.setLayoutProperty("ndvi-layer", "visibility", "none");
    // Bordes
    this.map.setLayoutProperty("campos_border", "visibility", "visible");
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
            ._draw=${this.draw} 
            .campo_feature=${this.campo_doc?.campo_geojson}
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
