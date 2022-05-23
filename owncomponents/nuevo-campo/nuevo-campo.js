import { LitElement, html } from "lit";

export class NuevoCampo extends LitElement{

    static properties = {
        map:{},
        show:{}
    }

    constructor(){
        super()
        this.show = false
    }

    render(){
        return (this.map ? html`<nueva-geometria-ui id="nuevo-campo-ui" .tipo='campo' .mapa=${this.map} .show=${this.show}></nueva-geometria-ui>` : null)
    }
}


customElements.define("nuevo-campo", NuevoCampo);