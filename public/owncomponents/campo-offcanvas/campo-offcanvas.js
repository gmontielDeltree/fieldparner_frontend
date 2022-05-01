import { LitElement, html, css } from '../../assets/lit-all.min.js';

export class MyElement extends LitElement {
    static properties = {
        greeting: {},
        planet: {},
        map:{},
        db:{},
        _id:"",
        nuevo_lote_callback: {},
        borrar_lote_callback: {},
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

    constructor() {
        super();
        // Define reactive properties--updating a reactive property causes
        // the component to update.
        this.greeting = 'Hello';
        this.planet = 'World';
        console.log("EJECUTANDO COMPONENTE")
    }

    createRenderRoot() {
        return this;
    }

    show() {
        const myOffcanvas = document.getElementById('offcanvas-campo-detalle');
        const bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas)
        bsOffcanvas.show()
    }

    // The render() method is called any time reactive properties change.
    // Return HTML in a string template literal tagged with the `html`
    // tag function to describe the component's internal DOM.
    // Expressions can set attribute values, property values, event handlers,
    // and child nodes/text.
    render() {
        return html`

            <div class="offcanvas offcanvas-bottom h-50" tabindex="-1" id="offcanvas-campo-detalle"
            aria-labelledby="offcanvas-campo-header" data-bs-backdrop="false">
            <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvas-campo-header">Campo</h5>
                    <button type="button" class="btn btn-success text-reset" @click=${this.nuevo_lote_callback}>+Lote</button>
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
    `;
    }

    // Event handlers can update the state of @properties on the element
    // instance, causing it to re-render
    togglePlanet() {
        this.planet = this.planet === 'World' ? 'Mars' : 'World';
    }
}
customElements.define('campo-offcanvas', MyElement);