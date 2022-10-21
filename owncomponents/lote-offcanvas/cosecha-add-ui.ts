import { LitElement, html } from "lit";
import { interpret } from "xstate";
import { cosechaMachine } from "./cosecha-machine";
import "../date-picker/date-picker.ts";
import "@vaadin/combo-box";
import { format } from "date-fns";
import Modal from "bootstrap/js/dist/modal.js";
import { property, state } from "lit/decorators.js";
import { Actividad, DetallesCosecha } from "../depositos/depositos-types";
import { empty_contratista } from "../contratistas/contratista-types";

export class CosechaAddUI extends LitElement {
  @property()
  campo_id: any;

  @property()
  lote_nombre: any;

  @property()
  contratistas: any;

  @property({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  _steps_elements: any;

  @property()
  _campo_doc: any;

  @property()
  _lote_doc: any;

  @property()
  doc: Actividad = {
    _id: "",
    uuid: "",
    ts_generacion: 0,
    tipo: "siembra",
    estado: "pendiente",
    lote_uuid: "",
    detalles: {
      fecha_ejecucion_tentativa: "",
      hectareas: 0,
      rinde: 0,
      humedad: 0,
    } as DetallesCosecha,
    comentario: "",
    adjuntos: [],
    contratista: { ...empty_contratista },
  };

  @state()
  paso: number = 0;

  static styles = null;

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.init_fsm();
  }

  init_fsm() {
    /**
     * Sensible default para el contexto
     */
    this.doc.detalles.fecha_ejecucion_tentativa = format(
      new Date(),
      "yyyy-MM-dd"
    );
    this.doc.detalles.hectareas = this._lote_doc?.properties.hectareas || 0;

    // this.fsm = interpret(cosechaMachine.withContext(someContext))
    //    .onTransition((state) => {
    //      this._ctx = state.context;
    //      // console.log(state.value);
    //      if (state.matches("idle")) {
    //        this.hideAll();
    //      }
    //      if (state.matches("editing.fecha")) {
    //        this.show_step(0);
    //      } else if (state.matches("editing.hectareas")) {
    //        this.show_step(1);
    //      } else if (state.matches("editing.rinde")) {
    //        this.show_step(2);
    //      } else if (state.matches("editing.humedad")) {
    //        this.show_step(3);
    //      } else if (state.matches("editing.adjuntos")) {
    //        this.show_step(4);
    //      } else if (state.matches("editing.comentario")) {
    //        this.show_step(5);
    //      } else if (state.matches("editing.resumiendo")) {
    //        this.show_step(6);
    //      }
    //    })
    //    .start();
  }

  show_step = (n) => {
    if (!this._steps_elements[n]._isShown) {
      this._steps_elements.map((el) => el.hide());
      this._steps_elements[n].show();
    }
  };

  hideAll = () => {
    this._steps_elements?.map((el) => el.hide());
  };

  firstUpdated() {
    this._steps_elements = [...document.querySelectorAll(".cosecha.step")].map(
      (el) => new Modal(el)
    );
  }

  /**
   * Actualiza los documentos si las propiedades han cambiando.
   * @param {*} changedProperties
   */
  willUpdate(changedProperties) {}

  start() {
    document.getElementById("contratista-cosecha-combo").clear();
    this.init_fsm();
    this.next()
  }

  solo_contratistas_cosecha() {
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

    //console.log("FILTRADO", this.contratistas)
    Object.values(this.contratistas.contratistas).map((value) => {
      //console.log("COntra", value)
      if (tiene_labor(value.labores, "Cosecha")) {
        filtered_contratistas.push(value);
      }
    });

    //console.log(filtered_contratistas)
    return filtered_contratistas;
  }

  guardar() {
    // Enviar Evento. se procesa en lote-offcanvas.js
    let cosecha = this.doc;
    const event = new CustomEvent("guardar-cosecha", {
      detail: cosecha,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
    this.cancel()
  }

  cancel() {
    this.hideAll();
    this.paso = 0;

  }

  next() {
    this.paso = this.paso + 1;
    this.show_step(this.paso);
  }

  back(){
    this.paso = this.paso - 1;
    this.show_step(this.paso);
  }

  render() {
    return html`
      <!-- Modal Visible en fecha state -->
      <div
        class="modal fade cosecha step"
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
                ¿Cual es la fecha de la cosecha?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${this.cancel}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <date-picker
                .fecha=${this.doc.detalles.fecha_ejecucion_tentativa}
                @change=${(e) => {
                  this.doc.detalles.fecha_ejecucion_tentativa = e.target.fecha;
                }}
              ></date-picker>

              <vaadin-combo-box
                allow-custom-value
                id="contratista-cosecha-combo"
                @custom-value-set="${() => {
                  console.log("Nuevo Value");
                }}"
                label="Contratista"
                item-label-path="nombre"
                item-value-path="uuid"
                .items="${this.contratistas
                  ? this.solo_contratistas_cosecha()
                  : []}"
                @selected-item-changed=${(e) => {
                  console.log("e", e);
                  this.doc.contratista = e.detail.value;
                }}
              ></vaadin-combo-box>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cancel}
              >
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" @click=${this.next}>
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en hectareas state -->
      <div
        class="modal fade cosecha step"
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
                ¿Sobre cuantas hectáreas se realizó la cosecha?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${this.cancel}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <input
                type="number"
                .value=${this.doc.detalles.hectareas}
                @change=${(e) => (this.doc.detalles.hectareas = e.target.value)}
              />
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.back}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.next}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Rinde state -->
      <div
        class="modal fade cosecha step"
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
                ¿Cual fue el Rinde?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${this.cancel}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  .value=${this.doc.detalles.rinde}
                  @change=${(e) => this.doc.detalles.rinde = e.target.value}
                  aria-label="Text input with dropdown button"
                />
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  tn/ha
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#">tn/ha</a></li>
                  <li><a class="dropdown-item" href="#">qq/ha</a></li>
                </ul>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.back}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.next}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Humedad state -->
      <div
        class="modal fade cosecha step"
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
                ¿Cual fue la humedad promedio de la cosecha?
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${this.cancel}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="input-group mb-3">
                <input
                  type="number"
                  class="form-control"
                  .value=${this.doc.detalles.humedad}
                  @change=${(e) => this.doc.detalles.humedad = e.target.value }
                  aria-label="Text input with dropdown button"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  aria-expanded="false"
                >
                  %
                </button>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.back}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.next}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Adjuntos state -->
      <div
        class="modal fade cosecha step"
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
                @click=${this.cancel}
              ></button>
            </div>
            <div class="modal-body mx-auto">
              <div class="input-group mb-3"></div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.back}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.next}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Comentarios state -->
      <div
        class="modal fade cosecha step"
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
                @click=${this.cancel}
              ></button>
            </div>
            <div class="modal-body mx-auto w-100">
              <textarea
                class="w-100"
                placeholder="Ingresa alguna nota aquí"
                .value=${this.doc.comentario}
                name="story"
                rows="5"
                @change=${(e) => this.doc.comentario = e.target.value }
              ></textarea>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.back}
              >
                Atras
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.next}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Visible en Resumiendo state -->
      <div
        class="modal fade cosecha step"
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
              <h5 class="modal-title" id="staticBackdropLabel">Resumen</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click=${this.cancel}
              ></button>
            </div>
            <div class="modal-body w-100 mx-auto">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">Cosecha en Lote</h5>
                <small>${this.doc.detalles.fecha_ejecucion_tentativa}</small>
              </div>
              <p class="mb-1">
                Rinde de ${this.doc.detalles.rinde} tn/ha en ${this.doc.detalles.hectareas} ha.
                - Total ${(this.doc.detalles.rinde * this.doc.detalles.hectareas).toFixed(2)}
                tn.
              </p>
              <p class="mb-1">Humedad ${this.doc.detalles.humedad} %</p>
              <small>${this.doc.comentario}</small>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click=${this.cancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click=${this.back}
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

customElements.define("cosecha-add-ui", CosechaAddUI);
