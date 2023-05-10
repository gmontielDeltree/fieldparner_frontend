import { customElement, property, state } from "lit/decorators.js";
import "../modal-generico/modal-generico";

import { LitElement, PropertyValueMap, html, render } from "lit";
import { Router, RouterLocation } from "@vaadin/router";
import { get, translate } from "lit-translate";

import "@vaadin/avatar";
import "@vaadin/button";
import "@vaadin/item";
import "@vaadin/list-box";
import "@vaadin/horizontal-layout";
import "@vaadin/vaadin-lumo-styles/typography";
import "@vaadin/vertical-layout";
import "@vaadin/menu-bar";
import "@vaadin/tooltip";


import { Task, TaskStatus } from "@lit-labs/task";
import { createMenuDots } from "./../helpers";
import { confirmar_eliminar } from "../helpers/confirmar-eliminar";
import { borrar_transfer } from "../depositos/transferencias-funciones";
import { showNotification } from "../helpers/notificaciones";
import { borrar_vehiculo, listar_vehiculos } from "./vehiculos-funciones";
import { Vehiculo } from "../tipos/vehiculos";

@customElement("vehiculos-lista")
export class VehiculosLista extends LitElement {
  @property()
  openedModal: boolean = true;

  @property()
  location: RouterLocation;

  private _loadTask = new Task(
    this,
    () => listar_vehiculos(),
    () => [this.location, this.openedModal]
  );

  private menu_items = [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: get("nuevo"),
          callback: () => {
            Router.go("equipos/add");
            console.log("Nuevo");
          },
        },
      ],
    },
  ];

  /* Tiene que ser una funcion para que genere los html elements del boton */
  private menu_detalles_item = (item: Vehiculo) => [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: get("editar"),
          callback: () => {
            Router.go("equipos/" + item.uuid + "/edit");
            console.log("edit");
          },
        },
        {
          text: get("eliminar"),
          callback: () => {
            confirmar_eliminar(() => {
              borrar_vehiculo(item)
                .then(() => showNotification(get("item_borrado")))
                .then(() => this._loadTask.run());
            });
          },
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

  render() {
    return html`
      <modal-generico .modalOpened=${this.openedModal} backurl="/">
        <div slot="title">${translate("equipos")}</div>
        <div slot="menu" s>
          <vaadin-menu-bar
            .items="${this.menu_items}"
            @item-selected=${this.menu_click}
            theme="icon"
          >
            <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
          </vaadin-menu-bar>
        </div>
        <div slot="body">
          <slot></slot>
          ${
            this._loadTask.render({
              pending: () => html`${translate("cargando")}`,
              complete: (vehiculos) => html`
                ${vehiculos.map(
                  (item) => html`
                    <vaadin-item
                      style="line-height: var(--lumo-line-height-m);"
                    >
                      <vaadin-horizontal-layout
                        style="align-items: center; justify-content: space-between;"
                        theme="spacing"
                      >
                        <vaadin-horizontal-layout
                          style="align-items: center;"
                          theme="spacing"
                        >
                          <vaadin-avatar
                            .name="${item.tipo}"
                          ></vaadin-avatar>
                          <vaadin-vertical-layout>
                            <span> ${item.marca} </span>
                            <span
                              style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                            >
                              ${item.modelo}
                            </span>
                          </vaadin-vertical-layout>
                        </vaadin-horizontal-layout>

                        <vaadin-horizontal-layout
                          style="align-items: center;"
                          theme="spacing"
                        >
                          <vaadin-button
                            @click=${() => {
                              Router.go(
                                "/equipos/" +
                                  item.uuid +
                                  "?from=" +
                                  this.location.pathname
                              );
                            }}
                            >${translate("ver")}</vaadin-button
                          >

                          <vaadin-menu-bar
                            .items="${this.menu_detalles_item(item)}"
                            @item-selected=${this.menu_click}
                            theme="icon"
                          >
                            <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
                          </vaadin-menu-bar>
                        </vaadin-horizontal-layout>
                      </vaadin-horizontal-layout>
                    </vaadin-item>
                  `
                )}
              `,
            })
            // End TASK RENDER
          }
        </div>
      </modal-generico>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vehiculos-lista": VehiculosLista;
  }
}
