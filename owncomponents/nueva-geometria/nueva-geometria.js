import { LitElement, html } from "lit";
import { nuevaGeometriaMachine } from "./nueva-geometria-machina";
import { Modal } from "bootstrap";
import { interpret } from "xstate";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Offcanvas } from "bootstrap";

export class NuevaGeometria extends LitElement {
  static properties = {
    campo_feature: {},
    show: {},
    mapa: {},
    tipo: {},
    _offcanvas: {},
    _draw: {},
    _ctx: {},
    _fsm: {},
    _feature_id: {},
    _modal_elements: {},
  };

  constructor() {
    super();
    this.show = false;
    this._modal_elements = {};
    // this._init_fsm();

    this._draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: false,
        trash: false,
      },
    });
    console.log("Construction", this.mapa);

    this._feature_id = "00";
    // this.map.addControl(this._draw, 'top-left');
  }

  createRenderRoot() {
    return this;
  }

  _init_fsm() {
    const someContext = nuevaGeometriaMachine.initialState.context;
    someContext.campo_feature = this.campo_feature;
    // Mods al ctx inicial
    this._fsm = interpret(nuevaGeometriaMachine.withContext(someContext))
      .onTransition((state) => {
        this._ctx = state.context;
        console.log(state.toStrings());
        this.show_step(state.toStrings());
      })
      .start();
  }

  show_step = (state_strings) => {
    this.hide_all_steps();
    console.log(this.draw);
    let state_value = state_strings.slice(-1)[0];
    if (state_value === "idle") {
      this.show = false;
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

    console.log("ST Show", state_value);
    if (!(state_value in this._modal_elements)) {
      return;
    }

    if (!this._modal_elements[state_value]?._isShown || false) {
      if (this.show) {
        this._modal_elements[state_value].show();
      }
    }
  };

  hide_all_steps() {
    Object.entries(this._modal_elements).forEach(([key, value]) =>
      value.hide()
    );
  }

  firstUpdated() {
    // _modal_elements es un objeto de objetos. Las claves son los id/states. { 'pregunta': Modal(), }
    let result_object = {};
    let lista_mapeo = [...document.querySelectorAll(".add-geometry.step")].map(
      (el) => (result_object[el.id] = new Modal(el)) // ej {'pregunta': Modal()}
    );

    this._modal_elements = result_object;

    this._offcanvas = new Offcanvas(
      document.getElementById("offcanvas-editing-dibujando")
    );
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("show") && this.show) {
      this._fsm.send("START");
    }

    if (changedProperties.has("campo_feature")) {
      this._init_fsm();
    }

    if (changedProperties.has("mapa")) {
      console.log("Changed Props", this.mapa);
      this.mapa.addControl(this._draw, "top-left");

      this.mapa.on("draw.selectionchange", (e) => {
        /* Si la seleccion cambia a algo distinto del featureId
         que ya genere, volver a seleccionar lo mismo para prevenir
          que pueda seguir dibujando */
        console.log("SELECTIONCHANGE", e);
        if (e.features[0]?.id !== this._feature_id) {
          console.log("RESELECTING");
          this._draw.changeMode("simple_select", {
            featureIds: [this._feature_id],
          });
        }
      });

      this.mapa.on("draw.create", (e) => {
        console.log("CERRO");
        /* Guardar la feature */
        this._feature_id = e.features[0].id;
        let feature = e.features[0];
        this._fsm.send({ type: "CERRO", feature });
      });

      this.mapa.on("draw.update", (args) => {
        let feature = args.features[0];
        console.log("UPDATE", args);
        this._fsm.send({ type: "UPDATE_POLIGONO", feature: feature });
      });
      //this.mapa.on("draw.render", this.render_callback);
    }
  }

  render_callback(args) {
    //console.log("Render, Callback", args);
  }

  dibujar() {
    this._fsm.send("DIBUJAR");
  }

  cerrar() {
    this._fsm.send("CANCEL");
  }

  render() {
    return html`
      <div class="modal add-geometry step" id="editing.pregunta" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                Dibuja el lote en tu mapa para continuar
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${this.cerrar}
              ></button>
            </div>
            <div class="modal-body">
              <p>Modal body text goes here.</p>
              <button @click="${this.dibujar}">Dibujar</button>
              <button
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
                Close
              </button>
              <button type="button" class="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="offcanvas offcanvas-bottom"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabindex="-1"
        id="offcanvas-editing-dibujando"
      >
        <div class="offcanvas-header py-1">
          <h5 class="offcanvas-title mx-auto">Nuevo ${this.tipo}</h5>

          <button
            type="button"
            class="btn-close text-reset"
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
                <input type="text" class="form-control" />
              </div>
            </div>

            ${(this._ctx.guardar_enable) ? (
              html` <div class="d-grid gap-2">
                <button class="btn btn-primary btn-success" type="button">
                  Guardar
                </button>
              </div>`
            ) : html `
              <div class="alert alert-danger" role="alert">
                Todos los puntos del lote deben estar dentro del campo!
              </div>
            `}
          </form>
        </div>
      </div>
    `;
  }
}

customElements.define("nueva-geometria-ui", NuevaGeometria);
