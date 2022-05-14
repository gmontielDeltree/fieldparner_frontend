import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';
import { aplicacionMachine } from './lote-machine.js';
import { createMachine, interpret, send } from 'xstate';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

//import "../../assets/pdfmake.min.js";
//import "../../assets/vfs_fonts.min.js";
import orden_definition from './orden_definition.js';
import './timeline/timeline.js';
import { Modal, Offcanvas } from 'bootstrap'

//pdfMake.vfs = pdfFonts.pdfMake.vfs;

//const { interpret, send } = XState;

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

    static styles = [css`
    :host {
      display: inline-block;
      padding: 10px;
      background: lightgray;
    }
    .planet {
      color: var(--planet-color, blue);
    }
    .bg-green {
        background-color: #50d38a !important;
        color: #fff;
    }
    `];

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
            } else if (state.matches('editing.motivo')) {
                this.show_step(4)
            }

            else if (state.matches('editing.masinsumos')) {
                this.show_step(5)
            } else if (state.matches('editing.comentario')) {
                this.show_step(6)
            } else if (state.matches('editing.resumiendo')) {
                this.show_step(7)
            } else if (state.matches('editing.share')) {
                this.show_step(8)
            }
        }).start()
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        this._lotesOffcanvas = new Offcanvas(document.getElementById('lote-offcanvas'))
        this._steps_elements = [...document.querySelectorAll('.aplicacion.step')].map((el) => new Modal(el))
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

    abrir_pdf(params) {
        pdfMake.createPdf(orden_definition).open();
    }


    render() {



                const insumo_el = (item) => html`<a href="#" class="list-group-item list-group-item-action" aria-current="true">
                                                <div class="d-flex w-100 justify-content-between" @click=${(e)=> this.fsm.send({
                                                    'type': 'SELECTED', value: item
                                                    })}>
                                                    <h5 class="mb-1">${item.name}</h5>
                                                    <small>Herbicida</small>
                                                </div>
                                                <p class="mb-1">Some placeholder content in a paragraph.</p>
                                                <small>And some small print.</small>
                                            </a>`

        
        // Render propiamente dicho
        return html`

        <div class="offcanvas offcanvas-bottom h-75" tabindex="-1" id="lote-offcanvas" aria-labelledby="offcanvasBottomLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title">Lote ${this.lote_nombre}</h5>
                <div class="row"><button class='btn btn-primary' @click=${this.siembra}>+ Siembra</button></div>
                        <div class="row"><button class='btn btn-primary' @click=${this.actividad}>+ Actividad</button></div>
                        <div class="row"><button class='btn btn-primary' @click=${this.cosecha}>+ Cosecha</button></div>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body small ">
                <div class="container">
                    <div class='row'>
                    <div class='col shadow mx-2 p-3 max-vh-25'>
                        <lit-timeline></lit-timeline>
                                                    
                    </div>
                    </div>
                   

                </div>

                
            </div>
        </div>
        
        <!-- Modal Visible en fecha state -->
        <div class="modal fade aplicacion step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
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
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NEXT")}>Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Visible en hectareas state -->
        <div class="modal fade aplicacion step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Sobre cuantas hectáreas se realizará la aplicación?
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="number" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}>
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
        
        <!-- Modal Visible en Insumo state -->
        <div class="modal fade aplicacion step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Seleccione un insumo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
        
                        <input type="text" @keyup=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}>
                        <div class='list-group'>
        
                            ${map(this._ctx.filtrado, insumo_el)}
        
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
        
        <!-- Modal Visible en Dosis state -->
        <div class="modal fade aplicacion step" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">¿Cual es la Dosis?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5>${this._ctx.current_insumo.name}</h5>
                        <input type="number" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
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
        
                        <input type="number" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
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
        
                        <input type="number" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}>
        
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("SI")} >SI</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NO")} >NO</button>
        
        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")} >Atras</button>
        
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
        
                        <textarea id="story" name="story" rows="5" cols="33" @change=${(e) => this.fsm.send({ type: "CHANGE", value: e.target.value })}>
                                                        It was a dark and stormy night...
                                                        </textarea>
        
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
                        <div class="container shadow min-vh-100 py-2">
                            <div class="row">
                                <div class="col">
                                    <h3>Aplicación en lote "Gulito" - "El Garompo"</h3>
                                    <div class="container">
                                        <div class="row">
                                            <div class="col">
                                                <h6>Fecha de aplicación: 30/12/2222</h6>
                                            </div>
                                            <button class='col col-2'> Edit </button>
                                        </div>
                                        <div class='row'>
                                            <h5>Barbecho</h5>
                                        </div>
                                        <div class="row list-group">
                                            <a href="#" class="list-group-item list-group-item-action">
                                                <div class="d-flex w-100 justify-content-between">
                                                    <h5 class="mb-1">2,4D</h5>
                                                    <small class="text-muted">Herbicida</small>
                                                </div>
                                                <p class="mb-1">10 lt/ha - 23 ha - 50 litros totales</p>
                                                <small class="text-muted"></small>
                                            </a>
                                            <a href="#" class="list-group-item list-group-item-action">
                                                <div class="d-flex w-100 justify-content-between">
                                                    <h5 class="mb-1">Glifochota</h5>
                                                    <small class="text-muted">Pesticida</small>
                                                </div>
                                                <p class="mb-1">10 lt/ha - 23 ha - 50 litros totales</p>
                                                <div class='d-flex w-100 justify-content-between'>
                                                    <small class="text-muted">Plaga - Orugas</small>
                                                    <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                                                        <button type="button" class="btn btn-danger">Eliminar</button>
                                                        <button type="button" class="btn btn-warning">Editar</button>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                        <div class='row mt-2'>
                                            <h6>Comentarios</h6>
                                            <textarea class="form-control" aria-label="With textarea"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                this.fsm.send("CANCEL")}>Cancelar</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")} >Atras</button>
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("GUARDAR")}>Guardar</button>
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
                        <h5 class="modal-title" id="staticBackdropLabel">¿Quieres compartir la Orden de Trabajo para esta
                            aplicación?</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="container modal-body">
        
                        <div class="btn-group-vertical col">
                            <button type="button" class="btn btn-success">Enviar por Whatsapp</button>
                            <button type="button" class="btn btn-info">Compartir por Email</button>
                            <button type="button" class="btn btn-dark" @click=${()=> this.abrir_pdf()}>Solo Descargar un
                                PDF</button>
                        </div>
        
                    </div>
                    <div class="modal-footer">
                        <!--  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click=${() =>
                        this.fsm.send("CANCEL")}>Cancelar</button> -->
                        <!-- <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("BACK")} >Atras</button> -->
                        <button type="button" class="btn btn-primary" @click=${() => this.fsm.send("NEXT")} >No Generar Nada por
                            Ahora</button>
                    </div>
                </div>
            </div>
        </div>

        `
    }

}

customElements.define('lote-offcanvas', LoteOffcanvas);
