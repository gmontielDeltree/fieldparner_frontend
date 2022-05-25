import { LitElement, html } from "lit-element";

export class FieldPartner extends LitElement{
	static properties = {
		map:{},
		draw:{},
	}

	constructor(){
		super();
	}

	render(){
		return html
		`
			<slot>

			</slot>
		`
	}
}

customElements.define('field-partner', FieldPartner);