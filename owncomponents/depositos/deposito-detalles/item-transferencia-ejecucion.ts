import { showNotification } from "./../../helpers/notificaciones";
import { borrar_transfer } from "./../transferencias_funciones";
import { listar_ejecuciones_por_depo } from "./../depositos_funciones";
import { gbl_state } from "./../../state";
import { customElement, property, state } from "lit/decorators.js";
import "../../modal-generico/modal-generico";
import "../deposito-transferencias/deposito-nuevo-transferencias";

import {
  LitElement,
  PropertyValueMap,
  html,
  render,
  css,
  unsafeCSS,
} from "lit";
import { Router, RouterLocation } from "@vaadin/router";
import { get, translate } from "lit-translate";

import { badge } from "@vaadin/vaadin-lumo-styles/badge.js";
import "../../lote-offcanvas/aux/span-pill";
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

import { Deposito, Ejecucion } from "../depositos-types";
import {
  listar_depositos,
  nuevo_deposito,
  cargar_depo,
} from "../depositos_funciones";
import { Task, TaskStatus } from "@lit-labs/task";
import { createMenuDots, get_lote_detalles_by_uuid } from "../../helpers";
import {
  DepositosTransferencia,
  LineaStock,
  Stock,
} from "../../tipos/depositos-transferencias";
import { listar_transferencias } from "../transferencias_funciones";
import { calcular_stock } from "../stock_funciones";
import { map } from "lit/directives/map.js";
import { confirmar_eliminar } from "../../helpers/confirmar-eliminar";
import { Lote } from "../../tipos/lotes";

@customElement("item-transferencia-ejecucion")
export class ItemTransferenciaEjecucion extends LitElement {
  static styles = [
    css`
      .transferencia-item {
        width: 100%;
        justify-content: space-around;
        font-size: var(--lumo-font-size-s);
      }

      .direccion-transferencia {
        font-weight: bolder;
      }
      .cantidad-insumos {
        font-weight: bold;
      }

      .titulo-seccion {
        font-weight: bold;
      }
    `,
    css`
      vaadin-avatar[name="IN"] {
        color: azure;
        background-color: darkgreen;
      }

      vaadin-avatar[name="OUT"] {
        color: azure;
        background-color: firebrick;
      }
    `,
  ];

  @property()
  item: Ejecucion;

  @state()
  detalles: Lote;

  private _loadTask = new Task(
    this,
    () => this.loadData(this.item),
    () => [this.item]
  );

  // Encadeno promises
  loadData(item: Ejecucion) {
    return get_lote_detalles_by_uuid(item.lote_uuid)
      .then((l) => {
        this.detalles = l;
      })
      .catch((e) => {
        console.error(e);
        showNotification(get("error_al_cargar"), "error");
        return [] as DepositosTransferencia[];
      });
  }

  /* Tiene que ser una funcion para que genere los html elements del boton */
  private menu_depo_items_ejecucion = (trans: Ejecucion, detalles: Lote) => [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
        {
          text: get("editar"),
          callback: () => {
            let campo_id = detalles.properties.campo_parent_id;
            let lote_id = detalles.properties.nombre;
            let uuid = trans.uuid;
            let url = `campo/${campo_id}/lote/${lote_id}/ejecucion/${uuid}/editar`;
            Router.go(url);
            console.log("edit ejecucion");
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

  tipo_2_title(tipo) {}

  render() {
    return this._loadTask.render({
      pending: () => html`${translate("cargando")}`,
      complete: (trans) => html`
        <vaadin-item style="line-height: var(--lumo-line-height-m);">
          <vaadin-horizontal-layout
            style="align-items: center; justify-content: space-between; font-size: var(--lumo-font-size-s);"
            theme="spacing"
          >
            <vaadin-horizontal-layout theme="spacing">
              <vaadin-horizontal-layout
                style="align-items: center;"
                theme="spacing"
              >
                <vaadin-avatar name="OUT"></vaadin-avatar>
                <vaadin-vertical-layout>
                  <span>${this.item.tipo.toUpperCase()} </span>
                  <span
                    style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                  >
                    ${this.item.detalles.fecha_ejecucion}
                  </span>
                </vaadin-vertical-layout>
              </vaadin-horizontal-layout>

              <span-pill style="--bg-color:green;"
                >Lote ${this.detalles.properties.nombre}</span-pill
              >
            </vaadin-horizontal-layout>

            <vaadin-horizontal-layout
              style="align-items: center;"
              theme="spacing"
            >
              <vaadin-menu-bar
                .items="${this.menu_depo_items_ejecucion(
                  this.item,
                  this.detalles
                )}"
                @item-selected=${this.menu_click}
                theme="icon"
              >
                <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
              </vaadin-menu-bar>
            </vaadin-horizontal-layout>
          </vaadin-horizontal-layout>
        </vaadin-item>
      `,
    });
  }
}
