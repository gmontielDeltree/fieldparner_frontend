import { LitElement, html } from "lit";
import { nuevaGeometriaMachine } from "./nueva-geometria-machina";
import { Modal } from "bootstrap";
import { interpret } from "xstate";

export class NuevaGeometria extends LitElement {
  static properties = {
    campo: {},
    show: {},
    _ctx: {},
    _fsm: {},
    _modal_elements: {},
  };

  constructor() {
    super();
    this.show = false;
    this._modal_elements = {};
    this._init_fsm();
  }

  createRenderRoot() {
    return this;
  }

  _init_fsm() {
    const someContext = nuevaGeometriaMachine.initialState.context;
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
    let state_value = state_strings.slice(-1)[0];
    if(state_value === 'idle'){
        this.hide_all_steps()
        this.show = false
        return
    }
    console.log("ST Show", state_value);
    if (!(state_value in this._modal_elements)) {
      return;
    }
    if (!this._modal_elements[state_value]?._isShown || false) {
      this.hide_all_steps();
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
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("show") && this.show) {
      this._fsm.send("START");
    }
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
              <button>Dibujar</button>
              <button>Subir Archivo</button>
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
    `;
  }
}

customElements.define("nueva-geometria-ui", NuevaGeometria);
