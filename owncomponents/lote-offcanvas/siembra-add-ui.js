import { LitElement, html } from "lit";
import { interpret } from "xstate";
import { siembraMachine } from "./siembra-machine";
import { Modal, Offcanvas } from "bootstrap";
import "../lista-searchable/lista-searchable.js";
import PouchDB from "pouchdb";
import { base_url } from "../helpers";
import uuid4 from "uuid4";
import "../date-picker/date-picker.ts";
import "@vaadin/combo-box";

export class SiembraAddUI extends LitElement {
  static properties = {
    lote_id: {},
    campo_id: {},
    lote_nombre: {},
    contratistas: {},
    _steps_elements: {},
    _ctx: {},
    _campo_doc: {},
    _lote_doc: {},
    settings: {},
    cultivo_input: {},
    es_nuevo_cultivo: {},
    cultivos_filtrados: {},
    fsm: { state: true },
    _variedades_db_local: {},
    _variedades_db_remote: {},
    _filtered_variedades_docs: {},
  };

  static styles = null;

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    /**
     * Sensible default para el contexto
     */

    this._ctx = siembraMachine.initialState.context;
    this.cultivos_filtrados = {};
    this.init_fsm();
    this.es_nuevo_cultivo = false;
  }

  show_step = (n) => {
    if (!this._steps_elements[n]._isShown) {
      this._steps_elements.map((el) => el.hide());
      this._steps_elements[n].show();
    }
  };

  firstUpdated() {
    this._steps_elements = [...document.querySelectorAll(".siembra.step")].map(
      (el) => new Modal(el)
    );
  }

  hideAll = () => {
    this._steps_elements?.map((el) => el.hide());
  };

  /**
   * Actualiza los documentos si las propiedades han cambiando.
   * @param {*} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has("_lote_doc")) {
      this.init_fsm();
    }
    if (changedProperties.has("settings")) {
      this.cultivos_filtrados = this.settings.user_cultivos;

      this._variedades_db_remote = new PouchDB(base_url + "variedades");
      this._variedades_db_local = new PouchDB("variedades");
      //PouchDB.replicate(this._variedades_db_remote, this._variedades_db_local, {retry:true, live:true})
    }
  }

  start() {
    this.fsm.stop();
    this.init_fsm();
    this.fsm.start();
    this.fsm.send({ type: "NEXT" });
  }

  init_fsm() {
    const someContext = { ...siembraMachine.initialState.context };
    someContext.hectareas = this._lote_doc?.properties.hectareas || 0;
    console.log("Hectareas ", someContext.hectareas);
    this._ctx = someContext;

    this.fsm = interpret(siembraMachine.withContext(someContext))
      .onTransition((state) => {
        this._ctx = state.context;
        console.log(state.value);
        if (state.matches("idle")) {
          this.hideAll();
        }
        if (state.matches("editing.fecha")) {
          this.show_step(0);
        } else if (state.matches("editing.hectareas")) {
          this.show_step(1);
        } else if (state.matches("editing.cultivo")) {
          this.show_step(2);
        } else if (state.matches("editing.variedad")) {
          this.show_step(3);
        } else if (state.matches("editing.peso_1000")) {
          this.show_step(4);
        } else if (state.matches("editing.densidad")) {
          this.show_step(5);
        } else if (state.matches("editing.distancia")) {
          this.show_step(6);
        } else if (state.matches("editing.adjuntos")) {
          this.show_step(7);
        } else if (state.matches("editing.comentario")) {
          this.show_step(8);
        } else if (state.matches("editing.resumiendo")) {
          this.show_step(9);
        }
      })
      .start();
  }

  guardar() {
    // Enviar Evento
    let siembra = this._ctx;
    const event = new CustomEvent("guardar-siembra", {
      detail: siembra,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    this.fsm.send({ type: "GUARDAR" });

    // Si hay cultivos nuevos y/o varidades enviar otro evento
    // para que la aplicacion tome accion apropiada

    let es_nuevo_cultivo = document.getElementById("cultivo-input").es_nuevo;
    let es_nueva_variedad = document.getElementById("variedad-input").es_nuevo;

    if (es_nuevo_cultivo) {
      // Evento para que se actualicen las settings en FP
    }

    if (es_nueva_variedad) {
      // Grabo la variedad aca
      console.log("es Nueva Variedad");
      let id =
        this._ctx.cultivo.toUpperCase() +
        ":" +
        this._ctx.variedad.toUpperCase();
      let nv = {};
      nv._id = id;
      nv.especie = this._ctx.cultivo.toUpperCase();
      nv.cultivar = this._ctx.variedad.toUpperCase();
      nv.uuid = uuid4();
      this._variedades_db_local.put(nv);
    }
  }

  cultivo_input_changed(e) {
    console.log("IN OPUT EVENT", e);
    this.fsm.send({ type: "CHANGE", value: e.target.value });
    if (!e.target.es_nuevo) {
      let cultivo = e.target.value;
      console.log("Cultivo", cultivo);

      // LA DB NO TIENE ACENTO y esta en Mayus
      this._variedades_db_local
        .allDocs({
          include_docs: true,
          startkey: cultivo.toUpperCase(),
          endkey: cultivo.toUpperCase() + "\ufff0",
        })
        .then((variedades_docs) => {
          this._filtered_variedades_docs = variedades_docs.rows.map(
            (d) => d.doc
          );
          console.log("Filtered Variedades", variedades_docs);
        });
    }
  }

  render() {
    let cancel_back_next = () => html` <button
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
      </button>`;

    return html`
      <!-- Modal Visible en fecha state -->
      <div
        class="modal fade siembra step"
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
                ¿Cual es la fecha y quien realizará la siembra?
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
                .items="${this.contratistas ? Object.values(this.contratistas?.contratistas) : []}"
                @selected-item-changed=${(e) => {
                  console.log("e",e)
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
        class="modal fade siembra step"
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
                ¿Sobre cuantas hectáreas se realizará la siembra?
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
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  .value=${this._ctx.hectareas}
                  @change=${(e) =>
                    this.fsm.send({
                      type: "CHANGE",
                      value: e.target.value,
                    })}
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  aria-expanded="false"
                >
                  has.
                </button>
              </div>
            </div>

            <div class="modal-footer">${cancel_back_next()}</div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Cultivo state -->
      <div
        class="modal fade siembra step"
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
                ¿Cual es el cultivo?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="container-fluid modal-body mx-auto"></div>
            <lista-searchable
              id="cultivo-input"
              .lista=${this.settings?.user_cultivos}
              .principal_key=${"nombre"}
              @input=${this.cultivo_input_changed}
            >
            </lista-searchable>
            <div class="modal-footer">${cancel_back_next()}</div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Variedad state -->
      <div
        class="modal fade siembra step"
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
                ¿Cual es la variedad?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this.fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="container-fluid  modal-body mx-auto">
              <p class="row mx-2">
                ${this._filtered_variedades_docs?.length || 0} variedades de
                ${this._ctx.cultivo.toUpperCase()}
              </p>
              <lista-searchable
                id="variedad-input"
                .lista=${this._filtered_variedades_docs}
                .principal_key=${"cultivar"}
                @input=${(e) => {
                  this.fsm.send({ type: "CHANGE", value: e.target.value });
                }}
              ></lista-searchable>
            </div>
            <div class="modal-footer">${cancel_back_next()}</div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Peso 1000 state -->
      <div
        class="modal fade siembra step"
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
                ¿Cual es el peso de las 1000 semillas?
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
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  @change=${(e) =>
                    this.fsm.send({
                      type: "CHANGE",
                      value: e.target.value,
                    })}
                  aria-label="Text input with dropdown button"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  aria-expanded="false"
                >
                  grs
                </button>
              </div>
            </div>
            <div class="modal-footer">${cancel_back_next()}</div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Densidad state -->
      <div
        class="modal fade siembra step"
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
                ¿Cual es la Densidad Objetivo?
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
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  @change=${(e) =>
                    this.fsm.send({
                      type: "CHANGE",
                      value: e.target.value,
                    })}
                  aria-label="Text input with dropdown button"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  aria-expanded="false"
                >
                  plantas/ha
                </button>
              </div>
            </div>
            <div class="modal-footer">${cancel_back_next()}</div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Distancia state -->
      <div
        class="modal fade siembra step"
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
                ¿Cual es la distancia entre surcos?
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
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  @change=${(e) =>
                    this.fsm.send({
                      type: "CHANGE",
                      value: e.target.value,
                    })}
                  aria-label="Text input with dropdown button"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  aria-expanded="false"
                >
                  cm
                </button>
              </div>
            </div>
            <div class="modal-footer">${cancel_back_next()}</div>
          </div>
        </div>
      </div>

      <div
        class="modal fade siembra step"
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
                ¿Quieres adjuntar algún archivo?
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
              <div class="input-group mb-3"></div>
            </div>
            <div class="modal-footer">${cancel_back_next()}</div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Comentarios state -->
      <div
        class="modal fade siembra step"
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
                @change=${(e) =>
                  this.fsm.send({ type: "CHANGE", value: e.target.value })}
              ></textarea>
            </div>
            <div class="modal-footer">${cancel_back_next()}</div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Resumiendo state -->
      <div
        class="modal fade siembra step"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
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
            <div class="modal-body w-100 mx-auto">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">
                  Siembra de ${this._ctx.cultivo} - ${this._ctx.variedad}
                </h5>
                <small>${this._ctx.fecha}</small>
              </div>
              <p class="mb-1">
                Surco: ${this._ctx.distancia} cm. - Densidad Objetivo:
                ${this._ctx.densidad_objetivo} plantas/ha.
              </p>
              <p class="mb-1">
                Peso 1000 semillas: ${this._ctx.peso_1000} grs.
              </p>
              <small>${this._ctx.comentario}</small>
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
                @click=${this.guardar}
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

customElements.define("siembra-add-ui", SiembraAddUI);
