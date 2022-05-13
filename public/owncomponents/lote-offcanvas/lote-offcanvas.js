import { LitElement, html, css, map } from '../../assets/lit-all.min.js';
import { aplicacionMachine } from './lote-machine.js';
import '../../assets/xstate.js';

const { interpret, send } = XState;

export class LoteOffcanvas extends LitElement {
    static properties = {
        db: {},
        lote_id: {},
        campo_id: {},
        lote_nombre: {},
        _lotesOffcanvas: {},
        _fecha_editor: {},
        _steps_elements: {},
        _ctx: {},
        fsm: { state: true }
    }

    static styles = css`
    :host {
      display: inline-block;
      padding: 10px;
      background: lightgray;
    }
    .planet {
      color: var(--planet-color, blue);
    }
    `;

    show_step = (n) => {
        if (!this._steps_elements[n]._isShown) {
            this._steps_elements.map((el) => el.hide())
            this._steps_elements[n].show();
        }
    }

    constructor() {
        super();
        this.fsm = interpret(aplicacionMachine).onTransition((state) => {
            this._ctx = state.context;
            console.log(state.value);
            if (state.matches('editing.fecha')) {
                this.show_step(0)
            } else if (state.matches('editing.hectareas')) {
                this.show_step(1)
            } else if (state.matches('editing.insumo')) {
                this.show_step(2)
            } else if (state.matches('editing.dosis')) {
                this.show_step(3)
            }else if (state.matches('editing.motivo')) {
                this.show_step(4)
            }

            else if (state.matches('editing.masinsumos')) {
                this.show_step(5)
            }else if (state.matches('editing.comentario')) {
                this.show_step(6)
            }else if (state.matches('editing.resumiendo')) {
                this.show_step(7)
            }else if (state.matches('editing.share')) {
                this.show_step(8)
            }
        }).start()
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        this._lotesOffcanvas = new bootstrap.Offcanvas(document.getElementById('lote-offcanvas'))
        // this._fecha_editor = new bootstrap.Modal(document.getElementById('lote-fecha-editor'))
        this._steps_elements = [...document.querySelectorAll('.aplicacion.step')].map((el) => new bootstrap.Modal(el))
    }

    show() {
        this._lotesOffcanvas.show();
    }

    siembra() {
        console.log(this.fsm)
    }

    actividad() {
        this.fsm.send({ type: "NEXT" })
    }

    cosecha() { }

    ctx(key) {
        return this.fsm.machine.context
    }

    render() {
        return html`

        <div class="offcanvas offcanvas-bottom" tabindex="-1" id="lote-offcanvas" aria-labelledby="offcanvasBottomLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title">Lote ${this.lote_nombre}</h5>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body small">
                <button @click=${this.siembra}>${this._ctx.fecha}</button>
                <button @click=${this.actividad}>+ Actividad</button>
                <button @click=${this.cosecha}>+ Cosecha</button>
            </div>
        </div>
        
        
        <!-- Modal Visible en fecha state -->
        <div class="modal fade aplicacion step" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cuando se realizará la aplicación?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
        
                        <input type="date" id="start" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}
                        value="2018-07-22" min="2018-01-01" max="2018-12-31">
        
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
        <div class="modal fade aplicacion step" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Sobre cuantas hectáreas se realizará la aplicación?
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5></h5>
                        <input type="number" @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
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
        
        <!-- Modal Visible en Insumo state -->
        <div class="modal fade aplicacion step" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Seleccione un insumo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5></h5>
                        <!-- Seleccion insumo -->
        
                        <input type="number" @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
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
        
        <!-- Modal Visible en Dosis state -->
        <div class="modal fade aplicacion step" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual es la Dosis?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5></h5>
                        <!-- Seleccion insumo -->
        
                        <input type="number" @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
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
        
        <!-- Modal Visible en Motivo state -->
        <div class="modal fade aplicacion step" id="lote-hectareas-editor" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual es el motivo de la aplicación?</h5>

                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        
                        <input type="number" @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
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
        
        <!-- Modal Visible en MasInsumos state -->
        <div class="modal fade aplicacion step" id="lote-hectareas-editor" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Deseas agregar otro un insumo?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
        
                        <input type="number" @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("SI")} >SI</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("NO")} >NO</button>


                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("BACK")} >Atras</button>

                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en Comentarios state -->
        <div class="modal fade aplicacion step" id="lote-hectareas-editor" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Tienes algún comentario adicional?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5></h5>
        
                        <textarea id="story" name="story" rows="5" cols="33" @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}>
                        It was a dark and stormy night...
                        </textarea>

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
        
        <!-- Modal Visible en Resumen state -->
        <div class="modal fade aplicacion step" id="lote-hectareas-editor" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Resumen</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5></h5>
                        <!-- Seleccion insumo -->
        
                        <input type="number" @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${()=>
                            this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${()=> this.fsm.send("GUARDAR")}>Guardar</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en Sharing state -->
        <div class="modal fade aplicacion step" id="lote-hectareas-editor" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Quieres compartir una Orden de Trabajo para esta
                            aplicación?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5></h5>
                        <!-- Seleccion insumo -->
        
                        <input type="number" @change=${(e)=> this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
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

customElements.define('lote-offcanvas', LoteOffcanvas);