import { Offcanvas } from "bootstrap";
import { LitElement, html, unsafeCSS, css } from "lit-element";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import "@vaadin/date-picker";
import "@vaadin/radio-group";
import "@vaadin/combo-box";

export class NotasOffcanvas extends LitElement {
  static properties = {
    map: {},
    nueva_nota_offcanvas: {},
    imagenes: {},
    ver_nota_offcanvas: {},
    handler_id: {},
    posicion: {},
    fecha:{},
    texto:{},
    color:{},
    audios:{}
  };

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
    this.imagenes = [];
    this.texto = "";
    this.fecha = ""
  }

  firstUpdated() {
    this.nueva_nota_offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-nueva-nota")
    );

    this.handler_id = navigator.geolocation.watchPosition(
      (pos) => this.posicion = pos,
      this.posicion_error,
      { enableHighAccuracy: true }
    );
  }


  posicion_error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  nueva_nota() {
    this.nueva_nota_offcanvas.show();
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
    const nota = {
      _id: "nota_" + uuidv4(),
      username: couch_username,
      campo_id: getCampoFromPoint(nota_marker.getLngLat()),
      lote_id: getLoteFromPoint(nota_marker.getLngLat()),

      color: getSelectedColor(),
      texto: document.getElementById("nota-comentario-input").value,
      fecha: "2022-05-09T01:30:00.000-05:00",
      posicion: nota_marker.getLngLat(),
      _attachments: {},
    };

    // Imagenes es un [Files]

    // Cada Audio tiene una propiedad .blob

    //         img_el = document.getElementsByClassName("nota-img");
    //         audios_el = document
    //           .querySelector("audio-recorder")
    //           .shadowRoot.querySelectorAll(".nota-audio");
    //         console.log("AudioEL", audios_el);
    //         img_sources = Array.from(img_el).map((imagen) => {
    //           return imagen.getAttribute("src");
    //         });

    //         audio_promise = Array.from(audios_el).map((audio) => {
    //           return urltoFile(audio.getAttribute("src"), uuidv4(), "audio/*");
    //         });

    //         console.log("AP", audio_promise);

    //         promises = img_sources.map((img_src) => {
    //           return urltoFile(img_src, uuidv4(), "image/*");
    //         });

    //         console.log(promises);

    //         Promise.all(promises).then((files) => {
    //           // Fotos OK
    //           //files.map(file => { formData.append(`files.fotos`, file, file.name) })
    //           files.map((file) => {
    //             nota._attachments["foto_" + uuidv4()] = {
    //               content_type: "image/*",
    //               data: file,
    //             };
    //           });

    //           Promise.all(audio_promise).then((audio_files) => {
    //             audio_files.map((file) => {
    //               nota._attachments["audio_" + uuidv4()] = {
    //                 content_type: "audio/*",
    //                 data: file,
    //               };
    //             });

    //             // Add uuid y Guardar Nota
    //             nota.uuid = uuidv4();
    //             notas_db
    //               .put(nota)
    //               .then()
    //               .catch((err) => console.log(err));
    //             offcanvas_nueva_nota.hide();
    //           });
    //         });
    //       });
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
                label="Fecha"
                value="2022-12-03"
                .value=${this.fecha}
                clear-button-visible
                @change=${(e)=>this.fecha = e.target.value}
              ></vaadin-date-picker>
            </div>

            <div class="col col-6">
              <vaadin-radio-group label="Geolocalizar Usando">
                <vaadin-radio-button
                  value="economy"
                  label="Dispositivo"
                  checked
                ></vaadin-radio-button>
                <vaadin-radio-button
                  value="business"
                  label="Mapa"
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
                id="btnradio-danger"
                autocomplete="off"
                checked
              />
              <label class="btn btn-outline-danger" for="btnradio-danger"
                >Urgente</label
              >

              <input
                type="radio"
                class="btn-check nota-status"
                name="btnradio"
                id="btnradio-warning"
                autocomplete="off"
              />
              <label class="btn btn-outline-warning" for="btnradio-warning"
                >Atención</label
              >

              <input
                type="radio"
                class="btn-check nota-status"
                name="btnradio"
                id="btnradio-success"
                autocomplete="off"
              />
              <label class="btn btn-outline-success" for="btnradio-success"
                >Todo Bien</label
              >
            </div>
            <!-- <input type="color" class="form-control form-control-color col-4" id="nota-color-input" value="#563d7c" title="Choose your color"> -->
          </div>

          <hr />

          <textarea
            class="form-control"
            id="nota-comentario-input"
            placeholder="Tus comentarios..."
            rows="3"
            .value=${this.texto}
            @input=${(e)=>this.texto = e.target.value}
          ></textarea>

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
            <audio-recorder></audio-recorder>
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
