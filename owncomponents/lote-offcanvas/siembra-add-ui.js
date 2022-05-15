import { LitElement, html } from "lit";
import { interpret } from 'xstate';
import { siembraMachine } from "./siembra-machine";
import { Modal, Offcanvas } from 'bootstrap'

export class SiembraAddUI extends LitElement {
    static properties = {
        lote_id: {},
        campo_id: {},
        lote_nombre: {},
        _steps_elements: {},
        _ctx: {},
        _campo_doc: {},
        _lote_doc: {},
        fsm: { state: true }
    }

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
        const someContext = siembraMachine.initialState.context;

        this.fsm = interpret(siembraMachine.withContext(someContext)).onTransition((state) => {
            this._ctx = state.context;
            console.log(state.value);
            if (state.matches('editing.fecha')) {
                this.show_step(0)
            } else if (state.matches('editing.hectareas')) {
                this.show_step(1)
            } else if (state.matches('editing.rinde')) {
                this.show_step(2)
            } else if (state.matches('editing.humedad')) {
                this.show_step(3)
            } else if (state.matches('editing.adjuntos')) {
                this.show_step(4)
            } else if (state.matches('editing.comentario')) {
                this.show_step(5)
            } else if (state.matches('editing.resumiendo')) {
                this.show_step(6)
            }
        }).start()
    }

    show_step = (n) => {
        if (!this._steps_elements[n]._isShown) {
            this._steps_elements.map((el) => el.hide())
            this._steps_elements[n].show();
        }
    }

    firstUpdated() {
        this._steps_elements = [...document.querySelectorAll('.siembra.step')].map((el) => new Modal(el))
    }

    /**
     * Actualiza los documentos si las propiedades han cambiando.
     * @param {*} changedProperties 
     */
    willUpdate(changedProperties) {

    }

    start() {
        this.fsm.start()
        this.fsm.send({ type: 'NEXT' })
    }

    guardar() {
        // Enviar Evento
        let cosecha = {}
        const event = new CustomEvent('guardar-cosecha', { detail: cosecha, bubbles: true, composed: true });
        this.dispatchEvent(event);
    }

    render() {
        return html`
        <!-- Modal Visible en fecha state -->
        <div class="modal fade siembra step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual es la fecha de la cosecha?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${() =>
                this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
        
                        <input type="date" id="start" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}
                        value="2022-01-01" min="2018-01-01" max="2030-12-31">
        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NEXT")}>Siguiente</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.guardar()}>TEST</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en hectareas state -->
        <div class="modal fade siembra step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Sobre cuantas hectáreas se realizará la aplicación?
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${() =>
                this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <input type="number" value=${this._ctx.hectareas} @change=${(e)=> this.fsm.send({ type: "CHANGE", value:
                        e.target.value })}>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("BACK")}>Atras</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("NEXT")}>Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en Rinde state -->
        <div class="modal fade siembra step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual fue el Rinde?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${() =>
                this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <div class="input-group mb-3">
        
                            <input type="number" class="form-control" @change=${(e)=> this.fsm.send({ type: "CHANGE", value:
                            e.target.value })} aria-label="Text input with dropdown button">
                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                                aria-expanded="false">${this._ctx.unidad}</button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#">tn/ha</a></li>
                                <li><a class="dropdown-item" href="#">qq/ha</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en Humedad state -->
        <div class="modal fade siembra step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual fue la humedad promedio?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${() =>
                this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" @change=${(e)=> this.fsm.send({ type: "CHANGE", value:
                            e.target.value })} aria-label="Text input with dropdown button">
                            <button class="btn btn-outline-secondary" type="button" aria-expanded="false">%</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en Adjuntos state -->
        <div class="modal fade siembra step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Quieres adjuntar algún archivo?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${() =>
                this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <div class="input-group mb-3">
        
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en Comentarios state -->
        <div class="modal fade siembra step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Tienes algún comentario adicional?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${() =>
                this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <h5></h5>
        
                        <textarea id="story" placeholder="Ingresa alguna nota aquí" name="story" rows="5"
                            @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}></textarea>
        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en Resumiendo state -->
        <div class="modal fade siembra step" id="lote-hectareas-editor" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Resumen</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${() =>
                this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <h5></h5>
        
                        <textarea id="story" placeholder="Ingresa alguna nota aquí" name="story" rows="5"
                            @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}></textarea>
        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>

        `
    }
}

customElements.define('siembra-add-ui', SiembraAddUI);
