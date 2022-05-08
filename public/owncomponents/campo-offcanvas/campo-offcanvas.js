import { LitElement, html, css } from '../../assets/lit-all.min.js';

export class MyElement extends LitElement {
    static properties = {
        greeting: {},
        planet: {},
        map: {},
        db: {},
        _id: "",
        campo_doc: {},
        nuevo_lote_callback: {},
        borrar_lote_callback: {},
        guardar_lote_callback: {},
        nombre_lote: "Lote " + makeid(5)
    };
    // Styles are scoped to this element: they won't conflict with styles
    // on the main page or in other components. Styling API can be exposed
    // via CSS custom properties.
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

    _detallesOffcanvas = {}
    _step1 = {}
    _step2 = {}



    constructor() {
        super();
        // Define reactive properties--updating a reactive property causes
        // the component to update.
        this.greeting = 'Hello';
        this.planet = 'World';
        console.log("EJECUTANDO COMPONENTE")
    }

    firstUpdated() {
        this._detallesOffcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvas-campo-detalle'))
        this._step1 = new bootstrap.Offcanvas(document.getElementById('offcanvas-lote-paso-1'))
        this._step2 = new bootstrap.Offcanvas(document.getElementById('offcanvas-lote-paso-2'))


    }

    createRenderRoot() {
        return this;
    }

    show() {
        this._step1.hide();
        this._step2.hide();
        this._detallesOffcanvas.show();
    }

    lote_paso_1() {
        // Hide Campo Detalle
        
        // Hide Step2
        this._step2.hide()

        // Show Step1
        this._step1.show()

        this._detallesOffcanvas.hide()

    }

    lote_paso_2() {
         // Hide Campo Detalle
         this._detallesOffcanvas.toggle()
         // Show Step2
         this._step2.show()
 
         // hide Step1
         this._step1.hide()
    }

    enable_siguiente() {
        document.getElementById('agregar-lote-siguiente-btn').removeAttribute('disabled')
    }

    nuevo_lote_click() {
        (this.nuevo_lote_callback)()
        this.lote_paso_1()
    }

    guardar_lote_click(){
        (this.guardar_lote_callback)()
    }
    // The render() method is called any time reactive properties change.
    // Return HTML in a string template literal tagged with the `html`
    // tag function to describe the component's internal DOM.
    // Expressions can set attribute values, property values, event handlers,
    // and child nodes/text.
    render() {
        return html`

            <div class="offcanvas offcanvas-bottom h-25" tabindex="-1" id="offcanvas-campo-detalle"
            aria-labelledby="offcanvas-campo-header" data-bs-backdrop="false">
            <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvas-campo-header">Campo</h5>
                    <button type="button" class="btn btn-success" @click=${this.nuevo_lote_click}>+Lote</button>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
            </div>
            <div class="offcanvas-body small col">
                    <div class="row no-wrap" id='campo-ndvi'></div>
                    <div class="row" id='campo-cultivo'></div>
                    <div class="row mb-2" id='campo-img-preview'>
                    </div>
                    <div class="row" id='campo-audio-players'></div>
                    <div class="row" id='campo-problemas'></div>
                    <div class="row" id='campo-campo'></div>
                    <button class="btn btn-danger" id="eliminar-campo-btn" @click=${this.borrar_lote_callback}>Eliminar Campo</button>
            </div>

            
        </div>
        <!--Primera paso --Add Lote -->
            <div class="offcanvas offcanvas-bottom" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1"
                    id="offcanvas-lote-paso-1" aria-labelledby="offcanvasBottomLabel">
                    <div class="offcanvas-header">
                            <h5 class="offcanvas-title" id="offcanvas-1-title"></h5>
    
                            <div class="d-grid gap-2">
                                    <button id="agregar-lote-siguiente-btn" type="button" class="btn btn-success"
                                            data-bs-toggle="offcanvas" data-bs-target="#offcanvas-lote-paso-2"
                                            aria-controls="offcanvasCampoForm" disabled>Siguiente</button>
                            </div>
                            <button type="button" id="map-edit-btn" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                                    aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body small">
                            <div class="d-grid gap-2">
                                    <button class="btn btn-primary" @click=${this.show} id='salir-edicion-btn' type="button">Salir del Modo de
                                            Edición</button>
                            </div>
    
    
                    </div>
            </div>
    
            <!--Campo Form-->
            <div class="offcanvas offcanvas-bottom h-50" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1"
                    id="offcanvas-lote-paso-2" aria-labelledby="offcanvasBottomLabel">
                    <div class="offcanvas-header">
                            <h5 class="offcanvas-title">Nuevo Lote</h5>
    
                            <button type="button" id="map-edit-btn" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                                    aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
    
                            <form>
                                    <div class="row mb-1">
                                            <label for="inputNombreLote" class="col-4 col-form-label">Nombre del
                                                    Lote</label>
                                            <div class="col-8">
                                                    <input type="text" @change=${e => this.nombre_lote = e.target.value} value="${this.nombre_lote}" class="form-control" id="inputNombreLote">
                                            </div>
                                    </div>
    
                                    <div class="d-grid gap-2">
                                            <button class="btn btn-primary btn-success" id='guardar-lote-btn'
                                                    @click=${this.guardar_lote_click} type="button">Guardar</button>
                                    </div>
                            </form>
                    </div>
            </div>
    `;
    }

    // Event handlers can update the state of @properties on the element
    // instance, causing it to re-render
    togglePlanet() {
        this.planet = this.planet === 'World' ? 'Mars' : 'World';
    }
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

customElements.define('campo-offcanvas', MyElement);