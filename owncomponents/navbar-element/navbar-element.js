import { LitElement, html, unsafeCSS } from "lit-element";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap"

export class NavbarElement extends LitElement{
	static properties = {
	
	}

  	static styles = unsafeCSS(bootstrap);

	constructor(){
		super();
	}

	createRenderRoot() {
		return this;
	      }

	render(){
		return html
		`
		<nav class="navbar navbar-expand-lg navbar-light bg-light">
		<div class="container-fluid">
		  <a class="navbar-brand" href="#">
		    <img
		      src="/images/icons/desktop/agrootolss_logo_sol.png"
		      alt=""
		      width="30"
		      height="24"
		      class="d-inline-block align-text-middle"
		    />
		    Agrotools
		  </a>
	
		  <button
		    class="navbar-toggler"
		    type="button"
		    data-bs-toggle="collapse"
		    data-bs-target="#navbarTogglerDemo01"
		    aria-controls="navbarTogglerDemo01"
		    aria-expanded="false"
		    aria-label="Toggle navigation"
		  >
		    <span class="navbar-toggler-icon"></span>
		  </button>
	
		  <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
		    <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>
		    <form class="d-flex">
		      <button class="btn btn-outline-success" type="submit">
			Ver Campos
		      </button>
		    </form>
		  </div>
		</div>
	      </nav>

		`
	}
}

customElements.define('navbar-element', NavbarElement);