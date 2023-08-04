import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/app-layout";
import "@vaadin/app-layout/vaadin-drawer-toggle";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/tabs";
import "@vaadin/vertical-layout";
import { Router } from "@vaadin/router";
import { get, translate, use } from "lit-translate";
import "@vaadin/item";
import "@vaadin/list-box";
import "@vaadin/select";
import "@vaadin/tabsheet";
import spain_flag from "../../src/images/icons/spain_flag.png";
import brazil_flag from "../../src/images/icons/brazil_flag.png";
import usa_flag from "../../src/images/icons/usa_flag.png";
import icono_depositos from "../../src/images/icons/deposito_2.webp";
import icono_campos from "../../src/images/icons/iconodecampo2D.webp";
import icono_insumos from "../../src/images/icons/icono de insumos.webp";
import icono_contratistas from "../../src/images/icons/iconocontratista.webp";
import { selectRenderer } from "@vaadin/select/lit.js";
import "./workspace-menu";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl, { Map } from "mapbox-gl";
import { gblStateLoaded, gbl_state } from "../state";
import { StateController } from "@lit-app/state";
import { ref, createRef } from "lit/directives/ref.js";
import "@vaadin/tabsheet";
import { Lenguaje } from "../tipos/tipos-varios";
import "../campana/menu-campana/menu-campana";
import "../campana-notificacion/campana-notificacion";

@customElement("app-layout-navbar-placement")
export class Example extends LitElement {
  version() {
    return import.meta.env.VITE_VERSION;
  }

  static override styles = [
    css`
      h1 {
        font-size: var(--lumo-font-size-l);
        margin: 0;
      }

      vaadin-icon {
        box-sizing: border-box;
        margin-inline-end: var(--lumo-space-m);
        margin-inline-start: var(--lumo-space-xs);
        padding: var(--lumo-space-xs);
      }
    `,
    css`
      vaadin-select::part(toggle-button) {
        background-color: red;
        width: 0px;
      }
    `,
  ];

  private bindState = new StateController(this, gbl_state);

  private idioma_inicializado: boolean = false;

  private selected_language = "es";

  geocoderRef = createRef<HTMLElement>();

  firstUpdated() {
    // this.shadowRoot.querySelector("vaadin-select").shadowRoot.querySelector('[part="toggle-button"]').style.display = 'none'
  }

  willUpdate(properties) {
    //   console.log("STATEEEEE",properties)
    // if (!this.idioma_inicializado) {
    //   this.idioma_inicializado = true;
    //   gbl_state.user_db
    //     .allDocs({
    //       startkey: "user_language",
    //       endkey: "user_language",
    //       include_docs: true,
    //     })
    //     .then((result) => {
    //       if (result.rows.length > 0) {
    //         // Existe
    //         let lang_doc: Lenguage = result.rows[0].doc as Lenguage;
    //         this.selected_language = lang_doc.lang;
    //         use(lang_doc.lang);
    //         console.log("Lang Selector", lang_doc);
    //       } else {
    //         // No existe
    //         use(this.selected_language);
    //       }
    //     });
    //}
    //   this.geocoder_inicializado = true;
    //   const geocoder = new MapboxGeocoder({
    //     accessToken: mapboxgl.accessToken,
    //     mapboxgl: mapboxgl,
    //     placeholder: get("navbar.geocoder.helper"),
    //   });
    //   this.geocoderRef.value
    //     .appendChild(geocoder.onAdd(gbl_state.map));
    //  }
  }

