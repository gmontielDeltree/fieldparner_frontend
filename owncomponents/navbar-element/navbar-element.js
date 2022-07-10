import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/dropdown";

import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

export class NavbarElement extends LitElement {
  static properties = {
    map: {},
  };

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
  }

  createRenderRoot() {
    return this;
  }

  willUpdate(properties) {
    if (properties.has("map")) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        placeholder: "Buscar Localidad",
      });
      document
        .getElementById("navbarTogglerDemo01")
        .appendChild(geocoder.onAdd(this.map));
    }
  }

  sendEvent = (name, details) => {
    let event = new CustomEvent(name, {
      detail: details,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  };

  render() {
    return html`
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
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
              <li>
                <button
                  type="button"
                  class="btn btn-outline-success btn-sm mx-1"
                  @click=${() => {
                    this.sendEvent("ver-lista-campos", null);
                  }}
                >
                  Ver Campos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="btn btn-outline-success btn-sm mx-1"
                  @click=${() => {
                    this.sendEvent("ver-depositos-click", null);
                  }}
                >
                  Ver Depositos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="btn btn-outline-success btn-sm mx-1"
                  @click=${() => {
                    this.sendEvent("ver-contratistas-click", null);
                  }}
                >
                  Ver Contratistas
                </button>
              </li>
              <li>
                <div class="nav-item dropdown">
                  <a
                    class="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Opciones
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li>
                      <a
                        class="dropdown-item"
                        @click=${() => {
                          this.sendEvent("ver-colores-cultivos");
                        }}
                        href="#"
                        >Color Cultivos</a
                      >
                    </li>
                    <li>
                      <a
                        class="dropdown-item"
                        @click=${() => {
                          location.reload();
                        }}
                        href="#"
                        >Recargar</a
                      >
                    </li>

                    <!-- <li><a class="dropdown-item" href="#">Another action</a></li> -->
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a
                        class="dropdown-item"
                        @click=${() => {
                          this.sendEvent("logout-click");
                        }}
                        href="#"
                        >Sign Out</a
                      >
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
            <!-- <form class="d-flex"> -->

            <!-- </form> -->
          </div>
        </div>
      </nav>
    `;
  }
}

customElements.define("navbar-element", NavbarElement);
