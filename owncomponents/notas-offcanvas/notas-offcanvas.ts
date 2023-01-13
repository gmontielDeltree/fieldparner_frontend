import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import "@vaadin/date-picker";
import "@vaadin/radio-group";
import "@vaadin/combo-box";
import { uuid4 } from "uuid4";
import { LngLat, Map, Marker } from "mapbox-gl";
import { format, parse, isBefore, parseISO } from "date-fns";
import "@vaadin/text-area";
import { touchEvent } from "../helpers";
import "../audiorecorder/index.js";

import Offcanvas from "bootstrap/js/dist/offcanvas.js";
import { property } from "lit/decorators.js";
import formatISO from "date-fns/formatISO";
import centroid from "@turf/centroid";
import { base_i18n } from "../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import { motivos_items } from "../jsons/motivos_items";
import { translate } from "lit-translate";
import { gbl_state } from "../state";
import "../image-gallery/images-gallery";

export class NotasOffcanvas extends LitElement {
  @property()
  lote_doc: any;

  @property()
  mostrar: Boolean;

  /* Internos */

  private nueva_nota_offcanvas: Offcanvas;

  @property()
  imagenes: any;

  @property({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  ver_nota_offcanvas: boolean;

  @property()
  handler_id: any;

  @property()
  posicion: any;

  @property()
  fecha: any;

  @property()
  texto: string;

  @property()
  color: any;

  @property()
  audio: any;

  @property()
  nota_marker: Marker;

  @property()
  modo_geolocalizacion: any;

  @property()
  db: PouchDB.Database;

  @property()
  map: Map;

  @property()
  proxima_fecha;

  @property()
  motivos_nota: any[];

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
    this.imagenes = [];
    this.texto = "sssss";
    this.fecha = new Date().toISOString().split("T")[0];
    this.color = "red";
    this.modo_geolocalizacion = "mapa";
    this.motivos_nota = [];
  }

  firstUpdated() {
    this.nueva_nota_offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-nueva-nota")
    );

    if (this.mostrar) {
      this.nueva_nota();
    }
  }

