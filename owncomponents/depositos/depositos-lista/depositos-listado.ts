import { customElement, property, state } from "lit/decorators.js";
import "../../modal-generico/modal-generico";
import "./deposito-nuevo";

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

import { Deposito } from "../depositos-types";
import { listar_depositos, nuevo_deposito } from "../depositos_funciones";
import { Task, TaskStatus } from "@lit-labs/task";
import { createMenuDots } from "../../helpers";

@customElement("depositos-listado")
export class DepositosListado extends LitElement {
  @property()
  openedModal: boolean = true;

  @property()
  location: RouterLocation;

  private _loadTask = new Task(
    this,
    () => listar_depositos(),
    () => [this.location, this.openedModal]
  );

  @state() // Tiene que ser state para forzar rerender
  abrirNuevoDialog: boolean = false;

  @state() // Tiene que ser state para forzar rerender
  abrirEditDialog: boolean = false;

  private depo_to_edit: Deposito;

  private menu_items = [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: get("nuevo"),
          callback: () => {
            this.abrirNuevoDialog = true;
            console.log("Nuevo");
          },
        },
      ],
    },
  ];

  /* Tiene que ser una funcion para que genere los html elements del boton */
  private menu_depo_items = (depo: Deposito) => [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: get("editar"),
          callback: () => {
            this.abrirEditDialog = true;
            this.depo_to_edit = depo;
            console.log("edit");
          },
        },
        {
          text: get("eliminar"),
          callback: () => {
            this.abrirNuevoDialog = true;
            console.log("Nuevo");
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
      <modal-generico .modalOpened=${this.openedModal} backurl='/'>
        <h4 slot="title">${translate("depositos")}</h4>
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
          <deposito-nuevo
            .opened=${this.abrirNuevoDialog}
            @nuevo-depo=${() => {
              console.log("Nuevo Click");
              this.abrirNuevoDialog = false;
              //Refresh
              // Notificación
            }}
            @opened-changed=${(e: CustomEvent) => {
              this.abrirNuevoDialog = e.detail.value;
            }}
          ></deposito-nuevo>
          <deposito-nuevo
            .edit=${true}
            .depo_to_edit=${this.depo_to_edit}
            .opened=${this.abrirEditDialog}
            @nuevo-depo=${() => {
              this.abrirEditDialog = false;
              //Refresh
              // Notificación
            }}
            @opened-changed=${(e: CustomEvent) => {
              this.abrirEditDialog = e.detail.value;
            }}
          ></deposito-nuevo>

          ${
            this._loadTask.render({
              pending: () => html`${translate("cargando")}`,
              complete: (depos) => html`
                ${depos.map(
                  (depo) => html`
                    <vaadin-item
                      style="line-height: var(--lumo-line-height-m);"
                    >
                      <vaadin-horizontal-layout
                        style="align-items: center; justify-content: space-between;"
                        theme="spacing"
                      >
                        <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                          <vaadin-avatar .name="${depo.nombre}"></vaadin-avatar>
                          <vaadin-vertical-layout>
                            <span> ${depo.nombre} </span>
                            <span
                              style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                            >
                              ${depo.direccion}
                            </span>
                          </vaadin-vertical-layout>
                        </vaadin-horizontal-layout>

                        <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                          <vaadin-button
                            @click=${() => {
                              Router.go(
                                "/deposito/" +
                                  depo.uuid +
                                  "?from=" +
                                  this.location.pathname
                              );
                            }}
                            >${translate("ver")}</vaadin-button
                          >

                          <vaadin-menu-bar
                            .items="${this.menu_depo_items(depo)}"
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
