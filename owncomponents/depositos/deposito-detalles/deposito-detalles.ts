import { gbl_state } from "./../../state";
import { customElement, property, state } from "lit/decorators.js";
import "../../modal-generico/modal-generico";
import "../deposito-transferencias/deposito-nuevo-transferencias";

import { LitElement, PropertyValueMap, html, render, css } from "lit";
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
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/notification";
import "@vaadin/vaadin-lumo-styles/vaadin-iconset";

import type { NotificationOpenedChangedEvent } from "@vaadin/notification";
import { notificationRenderer } from "@vaadin/notification/lit.js";
import type { NotificationLitRenderer } from "@vaadin/notification/lit.js";

import { Deposito } from "../depositos-types";
import {
  listar_depositos,
  nuevo_deposito,
  cargar_depo,
} from "../depositos_funciones";
import { Task, TaskStatus } from "@lit-labs/task";
import { createMenuDots } from "../../helpers";
import {
  DepositosTransferencia,
  LineaStock,
  Stock,
} from "../../tipos/depositos-transferencias";
import { listar_transferencias } from "../transferencias_funciones";
import { calcular_stock } from "../stock_funciones";
import { map } from "lit/directives/map.js";

@customElement("deposito-detalles")
export class DepositoDetalles extends LitElement {
  @property()
  openedModal: boolean = true;

  @property()
  location: RouterLocation;

  private depo: Deposito = nuevo_deposito();
  private transferencias: DepositosTransferencia;
  private stock: Stock;

  @state()
  errorNotificationOpened: boolean;

  private _loadTask = new Task(
    this,
    () => this.loadData(this.location.params.uuid),
    () => [this.location, this.openedModal]
  );

  @state() // Tiene que ser state para forzar rerender
  abrirNuevoDialog: boolean = false;

  @state() // Tiene que ser state para forzar rerender
  abrirEditDialog: boolean = false;

  // Encadeno promises
  loadData(depo_uuid) {
    return cargar_depo(depo_uuid)
      .then((d) => (this.depo = d))
      .then(() => calcular_stock(depo_uuid))
      .then((stock) => {
        this.stock = stock;
      })
      .then(() => listar_transferencias(depo_uuid))
      .catch((e) => {
        console.error(e);
        this.errorNotificationOpened = true;
        return [] as DepositosTransferencia[];
      });
  }

  private trans_to_edit: DepositosTransferencia;

