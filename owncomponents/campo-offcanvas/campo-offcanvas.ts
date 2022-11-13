import { LitElement, html, unsafeCSS, PropertyValueMap } from "lit";
import area from "@turf/area";
import uuid4 from "uuid4";
import "../share-modal/share-modal.js";
import { layer_visibility, normalizar_username } from "../helpers";
import bbox from "@turf/bbox";
import Offcanvas from "bootstrap/js/dist/offcanvas.js";
import gbl_state, { gblStateLoaded } from "../state";
import { state } from "lit/decorators.js";
import { State, StateController, property } from "@lit-app/state";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { Router } from "@vaadin/router";
//import bootstrap from "./bootstrap.min.css";

export class CampoOffcanvas extends LitElement {
  stateBind = new StateController(this, gbl_state);

  static override styles = unsafeCSS(bootstrap);

  @state()
  campo_doc: Object;

  @state({
    hasChanged: (newVal, oldVal) => {
      return false;
    },
  })
  data_loaded: boolean = false;

  @state({
    hasChanged: (newVal, oldVal) => {
      return false;
    },
  })
  _detallesOffcanvas: Offcanvas;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.count("willUpdate");
    if (!this.data_loaded && gblStateLoaded()) {
      // Inicializacion.
      // No hay data y esta disponible router(param) y db
      this.loadCampo();
      this.data_loaded = true;
      console.count("loadCampo");
    }
  }

  loadCampo() {
    let location = gbl_state.router.location;
    let campo_doc_id = decodeURIComponent(location.params.uuid as string);
    console.log("Campo Doc ID", campo_doc_id, gbl_state.db);
    this.data_loaded = true;
    gbl_state.db.get(campo_doc_id).then((campo_doc) => {
      this.campo_doc = campo_doc;
      this.mapShowOnlyThisCampo();
    });
  }

  mapShowOnlyThisCampo(){
    console.log("Showing solo el campo seleccionado")
    gbl_state.map.hideAllLayers()
    gbl_state.map.selectCampo(this.campo_doc.campo_geojson,this.campo_doc.lotes)
    gbl_state.map.showSelectedCampo()
    // Hide all layers
    // Show seleccion border
    // Show lotes fill
  }

  mapShowAllCampos(){
    console.log("Showing todos los campos")
    gbl_state.map.hideAllLayers()
    gbl_state.map.showAllCampos()
  }

  firstUpdated() {
    // Build Offcanvas
    this._detallesOffcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-campo-detalle")
    );

    this.shadowRoot
      .getElementById("offcanvas-campo-detalle")
      //Cierre callback
      .addEventListener("hidden.bs.offcanvas", () => {
        
      });


    /* Otros listeners */
    this.addEventListener("cerrargeometria", (e) => {
      console.log("cerrar_nueva_geometria");
      this._detallesOffcanvas.show();
    });

    this.addEventListener("guardargeometria", (e: CustomEvent) => {
      console.log("guardar_nueva_geometria", e.detail.feature);
      this._detallesOffcanvas.show();

      let lote_geojson = e.detail.feature;
      let nombre = e.detail.nombre;
      let thisCampoId = this.campo_doc["_id"];

      console.log("THIS", this.campo_doc);

      // Props adicionales del lote
      lote_geojson.properties.nombre = nombre;
      lote_geojson.properties.campo_parent_id = thisCampoId;
      let this_lote_id = uuid4();
      lote_geojson.properties.uuid = this_lote_id;
      lote_geojson.properties.hectareas =
        Math.round((area(lote_geojson) / 10000) * 100) / 100;
      lote_geojson.id = this_lote_id;

      gbl_state.db.get(thisCampoId).then((doc) => {
        console.log("Lote GeoJSON", lote_geojson);
        doc.lotes.push(lote_geojson);
        // Save Lote en campo doc
        gbl_state.db.put(doc).then(() => console.log("Lote Grabado"));
      });
    });


    this._detallesOffcanvas.show();
  }

  hide() {
    this._detallesOffcanvas.hide();
  }

  show() {
    this._detallesOffcanvas.show();
    //tour.start()
    // introJs()
    //   .setOptions({
    //     dontShowAgain: true,
    //     nextLabel: "Siguiente",
    //     doneLabel: "Fin",
    //     prevLabel: "Anterior",
    //     disableInteraction: false,
    //     steps: [
    //       {
    //         intro: "Has seleccionado un campo",
    //       },
    //       {
    //         element: shadowRoot.querySelector(".btn-anadir-lote"),
    //         intro: "Presiona aqui si quieres agregar un nuevo lote",
    //       },
    //     ],
    //   })
    //   .start();

    this.localizar_campo();
  }

  nuevo_lote_click() {
    // Mostrar Nueva Geometria - Lote
    this.shadowRoot.getElementById("nuevo-lote-ui").show = true;
    alert("Development!!!! En construccion")
    this.hide();
  }

  cerrar_modo() {
    console.log("Cerrar Modo Campo");

    this.mapShowAllCampos()
    Router.go('/')

    this._detallesOffcanvas.hide();
  }

  // share_campo() {
  //   this.shadowRoot.getElementById("share-modal").start();
  // }

  borrar_campo() {
    if (confirm("¿Desea Eliminar el Campo?")) {
      let event = new CustomEvent("borrar-campo", {
        detail: { campo_doc: this.campo_doc },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  localizar_campo() {
    gbl_state.map.fitBounds(bbox(this.campo_doc.campo_geojson), {
      padding: { top: 50, bottom: window.innerHeight / 4 },
    });
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
          <p>Toque en un lote del mapa para ver detalles</p>

          <button
            type="button"
            class="btn btn-success btn-sm btn-anadir-lote"
            @click=${this.nuevo_lote_click}
          >
            Añadir Lote
          </button>

          <button
            class="btn btn-sm btn-danger"
            id="eliminar-campo-btn"
            @click=${this.borrar_campo}
          >
            Eliminar Campo
          </button>
        </div>
      </div>

      <share-modal id="share-modal" .campo_doc=${this.campo_doc}></share-modal>
      ${gbl_state.map
        ? html`<nueva-geometria-ui
            id="nuevo-lote-ui"
            .tipo="lote"
            .mapa=${gbl_state.map}
            ._draw=${gbl_state.draw}
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
// <!-- ${this.campo_doc?.shared
//   ? html`<p>
//       Compartido por
//       <span class="badge bg-success"
//         >${this.campo_doc.owner.name.toUpperCase()}</span
//       >
//     </p>`
//   : null} -->

// <!-- <button
// type="button"
// class="btn btn-warning"
// @click=${this.share_campo}
// >
// Compartir Campo
// </button> -->
