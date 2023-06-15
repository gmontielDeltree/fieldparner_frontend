import { LitElement, css, html } from "lit";
import "./fp-sidebar";
import { state } from "lit/decorators.js";
import { john_deere_login } from './john-deere-functions';

export class JohnDeereIntegracion extends LitElement {
  @state()
  logged_in_to_johndeere: boolean = false;

  login_to_john_deere(){
	 john_deere_login()
  }
  
  render() {
    return html`
      <fp-sidebar>
        <div slot="title">Sidebar Title</div>
        <div slot="content">
          ${!this.logged_in_to_johndeere ? html`<form  method="post" action='/api/john-deere-login'> <button type='submit'>Acceder a John</button></form>` : null}
        </div>
      </fp-sidebar>
    `;
  }
}

customElements.define("john-deere-integracion", JohnDeereIntegracion);