  private menu_items = [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: get("nueva_transferencia_entrada"),
          callback: () => {
            Router.go(
              gbl_state.router.urlForPath("/deposito/:uuid/transfer/add/in", {
                uuid: this.location.params.uuid,
              })
            );
            console.log("Nuevo");
          },
        },
        {
          text: get("nueva_transferencia_salida"),
          callback: () => {
            Router.go(
              gbl_state.router.urlForPath("/deposito/:uuid/transfer/add/out", {
                uuid: this.location.params.uuid,
              })
            );
            console.log("Nuevo");
          },
        },
      ],
    },
  ];

  /* Tiene que ser una funcion para que genere los html elements del boton */
  private menu_depo_items = (trans: DepositosTransferencia) => [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: get("editar"),
          callback: () => {
            this.abrirEditDialog = true;
            this.trans_to_edit = trans;
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
      <modal-generico .modalOpened=${this.openedModal} backurl='/depositos' >
        <h4 slot="title">${this.depo.nombre}</h4>
        <div slot="menu">
          <vaadin-menu-bar
            .items="${this.menu_items}"
            @item-selected=${this.menu_click}
            theme="icon"
          >
            <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
          </vaadin-menu-bar>
        </div>
        <div slot="body">
          

          <vaadin-tabsheet>
            <vaadin-tabs slot="tabs">
              <vaadin-tab id="stock-tab">${translate("stock")}</vaadin-tab>
              <vaadin-tab id="es-tab"
                >${translate("entrada-salida")}
              </vaadin-tab>
              <!-- <vaadin-button style="margin-left:auto;"
                >${translate("filtrar")}</vaadin-button
              > -->
            </vaadin-tabs>

            <div tab="stock-tab">
              ${this._loadTask.render({
                pending: () => html`${translate("cargando")}`,
                complete: (trans) => this.stock_tab(),
              })}
            </div>
            <div tab="es-tab">
              ${
                this._loadTask.render({
                  pending: () => html`${translate("cargando")}`,
                  complete: (trans) => html`
                    ${trans.map(
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
                                .name="${item.deposito_origen.uuid ===
                                this.depo.uuid
                                  ? "OUT"
                                  : "IN"}"
                              ></vaadin-avatar>
                              <vaadin-vertical-layout>
                                <span>
                                  ${item.deposito_origen.nombre} ->
                                  ${item.deposito_destino.nombre}
                                </span>
                                <span
                                  style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                >
                                  ${item.fecha}
                                </span>
                              </vaadin-vertical-layout>
                            </vaadin-horizontal-layout>

                            <vaadin-horizontal-layout
                              style="align-items: center;"
                              theme="spacing"
                            >
                              <!-- <vaadin-button
                                @click=${() => {
                                Router.go(
                                  "/deposito/" +
                                    item.uuid +
                                    "?from=" +
                                    this.location.pathname
                                );
                              }}
                                >${translate("ver")}</vaadin-button
                              > -->

                              <vaadin-menu-bar
                                .items="${this.menu_depo_items(item)}"
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
          </vaadin-tabsheet>

          <deposito-nuevo-transferencias
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
          ></deposito-nuevo-transferencias>
          <deposito-nuevo-transferencias
            .edit=${true}
            .depo_to_edit=${this.trans_to_edit}
            .opened=${this.abrirEditDialog}
            @nuevo-depo=${() => {
              this.abrirEditDialog = false;
              //Refresh
              // Notificación
            }}
            @opened-changed=${(e: CustomEvent) => {
              this.abrirEditDialog = e.detail.value;
            }}
          ></deposito-nuevo-transferencias>
          <vaadin-notification
            theme="error"
            duration="0"
            position="middle"
            .opened="${this.errorNotificationOpened}"
            @opened-changed="${(e: NotificationOpenedChangedEvent) => {
              this.errorNotificationOpened = e.detail.value;
            }}"
            ${notificationRenderer(this.renderer, [])}
          ></vaadin-notification>
        </div>
        <!-- end body -->
        <slot><slot>
      </modal-generico>
    `;
  }

  renderer: NotificationLitRenderer = () => {
    return html`
      <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
        <div>${translate("error_al_cargar_refresque")}</div>
        <vaadin-button
          theme="tertiary-inline"
          @click="${this.closeError}"
          aria-label="Close"
        >
          <vaadin-icon icon="lumo:cross"></vaadin-icon>
        </vaadin-button>
      </vaadin-horizontal-layout>
    `;
  };

  closeError() {
    this.errorNotificationOpened = false;
    console.log("clicked");
  }

  stock_tab() {
    return html`
      ${map(
        Object.values(this.stock),
        (item: LineaStock) => html`
          <vaadin-item style="line-height: var(--lumo-line-height-m);">
            <vaadin-horizontal-layout
              style="align-items: center; justify-content: space-between;"
              theme="spacing"
            >
              <vaadin-horizontal-layout
                style="align-items: center;"
                theme="spacing"
              >
                <vaadin-avatar
                  .name="${item.insumo.marca_comercial}"
                ></vaadin-avatar>
                <vaadin-vertical-layout>
                  <span> ${item.insumo.marca_comercial} </span>
                  <span
                    style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                  >
                    ${item.insumo.principio_activo}
                  </span>
                </vaadin-vertical-layout>
                <span> ${item.cantidad} </span>
              </vaadin-horizontal-layout>

              <vaadin-horizontal-layout
                style="align-items: center;"
                theme="spacing"
              >
                <!-- <vaadin-button
                                @click=${() => {}}
                                >${translate("ver")}</vaadin-button
                              > -->

                <vaadin-menu-bar
                  .items="[]"
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
    `;
  }

  static override styles = css`
    vaadin-avatar[name="IN"] {
      color: azure;
      background-color: darkgreen;
    }

    vaadin-avatar[name="OUT"] {
      color: azure;
      background-color: firebrick;
    }
  `;
}