  hide() {
    this.nueva_nota_offcanvas.hide();

    this.map.off(touchEvent, this.mover_marcador);

    let event = new CustomEvent("nueva-nota", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    let event_fin = new CustomEvent("nueva-nota-finalizada", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event_fin);

    // this.inicializar_componente();
  }

  posicion_error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  nueva_nota() {
    this.inicializar_componente();
    this.nueva_nota_offcanvas.show();

    // this.handler_id = navigator.geolocation.watchPosition(
    //   (pos) => {
    //     this.posicion = pos;
    //     this.nota_marker.setLngLat([pos.coords.longitude, pos.coords.latitude]);
    //     this.map.flyTo({
    //       center: [pos.coords.longitude, pos.coords.latitude],
    //       padding: { bottom: 200 },
    //       zoom: 15,
    //     });
    //   },
    //   this.posicion_error,
    //   { enableHighAccuracy: true }
    // );
  }

  ver_nota() {
    this.ver_nota_offcanvas.show();
  }

  anadir_foto_click() {
    this.shadowRoot.getElementById("foto-upload-input").click();
  }

  nueva_imagen_anadida(e) {
    const file = e.target.files[0];

    if (file.type.startsWith("image/")) {
      this.imagenes.push(file);
      this.imagenes = [...this.imagenes];
    }
  }

  mover_marcador = (e) => {
    this.nota_marker.setLngLat(e.lngLat as LngLat);
    this.posicion = {
      coords: { longitude: e.lngLat.lng, latitude: e.lngLat.lat },
    };
  };

  cambio_geo_modo(e) {
    this.modo_geolocalizacion = e.target.value;
    console.log("Cambio Radio", e, this.modo_geolocalizacion);

    if (this.modo_geolocalizacion === "dispositivo") {
      this.map.off(touchEvent, this.mover_marcador);
      this.handler_id = navigator.geolocation.watchPosition(
        (pos) => {
          this.posicion = pos;
          this.nota_marker.setLngLat([
            pos.coords.longitude,
            pos.coords.latitude,
          ]);
          this.map.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            padding: { bottom: 200 },
            zoom: 15,
          });
        },
        this.posicion_error,
        { enableHighAccuracy: true }
      );
    } else if (this.modo_geolocalizacion === "mapa") {
      this.map.on(touchEvent, this.mover_marcador);
      navigator.geolocation.clearWatch(this.handler_id);
    }
  }

  color_change(e) {
    console.log("Color Change", e);
    this.color = e.target.value;
  }

  inicializar_componente() {
    //this.nueva_nota_offcanvas.hide();
    this.imagenes = [];
    this.color = "red";
    this.texto = "";
    this.fecha = new Date().toISOString().split("T")[0];

    if (this.modo_geolocalizacion === "dispositivo") {
      // Remover el handler de refresco de posicion
      navigator.geolocation.clearWatch(this.handler_id);
    } else {
      // Remover el callback de hacer click
      this.map.off(touchEvent, this.mover_marcador);
    }

    //this.nota_marker?.remove();

    this.nota_marker = new Marker()
      .setLngLat(this.map.getCenter())
      .addTo(this.map);

    this.modo_geolocalizacion = "mapa";
    this.map.on(touchEvent, this.mover_marcador);

    let centroide = centroid(this.lote_doc);
    let punto_marker: LngLat = new LngLat(
      centroide.geometry.coordinates[0],
      centroide.geometry.coordinates[1]
    );
    let fake_e = { lngLat: punto_marker };
    this.mover_marcador(fake_e);

    this.shadowRoot.getElementById("mapa").checked = true;

    // Color por defecto
    this.shadowRoot.getElementById("btnradio-red").checked = true;

    // Audio
    if (this.audio) {
    } else {
      this.shadowRoot.getElementById("audio-recorder").borrar();
    }
  }

  guardar_nota_click() {
    function urltoFile(url, filename, mimeType) {
      return fetch(url)
        .then(function (res) {
          return res.arrayBuffer();
        })
        .then(function (buf) {
          return new File([buf], filename, { type: mimeType });
        });
    }

    let lote_id = this.lote_doc.properties.uuid;
    let fecha = format(parse(this.fecha, "yyyy-MM-dd", new Date()), "yyyyMMdd");

    const nota_uuid = uuid4();

    const nota = {
      _id: "actividad:" + fecha + ":" + nota_uuid,
      ts_generacion: new Date().toISOString(),
      lote_uuid: this.lote_doc.id,
      tipo: "nota",
      color: this.color,
      texto: this.texto,
      fecha: this.fecha,
      proxima_visita: this.proxima_fecha
        ? formatISO(parse(this.proxima_fecha, "yyyy-MM-dd", new Date()))
        : "",
      url_referencia: `/campo/${encodeURIComponent(
        this.lote_doc.properties.campo_parent_id
      )}/lote/${encodeURIComponent(this.lote_doc.properties.nombre)}`,
      lote_nombre: this.lote_doc.properties.nombre,
      posicion: [this.posicion.coords.longitude, this.posicion.coords.latitude],
      _attachments: {},
    };

    // Imagenes
    this.imagenes.map((i) => {
      nota._attachments["foto_" + uuid4()] = {
        data: i,
        type: i.type,
      };
    });

    // Audio
    if (this.audio) {
      // Fruto de compartido
      nota._attachments["audio_" + uuid4()] = {
        data: this.audio, // Es un blob
        type: this.audio.type,
      };
    } else {
      if (this.shadowRoot.getElementById("audio-recorder").blob) {
        nota._attachments["audio_" + uuid4()] = {
          data: this.shadowRoot.getElementById("audio-recorder").blob,
          type: this.shadowRoot.getElementById("audio-recorder").blob.type,
        };
      }
    }

    this.db
      .put(nota)
      .then(() => {
        console.log("Nota grabada OK");
        //this.inicializar_componente();
        this.map.off(touchEvent, this.mover_marcador);

        this.nueva_nota_offcanvas.hide();
        let event = new CustomEvent("nueva-nota", {
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      })
      .catch((e) => {
        console.log("Error al grabar Nota", e);
        alert("Error al grabar Nota");
      });
  }

  render() {
    let limite_maximo = isBefore(
      new Date(),
      parseISO(gbl_state.campana_seleccionada.fin)
    )
      ? format(new Date(), "yyyy-MM-dd")
      : gbl_state.campana_seleccionada.fin;
    console.log("nota render limite maximo", limite_maximo);

    const imagen_element = (file) => {
      let url = URL.createObjectURL(file);
      return html`
        <div>
          <button
            type="button"
            class="close"
            aria-label="Close"
            @click=${() => {
              let event_fin = new CustomEvent("nueva-nota-finalizada", {
                bubbles: true,
                composed: true,
              });
              this.dispatchEvent(event_fin);
            }}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <img
            class="img-fluid col-4 col-md-2 mx-1 nota-img img-thumbnail"
            @load=${() => {
              URL.revokeObjectURL(url);
            }}
            src=${url}
            style="height:100px; object-fit: cover;"
          />
        </div>
      `;
    };

    const imagen_objeto_gallery = (file: Blob) => {
      let objeto = {
        id: "3",
        size: "", // Size como 1900-720
        src: "", // Src URL
        thumb: "", //Thumb URL
        subHtml: ``, // Template de lo que aparece abajo
      };

      let url = URL.createObjectURL(file);
      objeto.src = url;
      objeto.thumb = url;

      return objeto;
    };

    //h-50 offcanvas heigth
    return html`
      <!--Add Nota Form-->
      <div
        class="offcanvas offcanvas-start"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabindex="-1"
        id="offcanvas-nueva-nota"
        aria-labelledby="offcanvasBottomLabel"
      >
        <div class="offcanvas-header py-1">
          <button
            type="button"
            id="cerrar-nueva-nota-btn"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            @click=${this.hide}
          ></button>
          <h6 class="offcanvas-title">Nueva Nota</h6>

          <button
            type="button"
            id="guardar-nueva-nota-btn"
            class="btn btn-success"
            aria-label=""
            @click=${this.guardar_nota_click}
          >
            Guardar
          </button>
        </div>
        <hr class="my-0" />
        <div class="container-fluid offcanvas-body">
          <vaadin-vertical-layout
            style="align-items: stretch; justify-content:space-between"
          >
            <!--Row 1-->
            <vaadin-horizontal-layout>
              <!-- Prevenir que puede ingresar con el teclado  allowed-char-pattern="[]"-->
              <vaadin-date-picker
                id="nota-date-picker"
                label="Fecha"
                value="2022-12-03"
                placeholder="YYYY-MM-DD"
                .min=${gbl_state.campana_seleccionada.inicio}
                .max=${limite_maximo}
                .value=${this.fecha}
                allowed-char-pattern="[]"
                .i18n=${base_i18n}
                @change=${(e) => (this.fecha = e.target.value)}
              ></vaadin-date-picker>

              <vaadin-radio-group label="Geolocalizar Usando">
                <vaadin-radio-button
                  value="dispositivo"
                  label="Dispositivo"
                  id="dispositivo"
                  checked
                  @change=${this.cambio_geo_modo}
                ></vaadin-radio-button>
                <vaadin-radio-button
                  value="mapa"
                  id="mapa"
                  label="Mapa"
                  name="mapa"
                  @change=${this.cambio_geo_modo}
                ></vaadin-radio-button>
              </vaadin-radio-group>
            </vaadin-horizontal-layout>
            <!--Fin Row 1-->

            <!--Row 2-->
            <vaadin-horizontal-layout>
              <label for="nota-color-input" class="col-2">Color</label>
              <div
                class="btn-group col-10"
                role="group"
                id="nota-color-input"
                aria-label="Basic mixed styles example"
              >
                <input
                  type="radio"
                  class="btn-check nota-status"
                  name="btnradio"
                  value="red"
                  id="btnradio-red"
                  autocomplete="off"
                  checked
                  @change=${this.color_change}
                />
                <label class="btn btn-outline-danger" for="btnradio-red"
                  >Urgente</label
                >

                <input
                  type="radio"
                  class="btn-check nota-status"
                  name="btnradio"
                  value="yellow"
                  id="btnradio-warning"
                  autocomplete="off"
                  @change=${this.color_change}
                />
                <label class="btn btn-outline-warning" for="btnradio-warning"
                  >Atención</label
                >

                <input
                  type="radio"
                  class="btn-check nota-status"
                  name="btnradio"
                  value="green"
                  id="btnradio-success"
                  autocomplete="off"
                  @change=${this.color_change}
                />
                <label class="btn btn-outline-success" for="btnradio-success"
                  >Todo Bien</label
                >
              </div>
            </vaadin-horizontal-layout>
            <!--Fin Row 2-->

            <vaadin-text-area
              placeholder="Tus comentarios..."
              .value=${this.texto}
              autoselect
              @input=${(e) => (this.texto = e.target.value)}
            ></vaadin-text-area>

            <!--Galeria-->
            <light-gallery-demo
              .list=${this.imagenes.map(imagen_objeto_gallery)}
              @beforeOpen=${() => {
                this.nueva_nota_offcanvas.hide();
                console.log("hide offcanvas");
              }}
              @borrarImagen=${(e)=>{
                let index = e.detail.index
                let instance = e.detail.instance
                alert('borrar imagen index')
                this.imagenes.splice(index,1)
                this.requestUpdate()
              }}
              @afterClose=${() => this.nueva_nota_offcanvas.show()}
            >
            </light-gallery-demo>
            <!-- <div class="row mb-2" id="img-preview">
              ${this.imagenes.map(imagen_element)}
            </div> -->

            <input
              id="foto-upload-input"
              class="d-none"
              type="file"
              accept="image/*"
              @change=${this.nueva_imagen_anadida}
            />

            <button
              type="button"
              @click=${this.anadir_foto_click}
              id="anadir-foto-btn"
              class="btn btn-success"
            >
              Añadir Foto
            </button>

            ${this.audio
              ? html`<audio controls><source .src=${URL.createObjectURL(
                  this.audio
                )}></source></audio>`
              : html`<div class="row" id="audio-div">
                  <audio-recorder id="audio-recorder"></audio-recorder>
                </div>`}

            <vaadin-date-picker
              id="nota-proxima-date-picker"
              label="Proxima Visita"
              placeholder="YYYY-MM-DD"
              .value=${this.proxima_fecha}
              .i18n=${base_i18n}
              .min=${format(new Date(), "yyyy-MM-dd")}
              .max=${gbl_state.campana_seleccionada.fin}
              allowed-char-pattern="[]"
              @change=${(e) => (this.proxima_fecha = e.target.value)}
            ></vaadin-date-picker>

            <vaadin-multi-select-combo-box
              .label=${translate("motivos")}
              .items=${motivos_items}
              item-label-path="nombre"
              .selected-items-changed=${(e) =>
                (this.motivos_nota = e.target.selectedItems)}
            >
            </vaadin-multi-select-combo-box>
          </vaadin-vertical-layout>
        </div>
      </div>

      <div
        class="modal fade"
        id="detalle-imagen-modal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel"></h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <img id="imagen-modal-preview" class="img-fluid" src="" />
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                id="borrar-img-btn"
                data-bs-index="0"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("notas-oc", NotasOffcanvas);
