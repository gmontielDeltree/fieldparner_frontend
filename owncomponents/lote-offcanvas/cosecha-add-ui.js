import { LitElement, html } from "lit";
import { interpret } from 'xstate';
import { cosechaMachine } from "./cosecha-machine";
import { Modal, Offcanvas } from 'bootstrap'

export class CosechaAddUI extends LitElement {
    static properties = {
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
        this._ctx = cosechaMachine.initialState.context;
        const someContext = cosechaMachine.initialState.context;

        this.fsm = interpret(cosechaMachine.withContext(someContext)).onTransition((state) => {
            this._ctx = state.context;
            console.log(state.value);
            if(state.matches('idle')){
                this.hideAll()
            }
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
    
    hideAll = () => {
            this._steps_elements?.map((el) => el.hide())
    }
    

    firstUpdated() {
        this._steps_elements = [...document.querySelectorAll('.cosecha.step')].map((el) => new Modal(el))
    }

    /**
     * Actualiza los documentos si las propiedades han cambiando.
     * @param {*} changedProperties 
     */
    willUpdate(changedProperties) {
       
    }

    start(){
        this.fsm.start()
        this.fsm.send({type:'NEXT'})
    }

    guardar(){
        // Enviar Evento
        let cosecha = this._ctx
        const event = new CustomEvent('guardar-cosecha', {detail:cosecha, bubbles: true, composed: true});
        this.dispatchEvent(event);
        this.fsm.send({type:'GUARDAR'})
    }

    render() {
        return html`
        <!-- Modal Visible en fecha state -->
        <div class="modal fade cosecha step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual es la fecha de la cosecha?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${()=>
                            this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                    <lit-flatpickr 
                        id="dpc"
                        altInput
                        altFormat="j F, Y"
                        dateFormat="d-m-Y"
                        theme="material_blue"
                        minDate="31-12-2020"
                        maxDate="31-12-2050"
                        locale="es"
                        placeholder="Ingrese una fecha"
                        .onChange='${(e) => {this.fsm.send({ type: "CHANGE", value: document.getElementById('dpc').getValue() })}}'
                    >
                    <div>
                        <input />
                    </div>
                    </lit-flatpickr>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("NEXT")}>Siguiente</button>
                    </div>
                </div>
            </div>
        </div>

                <!-- Modal Visible en hectareas state -->
                <div class="modal fade cosecha step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Sobre cuantas hectáreas se realizó la cosecha?
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${()=>
                            this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <input type="number" value=${this._ctx.hectareas} @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")}>Atras</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NEXT")}>Siguiente</button>
                    </div>
                </div>
            </div>
        </div>

                <!-- Modal Visible en Rinde state -->
                <div class="modal fade cosecha step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual fue el Rinde?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${()=>
                            this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <div class="input-group mb-3">
                            
                            <input type="number" class="form-control" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })} aria-label="Text input with dropdown button">
                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">tn/ha</button>
                            <ul class="dropdown-menu"> 
                                <li><a class="dropdown-item" href="#">tn/ha</a></li>
                                <li><a class="dropdown-item" href="#">qq/ha</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>

                <!-- Modal Visible en Humedad state -->
                <div class="modal fade cosecha step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual fue la humedad promedio de la cosecha?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${()=>
                            this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })} aria-label="Text input with dropdown button">
                            <button class="btn btn-outline-secondary" type="button" aria-expanded="false">%</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() => this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>

                <!-- Modal Visible en Adjuntos state -->
            <div class="modal fade cosecha step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Quieres adjuntar algún archivo?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${()=>
                            this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto">
                        <div class="input-group mb-3">

                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>

                <!-- Modal Visible en Comentarios state -->
                <div class="modal fade cosecha step" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Tienes algún comentario adicional?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${()=>
                            this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body mx-auto w-100">

                        <textarea class="w-100" placeholder="Ingresa alguna nota aquí" name="story" rows="5" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}></textarea>
        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NEXT")} >Siguiente</button>
                    </div>
                </div>
            </div>
        </div>

                <!-- Modal Visible en Resumiendo state -->
                <div class="modal fade cosecha step" id="lote-hectareas-editor" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Resumen</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click=${()=>
                            this.fsm.send("CANCEL")}></button>
                    </div>
                    <div class="modal-body w-100 mx-auto">
                        <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Cosecha en Lote</h5>
                        <small>${this._ctx.fecha}</small>
                        </div>
                        <p class="mb-1">Rinde de ${this._ctx.rinde} tn/ha en ${this._ctx.hectareas} ha. - Total ${(this._ctx.rinde * this._ctx.hectareas).toFixed(2)} tn.</p>
                        <p class="mb-1">Humedad ${this._ctx.humedad} %</p>
                        <small>${this._ctx.comentario}</small>

        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${this.guardar} >Guardar</button>
                    </div>
                </div>
            </div>
        </div>

        `
    }
}

customElements.define('cosecha-add-ui', CosechaAddUI);
