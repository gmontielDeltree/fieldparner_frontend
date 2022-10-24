import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('null-component')
export class NullComponent extends LitElement{
    render(): unknown {
        return html``
    }
}