import { LitElement, PropertyValueMap, css, html, render } from 'lit';
import "./fp-sidebar";
import { property, state } from "lit/decorators.js";
import "@vaadin/combo-box"

const base_url = import.meta.env.VITE_INTEGRACIONES_SERVER_URL

export class JohnDeereEquipmentList extends LitElement {

	@property({attribute:false})
	equipos : any[] = []

	render(){
		return this.equipos.map((b) => html`<div>${b.name}</div>`)
	}
}

customElements.define("john-deere-equipment-list", JohnDeereEquipmentList );
