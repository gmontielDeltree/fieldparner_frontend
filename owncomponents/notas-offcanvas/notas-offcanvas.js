import { Offcanvas } from "bootstrap";
import { LitElement, html, unsafeCSS, css } from "lit-element";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import "@vaadin/date-picker";
import "@vaadin/radio-group";
import "@vaadin/combo-box";
import { uuid4 } from "uuid4";
import mapboxgl from "mapbox-gl";
import { format, parse } from "date-fns";
import '@vaadin/text-area';
import { touchEvent } from "../helpers";

export class NotasOffcanvas extends LitElement {
  static properties = {
    map: {},
    db: {},
    lote_doc: {},
    /* Internos */
    nueva_nota_offcanvas: {},
    imagenes: {},
    ver_nota_offcanvas: {},
    handler_id: {},
    posicion: {},
    fecha: {},
    texto: {},
    color: {},
    audios: {},
    nota_marker: {},
    modo_geolocalizacion: {},
  };

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
    this.imagenes = [];
    this.texto = "sssss";
    this.fecha = new Date().toISOString().split("T")[0];
    this.color = "red";
    this.modo_geolocalizacion = "dispositivo";
  }

  firstUpdated() {
    this.nueva_nota_offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-nueva-nota")
    );

    /* Format date */
    const formatDateIso8601 = (dateParts) => {
      const { year, month, day } = dateParts;
      const date = new Date(year, month, day);

      return format(date, "yyyy-MM-dd");
    };

    const parseDateIso8601 = (inputValue) => {
      const date = parse(inputValue, "yyyy-MM-dd", new Date());

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      };
    };

    if (this.shadowRoot.getElementById("nota-date-picker")) {
      this.shadowRoot.getElementById("nota-date-picker").i18n = {
        ...this.shadowRoot.getElementById("nota-date-picker").i18n,
        formatDate: formatDateIso8601,
        parseDate: parseDateIso8601,
      };
    }
  }

  hide() {
    this.nueva_nota_offcanvas.hide();
    
    this.inicializar_componente();
    let event = new CustomEvent("nueva-nota",{bubbles:true, composed:true})
    this.dispatchEvent(event)
  }

  posicion_error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  nueva_nota() {
    this.inicializar_componente();
    this.nueva_nota_offcanvas.show();
    this.nota_marker = new mapboxgl.Marker()
      .setLngLat(this.map.getCenter())
      .addTo(this.map);

    this.handler_id = navigator.geolocation.watchPosition(
      (pos) => {
        this.posicion = pos;
        this.nota_marker.setLngLat([pos.coords.longitude, pos.coords.latitude]);
        this.map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          padding: { bottom: 200 },
          zoom: 15,
        });
      },
      this.posicion_error,
      { enableHighAccuracy: true }
    );
    
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
    this.nota_marker.setLngLat(e.lngLat);
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
    console.log("Color Change",e)
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

    
    this.nota_marker?.remove();

    this.modo_geolocalizacion = "dispositivo";
    this.shadowRoot.getElementById("dispositivo").checked = true;

    // Color por defecto
    this.shadowRoot.getElementById("btnradio-red").checked = true;

    // Audio
    this.shadowRoot.getElementById("audio-recorder").borrar();
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
    const nota = {
      _id: "actividad:nota:" + lote_id + ":" + uuid4(),
      ts: new Date().toISOString(),
      lote_id: this.lote_doc.id,
      tipo: "nota",
      color: this.color,
      texto: this.texto,
      fecha: this.fecha,

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
    if (this.shadowRoot.getElementById("audio-recorder").blob) {
      nota._attachments["audio_" + uuid4()] = {
        data: this.shadowRoot.getElementById("audio-recorder").blob,
        type: this.shadowRoot.getElementById("audio-recorder").blob.type,
      };
    }

    this.db
      .put(nota)
      .then(() => {
        console.log("Nota grabada OK");
        this.inicializar_componente();

        this.nueva_nota_offcanvas.hide()
        let event = new CustomEvent("nueva-nota",{bubbles:true, composed:true})
        this.dispatchEvent(event)
        
      })
      .catch((e) => {
        console.log("Error al grabar Nota", e);
        alert("Error al grabar Nota");
      });
  }

  render() {
    const imagen_element = (file) => {
      let url = URL.createObjectURL(file);
      return html`
        <div>
          <button type="button" class="close" aria-label="Close">
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

    console.log("RENDER NOTA")
    return html`
      <!--Add Nota Form-->
      <div
        class="offcanvas offcanvas-bottom h-50"
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
          <div class="row">
            <div class="col col-sm-12 col-md-6">
              <vaadin-date-picker
                id="nota-date-picker"
                label="Fecha"
                value="2022-12-03"
                placeholder="YYYY-MM-DD"
                .value=${this.fecha}
                clear-button-visible
                @change=${(e) => (this.fecha = e.target.value)}
              ></vaadin-date-picker>
            </div>

            <div class="col col-6">
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
                  label="Mapa"
                  name="mapa"
                  @change=${this.cambio_geo_modo}
                ></vaadin-radio-button>
              </vaadin-radio-group>
            </div>
          </div>

          <div class="row">
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
            <!-- <input type="color" class="form-control form-control-color col-4" id="nota-color-input" value="#563d7c" title="Choose your color"> -->
          </div>

          <hr />

          <textarea class="form-control" placeholder="Tus comentarios..." .value=${this.texto} @input=${(e) => (this.texto = e.target.value)} rows="3"></textarea>

          <!--.value=${this.texto} 
             -->

          <hr />

          <div class="row mb-2" id="img-preview">
            ${this.imagenes.map(imagen_element)}
          </div>

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

          <hr />

          <div class="row" id="audio-div">
            <audio-recorder id="audio-recorder"></audio-recorder>
          </div>

          <hr />
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
