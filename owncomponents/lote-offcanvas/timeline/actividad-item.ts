import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Actividad } from "../../depositos/depositos-types";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import { Router } from "@vaadin/router";
import gbl_state from "../../state";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/button";
import "@vaadin/details";
import "@vaadin/horizontal-layout";
import "@vaadin/upload";
import "@vaadin/menu-bar";
import {badge} from "@vaadin/vaadin-lumo-styles/badge"

@customElement("actividad-item")
export class ActividadItem extends LitElement {
  
  static override styles = [badge]
  @property()
  item: Actividad;

  private menu_items = [
    {
      component: this.createItem("ellipsis-dots-v"),
      tooltip: "Mas",
      children: [
        {
          text: "Editar",
          tooltip: "Edit",
        },{
          text: "Repetir Planificacion",
          tooltip: "Repetir",
        },
        {
          text: "Orden de Trabajo PDF",
          tooltip: "Move",
        },
        {
          text: "Compartir Orden de Trabajo",
          tooltip: "Duplicate",
        },
        {
          text: "Datos Meteorológicos",
          tooltip: "Archive",
        },
        {
          text: "Eliminar",
          tooltip: "Archive",
        },
      ],
    },
  ];

  createItem(iconName: string) {
    const item = document.createElement("vaadin-context-menu-item");
    const icon = document.createElement("vaadin-icon");
    icon.setAttribute("icon", `vaadin:${iconName}`);
    item.appendChild(icon);
    return item;
  }

  render() {
    return html`
    
    <vaadin-horizontal-layout
        theme=""
        style="align-items:center; justify-content:space-between;"
      >
      <div><span theme="badge success">2022-10-31</span>
      <a
          >${this.item?.tipo.toUpperCase()}
          <span class="text-muted">
            en ${this.item.detalles.hectareas} has.</span
          ></a
        >
      </div>


        <vaadin-menu-bar .items="${this.menu_items}" theme="icon">
          <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
        </vaadin-menu-bar>
      </vaadin-horizontal-layout>
      <vaadin-tabsheet>
        <vaadin-tabs slot="tabs">
          <vaadin-tab id="dashboard-tab">Planificación</vaadin-tab>
          <vaadin-tab id="payment-tab">Ejecución</vaadin-tab>
          <vaadin-tab id="shipping-tab">Adjuntos</vaadin-tab>
        </vaadin-tabs>

        <!-- Planificacion -->
        <div tab="dashboard-tab">
          <div>Fecha Estimada de Aplicación</div>
          <vaadin-details opened theme="small">
            <div slot="summary">Insumos</div>

            <ul>
              <li>Blake Martin</li>
              <li>Caroline Clark</li>
              <li>Avery Torres</li>
              <li>Khloe Scott</li>
              <li>Camila Fisher</li>
              <li>Gavin Lewis</li>
              <li>Isabella Powell</li>
              <li>Zoe Wilson</li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Contratista</div>

            <ul>
              <li>Blake Martin</li>
              <li>Caroline Clark</li>
              <li>Avery Torres</li>
              <li>Khloe Scott</li>
              <li>Camila Fisher</li>
              <li>Gavin Lewis</li>
              <li>Isabella Powell</li>
              <li>Zoe Wilson</li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Condiciones de Trabajo</div>

            <ul>
              <li>Blake Martin</li>
              <li>Caroline Clark</li>
              <li>Avery Torres</li>
              <li>Khloe Scott</li>
              <li>Camila Fisher</li>
              <li>Gavin Lewis</li>
              <li>Isabella Powell</li>
              <li>Zoe Wilson</li>
            </ul>
          </vaadin-details>
          <vaadin-details theme="small">
            <div slot="summary">Observaciones</div>

            <ul>
              <li>Blake Martin</li>
              <li>Caroline Clark</li>
              <li>Avery Torres</li>
              <li>Khloe Scott</li>
              <li>Camila Fisher</li>
              <li>Gavin Lewis</li>
              <li>Isabella Powell</li>
              <li>Zoe Wilson</li>
            </ul>
          </vaadin-details>
        </div>
        <!-- Fin planificacion -->

        <!-- Ejecucion -->
        <div tab="payment-tab">
          <vaadin-horizontal-layout
            theme="spacing padding"
            style="justify-content: center"
          >
            <vaadin-button
              @click=${() =>
                Router.go(gbl_state.router.urlForPath("/ejecucion"))}
              theme="primary success"
            >
              Ejecutar
            </vaadin-button>
          </vaadin-horizontal-layout>
        </div>
        <!-- Fin Ejecucion -->

        <!-- Adjuntos -->
        <div tab="shipping-tab">
          <vaadin-upload target="/api/fileupload"></vaadin-upload>
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
