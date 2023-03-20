import { upload_file } from "./../helpers";
import {
  nota_adjuntar_archivo,
  Nota,
  nota_remover_adjunto,
  nota_nueva,
  cargar_nota,
  guardar_nota,
} from "./notas-fuciones";
import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import "@vaadin/date-picker";
import "@vaadin/radio-group";
import "@vaadin/combo-box";
import { uuid4 } from "uuid4";
import { LngLat, Map, Marker } from "mapbox-gl";
import { format, parse, isBefore, parseISO } from "date-fns";
import "@vaadin/text-area";
import { get_lote_by_names, touchEvent } from "../helpers";
import "../audiorecorder/index.js";

import Offcanvas from "bootstrap/js/dist/offcanvas.js";
import { property, state } from "lit/decorators.js";
import formatISO from "date-fns/formatISO";
import centroid from "@turf/centroid";
import { base_i18n } from "../lote-offcanvas/repetir-aplicacion/date-picker-i18n";
import { motivos_items } from "../jsons/motivos_items";
import { get, translate } from "lit-translate";
import { gbl_state } from "../state";
import "../image-gallery/images-gallery";
import { RouterLocation } from "@vaadin/router";
import { uuidv7 } from "uuidv7";
import { Task } from "@lit-labs/task";
import { showNotification } from "../helpers/notificaciones";
import { RadioGroup } from "@vaadin/radio-group";
import { UploadFile } from "@vaadin/upload";

export class NotasOffcanvas extends LitElement {
  @property()
  location: RouterLocation;

  @property()
  lote_doc: any;

  private mostrar: Boolean = true;

  /* Internos */

  private nueva_nota_offcanvas: Offcanvas;

  @state()
  imagenes: any = [];

  @property()
  handler_id: any;

  @property()
  posicion: any;

  @property()
  audio: any;

  @property()
  nota_marker: Marker;

  @property()
  proxima_fecha: string;

  @state()
  editing: boolean = false;

  static styles = unsafeCSS(bootstrap);

  private lanota: Nota = nota_nueva();

  private _loadTask = new Task(
    this,
    () => this.load_data(this.location),
    () => [this.location]
  );

  async load_data(location: RouterLocation) {
    // Editando o nuevo
    if (location.params.uuid) {
      if (location.pathname.includes("edit")) {
        this.editing = true;
      }
      let item_uuid = location.params.uuid as string;
      let lote_uuid = location.params.uuid_lote as string;
      let campo_uuid = location.params.uuid_campo as string;
      get_lote_by_names(gbl_state.db, campo_uuid, lote_uuid).then((lote) => {
        this.lote_doc = lote;
        this.nueva_nota();
      });

      return cargar_nota(item_uuid)
        .then((d) => (this.lanota = d))
        .catch((e) => {
          console.error(e);
          showNotification(get("error_al_cargar"), "error");
        });
    } else {
      let lote_uuid = location.params.uuid_lote as string;
      let campo_uuid = location.params.uuid_campo as string;

      return get_lote_by_names(gbl_state.db, campo_uuid, lote_uuid).then(
        (lote) => {
          this.lote_doc = lote;
          this.lanota = nota_nueva();
          //this.editing = true;
          this.nueva_nota();
        }
      );
    }
  }
  // constructor() {
  //   super();
  //   this.imagenes = [];
  //   this.texto = "sssss";
  //   this.fecha = new Date().toISOString().split("T")[0];
  //   this.color = "red";
  //   this.modo_geolocalizacion = "mapa";
  //   this.motivos_nota = [];
  // }

  firstUpdated() {
    console.log("FIRST UPDATE NOTAS OFFANVAS");
    this.nueva_nota_offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-nueva-nota")
    );

