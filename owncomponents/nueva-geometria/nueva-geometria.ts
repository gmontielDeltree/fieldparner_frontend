import { LitElement, html, unsafeCSS } from "lit";
import { nuevaGeometriaMachine, initial_ctx } from "./nueva-geometria-machina";
import { interpret } from "xstate";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import centroid from "@turf/centroid";
import { kml } from "@tmcw/togeojson";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import * as JSZip from "jszip";
import "@vaadin/text-field";
import Modal from "bootstrap/js/dist/modal.js";
import Offcanvas from "bootstrap/js/dist/offcanvas.js";
import { property, state } from "lit/decorators.js";

export class NuevaGeometria extends LitElement {
  static properties = {
    campo_feature: {},
    show: {},
    mapa: {},
    _offcanvas: {
      hasChanged(newVal, oldVal) {
        return false;
      },
    },
    _modal_multiple: {
      hasChanged(newVal, oldVal) {
        return false;
      },
    },
    _nombre_multiple: {},
    _draw: {},
    _ctx: {},
    _fsm: {},
    _feature_id: {},
    _modal_elements: {
      hasChanged(newVal, oldVal) {
        return false;
      },
    },
    _bs_inicializado: {
      hasChanged(newVal, oldVal) {
        return false;
      },
    },
    _multiplesfeatures: {},
  };

  @property()
  tipo : string = "campo"

  @state()
  nombre: string = "";

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
    this.show = false;
    this._modal_elements = {};
    this._feature_id = "";
    this._bs_inicializado = false;
    this._ctx = initial_ctx;

