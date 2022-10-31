import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/dropdown";
import { Router } from "@vaadin/router";
import { use, translate, get } from "lit-translate";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { roundToNearestMinutes } from "date-fns";

export class NavbarElement extends LitElement {
  static properties = {
    map: {},
    selected_lang:{}
  };

  static styles = unsafeCSS(bootstrap);

  constructor() {
    super();
    this.selected_lang = 'es'
  }

  createRenderRoot() {
    return this;
  }

  willUpdate(properties) {
    if (properties.has("map")) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        placeholder: get('navbar.geocoder.helper'),
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

  selected_lang_flag(){
    if(this.selected_lang === 'es'){
      return html`&#127466;&#127462;`
    }else if(this.selected_lang === 'pr'){
      return html`&#127463;&#127479;`
    }else if(this.selected_lang === 'en'){
      return html`&#x1F1FA;&#x1F1F8;`
    }
  }

  seleccionar_lang(l){
    use(l)
    this.selected_lang = l
  }
  
  version() {
    return import.meta.env.VITE_VERSION;
  }

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
              <li
                class="nav-item"
                data-bs-toggle="collapse"
                data-bs-target="#navbarTogglerDemo01"
              >
                <div
                  style="cursor: pointer;background-image: url('/iconodecampo2D.webp');width: 50px;height: 50px;background-size: cover;background-position: center;"
                  @click=${() => {
                    // this.sendEvent("ver-lista-campos", null);
                    Router.go("/campos");
                  }}
                ></div>

                <!-- <button
                  type="button"
                  class="btn btn-outline-success btn-sm mx-1"
                  @click=${() => {
                  this.sendEvent("ver-lista-campos", null);
                }}
                >
                  Campos
                </button> -->
              </li>
              <li
                class="nav-item"
                data-bs-toggle="collapse"
                data-bs-target="#navbarTogglerDemo01"
              >
                <div
                  style="cursor: pointer;background-image: url('/deposito_2.webp');width: 50px;height: 50px;background-size: cover;background-position: center;"
                  @click=${() => {
                    this.sendEvent("ver-depositos-click", null);
                  }}
                ></div>
                <!-- <button
                  type="button"
                  class="btn btn-outline-success btn-sm mx-1"
                  @click=${() => {
                  this.sendEvent("ver-depositos-click", null);
                }}
                >
                  Depositos
                </button> -->
              </li>
              <li
                class="nav-item"
                data-bs-toggle="collapse"
                data-bs-target="#navbarTogglerDemo01"
              >
                <div
                  style="cursor: pointer;background-image: url('/iconocontratista.webp');width: 50px;height: 50px;background-size: cover;background-position: center;"
                  @click=${() => {
                    this.sendEvent("ver-contratistas-click", null);
                  }}
                ></div>
                <!-- <button
                  type="button"
                  class="btn btn-outline-success btn-sm mx-1"
                  @click=${() => {
                  this.sendEvent("ver-contratistas-click", null);
                }}
                >
                  Contratistas
                </button> -->
              </li>
              <li
                class="nav-item"
                data-bs-toggle="collapse"
                data-bs-target="#navbarTogglerDemo01"
              >
                <div
                  style="cursor: pointer;background-image: url('/icono de insumos.webp');width: 50px;height: 50px;background-size: cover;background-position: center;"
                  @click=${() => {
                    this.sendEvent("ver-insumos-click", null);
                  }}
                ></div>
                <!-- <button
                  type="button"
                  class="btn btn-outline-success btn-sm mx-1"
                  @click=${() => {
                  this.sendEvent("ver-insumos-click", null);
                }}
                >
                  Insumos
                </button> -->
              </li>
              <li class="nav-item">
                <div class="nav-item dropdown">
                  <a
                    class="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    ${translate('navbar.opciones.titulo')}
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li
                      data-bs-toggle="collapse"
                      data-bs-target="#navbarTogglerDemo01"
                    >
                      <a
                        class="dropdown-item"
                        @click=${() => {
                          this.sendEvent("ver-colores-cultivos");
                        }}
                        href="#"
                        >${translate('navbar.opciones.colorCultivos')}</a
                      >
                    </li>
                    <li
                      data-bs-toggle="collapse"
                      data-bs-target="#navbarTogglerDemo01"
                    >
                      <a
                        class="dropdown-item"
                        @click=${() => {
                          this.sendEvent("ver-lista-de-sensores");
                        }}
                        href="#"
                        >${translate('navbar.opciones.listaDispositivos')}</a
                      >
                    </li>
                    <li
                      data-bs-toggle="collapse"
                      data-bs-target="#navbarTogglerDemo01"
                    >
                      <a
                        class="dropdown-item"
                        @click=${() => {
                          location.reload();
                        }}
                        href="#"
                        >${translate('navbar.opciones.recargar')}</a
                      >
                    </li>

                    <!-- <li><a class="dropdown-item" href="#">Another action</a></li> -->
                    <li><hr class="dropdown-divider" /></li>
                    <li
                      data-bs-toggle="collapse"
                      data-bs-target="#navbarTogglerDemo01"
                    >
                      <a
                        class="dropdown-item"
                        @click=${() => {
                          this.sendEvent("logout-click");
                        }}
                        href="#"
                        >Sign Out</a
                      >
                    </li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                      <a class="dropdown-item">${translate('navbar.opciones.version')} ${this.version()}</a>
                    </li>
                  </ul>
                </div>
              </li>

              <li class="nav-item">
                <div class="nav-item dropdown">
                  <a
                    class="nav-link dropdown-toggle"
                    href="#"
                    id="Dropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="flag-united-kingdom flag m-0">${this.selected_lang_flag()}</i>
                  </a>

                  <ul class="dropdown-menu" aria-labelledby="Dropdown">
                    <li>
                      <a class="dropdown-item" href="#" @click=${() => this.seleccionar_lang('es')}
                        ><i class="flag-spain flag"></i> &#127466;&#127462; Español</a
                      >
                    </li>

                    <li>
                      <a class="dropdown-item" href="#" @click=${()=>this.seleccionar_lang('pr')}
                        ><i class="flag-brasil flag"></i> &#127463;&#127479; Português</a
                      >
                    </li>

                    <li>
                      <a class="dropdown-item" href="#" @click=${()=>this.seleccionar_lang('en')}
                        ><i class="flag-united-kingdom flag"></i> &#x1F1FA;&#x1F1F8; English
                        <i class="fa fa-check text-success ms-2"></i
                      ></a>
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
