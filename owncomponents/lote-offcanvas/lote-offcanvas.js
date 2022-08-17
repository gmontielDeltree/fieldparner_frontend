import { LitElement, html } from "lit";
import { map } from "lit/directives/map.js";
import { aplicacionMachine } from "./lote-machine.js";
import { interpret } from "xstate";
import { mapbox_static_img } from "./mapbox_static_image.js";
import "../date-picker/date-picker.ts";
import "@vaadin/combo-box";
import "@polymer/paper-spinner/paper-spinner.js";
import { Marker, Popup } from "mapbox-gl";

import "@vaadin/menu-bar";
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
import Modal from "bootstrap/js/dist/modal.js";
import Offcanvas from "bootstrap/js/dist/offcanvas.js";
//import PouchDB from "pouchdb";
import uuid4 from "uuid4";
import moment from "moment";
import "../notas-offcanvas/notas-offcanvas.js";
import "./cosecha-add-ui.js";
import "./siembra-add-ui.ts";
import { google_maps_link_go_to } from "./google_maps.js";
import bbox from "@turf/bbox";

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

export class LoteOffcanvas extends LitElement {
  static properties = {
    campo_id: {},
    username: {},
    lote_nombre: {},
    map: {},
    _actividades: {},
    _actividades_docs: {},
    _lotesOffcanvas: {
      hasChanged(newVal, oldVal) {
        return false;
      },
    },
    _fecha_editor: {},
    _steps_elements: {
      hasChanged(newVal, oldVal) {
        return false;
      },
    },
    _ctx: {},
    _campo_doc: {},
    _lote_doc: {},
    settings: {},
    _nota_marker: {},
    db: {},
    fsm: { state: true },
    _loading_pdf: { state: true },
    _contratistas: { state: true },
  };

  static styles = null;

  show_step = (n) => {
    if (!this._steps_elements[n]._isShown) {
      this._steps_elements.map((el) => el.hide());
      this._steps_elements[n].show();
    }
  };

