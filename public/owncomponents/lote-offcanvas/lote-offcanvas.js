import { LitElement, html, css, map } from '../../assets/lit-all.min.js';


export class LoteOffcanvas extends LitElement {
    static properties = {
        db: {},
        lote_id: {},
        campo_id: {},
        lote_nombre: {},
        _lotesOffcanvas: {}
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

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        this._lotesOffcanvas = new bootstrap.Offcanvas(document.getElementById('lote-offcanvas'))
    }

    show() {
        this._lotesOffcanvas.show();
    }

    siembra(){

    }

    actividad() {

    }

    cosecha() {}

    render() {
        return html`

        <div class="offcanvas offcanvas-bottom" tabindex="-1" id="lote-offcanvas" aria-labelledby="offcanvasBottomLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title">Lote ${this.lote_nombre}</h5>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body small">
                <button @click=${this.siembra}>+ Siembra</button>
                <button @click=${this.actividad}>+ Actividad</button>
                <button @click=${this.cosecha}>+ Cosecha</button>
            </div>
        </div>
            
        `
    }

}

customElements.define('lote-offcanvas', LoteOffcanvas);