  sendEvent = (name: string, details: any) => {
    let event = new CustomEvent(name, {
      detail: details,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  };

  private lenguajes = [
    { nombre: "Español", valor: "es", icono: spain_flag },
    { nombre: "Portugues", valor: "pr", icono: brazil_flag },
    { nombre: "English", valor: "en", icono: usa_flag },
  ];

  private lang_renderer = () => html` <vaadin-list-box>
    ${this.lenguajes.map(
      (lang) => html`
        <vaadin-item value="${lang.valor}">
          <div
            style="display: flex; align-items: center; justify-content:center;"
          >
            <img
              src="${lang.icono}"
              alt="${lang.nombre}"
              style="width: 16px;"
            />
          </div>
        </vaadin-item>
      `
    )}
  </vaadin-list-box>`;

  render() {
    return html`
      <vaadin-app-layout .drawerOpened=${false} .overlay=${true}>
        <vaadin-drawer-toggle
          slot="navbar [touch-optimized]"
        ></vaadin-drawer-toggle>

        <h1 slot="navbar" title="Version ${this.version()}">
          <img
            src="/images/icons/desktop/agrootolss_logo_sol.png"
            alt="${this.version()}"
            title="Version ${this.version()}"
            width="16"
            height="16"
            class="d-inline-block align-text-middle"
          />
          FieldPartner
        </h1>

        <vaadin-horizontal-layout
          slot="navbar"
          style="flex-grow: 100; justify-content: space-between;align-items: center;"
        >
          <vaadin-tabs>
            <vaadin-tab>
              <div
                title="Lista de Campos"
                style="cursor: pointer;background-image: url('${icono_campos}');width: 32px;height: 32px;background-size: cover;background-position: center;"
                @click=${() => {
                  Router.go("/campos");
                }}
              ></div>
            </vaadin-tab>
            <vaadin-tab>
              <div
                title="Contratistas"
                style="cursor: pointer;background-image: url('${icono_contratistas}');width: 32px;height: 32px;background-size: cover;background-position: center;"
                @click=${() => {
                  Router.go("/contratistas")
                  // this.sendEvent("ver-contratistas-click", null);
                }}
              ></div>
            </vaadin-tab>
            <vaadin-tab>
              <div
                title="Insumos"
                style="cursor: pointer;background-image: url('${icono_insumos}');width: 32px;height: 32px;background-size: cover;background-position: center;"
                @click=${() => {
                  Router.go("insumos");
                }}
              ></div>
            </vaadin-tab>
            <vaadin-tab>
              <div
                title="Depositos"
                style="cursor: pointer;background-image: url('${icono_depositos}');width: 32px;height: 32px;background-size: cover;background-position: center;"
                @click=${() => {
                  Router.go("depositos");
                }}
              ></div>
            </vaadin-tab>
            <vaadin-tab id="dummy-tab" ${ref(this.geocoderRef)}></vaadin-tab>
            <vaadin-tab>

          <campana-notificacion></campana-notificacion>
            </vaadin-tab>
            <vaadin-tab>
              <menu-campana-button></menu-campana-button>
            </vaadin-tab>
          </vaadin-tabs>

          <div style="align-items: center;display: flex;">

            <!--Se pueden usar css variables para pasar o alterar styles -->
            <!--https://stackoverflow.com/questions/70634210/lit-how-to-apply-style-to-nested-template-->
            <vaadin-select
              style="margin-right:4px; width:4em; --lumo-icons-dropdown:''; --lumo-contrast-10pct:transparent; align-items: center;"
              .value=${gbl_state.lenguaje_seleccionado.lang}
              @change=${(e: CustomEvent) => {
                let lang = e.target.value;
                use(lang);
                if (gblStateLoaded()) {
                  gbl_state.user_db
                    .allDocs({
                      startkey: "user_language",
                      endkey: "user_language",
                      include_docs: true,
                    })
                    .then((result) => {
                      if (result.rows.length > 0) {
                        // Existe
                        let lang_doc: Lenguaje = result.rows[0].doc as Lenguaje;
                        lang_doc.lang = lang;
                        gbl_state.user_db
                          .put(lang_doc)
                          .then(() => window.location.reload());
                      } else {
                        // No existe
                        let lang_doc: Lenguaje = {
                          _id: "user_language",
                          lang: lang,
                        };
                        gbl_state.user_db
                          .put(lang_doc)
                          .then(() => window.location.reload());
                      }
                    });
                }
              }}
              ${selectRenderer(this.lang_renderer, this.lenguajes)}
            ></vaadin-select>

            <a
              tabindex="-1"
              href='https://www.qtsagro.net/'
              @click=${() => {
                this.sendEvent("logout-click", {});
              }}
            >
              <vaadin-icon icon="vaadin:sign-out"></vaadin-icon>
              <span></span>
            </a>
          </div>
        </vaadin-horizontal-layout>

        <vaadin-vertical-layout
          slot="drawer"
          style="height:100%;justify-content: space-between;"
        >
          <vaadin-tabs orientation="vertical">
            <!-- <vaadin-tab>
              <a tabindex="-1">
                <vaadin-icon icon="vaadin:desktop"></vaadin-icon>
                <workspace-menu></workspace-menu>
              </a>
            </vaadin-tab> -->
            <vaadin-tab>
              <a tabindex="-1" href="/campos">
                <vaadin-icon icon="vaadin:bullseye"></vaadin-icon>
                <span>Campos</span>
              </a>
            </vaadin-tab>
            <!-- <vaadin-tab>
            <a tabindex="-1" @click=${() => {
              let base = "";
              if (
                location.hostname === "localhost" ||
                location.hostname === "127.0.0.1"
              ) {
                base += "https://staging--agrotools.netlify.app";
              }

              fetch(base + "/geolocation")
                .then((response) => response.json())
                .then((geodata) => {
                  alert(JSON.stringify(geodata));
                });
            }}>
              <vaadin-icon icon="vaadin:location-arrow-circle"></vaadin-icon>
              <span>Test Localizacion</span>
            </a>
          </vaadin-tab> -->
            <!--
          <vaadin-tab>
            <a tabindex="-1">
              <vaadin-icon icon="vaadin:user-heart"></vaadin-icon>
              <span>Customers</span>
            </a>
          </vaadin-tab>
          <vaadin-tab>
            <a tabindex="-1">
              <vaadin-icon icon="vaadin:package"></vaadin-icon>
              <span>Products</span>
            </a>
          </vaadin-tab> -->
            <vaadin-tab>
              <a
                tabindex="-1"
                @click=${() => {
                  location.reload();
                }}
              >
                <vaadin-icon icon="vaadin:refresh"></vaadin-icon>
                <span>${translate("navbar.opciones.recargar")}</span>
              </a>
            </vaadin-tab>
            <vaadin-tab>
              <a
                tabindex="-1"
                @click=${() => {
                  this.sendEvent("ver-lista-de-sensores", null);
                }}
              >
                <vaadin-icon icon="vaadin:list"></vaadin-icon>
                <span>${translate("navbar.opciones.listaDispositivos")}</span>
              </a>
            </vaadin-tab>
            <vaadin-tab>
              <a
                tabindex="-1"
                @click=${() => {
                  Router.go("/personal");
                }}
              >
                <vaadin-icon icon="vaadin:users"></vaadin-icon>
                <span>${translate("personal")}</span>
              </a>
            </vaadin-tab>
            <vaadin-tab>
              <a
                tabindex="-1"
                @click=${() => {
                  Router.go("/overview/vehiculo");
                }}
              >
                <vaadin-icon icon="vaadin:truck"></vaadin-icon>
                <span>${translate("equipos")}</span>
              </a>
            </vaadin-tab>

            <vaadin-tab>
              <a
                tabindex="-1"
                @click=${() => {
                  Router.go("/prices");
                }}
              >
                <vaadin-icon icon="vaadin:dollar"></vaadin-icon>
                <span>${translate("precios")}</span>
              </a>
            </vaadin-tab>

            ${
              import.meta.env.VITE_INTEGRACIONES_ONLY === "YES"
                ? html`
                    <vaadin-tab>
                      <a
                        tabindex="-1"
                        @click=${() => {
                          Router.go("/integraciones");
                        }}
                      >
                        <vaadin-icon icon="vaadin:cluster"></vaadin-icon>
                        <span>${"Integraciones"}</span>
                      </a>
                    </vaadin-tab>
                  `
                : null
            }

            <vaadin-tab>
              <a
                tabindex="-1"
                @click=${() => {
                  Router.go("/settings");
                }}
              >
                <vaadin-icon icon="vaadin:cogs"></vaadin-icon>
                <span>${translate("ajustes")}</span>
              </a>
            </vaadin-tab>

            <!-- <vaadin-tab>
            <a tabindex="-1" href="/cultivos">
              <vaadin-icon icon="vaadin:chart"></vaadin-icon>
              <span>${translate("navbar.opciones.colorCultivos")}</span>
            </a>
          </vaadin-tab> -->
          </vaadin-tabs>

          <vaadin-tabs orientation="vertical">
            <!-- <vaadin-tab>
              <a 
                tabindex="-1"
                
                @click=${() => {
                  this.sendEvent("logout-click", {});
                }}
              >
                <vaadin-icon icon="vaadin:sign-out"></vaadin-icon>
                <span>Log Out</span>
              </a>
            </vaadin-tab>
          </vaadin-tabs> -->
        </vaadin-vertical-layout>

        <slot></slot>
      </vaadin-app-layout>
    `;
  }
}