  constructor() {
    super();
    /**
     * Sensible default para el contexto
     */
    this._ctx = aplicacionMachine.initialState.context;

    this.addEventListener("guardar-cosecha", (e) =>
      this.guardar_aplicacion("cosecha", e.detail)
    );

    this.addEventListener("guardar-siembra", (e) =>
      this.guardar_aplicacion("siembra", e.detail)
    );

    this.addEventListener("generar-ot", (e) =>
      this.download_pdf(e.detail.uuid)
    );
    this.addEventListener("share-ot", (e) => this.share_pdf(e.detail.uuid));

    this.addEventListener("eliminar-actividad", (e) =>
      this.eliminar_actividad(e.detail)
    );

    this.addEventListener("editar-actividad", (e) =>
      this.editar_actividad(e.detail.act_doc)
    );

    this.addEventListener("guardar-edicion", async (e) => {
      let old_id = e.detail.old_id;
      let new_doc = e.detail.actividad;
      delete new_doc._rev;

      this.eliminar_actividad(old_id);

      this.guardar_aplicacion("siembra", new_doc);
    });

    this.addEventListener("eliminar-nota", (e) => {
      let nota_doc = e.detail.nota_doc;
      this.db.remove(nota_doc);
      this.reload_actividades();
    });

    this.addEventListener("nueva-nota", (e) => {
      this.reload_actividades();
      this._lotesOffcanvas.show();
    });

    this.addEventListener("cambio-estado", (e) => {
      this.db.put(e.detail.item)
      this.reload_actividades();
    })

    this.addEventListener("localizar-nota", (e) => {
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
        .addTo(this.map);

      this.map.flyTo({
        center: posicion,
        padding: { bottom: 200 },
        zoom: 15,
      });
    });
    //this._actividades = []
  }

  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this._lotesOffcanvas = new Offcanvas(
      document.getElementById("lote-offcanvas")
    );
    this._steps_elements = [
      ...document.querySelectorAll(".aplicacion.step"),
    ].map((el) => new Modal(el));
  }

  show() {
    // Reload _lote_doc
    this.reload_lote_doc_y_localizar();

    this._lotesOffcanvas.show();
    introJs()
      .setOptions({
        dontShowAgain: true,
        nextLabel: "Siguiente",
        doneLabel: "Fin",
        prevLabel: "Anterior",
        disableInteraction: false,
        steps: [
          {
            intro:
              "Es esta persiana podras ver y editar la historia de tu lote",
          },
          {
            element: document.querySelector(".btn-actividad"),
            intro: "Utiliza estos botones para agregar nuevos registros",
          },
        ],
      })
      .start();
  }

  hide() {
    this._lotesOffcanvas.hide();
    let event = new CustomEvent("lote-detalles-hide", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  siembra() {
    document.getElementById("siembra-add-el").start();
  }

  actividad() {
    this.fsm.start();
    this.fsm.send({ type: "NEXT" });
  }

  notas() {
    this._lotesOffcanvas.hide();
    document.getElementById("notas-oc").nueva_nota();
  }

  cosecha() {
    document.getElementById("cosecha-add-el").start();
  }

  abrir_pdf(params) {
    import("pdfmake/build/pdfmake.min.js").then(({ default: pdfMake }) => {
      pdfMake.fonts = pdf_fonts;
      pdfMake
        .createPdf(
          orden_definition(
            this._lote_doc.properties.actividades[0],
            this._campo_doc.nombre,
            this._lote_doc.properties.nombre
          )
        )
        .open();
    });

    this.fsm.send("CANCEL");
  }

  evento_show_ndvi(e) {
    const event = new CustomEvent("ver-ndvi-click", {
      detail: { lote: this._lote_doc },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
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

  download_pdf(uuid) {
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
        //console.log("Generando PDF");
        pdfMake.createPdf(dd).open();
        this._loading_pdf = false;
      })
      .catch(() => {
        this._loading_pdf = false;
      });
  }

  eliminar_actividad(item) {
    this.db
      .get(item._id)
      .then((doc) => {
        return this.db.remove(doc);
      })
      .then(() => {
        this.reload_actividades();
      });

    // let restantes = this._lote_doc.properties.actividades.filter(
    //   (a) => a.uuid !== uuid
    // );
    // // Re-Get Lotes y update
    // this.db.get(this.campo_id).then((doc) => {
    //   let lote_index = doc.lotes.findIndex(
    //     (lote) => lote.properties.nombre === this.lote_nombre
    //   );
    //   if (lote_index > -1) {
    //     // Cool - Existe
    //     let current_aplicaciones = restantes;

    //     // Ordenar por fecha
    //     function compare(a, b) {
    //       let ma = moment(a.detalles.fecha, "DD-MM-YYYY");
    //       let mb = moment(b.detalles.fecha, "DD-MM-YYYY");
    //       if (ma.isAfter(mb)) {
    //         return -1;
    //       }
    //       if (ma.isBefore(mb)) {
    //         return 1;
    //       }
    //       // a must be equal to b
    //       return 0;
    //     }
    //     current_aplicaciones.sort(compare);

    //     doc.lotes[lote_index].properties.actividades = current_aplicaciones;
    //     this.db.put(doc).then((r) => console.log("Actividad Eliminada"));

    //     // Recargemoslos
    //     this._campo_doc = doc;
    //     this._lote_doc = doc.lotes[lote_index];

    //     //document.getElementById('actividades-timeline').actividades = this._lote_doc.properties.actividades;
    //   }
    // });
  }

  editar_actividad(actividad) {
    if ((actividad.tipo = "siembra")) {
      console.log("EDITAR", actividad);
      document.getElementById("siembra-add-el").editar(actividad);
    }
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
      return "Cultivo Desconocido";
    }
  }

  eliminar_lote() {
    let restantes = this._campo_doc.lotes.filter(
      (lote) => lote.id !== this._lote_doc.id
    );
    this.db.get(this.campo_id).then((doc) => {
      let restantes = this._campo_doc.lotes.filter(
        (lote) => lote.id !== this._lote_doc.id
      );
      doc.lotes = restantes;
      this.db.put(doc).then((r) => console.log("Lote Eliminado"));
      this._campo_doc = doc;
      this.hide();
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
      return "Cultivo Desconocido";
    }
  }

  guardar_aplicacion(tipo, detalles_de_actividad) {
    let detalles = {};
    let aplicacion = {};
    // Save to lote properties
    let ts_ahora = new Date().toISOString();

    if (tipo === "aplicacion") {
      this.fsm.send("GUARDAR");
      detalles = {
        fecha: this._ctx.fecha,
        hectareas: this._ctx.hectareas,
        insumos: this._ctx.insumos,
        comentarios: this._ctx.comentarios,
        contratista: this._ctx.contratista,
      };
      aplicacion = {
        uuid: uuid4(),
        tipo: "aplicacion",
        ts_generacion: ts_ahora,
        detalles: detalles,
      };
    } else if (tipo === "siembra") {
      detalles = detalles_de_actividad;
      // aplicacion = {
      //   uuid: uuid4(),
      //   tipo: "siembra",
      //   ts_generacion: ts_ahora,
      //   detalles: detalles,
      // };

      this.db.put(detalles);
      this.reload_actividades();
      return;
    } else if (tipo === "cosecha") {
      detalles = detalles_de_actividad;
      aplicacion = {
        uuid: uuid4(),
        tipo: "cosecha",
        ts_generacion: ts_ahora,
        detalles: detalles,
      };
    }

    // Condiciones ambientales?

    // Re-Get Lotes y update
    this.db.get(this.campo_id).then((doc) => {
      let lote_index = doc.lotes.findIndex(
        (lote) => lote.properties.nombre === this.lote_nombre
      );
      if (lote_index > -1) {
        // Cool - Existe
        let current_aplicaciones =
          doc.lotes[lote_index].properties.actividades || [];
        current_aplicaciones.push(aplicacion);

        // Ordenar por fecha
        function compare(a, b) {
          let ma = moment(a.detalles.fecha, "YYYY-MM-DD");
          let mb = moment(b.detalles.fecha, "YYYY-MM-DD");
          if (ma.isAfter(mb)) {
            return -1;
          }
          if (ma.isBefore(mb)) {
            return 1;
          }
          // a must be equal to b
          return 0;
        }
        current_aplicaciones.sort(compare);

        doc.lotes[lote_index].properties.actividades = current_aplicaciones;
        this.db.put(doc).then((r) => console.log("Actividad Agregada"));

        // Recargemoslos
        this._campo_doc = doc;
        this._lote_doc = doc.lotes[lote_index];
        // document.getElementById('actividades-timeline').actividades = this._lote_doc.properties.actividades;
      }
    });
  }
  /**
   * Actualiza los documentos si las propiedades han cambiando.
   * @param {*} changedProperties
   */
  willUpdate(changedProperties) {
    // only need to check changed properties for an expensive computation.
    if (
      changedProperties.has("campo_id") ||
      changedProperties.has("lote_nombre")
    ) {
      this.db.get(this.campo_id).then((doc) => {
        this._campo_doc = doc;
        this._lote_doc =
          doc.lotes.filter(
            (lote) => lote.properties.nombre === this.lote_nombre
          )[0] || {};

        const someContext = aplicacionMachine.initialState.context;
        someContext.hectareas = this._lote_doc.properties.hectareas;
        this.fsm = interpret(aplicacionMachine.withContext(someContext))
          .onTransition((state) => {
            this._ctx = state.context;
            //console.log(state.value);
            if (state.matches("idle")) {
              this._steps_elements.map((el) => el.hide());
            }
            if (state.matches("editing.fecha")) {
              this.show_step(0);
            } else if (state.matches("editing.hectareas")) {
              this.show_step(1);
            } else if (state.matches("editing.insumo")) {
              this.show_step(2);
            } else if (state.matches("editing.dosis")) {
              this.show_step(3);
            } else if (state.matches("editing.motivo")) {
              this.show_step(4);
            } else if (state.matches("editing.masinsumos")) {
              this.show_step(5);
            } else if (state.matches("editing.comentario")) {
              this.show_step(6);
            } else if (state.matches("editing.resumiendo")) {
              this.show_step(7);
            } else if (state.matches("editing.share")) {
              this.show_step(8);
            }
          })
          .start();

        this.reload_actividades();

        // document.getElementById('actividades-timeline').actividades = this._lote_doc.properties.actividades;
      });
    }
  }

  reload_lote_doc_y_localizar() {
    this.db.get(this.campo_id).then((doc) => {
      this._campo_doc = doc;
      this._lote_doc =
        doc.lotes.filter(
          (lote) => lote.properties.nombre === this.lote_nombre
        )[0] || {};

      this.localizar_lote();
      this.reload_actividades();
    });

    this.db.get("contratistas").then((result) => {
      console.log("Contratistas", result);
      this._contratistas = result;
    });
  }

  reload_actividades() {
    this.db
      .allDocs({
        include_docs: true,
        attachments: true,
        binary: true,
        startkey: "actividad:nota:" + this._lote_doc.id,
        endkey: "actividad:nota:" + this._lote_doc.id + "\ufff0",
      })
      .then((result) => {
        let rrows = result.rows;
        //console.log("Actividad con Attachments", rrows);
        this._actividades = [...rrows];
      });

    this.db
      .allDocs({
        include_docs: true,
        //descending:true,
        startkey: "actividad:",
        endkey: "actividad:\ufff0",
      })
      .then((e) => {
        let acts = e.rows.map((r) => r.doc);
        let s = acts.filter(
          ({ lote_uuid }) => lote_uuid === this._lote_doc.properties.uuid
        );

        this._actividades_docs = s.reverse();
      });
  }

  localizar_lote() {
    console.log("LOCALIZAR", this._lote_doc);
    this.map.fitBounds(bbox(this._lote_doc), {
      padding: { top: 50, bottom: window.innerHeight / 2 },
    });
  }

  menu_click({ detail }) {
    let valor = detail.value.value;
    if (valor === "siembra") {
      this.siembra();
    } else if (valor === "cosecha") {
      this.cosecha();
    } else if (valor === "aplicacion") {
      this.actividad();
    } else if (valor === "eliminar") {
      this.eliminar_lote();
    } else if (valor === "ndvi") {
      this.evento_show_ndvi();
    } else if (valor === "notas") {
      this.notas();
    }
  }
  render() {
    //console.log("RENDER LOTE OFFCANVAS");

    const resumen_item_el = (item) => html`<a
      href="#"
      class="list-group-item list-group-item-action"
    >
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${capitalize(item.name)}</h5>
        <small class="text-muted">${capitalize(item.type)}</small>
      </div>
      <p class="mb-1">
        ${item.dosis} ${item.unidad} - ${item.hectareas} ha. -
        ${item.total.toFixed(2)} ${item.unidad === "lt/ha" ? "litros" : "kgs"}
        totales
      </p>
      <div class="d-flex w-100 justify-content-between">
        <small class="text-muted">${motivos_2_str(item.motivos)}</small>
        <div
          class="btn-group"
          role="group"
          aria-label="Basic mixed styles example"
        >
          <!-- <button type="button" class="btn btn-danger">Eliminar</button> -->
        </div>
      </div>
    </a>`;

    const insumo_el = (item) => html`<a
      href="#"
      class="list-group-item list-group-item-action ${this._ctx.current_insumo
        .name === item.name
        ? "active"
        : ""}"
      @click=${(e) =>
        this.fsm.send({
          type: "SELECTED",
          value: item,
        })}
      aria-current="true"
    >
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1 mx-1">${capitalize(item.name)}</h5>
        <small>${capitalize(item.type)}</small>
      </div>
      <p class="mb-1">${capitalize(item.company)}</p>
      <small>${principio_activo(item)}</small>
    </a>`;

    // Render propiamente dicho
    return html`
      <div
        class="offcanvas offcanvas-bottom h-50"
        tabindex="-1"
        id="lote-offcanvas"
        aria-labelledby="offcanvasBottomLabel"
        data-bs-scroll="true"
        data-bs-backdrop="false"
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
            @click=${this.hide}
          ></button>
        </div>
        <div class="offcanvas-body small pt-1">
          ${this._loading_pdf
            ? html` <div
                class="d-flex justify-content-center align-items-center"
                style="width: 100%;height: 100%;position: absolute;background:#fffc;z-index: 9;"
              >
                <paper-spinner active></paper-spinner>
                <span>Preparando PDF</span>
              </div>`
            : null}
          <div class="btn-toolbar shadow px-0" role="toolbar">
            <vaadin-menu-bar
              theme="small"
              class="d-block d-md-none"
              .items="${[
                {
                  text: "Más Acciones",
                  children: [
                    { text: "Notas", value: "notas" },
                    { text: "Siembra", value: "siembra" },
                    { text: "Aplicación", value: "aplicacion" },
                    { text: "Cosecha", value: "cosecha" },
                    { text: "NDVI", value: "ndvi" },
                    { text: "Eliminar", value: "eliminar" },
                  ],
                },
              ]}"
              @item-selected=${this.menu_click}
              class="ms-1"
            ></vaadin-menu-bar>

            <div class="btn-group me-2" role="group" aria-label="Zero group">
              <button
                class="btn btn-danger btn-sm d-none d-md-block"
                @click=${this.eliminar_lote}
              >
                Eliminar Lote
              </button>
            </div>
            <div class="btn-group d-none d-md-block" role="group" aria-label="First group">
              <button
                class="btn btn-primary btn-sm btn-actividad"
                @click=${this.siembra}
              >
                + Siembra
              </button>
              <button
                class="btn btn-primary btn-sm btn-actividad"
                @click=${this.actividad}
              >
                + Aplicación
              </button>
              <button
                class="btn btn-primary btn-sm btn-actividad"
                @click=${this.cosecha}
              >
                + Cosecha
              </button>
              <button
                class="btn btn-primary btn-sm btn-actividad"
                @click=${this.notas}
              >
                + Notas
              </button>
            </div>
            <div class="btn-group me-2 d-none d-md-block" role="group" aria-label="Second group">
              <button
                class="btn btn-primary btn-sm"
                @click=${this.evento_show_ndvi}
              >
                NDVI
              </button>
            </div>
          </div>
          <div class="row">
            <div class="col shadow mx-2 p-3 max-vh-25">
              <lit-timeline
                .db=${this.db}
                .actividades_docs=${this._actividades}
                .actividades=${this._lote_doc?.properties.actividades}
                .a=${this._actividades_docs}
                id="actividades-timeline"
              ></lit-timeline>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en fecha state -->
      <div
        class="modal fade aplicacion step"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                ¿Cuando se realizará la aplicación?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <date-picker
                @change=${(e) => {
                  this.fsm.send({
                    type: "CHANGE",
                    value: e.target.fecha,
                  });
                }}
              ></date-picker>

              <vaadin-combo-box
                allow-custom-value
                @custom-value-set="${() => {
                  console.log("Nuevo Value");
                }}"
                label="Contratista"
                item-label-path="nombre"
                item-value-path="uuid"
                .items="${this._contratistas
                  ? Object.values(this._contratistas?.contratistas)
                  : []}"
                @selected-item-changed=${(e) => {
                  console.log("e", e);
                  this.fsm.send({
                    type: "ASSIGN_CONTRATISTA",
                    value: e.detail.value,
                  });
                }}
              ></vaadin-combo-box>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this.fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("NEXT")}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en hectareas state -->
      <div
        class="modal fade aplicacion step"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                ¿Sobre cuantas hectáreas se realizará la aplicación?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <input
                type="number"
                value=${this._ctx.hectareas}
                @change=${(e) =>
                  this.fsm.send({ type: "CHANGE", value: e.target.value })}
              />
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this.fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("BACK")}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("NEXT")}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Insumo state -->
      <div
        class="modal fade aplicacion step"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div
          class="modal-dialog modal-dialog-scrollable modal-fullscreen-md-down"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                Seleccione un insumo
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto container-fluid">
              <div class="row">
                <input
                  class="form-control"
                  type="text"
                  placeholder="Escriba el nombre del insumo para filtrar"
                  @keyup=${(e) =>
                    this.fsm.send({ type: "CHANGE", value: e.target.value })}
                />
              </div>
              <div class="list-group mx-auto mt-1 row">
                ${map(this._ctx.filtrado, insumo_el)}
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this.fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("BACK")}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("NEXT")}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Dosis state -->
      <div
        class="modal fade aplicacion step"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                ¿Cual es la Dosis?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <h4>${capitalize(this._ctx.current_insumo.name)}</h4>
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  @change=${(e) =>
                    this.fsm.send({ type: "CHANGE", value: e.target.value })}
                  aria-label="Text input with dropdown button"
                />
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  ${this._ctx.unidad}
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#">kg/ha</a></li>
                  <li><a class="dropdown-item" href="#">lt/ha</a></li>
                </ul>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this.fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("BACK")}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("NEXT")}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Motivo state -->
      <div
        class="modal fade aplicacion step"
        id="lote-hectareas-editor"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                ¿Cual es el motivo de la aplicación?
              </h5>

              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value=""
                  @change=${(e) => {
                    this.fsm.send({
                      type: "TICK",
                      value: e.target.checked,
                      name: e.target.name,
                    });
                  }}
                  name="Enfermedad"
                />
                <label class="form-check-label" for="flexCheckDefault">
                  Enfermedad
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value=""
                  name="Plaga"
                  @change=${(e) => {
                    this.fsm.send({
                      type: "TICK",
                      value: e.target.checked,
                      name: e.target.name,
                    });
                  }}
                />
                <label class="form-check-label" for="flexCheckDefault">
                  Plaga
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value=""
                  name="Malezas"
                  @change=${(e) => {
                    this.fsm.send({
                      type: "TICK",
                      value: e.target.checked,
                      name: e.target.name,
                    });
                  }}
                />
                <label class="form-check-label" for="flexCheckDefault">
                  Malezas
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value=""
                  name="Otro"
                  @change=${(e) => {
                    this.fsm.send({
                      type: "TICK",
                      value: e.target.checked,
                      name: e.target.name,
                    });
                  }}
                />
                <label class="form-check-label" for="flexCheckDefault">
                  Otro
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this.fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("BACK")}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("NEXT")}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en MasInsumos state -->
      <div
        class="modal fade aplicacion step"
        id="lote-hectareas-editor"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                ¿Deseas agregar otro insumo?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <button
                type="button"
                class="btn btn-success btn-lg"
                @click=${() => this.fsm.send("SI")}
              >
                SI
              </button>
              <button
                type="button"
                class="btn btn-danger btn-lg"
                @click=${() => this.fsm.send("NO")}
              >
                NO
              </button>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this.fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("BACK")}
              >
                Atras
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Comentarios state -->
      <div
        class="modal fade aplicacion step"
        id="lote-hectareas-editor"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                ¿Tienes algún comentario adicional?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto w-100">
              <h5></h5>

              <textarea
                class="w-100"
                id="story"
                placeholder="Ingresa alguna nota aquí"
                name="story"
                rows="5"
                .value=${this._ctx.comentarios}
                @change=${(e) =>
                  this.fsm.send({ type: "CHANGE", value: e.target.value })}
              ></textarea>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this.fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("BACK")}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("NEXT")}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Resumen state -->
      <div
        class="modal fade aplicacion step"
        id="lote-hectareas-editor"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen-md-down">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">Resumen</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body">
              <div class="container-fluid shadow py-2">
                <div class="row">
                  <div class="col">
                    <h5>
                      Aplicación en "${this.lote_nombre}" -
                      "${this._campo_doc?.nombre}"
                    </h5>
                    <div>
                      <div class="row">
                        <div class="col">
                          <h6>Fecha de aplicación: ${this._ctx.fecha}</h6>
                        </div>
                        <!-- <button class='col col-2'> Edit </button> -->
                      </div>
                      <div class="row">
                        <h5>${this.tiene_cultivo_este_lote()}</h5>
                      </div>
                      <div class="row list-group">
                        ${map(this._ctx.insumos, resumen_item_el)}
                      </div>
                      <div class="row mt-2">
                        <h6>Comentarios</h6>
                        <textarea
                          class="form-control"
                          aria-label="With textarea"
                          .value=${this._ctx.comentarios}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this.fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("BACK")}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.guardar_aplicacion("aplicacion")}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Sharing state -->
      <div
        class="modal fade aplicacion step"
        id="lote-hectareas-editor"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">
                ¿Quieres compartir la Orden de Trabajo para esta aplicación?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="btn-group-vertical col">
                <button
                  type="button"
                  class="btn btn-dark"
                  @click=${() => this.abrir_pdf()}
                >
                  Solo Descargar un PDF
                </button>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this.fsm.send("CANCEL")}
              >
                No Generar Nada por Ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      <cosecha-add-ui
        id="cosecha-add-el"
        .contratistas=${this._contratistas}
        ._lote_doc=${this._lote_doc}
        .settings=${this.settings}
      ></cosecha-add-ui>

      <siembra-add-ui
        id="siembra-add-el"
        .db=${this.db}
        .contratistas=${this._contratistas}
        ._lote_doc=${this._lote_doc}
        .settings=${this.settings}
      ></siembra-add-ui>

      <notas-oc
        id="notas-oc"
        .map=${this.map}
        .db=${this.db}
        .lote_doc=${this._lote_doc}
      ></notas-oc>
      <!-- <nueva-geometria-ui id='nueva-geometria-el'></nueva-geometria-ui> -->
    `;
  }
}

customElements.define("lote-offcanvas", LoteOffcanvas);
