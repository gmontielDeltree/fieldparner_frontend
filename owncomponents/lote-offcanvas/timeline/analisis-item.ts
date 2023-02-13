import {
  actividad_adjuntar_archivo,
  actividad_remover_adjunto,
} from "./../../helpers/actividad-funciones";
import { LitElement, html, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Actividad, Ejecucion } from "../../depositos/depositos-types";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import { Router } from "@vaadin/router";
import gbl_state from "../../state";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/button";
import "@vaadin/details";
import "@vaadin/horizontal-layout";
import "@vaadin/vertical-layout";
import "@vaadin/upload";
import "@vaadin/menu-bar";
import { badge } from "@vaadin/vaadin-lumo-styles/badge";
import { format, isBefore, parse, parseISO } from "date-fns";
import { map } from "lit/directives/map.js";
import { translate } from "lit-translate";
import { actividad_detalles } from "./detalles-actividad/detalles-actividad";
import { ejecucion_detalles } from "./detalles-actividad/detalles-ejecucion";
import { AnalisisSuelo } from "../../tipos/analisis-suelo";
import { borrar_analisis_suelo, analisis_suelo_remover_adjunto } from '../../analisis-suelo/analisis-suelo-funciones';

@customElement("analisis-suelo-item")
export class AnalisisSueloItem extends LitElement {
  static override styles = [badge];

  @property()
  ana: AnalisisSuelo;

  private menu_items = [
    {
      component: this.createItem("ellipsis-dots-v"),
      tooltip: "Mas",
      children: [
        {
          text: "Editar",
          tooltip: "Edit",
          value: "editar",
          callback: () => {
            Router.go(`/analisissuelo/${this.ana.uuid}/edit`)
          }
        },
        {
          text: "Eliminar",
          tooltip: "Archive",
          value: "eliminar",
          callback: () => this.borrar_actividad(),
        },
      ],
    },
  ];

  menu_click({ detail }) {
    /* Si tiene un callback, lo ejecuto */
    if (detail.value.callback) {
      detail.value.callback();
      return;
    }
  }

  createItem(iconName: string) {
    const item = document.createElement("vaadin-context-menu-item");
    const icon = document.createElement("vaadin-icon");
    icon.setAttribute("icon", `vaadin:${iconName}`);
    item.appendChild(icon);
    return item;
  }

  borrar_actividad() {
    console.log("Borrar Actividad");
    borrar_analisis_suelo(this.ana);
    this.solicitar_refresco();
  }

  solicitar_refresco() {
    let ev = new CustomEvent("refrescar-actividades", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
  }

  render() {
    let fecha = this.ana.fecha;

    return html` <vaadin-horizontal-layout
        theme=""
        style="align-items:center; justify-content:space-between;"
      >
        <div>
          <!--Badge Ejecucion-->
          <span theme="badge primary">${fecha}</span>

          <a>${translate("analisis_de_suelo")}</a>
        </div>

        <vaadin-menu-bar
          .items="${this.menu_items}"
          @item-selected=${this.menu_click}
          theme="icon"
        >
          <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
        </vaadin-menu-bar>
      </vaadin-horizontal-layout>
      <vaadin-tabsheet>
        <vaadin-tabs slot="tabs">
          <vaadin-tab id="dashboard-tab"
            >${translate("detalles")}</vaadin-tab
          >
          <vaadin-tab id="shipping-tab">${translate("adjuntos")}</vaadin-tab>
        </vaadin-tabs>

       

        <!-- Planificacion -->
        <div tab="dashboard-tab">
          <div style="font-size: small;">
            
          </div>
          ${this.ana.laboratorio}
        </div>
        <!-- Fin planificacion -->

        <!-- Adjuntos -->
        <div tab="shipping-tab">
          <vaadin-vertical-layout style="align-self:stretch">
            ${this.ana.attachments
              ? this.ana.attachments.map(
                  (att) => html`
                    <vaadin-horizontal-layout
                      style="width:100%; align-items:center; justify-content:space-between"
                      theme="spacing"
                    >
                      <div>${att.filename}</div>
                      <div>
                        <!-- Grupo botones -->

                        <!-- <vaadin-button @click=${() => {
                          let n = att.filename;
                          if (n.includes(".shp")) {
                            //Show on map
                          } else if (n.includes(".jpg")) {
                            // Open lightbox
                          }
                        }}>
                      <vaadin-icon icon='lumo:eye'></vaadin-icon>
                      </vaadin-button> -->
                        <vaadin-button
                          @click=${() => {
                            fetch(
                              "/attachments?file=" +
                                encodeURIComponent(att.filename)
                            )
                              .then((r) => {
                                return r.blob();
                              })
                              .then((data) => {
                                // Download Fetch
                                var a = document.createElement("a");
                                a.href = window.URL.createObjectURL(data);
                                a.download = att.filename;
                                a.click();
                              });
                          }}
                        >
                          <vaadin-icon icon="lumo:download"></vaadin-icon>
                        </vaadin-button>
                        <vaadin-button
                          @click=${() => {
                            // Solicitar borrado en server y en la db
                            analisis_suelo_remover_adjunto(this.ana, att.uuid).then(
                              () => this.requestUpdate()
                            );
                          }}
                          ><vaadin-icon icon="vaadin:trash"></vaadin-icon
                        ></vaadin-button>
                      </div>
                    </vaadin-horizontal-layout>
                  `
                )
              : html`${translate("sin_adjuntos")}`}
          </vaadin-vertical-layout>
        </div>
        <!-- FinAdjuntos-->
      </vaadin-tabsheet>`;
  }
}

const url_repeticion = (actividad_uuid) => {
  let location = gbl_state.router.location.pathname;
  let url =
    location + "/actividad/" + encodeURIComponent(actividad_uuid) + "/repetir";
  return url;
};
