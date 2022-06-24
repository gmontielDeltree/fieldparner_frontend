import { LitElement, html, css } from "lit";
import { Offcanvas } from "bootstrap";
import area from "@turf/area";
import uuid4 from "uuid4";
import "../share-modal/share-modal.js";
import { normalizar_username } from "../helpers.js";
import bbox from "@turf/bbox";

export class CampoOffcanvas extends LitElement {
  static properties = {
    map: {},
    draw: {},
    campos_db: {},
    campo_doc: {},
    user: {},
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

    this.addEventListener("cerrargeometria", (e) => {
      console.log("cerrar_nueva_geometria");
      this._detallesOffcanvas.show();
    });

    this.addEventListener("guardargeometria", (e) => {
      console.log("guardar_nueva_geometria", e.detail.feature);
      this.show = false;
      this._detallesOffcanvas.show();

      let lote_geojson = e.detail.feature;
      let nombre = e.detail.nombre;
      let thisCampoId = this.campo_doc["_id"];

      console.log("THISSSSS", this.campo_doc);

      // Props adicionales del lote
      lote_geojson.properties.nombre = nombre;
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
        this.campos_db.put(doc).then(() => console.log("Lote Grabado"));

        // Changes para NDVI
        let couch_username = normalizar_username(this.user.name);
        this.local_campos_changes.put(
          {
            _id: this_lote_id,
            tipo: "add-lote",
            username: couch_username,
            details: {
              campo_id: thisCampoId,
              db: "campos_" + couch_username,
              lote_geojson: lote_geojson,
              username: couch_username,
            },
          },
          (err, result) => {
            if (!err) {
              console.log("LocalChanges Successfully posted!");
            } else {
              console.log(err);
            }
          }
        );
      });
    });
  }

  hide() {
    this._detallesOffcanvas.hide();
  }

  show() {
    this._detallesOffcanvas.show();
    //tour.start()
    introJs()
      .setOptions({
        dontShowAgain: true,
        nextLabel: "Siguiente",
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
      
    this.localizar_campo()
  }

  enable_siguiente() {
    document
      .getElementById("agregar-lote-siguiente-btn")
      .removeAttribute("disabled");
  }

  nuevo_lote_click() {
    // Mostrar Nueva Geometria - Lote
    document.getElementById("nuevo-lote-ui").show = true;
    this.hide();
  }

  cerrar_modo() {
    console.log("Cerrar Modo Campo");
    // Show Campos
    this.map.setLayoutProperty("campos", "visibility", "visible");
    // Hide Lotes
    this.map.setLayoutProperty("lotes", "visibility", "none");
    // Hide NDVI
    // this.map.setLayoutProperty("ndvi-layer", "visibility", "none");
    // Bordes
    this.map.setLayoutProperty("campos_border", "visibility", "visible");
  }

  share_campo() {
    document.getElementById("share-modal").start();
  }

  hide() {
    this._detallesOffcanvas.hide();
  }

  borrar_campo() {
    let event = new CustomEvent("borrar-campo", {
      detail: { campo_doc: this.campo_doc },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  localizar_campo(){

    this.map.fitBounds(bbox(this.campo_doc.campo_geojson),{padding: {top:50, bottom:window.innerHeight/4}})
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

          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click=${this.localizar_campo}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-geo-alt"
              viewBox="0 0 16 16"
            >
              <path
                d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"
              />
              <path
                d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              />
            </svg>
            <span class="d-none d-md-inline">Localizar</span>
          </button>

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
          <!-- ${this.campo_doc?.shared
            ? html`<p>
                Compartido por
                <span class="badge bg-success"
                  >${this.campo_doc.owner.name.toUpperCase()}</span
                >
              </p>`
            : null} -->
          <p>Toque en un lote del mapa para ver detalles</p>

          <button
            type="button"
            class="btn btn-success btn-anadir-lote"
            @click=${this.nuevo_lote_click}
          >
            Añadir Lote
          </button>

          <!-- <button
            type="button"
            class="btn btn-warning"
            @click=${this.share_campo}
          >
            Compartir Campo
          </button> -->

          <button
            class="btn btn-danger"
            id="eliminar-campo-btn"
            @click=${this.borrar_campo}
          >
            Eliminar Campo
          </button>
        </div>
      </div>

      <share-modal id="share-modal" .campo_doc=${this.campo_doc}></share-modal>
      ${this.map
        ? html`<nueva-geometria-ui
            id="nuevo-lote-ui"
            .tipo="lote"
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
