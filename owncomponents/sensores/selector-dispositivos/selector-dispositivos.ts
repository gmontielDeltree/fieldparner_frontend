import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement } from "lit";
import { RouterLocation } from "@vaadin/router";
import { map } from "lit/directives/map";

@customElement("selector-dispositivos")
export class SelectorDispositivos extends LitElement {
  @property()
  location: RouterLocation;

  @state()
  dispositivos : Object[]

  render() {
	return html`
	<ul>
		${map(this.dispositivos,
		(d)=>	html`
			<li>
			${d.nombre}
			</li>
		`
			)}
	</ul>
	`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "selector-dispositivos": SelectorDispositivos;
  }
}
