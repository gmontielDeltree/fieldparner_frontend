import { LitElement, html, unsafeCSS, css } from "lit";
import { map } from "lit/directives/map.js";
import { Router } from "@vaadin/router";
import { StateController } from "@lit-app/state";
import gbl_state from "../state.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { interpret } from "xstate";
import { mapbox_static_img } from "./mapbox_static_image.js";
import "../date-picker/date-picker.ts";
import "@vaadin/combo-box";
import "@polymer/paper-spinner/paper-spinner.js";
import mapboxgl, { Marker, Popup } from "mapbox-gl";
import { property, state } from "lit/decorators.js";
import { format, isWithinInterval } from "date-fns";
import parseISO from "date-fns/parseISO";
import "@vaadin/menu-bar";
import { gblStateLoaded } from "../state.js";
import "@vaadin/scroller";
import "@vaadin/vertical-layout";
// import * as pdfFonts from "pdfmake/build/vfs_fonts.js";
// import pdfMake from "pdfmake/build/pdfmake.min.js";

const pdf_fonts = {
  // download default Roboto font from cdnjs.com
  Roboto: {
    normal:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
    italics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

import orden_definition from "./orden_definition.js";
import "./timeline/timeline.ts";
import "./timeline/timeline-side.ts";
import Modal from "bootstrap/js/dist/modal.js";
import Offcanvas from "bootstrap/js/dist/offcanvas.js";
//import PouchDB from "pouchdb";
import uuid4 from "uuid4";
import moment from "moment";
import "../notas-offcanvas/notas-offcanvas.ts";
import "./cosecha-add-ui.ts";
import "./siembra-add-ui.ts";
import { google_maps_link_go_to } from "./google_maps.js";
import bbox from "@turf/bbox";
import { Insumo } from "../insumos/insumos-types";
import {
  Actividad,
  DetallesAplicacion,
  Ejecucion,
  LineaDosis,
} from "../depositos/depositos-types";
import { init } from "xstate/lib/actionTypes";
import "@vaadin/tooltip";
import { informe_diferencias_definition } from "./informe_comparacion_pdf.js";
import { translate } from "lit-translate";
import {
  gbl_docs_starting,
  only_docs,
  actividades_y_ejecuciones,
} from "../helpers";

const capitalize = (mySentence) => {
  if (mySentence === null || mySentence === undefined) {
    return "";
  } else {
    return mySentence.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter.toUpperCase()
    );
  }
};

const principio_activo = (item) => {
  let components = item.components;
  if (components.length === 0) {
    return "Principio Activo Desconocido";
  }
  let principio_activos = components
    .filter((c) => c.active_principle)
    .map((c) => c.name);
  let enmayusculas = principio_activos.map((e) => e.toUpperCase()).slice(0, 3);
  let r = enmayusculas.join();
  if (principio_activos.length > 4) {
    return r + "...";
  } else {
    return r;
  }
};

const motivos_2_str = (motivos) => {
  let motivos_array = Object.keys(motivos);
  let solo_verdaderos = motivos_array.filter((m) => motivos[m]);

  return solo_verdaderos.join(", ");
};

export class LoteOffcanvasSide extends LitElement {
  static override styles = [
    unsafeCSS(bootstrap)
  ];

  bindState = new StateController(this, gbl_state);

  @state()
  _insumos: Insumo[];

  @state()
  _ctx: Actividad;

  @state({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  _steps_elements: Modal[];

  @state()
  _loading_pdf: boolean;

  @state()
  _contratistas: any;

  @state()
  campo_id: string = "";

  @state()
  lote_nombre: string = "";

  @property()
  settings: any;

  @state()
  _actividades: any;

  @state()
  _actividades_ejecuciones_docs: any;

  @state({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  _lotesOffcanvas: Offcanvas;

  // _fecha_editor: {},

  @state()
  _campo_doc: any;

  @state()
  _lote_doc: any;

  @state()
  _nota_marker: any;

  @state()
  fsm: any;

  @state()
  _current_dosis: LineaDosis;

  @state()
  data_loaded: boolean = false;

  constructor() {
    super();
    /**
     * Sensible default para el contexto
     */

    this.addEventListener("refrescar-actividades", (e: CustomEvent) =>
      this.reload_actividades()
    );

    this.addEventListener("generar-ot", (e: CustomEvent) =>
      this.download_pdf(e.detail)
    );

    this.addEventListener("generar-informe-diferencia-pdf", (e: CustomEvent) =>
      this.informe_comparacion_pdf(e.detail)
    );

    this.addEventListener("share-ot", (e: CustomEvent) =>
      this.share_pdf(e.detail)
    );

    this.addEventListener("eliminar-actividad", (e: CustomEvent) =>
      this.eliminar_actividad(e.detail._id)
    );

    this.addEventListener("eliminar-nota", (e: CustomEvent) => {
      let nota_doc = e.detail.nota_doc;
      gbl_state.db.remove(nota_doc);
      this.reload_actividades();
    });

    this.addEventListener("nueva-nota", (e: CustomEvent) => {
      this.reload_actividades();
      this._lotesOffcanvas.show();
    });

    this.addEventListener("localizar-nota", (e: CustomEvent) => {
      let posicion = e.detail.item.posicion;
      let texto = e.detail.item.texto;
      let color = e.detail.item.color;
      //console.log("loacalizar nota", e);
      if (this._nota_marker !== undefined) {
        this._nota_marker.remove();
      }
      this._nota_marker = new Marker({
        color: color,
      })
        .setPopup(new Popup().setHTML(`<h4>${texto}</h4>`))
        .setLngLat(posicion)
        .addTo(gbl_state.map);

      gbl_state.map.flyTo({
        center: posicion,
        padding: { left: 500, bottom: 200 },
        zoom: 15,
      });
    });
    //this._actividades = []
  }

  firstUpdated() {
    this._lotesOffcanvas = new Offcanvas(
      this.shadowRoot.getElementById("lote-offcanvas-side")
    );
  }

  show() {
    // Reload _lote_doc
    this.reload_lote_doc_y_localizar();

    this._lotesOffcanvas.show();

    // introJs()
    //   .setOptions({
    //     dontShowAgain: true,
    //     nextLabel: "Siguiente",
    //     doneLabel: "Fin",
    //     prevLabel: "Anterior",
    //     disableInteraction: false,
    //     steps: [
    //       {
    //         intro:
    //           "Es esta persiana podras ver y editar la historia de tu lote",
    //       },
    //       {
    //         element: this.shadowRoot.querySelector(".btn-actividad"),
    //         intro: "Utiliza estos botones para agregar nuevos registros",
    //       },
    //     ],
    //   })
    //   .start();
  }

  cerrar() {
    gbl_state.map.hideAllLayers();
    gbl_state.map.showAllCampos();

    this._lotesOffcanvas.hide();
    Router.go("/");

    // let event = new CustomEvent("lote-detalles-hide", {
    //   bubbles: true,
    //   composed: true,
    // });
    // this.dispatchEvent(event);
  }

  notas() {
    this._lotesOffcanvas.hide();
    this.shadowRoot.getElementById("notas-oc").nueva_nota();
  }

  abrir_pdf(params) {
    // import("pdfmake/build/pdfmake.min.js").then(({ default: pdfMake }) => {
    //   pdfMake.fonts = pdf_fonts;
    //   pdfMake
    //     .createPdf(
    //       orden_definition(
    //         this._lote_doc.properties.actividades[0],
    //         this._campo_doc.nombre,
    //         this._lote_doc.properties.nombre
    //       )
    //     )
    //     .open();
    // });
    // this.fsm?.send("CANCEL");
  }

  evento_show_ndvi() {
    Router.go("/indices/" + this._lote_doc.id);
    this._lotesOffcanvas.hide();
  }

  share_pdf(uuid) {
    let campos_url = mapbox_static_img(this._campo_doc, this._lote_doc);

    let google_map_link = google_maps_link_go_to(this._lote_doc);

    let indice = this._lote_doc.properties.actividades.findIndex(
      (a) => a.uuid === uuid
    );
    // docDefinition
    let dd = orden_definition(
      this._lote_doc.properties.actividades[indice],
      this._campo_doc.nombre,
      this._lote_doc.properties.nombre,
      campos_url,
      google_map_link
    );
    //console.log("DD", JSON.stringify(dd));
    // Loading
    this._loading_pdf = true;

    import("pdfmake/build/pdfmake.min.js")
      .then(({ default: pdfMake }) => {
        pdfMake.fonts = pdf_fonts;

        if (navigator.share) {
          //console.log("Compartiendo PDF");
          const pdfDocGenerator = pdfMake.createPdf(dd);
          pdfDocGenerator.getBlob((blob) => {
            const files = [
              new File([blob], "orden_de_trabajo.pdf", { type: blob.type }),
            ];
            navigator.share({
              files: files,
              title: "Orden de Trabajo",
              text: "Lote " + this._lote_doc.nombre,
            });
            this._loading_pdf = false;
          });
        }
      })
      .catch(() => {
        this._loading_pdf = false;
      });
  }

  download_pdf(actividad: Actividad) {
    let campos_url = mapbox_static_img(this._campo_doc, this._lote_doc);

    let google_map_link = google_maps_link_go_to(this._lote_doc);

    // let indice = this._lote_doc.properties.actividades.findIndex(
    //  (a) => a.uuid === uuid
    /// );
    // docDefinition
    console.log("GENERANDO PDF", actividad);
    let dd = orden_definition(
      actividad,
      this._campo_doc.nombre,
      this._lote_doc.properties.nombre,
      campos_url,
      google_map_link
    );
    //console.log("DD", JSON.stringify(dd));
    // Loading
    this._loading_pdf = true;

    import("pdfmake/build/pdfmake.min.js")
      .then(({ default: pdfMake }) => {
        pdfMake.fonts = pdf_fonts;
        //console.log("Generando PDF");
        pdfMake.createPdf(dd).open();
        this._loading_pdf = false;
      })
      .catch(() => {
        this._loading_pdf = false;
      });
  }

  informe_comparacion_pdf({ actividad, ejecucion }) {
    console.log("GENERANDO PDF", actividad);
    let dd = informe_diferencias_definition(
      actividad,
      ejecucion,
      this._campo_doc.nombre,
      this._lote_doc.properties.nombre
    );
    //console.log("DD", JSON.stringify(dd));
    // Loading
    this._loading_pdf = true;

    import("pdfmake/build/pdfmake.min.js")
      .then(({ default: pdfMake }) => {
        pdfMake.fonts = pdf_fonts;
        //console.log("Generando PDF");
        pdfMake.createPdf(dd).open();
        this._loading_pdf = false;
      })
      .catch(() => {
        this._loading_pdf = false;
      });
  }

  eliminar_actividad(actividad_id) {
    gbl_state.db
      .get(actividad_id)
      .then((doc) => {
        return gbl_state.db.remove(doc);
      })
      .then(() => {
        this.reload_actividades();
      });
  }

  tiene_cultivo_este_lote() {
    /**
     * Es un array que contiene todas las actividades historicas en el lote
     */
    let actividades = this._lote_doc?.properties.actividades || [];

    // Filtrar Cosechas
    let cosechas = actividades.findIndex((a) => a.tipo === "cosechas");

    // Filtrar Siembras
    let siembras = actividades.findIndex((a) => a.tipo === "siembra");

    if (siembras > -1) {
      if (cosechas > -1) {
        if (siembras < cosechas) {
          // Ultima evento es siembra
          return actividades[siembras].detalles.cultivo;
        } else {
          return "Barbecho";
        }
      } else {
        // No hay cosechas
        return actividades[siembras].detalles.cultivo;
      }
    } else {
      return ""; // No Pongo nada si no se nada
    }
  }

  eliminar_lote() {
    let restantes = this._campo_doc.lotes.filter(
      (lote) => lote.id !== this._lote_doc.id
    );
    gbl_state.db.get(this.campo_id).then((doc) => {
      let restantes = this._campo_doc.lotes.filter(
        (lote) => lote.id !== this._lote_doc.id
      );
      doc.lotes = restantes;
      gbl_state.db.put(doc).then((r) => console.log("Lote Eliminado"));
      this._campo_doc = doc;
      this.cerrar();
    });
  }

  ultima_siembra() {
    let actividades = this._lote_doc?.properties.actividades || [];
    let ultima_siembra = actividades.filter((a) => a.tipo === "siembra");
    if (ultima_siembra.length) {
      return (
        ultima_siembra[0].detalles.cultivo +
        " - " +
        ultima_siembra[0].detalles.variedad
      );
    } else {
      return ""; // No Pongo nada si no se nada
    }
  }

  /**
   * Actualiza los documentos si las propiedades han cambiando.
   * @param {*} changedProperties
   */
  willUpdate(changedProperties) {
    // only need to check changed properties for an expensive computation.

    console.count("LoteOffcanvas willUpdate");
    if (!this.data_loaded && gblStateLoaded()) {
      console.log("Data No Loaded y estado loaded");
      console.count("NoDataLoaded");

      this.data_loaded = true;

      let params = gbl_state.router.location.params;

      this.campo_id = decodeURIComponent(params.uuid_campo);
      this.lote_nombre = decodeURIComponent(params.uuid_lote);

      gbl_state.db.get(this.campo_id).then((doc) => {
        this._campo_doc = doc;
        this._lote_doc =
          doc.lotes.filter(
            (lote) => lote.properties.nombre === this.lote_nombre
          )[0] || {};

        this.reload_lote_doc_y_localizar();
        this.reload_actividades();
        this._lotesOffcanvas.show();
      });
    }
  }

  reload_lote_doc_y_localizar() {
    gbl_state.db.get(this.campo_id).then((doc) => {
      this._campo_doc = doc;
      this._lote_doc =
        doc.lotes.filter(
          (lote) => lote.properties.nombre === this.lote_nombre
        )[0] || {};

      this.localizar_lote();
    });
  }

  filtro_esta_temporada = (actividades: Actividad[]) => {
    let inicio = parseISO(gbl_state.campana_seleccionada.inicio);
    let fin = parseISO(gbl_state.campana_seleccionada.fin);
    let deesta = actividades.filter((act) => {
      let fecha_str =
        act.tipo === "nota"
          ? act.fecha
          : act.detalles.fecha_ejecucion_tentativa;
      let fecha = parseISO(fecha_str);
      return isWithinInterval(fecha, { start: inicio, end: fin });
    });
    return deesta;
  };

  reload_actividades() {
    actividades_y_ejecuciones(this._lote_doc.properties.uuid).then((res) => {
      this._actividades_ejecuciones_docs = res;
      console.log("RESSSS", res);
    });
    // gbl_docs_starting("actividad",true,true,true).then(only_docs)
    // .then((acts : Actividad[]) => {
    //     let s = acts.filter(
    //       ({ lote_uuid }) => lote_uuid === this._lote_doc.properties.uuid
    //     );
    //     this._actividades_docs = this.filtro_esta_temporada(s.reverse());
    //   });
  }

  localizar_lote() {
    console.log("LOCALIZAR", this._lote_doc);
    gbl_state.map.fitBounds(bbox(this._lote_doc), {
      padding: { top: 50, bottom: window.innerHeight / 2, left: 800 },
    });
  }

  menu_click({ detail }) {
    let valor = detail.value.value;
    if (valor === "siembra") {
      //this.siembra();
      Router.go(
        gbl_state.router.location.getUrl() + "/actividad/nueva/siembra"
      );
    } else if (valor === "cosecha") {
      Router.go(
        gbl_state.router.location.getUrl() + "/actividad/nueva/cosecha"
      );
      //      this.cosecha();
    } else if (valor === "aplicacion") {
      Router.go(
        gbl_state.router.location.getUrl() + "/actividad/nueva/aplicacion"
      );
      //      this.nueva_actividad();
    } else if (valor === "eliminar") {
      this.eliminar_lote();
    } else if (valor === "ndvi") {
      this.evento_show_ndvi();
    } else if (valor === "notas") {
      this.notas();
    }
  }

  render() {
    // Render propiamente dicho
    return html`
      <div
        class="offcanvas offcanvas-start show"
        tabindex="-1"
        id="lote-offcanvas-side"
        aria-labelledby="offcanvasBottomLabel"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        style="--bs-offcanvas-width: 800px;--bs-offcanvas-zindex: 500;"
      >
        <div class="offcanvas-header py-2">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click=${this.localizar_lote}
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

          <h6 class="offcanvas-title fw-bold">
            Lote "${this.lote_nombre}"
            <small class="text-muted"
              >${this.ultima_siembra().toUpperCase()}</small
            >
          </h6>

          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            @click=${this.cerrar}
          ></button>
        </div>
        <div class="offcanvas-body small pt-1 px-1">
          ${this._loading_pdf
            ? html` <div
                class="d-flex justify-content-center align-items-center"
                style="width: 100%;height: 100%;position: absolute;background:#fffc;z-index: 9;"
              >
                <paper-spinner active></paper-spinner>
                <span>Preparando PDF</span>
              </div>`
            : null}
          <div class="btn-toolbar shadow py-1" role="toolbar">
            <vaadin-menu-bar
              theme="small"
              class="d-block d-md-none"
              .items="${[
                {
                  text: "Más Acciones",
                  children: [
                    { text: "Notas", value: "notas" },
                    { text: "Planificar Siembra", value: "siembra" },
                    { text: "Planificar Aplicación", value: "aplicacion" },
                    { text: "Planificar Cosecha", value: "cosecha" },
                    { text: "NDVI", value: "ndvi" },
                    { text: "Eliminar Lote", value: "eliminar" },
                  ],
                },
              ]}"
              @item-selected=${this.menu_click}
              class="ms-1"
            ></vaadin-menu-bar>

            <div class="d-none d-md-block w-50">
              <div
                class="container-fluid row btn-group"
                role="group"
                style="height:32px;"
                aria-label="First group"
              >
                <div
                  class="col col-2"
                  style="cursor: pointer;background-image: url('/sembradora_act.webp');background-size: contain; background-repeat: no-repeat; background-position: center;"
                  @click=${() =>
                    Router.go(
                      gbl_state.router.location.getUrl() +
                        "/actividad/nueva/siembra"
                    )}
                  title="${translate("planificar_siembra")}"
                ></div>

                <div
                  title="${translate("planificar_aplicacion")}"
                  class="col col-2"
                  style="cursor: pointer;background-image: url('/pulverizadora_act.webp');background-size: contain; background-repeat: no-repeat;background-position: center;"
                  @click=${() =>
                    Router.go(
                      gbl_state.router.location.getUrl() +
                        "/actividad/nueva/aplicacion"
                    )}
                ></div>

                <div
                  title="${translate("planificar_cosecha")}"
                  class="col col-2"
                  style="cursor: pointer;background-image: url('/cosechadora_act.webp');background-size: contain; background-repeat: no-repeat;background-position: center;"
                  @click=${() =>
                    Router.go(
                      gbl_state.router.location.getUrl() +
                        "/actividad/nueva/cosecha"
                    )}
                ></div>

                <div
                  title="Notas"
                  class="col col-2"
                  style="cursor: pointer;background-image: url('/iconodenotas_act.webp');background-size: contain; background-repeat: no-repeat;background-position: center;"
                  @click=${this.notas}
                ></div>

                <div
                  title="Imagenes Satelitales"
                  class="col col-2"
                  style="cursor: pointer;background-image: url('/iconosatelite.webp');background-size: contain; background-repeat: no-repeat;background-position: center;"
                  @click=${this.evento_show_ndvi}
                ></div>
              </div>
            </div>
          </div>

          <vaadin-scroller
            class="py-1"
            scroll-direction="vertical"
            style="height: 90%;"
          >
            <lit-timeline-side
              .db=${gbl_state.db}
              .a=${this._actividades_ejecuciones_docs}
              id="actividades-timeline"
              @gallery-open=${() => this._lotesOffcanvas.hide()}
              @gallery-closed=${() => this._lotesOffcanvas.show()}
            ></lit-timeline-side>
          </vaadin-scroller>
        </div>
      </div>

      <notas-oc
        id="notas-oc"
        .map=${gbl_state.map}
        .db=${gbl_state.db}
        .lote_doc=${this._lote_doc}
      ></notas-oc>
    `;
  }
}

// .actividades_docs=${this._actividades}
// .actividades=${this._lote_doc?.properties.actividades}

customElements.define("lote-offcanvas-side", LoteOffcanvasSide);
