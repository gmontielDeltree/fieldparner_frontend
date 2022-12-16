import { LitElement, html, unsafeCSS } from "lit";
import { interpret, StateMachine } from "xstate";
import { siembraMachine } from "./siembra-machine";
import "../lista-searchable/lista-searchable.js";
import PouchDB from "pouchdb";
import { base_url } from "../helpers";
import uuid4 from "uuid4";
import "../date-picker/date-picker.ts";
import "@vaadin/combo-box";
import { format } from "date-fns";
import { filter } from "jszip";
import Modal from "bootstrap/js/dist/modal.js";
import { Actividad, DetallesSiembra } from "../depositos/depositos-types";
import { property, state } from "lit/decorators.js";
import { ComboBox } from "@vaadin/combo-box";
import parseISO from "date-fns/parseISO";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";

export class SiembraAddUI extends LitElement {
  @property()
  db: PouchDB.Database;

  @property()
  lote_id: any;

  @property()
  campo_id: any;

  @property()
  lote_nombre: any;

  @property()
  contratistas: any;

  @property()
  settings: any;

  @state({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  _steps_elements: Modal[];

  @state()
  _ctx: Actividad = siembraMachine.initialState.context;

  @state()
  _campo_doc: any;

  @state()
  _lote_doc: any;

  @state()
  _fsm: any;

  @state()
  _insumos: any;

  @state()
  _editando: boolean;

  static styles = unsafeCSS(bootstrap);

  
  load_data() {
    this.db
      .allDocs({
        startkey: "insumo:",
        endkey: "insumo:\ufff0",
        include_docs: true,
      })
      .then((e) => {
        //this._insumos = Object.values(e.);
        console.log("Insumos DOC", e);
        this._insumos = e.rows.map((r) => r.doc);
      })
      .catch((e) => {});
  }

  constructor() {
    super();
    /**
     * Sensible default para el contexto
     */

    // this.cultivos_filtrados = {};
    this.init_fsm();
    // this.es_nuevo_cultivo = false;
  }

  show_step = (n) => {
    if (!this._steps_elements[n]._isShown) {
      this._steps_elements.map((el) => el.hide());
      this._steps_elements[n].show();
    }
  };

  firstUpdated() {
    this._steps_elements = [...this.shadowRoot.querySelectorAll(".siembra.step")].map(
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
      // this.cultivos_filtrados = this.settings.user_cultivos;
      //this._variedades_db_remote = new PouchDB(base_url + "variedades");
      //this._variedades_db_local = new PouchDB("variedades");
      //PouchDB.replicate(this._variedades_db_remote, this._variedades_db_local, {retry:true, live:true})
    }

    if (changedProperties.has("db")) {
      this.load_data();
    }
  }

  start() {
    /* Some UI cleaning */
    (this.shadowRoot.getElementById("contratista-combo") as ComboBox).clear();

    this._fsm.stop();
    this.init_fsm();
    this._fsm.start();
    this._fsm.send({ type: "NEXT" });
    this._editando = false;
  }

  init_fsm() {
    const someContext: Actividad = { ...siembraMachine.initialState.context };
    someContext.detalles.hectareas = this._lote_doc?.properties.hectareas || 0;
    //console.log("Hectareas ", someContext.detalles.hectareas);
    someContext.detalles.fecha_ejecucion_tentativa = format(
      new Date(),
      "yyyy-MM-dd"
    );
    this._ctx = someContext;
    this.init_fsm_with_ctx(this._ctx);
  }

  init_fsm_with_ctx(ctx) {
    this._fsm = interpret(siembraMachine.withContext(ctx))
      .onTransition((state) => {
        this._ctx = state.context;
        //console.log(state.value);
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

  editar(act: Actividad) {
    this._ctx = act;
    this._fsm.stop();
    this.init_fsm_with_ctx(this._ctx);
    this._fsm.start();
    this._fsm.send({ type: "NEXT" });

    // Algunos controles necesita inicializacion
    this._editando = true;
  }

  guardar() {
    // Enviar Evento
    let siembra: Actividad = this._ctx as Actividad;

    let old_id;
    if(this._editando){
      old_id = siembra._id;
    }

    // Nuevo
    let uuid = uuid4();
    siembra.lote_uuid = this._lote_doc.properties.uuid;

    let fecha = format(
      parseISO(siembra.detalles.fecha_ejecucion_tentativa),
      "yyyyMMdd"
    );

    siembra._id = "actividad:" + fecha + ":" + uuid;
    siembra.uuid = uuid;

    if(this._editando){
      const event = new CustomEvent("guardar-edicion", {
        detail: {old_id: old_id, actividad: siembra},
        bubbles: true,
        composed: true,
      });
  
      this.dispatchEvent(event);
    }else{
      const event = new CustomEvent("guardar-siembra", {
        detail: siembra,
        bubbles: true,
        composed: true,
      });
  
      this.dispatchEvent(event);
    }



    

    this._fsm.send({ type: "GUARDAR" });

    // Si hay cultivos nuevos y/o varidades enviar otro evento
    // para que la aplicacion tome accion apropiada

    //let es_nuevo_cultivo = this.shadowRoot.getElementById("cultivo-input").es_nuevo;
    //let es_nueva_variedad = this.shadowRoot.getElementById("variedad-input").es_nuevo;

    // if (es_nuevo_cultivo) {
    //   // Evento para que se actualicen las settings en FP
    // }

    // if (es_nueva_variedad) {
    //   // Grabo la variedad aca
    //   console.log("es Nueva Variedad");
    //   let id =
    //     this._ctx.cultivo.toUpperCase() +
    //     ":" +
    //     this._ctx.variedad.toUpperCase();
    //   let nv = {};
    //   nv._id = id;
    //   nv.especie = this._ctx.cultivo.toUpperCase();
    //   nv.cultivar = this._ctx.variedad.toUpperCase();
    //   nv.uuid = uuid4();
    //   this._variedades_db_local.put(nv);
    // }
  }

  solo_contratistas_siembra() {
    /**
     *
     * @param {array} labores
     * @param {*} nombre_labor
     * @returns true - nombre_labor existe en el array de labores
     */
    const tiene_labor = (labores, nombre_labor) => {
      let a = labores?.filter((labor) => labor.labor === nombre_labor);
      if (a?.length > 0) {
        return true;
      }
      return false;
    };

    let filtered_contratistas = [];

    // console.log("FILTRADO", this.contratistas);
    Object.values(this.contratistas.contratistas).map((value) => {
      //console.log("COntra", value)
      if (tiene_labor(value.labores, "Siembra")) {
        filtered_contratistas.push(value);
      }
    });

    //console.log(filtered_contratistas)
    return filtered_contratistas;
  }

  cultivo_input_changed(e) {
    // console.log("IN OPUT EVENT", e);
    // this._fsm.send({ type: "CHANGE", value: e.target.value });
    // if (!e.target.es_nuevo) {
    //   let cultivo = e.target.value;
    //   console.log("Cultivo", cultivo);
    //   // LA DB NO TIENE ACENTO y esta en Mayus
    //   this._variedades_db_local
    //     .allDocs({
    //       include_docs: true,
    //       startkey: cultivo.toUpperCase(),
    //       endkey: cultivo.toUpperCase() + "\ufff0",
    //     })
    //     .then((variedades_docs) => {
    //       this._filtered_variedades_docs = variedades_docs.rows.map(
    //         (d) => d.doc
    //       );
    //       console.log("Filtered Variedades", variedades_docs);
    //     });
    // }
  }

  render() {
    let detalles = this._ctx.detalles as DetallesSiembra;

    let cancel_back_next = () => html` <button
        type="button"
        class="btn btn-secondary"
        data-bs-dismiss="modal"
        @click=${() => this._fsm.send("CANCEL")}
      >
        Cancelar
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click=${() => this._fsm.send("BACK")}
      >
        Atras
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click=${() => this._fsm.send("NEXT")}
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
                @click=${() => this._fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <date-picker
                id="siembra-fecha"
                .fecha=${detalles.fecha_ejecucion_tentativa}
                @change=${(e) => {
                  this._fsm.send({
                    type: "CHANGE",
                    value: e.target.fecha,
                  });
                }}
              ></date-picker>

              <vaadin-combo-box
                id="contratista-combo"
                allow-custom-value
                @custom-value-set="${() => {
                  console.log("Nuevo Value");
                }}"
                label="Contratista"
                item-label-path="nombre"
                item-value-path="uuid"
                .selectedItem=${this._ctx.contratista}
                .items="${this.contratistas
                  ? this.solo_contratistas_siembra()
                  : []}"
                @selected-item-changed=${(e) => {
                  // console.log("e", e);
                  this._fsm.send({
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
                @click=${() => this._fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this._fsm.send("NEXT")}
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
                @click=${() => this._fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  .value=${detalles.hectareas}
                  @change=${(e) =>
                    this._fsm.send({
                      type: "CHANGE",
                      value: +e.target.value,
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
                ¿Cual es el cultivo/semilla?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${() => this._fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="container-fluid modal-body mx-auto"></div>

            <vaadin-combo-box
              id="marca-comercial-combo"
              allow-custom-value
              @custom-value-set="${() => {
                console.log("Nuevo Value");
              }}"
              label="Insumo"
              item-label-path="marca_comercial"
              item-value-path="uuid"
              .selectedItem=${detalles.insumo}
              .items="${this._insumos ? this._insumos : []}"
              @selected-item-changed=${(e) => {
                // console.log("e", e);
                this._fsm.send({
                  type: "SELECTED",
                  value: e.detail.value,
                });
              }}
            ></vaadin-combo-box>

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
                @click=${() => this._fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="container-fluid  modal-body mx-auto">
              <p class="row mx-2"></p>
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
                @click=${() => this._fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  .value=${detalles.peso_1000}
                  @change=${(e) =>
                    this._fsm.send({
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
                @click=${() => this._fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  .value=${detalles.densidad_objetivo}
                  @change=${(e) =>
                    this._fsm.send({
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
                @click=${() => this._fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  .value=${detalles.distancia}
                  @change=${(e) =>
                    this._fsm.send({
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
                @click=${() => this._fsm.send("CANCEL")}
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
                @click=${() => this._fsm.send("CANCEL")}
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
                .value=${this._ctx.comentario}
                @change=${(e) =>
                  this._fsm.send({ type: "CHANGE", value: e.target.value })}
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
                @click=${() => this._fsm.send("CANCEL")}
              ></button>
            </div>
            <div class="modal-body w-100 mx-auto">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">
                  Siembra de ${detalles.insumo.marca_comercial} -
                </h5>
                <small>${detalles.fecha_ejecucion_tentativa}</small>
              </div>
              <p class="mb-1">
                Surco: ${detalles.distancia} cm. - Densidad Objetivo:
                ${detalles.densidad_objetivo} plantas/ha.
              </p>
              <p class="mb-1">Peso 1000 semillas: ${detalles.peso_1000} grs.</p>
              <small>${this._ctx.comentario}</small>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${() => this._fsm.send("CANCEL")}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${() => this._fsm.send("BACK")}
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

declare global {
  interface HTMLElementTagNameMap {
    "siembra-add-ui": SiembraAddUI;
  }
}