    this._draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: false,
        trash: false,
      },
      touchBuffer: 50,
    });
    // console.log("Construction", this.mapa);
    this._init_fsm();
  }

  // createRenderRoot() {
  //   return this;
  // }

  firstUpdated() {
    this._bs_inicializar();
    this._modal_multiple = new Modal(
      this.shadowRoot.getElementById("modal-multiple")
    );
  }

  willUpdate(changedProperties) {
    console.count("willUpdate Nueva Geometria");
    if (!this._bs_inicializado) {
      return;
    }

    if (changedProperties.has("show") && this.show) {
      this._init_fsm();
      this._fsm.send("START");
      //console.log("START", this._modal_elements);
    }

    if (changedProperties.has("campo_feature")) {
      //console.log("START CF", this._modal_elements);
      this._init_fsm();
    }

    if (changedProperties.has("mapa")) {
    }
  }

  _bs_inicializar() {
    // _modal_elements es un objeto de objetos. Las claves son los id/states. { 'pregunta': Modal(), }
    let result_object = {};
    let lista_mapeo = [
      ...this.shadowRoot.querySelectorAll(".add-geometry.step"),
    ].map(
      (el) => (result_object[el.id] = new Modal(el)) // ej {'pregunta': Modal()}
    );

    this._modal_elements = result_object;
    //console.log("nueva-geometria", "firstUpdated", this._modal_elements);

    this._offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-editing-dibujando")
    );

    this._init_map();
    this._bs_inicializado = true;
  }

  _init_fsm() {
    const someContext = nuevaGeometriaMachine.initialState.context;
    someContext.campo_feature = this.campo_feature;
    someContext.es_lote = this.tipo === "lote" ? true : false;
    someContext.guardar_enable = this.tipo === "lote" ? false : true;
    // Mods al ctx inicial
    this._fsm = interpret(nuevaGeometriaMachine.withContext(someContext))
      .onTransition((state) => {
        this._ctx = state.context;
        //console.log(state.toStrings());
        this.show_step(state.toStrings());
      })
      .start();
  }

  _init_map() {
    // Set eventos cuando se carga el mapa
    //console.log("Changed Props", this.mapa);

    // try {
    //   this.mapa.addControl(this._draw, "top-left");
    // } catch {
    //   console.log("add draw fallo");
    // }

    this.mapa.on("draw.selectionchange", (e) => {
      /* Si la seleccion cambia a algo distinto del featureId
          que ya genere, volver a seleccionar lo mismo para prevenir
          que pueda seguir dibujando */
      //console.log("SELECTIONCHANGE", e);
      if (e.features[0]?.id !== this._feature_id) {
        //console.log("RESELECTING");
        this._draw.changeMode("simple_select", {
          featureIds: [this._feature_id],
        });
      }
    });

    this.mapa.on("draw.create", (e) => {
      //console.log("CERRO");
      /* Guardar la feature */
      this._feature_id = e.features[0].id;
      let feature = e.features[0];
      this._fsm.send({ type: "CERRO", feature });
    });

    this.mapa.on("draw.update", (args) => {
      let feature = args.features[0];
      //console.log("UPDATE", args);
      this._fsm.send({ type: "UPDATE_POLIGONO", feature: feature });
    });
  }

  show_step = (state_strings) => {
    this.hide_all_steps();
    let state_value = state_strings.slice(-1)[0];

    //console.log("show_step", state_value, this._modal_elements);
    if (state_value === "idle") {
      //this.show = false;
      return;
    }

    if (state_value === "editing.dibujando.abierto") {
      if (this._draw.getMode() !== "draw_polygon") {
        this._draw.changeMode("draw_polygon");
      }
    }

    if (state_value === "editing.dibujando.abierto") {
      this._offcanvas.show();
    }

    if (state_value === "editing.nombre") {
      this._offcanvas.show();
    }

    if (state_value === "editing.modal_multiple") {
      this._modal_multiple.show();
    }

    if (!(state_value in this._modal_elements)) {
      //console.log("Estado no tiene modal");
      return;
    }

    if (!this._modal_elements[state_value]?._isShown || false) {
      if (this.show) {
        //console.log("SHOW");
        this._modal_elements[state_value].show();
      }
    }
  };

  hide_all_steps() {
    Object.entries(this._modal_elements).forEach(([key, value]) =>
      value.hide()
    );
  }

  dibujar() {
    this._fsm.send("DIBUJAR");
  }

  cerrar() {
    // Cerrar el modo de dibujo
    this._draw.changeMode("simple_select");
    this._draw.deleteAll();
    // Ocultar el offcanvas
    this._offcanvas.hide();
    // Enviar evento
    this._fsm.send("CANCEL");
    //event cerrar
    let event = new CustomEvent("cerrargeometria", {
      detail: {},
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    this.show = false;
  }

  open_kml() {
    this.shadowRoot.getElementById("kml_file_input").click();
  }

  open_kmz() {
    this.shadowRoot.getElementById("kmz_file_input").click();
  }

  guardar() {
    //console.log("GUARDAR_CLICK");
    this._draw.changeMode("simple_select");
    this._draw.deleteAll();
    this._offcanvas.hide();

    let event = new CustomEvent("guardargeometria", {
      detail: { feature: this._ctx.feature, nombre: this._ctx.nombre },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    this._fsm.send("CANCEL");
  }

  guardar_geometrias_multiples() {
    console.log("GUARDAR_MULTIPLES_CLICK");
    this._draw.changeMode("simple_select");
    this._draw.deleteAll();
    this._offcanvas.hide();

    let event = new CustomEvent("guardargeometriasmultiples", {
      detail: {
        features: this._multiplesfeatures,
        nombre: this._nombre_multiple,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    this._fsm.send("CANCEL");
  }

  kmz_input_changed() {
    var file = this.shadowRoot.getElementById("kmz_file_input").files[0];
    let getDom = (xml) => new DOMParser().parseFromString(xml, "text/xml");
    let getExtension = (fileName) => fileName.split(".").pop();
    let kmlDom = null;
    if (file) {
      JSZip.loadAsync(file) // 1) read the Blob
        .then(
          (zip) => {
            zip.forEach((relPath, file) => {
              // 2) print entries
              //console.log("zip", file);
              if (getExtension(relPath) === "kml" && kmlDom === null) {
                kmlDom = file.async("string").then((d) => {
                  let feature_collection = kml(getDom(d));
                  //console.log("KMZ", feature_collection);
                  if (feature_collection.features.length === 0) {
                    // No hay niguna feature
                    alert("El archivo no tiene ninguna caracteristica");
                    return;
                  }
                  if (feature_collection.features.length > 1) {
                    // Hay mas de un poligono
                    // alert(
                    //   "El archivo tiene mas de un polígono.\nPor el momento solo estan soportados los archivos que contienen un solo polígono."
                    // );

                    this._multiplesfeatures = feature_collection;

                    // Enviar señal
                    // Add to Draw
                    this._draw.add(feature_collection);
                    // Evento para FSM
                    this._fsm.send({ type: "SUBIDO_MULTIPLE" });

                    // Move map to new feature
                    this.mapa.flyTo({
                      center: centroid(feature_collection.features[0]).geometry
                        .coordinates,
                      zoom: 10,
                    });

                    return;
                  }
                  if (
                    feature_collection.features[0].geometry.type !== "Polygon"
                  ) {
                    // La geometria no es un poligon
                    alert("La geometria no es un poligono");
                    return;
                  }

                  // feature es el GeoJson
                  let feature = feature_collection.features[0];
                  // Todo Bien

                  // Add to Draw
                  this._draw.add(feature);
                  // Evento para FSM
                  this._fsm.send({ type: "SUBIDO", feature: feature });

                  // Move map to new feature
                  this.mapa.flyTo({
                    center: centroid(feature).geometry.coordinates,
                    zoom: 10,
                  });
                });
              }
            });
          },
          function (e) {
            console.log("ERROR al LEER KMZ");
          }
        );
    }
  }

  kml_input_changed() {
    var file = this.shadowRoot.getElementById("kml_file_input").files[0];
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (evt) => {
        let xml = evt.target.result;
        //console.log(evt.target.result);
        // Convertir a geojson
        //console.log("gEOJSON");
        let feature_collection = kml(
          new DOMParser().parseFromString(xml, "text/xml")
        );
        if (feature_collection.features.length === 0) {
          // No hay niguna feature
        }
        if (feature_collection.features.length > 1) {
          // Hay mas de un poligono
        }
        if (feature_collection.features[0].geometry.type !== "Polygon") {
          // La geometria no es un poligono
        }

        // feature es el GeoJson
        let feature = feature_collection.features[0];
        // Todo Bien

        // Add to Draw
        this._draw.add(feature);
        // Evento para FSM
        this._fsm.send({ type: "SUBIDO", feature: feature });

        // Move map to new feature
        this.mapa.flyTo({
          center: centroid(feature).geometry.coordinates,
          zoom: 10,
        });
      };

      reader.onerror = function (evt) {
        //console.log("error reading file");
        this._fsm.send({ type: "ERROR", msg: "Error al leer el Archivo" });
      };
    }
  }

  enable_guardar = () => {
    if (this.nombre !== "") {
      return true;
    } else {
      return false;
    }
  };

  render() {
    return html`
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossorigin="anonymous"
      />

      <div class="modal add-geometry step" id="editing.pregunta" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                ¿Como quieres agregar la nueva geometria?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${this.cerrar}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <button class="btn btn-primary" @click="${this.dibujar}">
                Dibujar
              </button>
              <button
                class="btn btn-primary"
                @click=${() => {
                  this._fsm.send("SUBIR");
                }}
              >
                Subir Archivo
              </button>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cerrar}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="modal add-geometry step"
        id="editing.subir_archivo"
        tabindex="-1"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Selecciona el tipo de archivo</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${this.cerrar}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <button class="btn btn-primary" @click="${this.open_kml}">
                KML
              </button>
              <button class="btn btn-primary" @click="${this.open_kmz}">
                KMZ
              </button>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cerrar}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <input
        class="d-none"
        type="file"
        id="kml_file_input"
        name="avatar"
        @change=${this.kml_input_changed}
        accept="application/vnd.google-earth.kml+xml"
      />

      <input
        class="d-none"
        type="file"
        id="kmz_file_input"
        @change=${this.kmz_input_changed}
        accept="application/vnd.google-earth.kmz"
      />

      <div
        class="offcanvas offcanvas-bottom h-25"
        id="offcanvas-editing-dibujando"
        tabindex="-1"
        data-bs-backdrop="false"
      >
        <div class="offcanvas-header py-1">
          <h5 class="offcanvas-title mx-auto">Nuevo ${this.tipo}</h5>

          <button
            type="button"
            class="btn-close text-reset"
            @click=${this.cerrar}
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body pt-1">
          <form>
            <div class="row mb-1">
              <label for="inputNombreLote" class="col-4 col-form-label"
                >Nombre</label
              >
              <div class="col-8">
                <input
                  type="text"
                  value=${this._ctx.nombre}
                  @input=${(e) => {
                    this.nombre = e.target.value;
                  }}
                  @change=${(e) => {
                    this.nombre = e.target.value;
                    this._fsm.send({ type: "CHANGE", value: e.target.value });
                  }}
                  class="form-control"
                />
              </div>
            </div>

            <div class="d-grid gap-2">
              ${this.enable_guardar()
                ? html`<button
                    @click=${this.guardar}
                    class="btn btn-primary btn-success"
                    type="button"
                    ${this.enable_guardar() ? html`"hgh"` : html`"disabled"`}
                  >
                    Guardar
                  </button>`
                : null}
            </div>
          </form>
        </div>
      </div>

      <!-- Modal -->
      <div
        class="modal fade"
        id="modal-multiple"
        tabindex="-1"
        role="dialog"
        aria-labelledby=""
        aria-hidden="true"
      >
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Multiples Geometrias</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body mx-auto">
              Existen multiples geometrias en el archivo. Se agregaran como
              lotes de un campo.
              <vaadin-text-field
                label="Nombre"
                helper-text="Ingrese el nombre del campo"
                .value=${this._nombre_multiple}
                @input=${(e) => (this._nombre_multiple = e.target.value)}
                clear-button-visible
              >
              </vaadin-text-field>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cerrar}
              >
                Cerrar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.guardar_geometrias_multiples}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
// class="fixed-bottom h-50 bg-warning ${this._fsm?.state.matches('editing.nombre') ? "": "d-none"}"
customElements.define("nueva-geometria-ui", NuevaGeometria);