    // if (this.mostrar) {
    //   this.nueva_nota();
    // }
  }

  hide() {
    this.nueva_nota_offcanvas.hide();

    gbl_state.map.off(touchEvent, this.mover_marcador);

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

    history.back();
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
    //     gbl_state.map.flyTo({
    //       center: [pos.coords.longitude, pos.coords.latitude],
    //       padding: { bottom: 200 },
    //       zoom: 15,
    //     });
    //   },
    //   this.posicion_error,
    //   { enableHighAccuracy: true }
    // );
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
    this.lanota.modo_geolocalizacion = e.target.value;
    console.log("Cambio Radio", e, this.lanota.modo_geolocalizacion);

    if (this.lanota.modo_geolocalizacion === "dispositivo") {
      gbl_state.map.off(touchEvent, this.mover_marcador);
      this.handler_id = navigator.geolocation.watchPosition(
        (pos) => {
          this.posicion = pos;
          this.nota_marker.setLngLat([
            pos.coords.longitude,
            pos.coords.latitude,
          ]);
          gbl_state.map.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            padding: { bottom: 200, top: 0, left: 0, right: 0 },
            zoom: 15,
          });
        },
        this.posicion_error,
        { enableHighAccuracy: true }
      );
    } else if (this.lanota.modo_geolocalizacion === "mapa") {
      gbl_state.map.on(touchEvent, this.mover_marcador);
      navigator.geolocation.clearWatch(this.handler_id);
    }
  }

  color_change(e) {
    console.log("Color Change", e);
    this.lanota.color = e.target.value;
  }

  inicializar_componente() {
    //this.nueva_nota_offcanvas.hide();
    // this.imagenes = [];
    // this.color = "red";
    // this.texto = "";
    // this.fecha = new Date().toISOString().split("T")[0];

    if (this.lanota.modo_geolocalizacion === "dispositivo") {
      // Remover el handler de refresco de posicion
      navigator.geolocation.clearWatch(this.handler_id);
    } else {
      // Remover el callback de hacer click
      gbl_state.map.off(touchEvent, this.mover_marcador);
    }

    //this.nota_marker?.remove();

    this.nota_marker = new Marker()
      .setLngLat(gbl_state.map.getCenter())
      .addTo(gbl_state.map);

    this.lanota.modo_geolocalizacion = "mapa";
    gbl_state.map.on(touchEvent, this.mover_marcador);

    let centroide = centroid(this.lote_doc);
    let punto_marker: LngLat = new LngLat(
      centroide.geometry.coordinates[0],
      centroide.geometry.coordinates[1]
    );
    let fake_e = { lngLat: punto_marker };
    this.mover_marcador(fake_e);

    (<HTMLInputElement>this.shadowRoot.getElementById("mapa")).checked = true;

    // Color por defecto
    (<HTMLInputElement>this.shadowRoot.getElementById("btnradio-red")).checked =
      true;

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
    let fecha = format(
      parse(this.lanota.fecha, "yyyy-MM-dd", new Date()),
      "yyyyMMdd"
    );

    if (!this.editing) {
      const nota_uuid = uuidv7();
      this.lanota._id = "actividad:" + fecha + ":" + nota_uuid;
    }

    this.lanota.lote_uuid = this.lote_doc.id;

    // this.lanota.proxima_visita = this.lanota.proxima_visita
    //   ? formatISO(parse(this.lanota.proxima_visita, "yyyy-MM-dd", new Date()))
    //   : "";

    this.lanota.url_referencia = `/campo/${encodeURIComponent(
      this.lote_doc.properties.campo_parent_id
    )}/lote/${encodeURIComponent(this.lote_doc.properties.nombre)}`;

    this.lanota.lote_nombre = this.lote_doc.properties.nombre;
    this.lanota.posicion = [
      this.posicion.coords.longitude,
      this.posicion.coords.latitude,
    ];
    // const nota: Nota = {
    //   _id:
    //   lote_uuid: this.lote_doc.id,
    //   tipo: "nota",
    //   color: this.color,
    //   texto: this.texto,
    //   fecha: this.fecha,
    //   proxima_visita: this.proxima_fecha
    //     ? formatISO(parse(this.proxima_fecha, "yyyy-MM-dd", new Date()))
    //     : "",
    //   url_referencia: `/campo/${encodeURIComponent(
    //     this.lote_doc.properties.campo_parent_id
    //   )}/lote/${encodeURIComponent(this.lote_doc.properties.nombre)}`,
    //   lote_nombre: this.lote_doc.properties.nombre,
    //   posicion: [this.posicion.coords.longitude, this.posicion.coords.latitude],
    //   _attachments: {},
    //   motivos_nota: this.motivos_nota,
    // };

    // Imagenes
    this.imagenes.map((i) => {
      this.lanota._attachments["foto_" + uuid4()] = {
        data: i,
        type: i.type,
      };
    });

    // Audio
    if (this.audio) {
      // Fruto de compartido
      this.lanota._attachments["audio_" + uuid4()] = {
        data: this.audio, // Es un blob
        type: this.audio.type,
      };
    } else {
      if (this.shadowRoot.getElementById("audio-recorder").blob) {
        this.lanota._attachments["audio_" + uuid4()] = {
          data: this.shadowRoot.getElementById("audio-recorder").blob,
          type: this.shadowRoot.getElementById("audio-recorder").blob.type,
        };
      }
    }

    guardar_nota(this.lanota)
      .then(() => {
        console.log("Nota grabada OK", this.lanota);
        //this.inicializar_componente();
        gbl_state.map.off(touchEvent, this.mover_marcador);

        this.nueva_nota_offcanvas.hide();
        let event = new CustomEvent("nueva-nota", {
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
        history.back();
      })
      .catch((e) => {
        console.log("Error al grabar Nota", e);
        alert("Error al grabar Nota");

        history.back();
      });
  }

  render() {
    const es_imagen = (filename: string) => {
      return filename.includes("png");
    };

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
                .value=${this.lanota.fecha}
                allowed-char-pattern="[]"
                .i18n=${base_i18n}
                @change=${(e) => (this.lanota.fecha = e.target.value)}
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
              .value=${this.lanota.texto}
              autoselect
              @input=${(e) => (this.lanota.texto = e.target.value)}
            ></vaadin-text-area>

            <!-- Galeria
            <light-gallery-demo
              .list=${this.imagenes.map(imagen_objeto_gallery)}
              @beforeOpen=${() => {
              this.nueva_nota_offcanvas.hide();
              console.log("hide offcanvas");
            }}
              @borrarImagen=${(e) => {
              let index = e.detail.index;
              let instance = e.detail.instance;
              //alert('borrar imagen index')
              this.imagenes.splice(index, 1);
              this.requestUpdate();
            }}
              @afterClose=${() => this.nueva_nota_offcanvas.show()}
            >
            </light-gallery-demo>
            <!-- <div class="row mb-2" id="img-preview">
              ${this.imagenes.map(imagen_element)}
            </div> -->

            <!-- <input
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
            </button>  -->

            <div class="row" id="audio-div">
              <audio-recorder
                id="audio-recorder"
                @recordingCompleted=${(e) => {
                  console.log("RECORDING COMPLETED", e);
                  let audio = e.detail as File;
                  upload_file(audio).then(() => {
                    this.lanota.audio_url = audio.name;
                  });
                }}
              ></audio-recorder>
            </div>
            ${this.lanota.audio_url
              ? html`<audio controls><source .src=${
                  "/attachments?file=" + this.lanota.audio_url
                }></source></audio>`
              : null}

            <div>
              <!--upload-->
              <vaadin-vertical-layout style="align-self:stretch">
                ${this.lanota.attachments
                  ? this.lanota.attachments.map(
                      (att) => html`
                    <vaadin-horizontal-layout
                      style="width:100%; align-items:center; justify-content:space-between"
                      theme="spacing"
                    >
                      ${es_imagen(att.filename) ? html`` : null}
                      <div>${att.filename}</div>
                      <div> <!-- Grupo botones -->

                    
                      </vaadin-button>
                        <vaadin-button
                          @click=${() => {
                            fetch(
                              "/attachments?file=" +
                                encodeURIComponent(att.filename)
                            )
                              .then((r) => {
                                return r.blob();
                              })
                              .then((data) => {
                                // Download Fetch
                                var a = document.createElement("a");
                                a.href = window.URL.createObjectURL(data);
                                a.download = att.filename;
                                a.click();
                              });
                          }}
                        >
                          <vaadin-icon icon="lumo:download"></vaadin-icon>
                        </vaadin-button>
                        <vaadin-button
                          @click=${() => {
                            // Solicitar borrado en server y en la db
                            nota_remover_adjunto(this.lanota, att.uuid).then(
                              () => this.requestUpdate()
                            );
                          }}
                          ><vaadin-icon icon="vaadin:trash"></vaadin-icon
                        ></vaadin-button>
                      </div>
                    </vaadin-horizontal-layout>
                  `
                    )
                  : html`${translate("sin_adjuntos")}`}
              </vaadin-vertical-layout>

              <vaadin-upload
                target="/attachments"
                .files=${
                  [] as UploadFile[] /* Previene que se agregen los archivos debajo del control*/
                }
                @upload-success=${(e) => {
                  console.log("successevent", e);
                  nota_adjuntar_archivo(this.lanota, e.detail.file).then(() => {
                    this.requestUpdate();
                  });
                }}
              ></vaadin-upload>
            </div>

            <vaadin-date-picker
              id="nota-proxima-date-picker"
              label="Proxima Visita"
              placeholder="YYYY-MM-DD"
              .value=${this.lanota.proxima_visita}
              .i18n=${base_i18n}
              .min=${format(new Date(), "yyyy-MM-dd")}
              .max=${gbl_state.campana_seleccionada.fin}
              allowed-char-pattern="[]"
              @change=${(e) => (this.lanota.proxima_visita = e.target.value)}
            ></vaadin-date-picker>

            <vaadin-multi-select-combo-box
              .label=${translate("motivos")}
              .items=${motivos_items}
              item-label-path="nombre"
              @selected-items-changed=${(e) =>
                (this.lanota.motivos_nota = e.target.selectedItems)}
            >
            </vaadin-multi-select-combo-box>
          </vaadin-vertical-layout>

          ${this._loadTask.render({
            pending: () => html`${translate("cargando")}`,
            complete: (proveedores) => html``,
          })}
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
