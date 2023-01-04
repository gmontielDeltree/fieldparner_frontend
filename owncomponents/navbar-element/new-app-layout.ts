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

@customElement("app-layout-navbar-placement")
export class Example extends LitElement {
  version() {
    return import.meta.env.VITE_VERSION;
  }

  static get styles() {
    return css`
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
    `;
  }

  private bindState = new StateController(this, gbl_state);

  private geocoder_inicializado: boolean = false;

  geocoderRef = createRef<HTMLElement>();

  willUpdate(properties) {
    //   console.log("STATEEEEE",properties)
    //  if (!this.geocoder_inicializado && gblStateLoaded()) {
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
          <div style="display: flex; align-items: center;">
            <img
              src="${lang.icono}"
              alt="${lang.nombre}"
              style="width: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
            />
            <div>${lang.nombre}</div>
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

        <h1 slot="navbar">
          <img
            src="/images/icons/desktop/agrootolss_logo_sol.png"
            alt=""
            width="16"
            height="16"
            class="d-inline-block align-text-middle"
          />
          FieldPartner
        </h1>

          <vaadin-tabs slot="navbar">
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
                  this.sendEvent("ver-contratistas-click", null);
                }}
              ></div>
            </vaadin-tab>
            <vaadin-tab>
              <div
                title="Insumos"
                style="cursor: pointer;background-image: url('${icono_insumos}');width: 32px;height: 32px;background-size: cover;background-position: center;"
                @click=${() => {
                  this.sendEvent("ver-insumos-click", null);
                }}
              ></div>
            </vaadin-tab>
            <vaadin-tab>
              <div
                title="Depositos"
                style="cursor: pointer;background-image: url('${icono_depositos}');width: 32px;height: 32px;background-size: cover;background-position: center;"
                @click=${() => {
                  this.sendEvent("ver-depositos-click", null);
                }}
              ></div>
            </vaadin-tab>
            <vaadin-tab
              id="dummy-tab"
              ${ref(this.geocoderRef)}
            ></vaadin-tab>
          </vaadin-tabs>

          <vaadin-horizontal-layout slot='navbar'>
            
          </vaadin-horizontal-layout>
          

        <vaadin-tabs slot="drawer" orientation="vertical">
          <vaadin-tab>
            <a tabindex="-1">
              <vaadin-icon icon="vaadin:dashboard"></vaadin-icon>
              <workspace-menu></workspace-menu>
            </a>
          </vaadin-tab>
          <vaadin-tab>
            <a tabindex="-1" href="/campos">
              <vaadin-icon icon="vaadin:dashboard"></vaadin-icon>
              <span>Campos</span>
            </a>
          </vaadin-tab>
          <!-- <vaadin-tab>
            <a tabindex="-1">
              <vaadin-icon icon="vaadin:cart"></vaadin-icon>
              <span>Dispositivos</span>
            </a>
          </vaadin-tab>
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
              <vaadin-icon icon="vaadin:records"></vaadin-icon>
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
          <!-- <vaadin-tab>
            <a tabindex="-1" href="/cultivos">
              <vaadin-icon icon="vaadin:chart"></vaadin-icon>
              <span>${translate("navbar.opciones.colorCultivos")}</span>
            </a>
          </vaadin-tab> -->

          <vaadin-tab>
            <a tabindex="-1">
              <vaadin-select
                .value=${"es"}
                @change=${(e: CustomEvent) => {
                  let lang = e.target.value;
                  use(lang);
                }}
                ${selectRenderer(this.lang_renderer, this.lenguajes)}
              ></vaadin-select>
            </a>
          </vaadin-tab>

          <vaadin-tab>
            <a
              tabindex="-1"
              @click=${() => {
                this.sendEvent("logout-click", {});
              }}
            >
              <vaadin-icon icon="vaadin:cart"></vaadin-icon>
              <span>Log Out</span>
            </a>
          </vaadin-tab>

          <vaadin-tab>
            <a tabindex="-1">
              <span>Version: ${this.version()}</span>
            </a>
          </vaadin-tab>
        </vaadin-tabs>

        <slot></slot>
      </vaadin-app-layout>
    `;
  }
}
