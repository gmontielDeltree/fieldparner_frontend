import { cargar_proveedor, nuevo_proveedor } from "./proveedores-funciones";
import { Proveedor } from "./../tipos/proveedores";
import { listar_ejecuciones_por_depo } from "../depositos/depositos-funciones";
import { gbl_state } from "../state";
import { customElement, property, state } from "lit/decorators.js";
import "../modal-generico/modal-generico";
import "../depositos/deposito-transferencias/deposito-nuevo-transferencias";

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

import { Deposito, Ejecucion } from "../depositos/depositos-types";
import {
  listar_depositos,
  nuevo_deposito,
  cargar_depo,
} from "../depositos/depositos-funciones";
import { Task, TaskStatus } from "@lit-labs/task";
import { createMenuDots } from "../helpers";
import {
  DepositosTransferencia,
  LineaStock,
  Stock,
} from "../tipos/depositos-transferencias";
import { listar_transferencias } from "../depositos/transferencias-funciones";
import { calcular_stock } from "../depositos/stock-funciones";
import { map } from "lit/directives/map.js";
import { showNotification } from "../helpers/notificaciones";
import { Ingeniero } from "../tipos/ingenieros";
import { nuevo_ingeniero, cargar_ingeniero } from "./ingenieros-funciones";

@customElement("ingenieros-detalles")
export class IngenierosDetalles extends LitElement {
  @property()
  openedModal: boolean = true;

  @property()
  location: RouterLocation;

  private ingeniero: Ingeniero = nuevo_ingeniero();

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
  loadData(ing_uuid) {
    return cargar_ingeniero(ing_uuid)
      .then((d) => (this.ingeniero = d))
      .catch((e) => {
        console.error(e);
        showNotification(get("error_al_cargar"), "error");
        return null as Ingeniero;
      });
  }

  private menu_items = [
    {
      component: createMenuDots("ellipsis-dots-v"),
      tooltip: get("mas"),
      children: [
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
            console.log("edit");
          },
        },
        {
          text: get("eliminar"),
          callback: () => {
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
    return html``;
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

declare global {
  interface HTMLElementTagNameMap {
    "ingenieros-detalles": IngenierosDetalles;
  }
}

// <modal-generico .modalOpened=${this.openedModal} backurl='/ingenieros' >
//         <h4 slot="title">${this.ingeniero.nombre}</h4>
//         <div slot="menu">
//           <vaadin-menu-bar
//             .items="${this.menu_items}"
//             @item-selected=${this.menu_click}
//             theme="icon"
//           >
//             <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
//           </vaadin-menu-bar>
//         </div>
//         <div slot="body">

//           <vaadin-tabsheet>

//             <vaadin-tabs slot="tabs">
//               <vaadin-tab id="es-tab"
//                 >${translate("transferencias")}
//               </vaadin-tab>
//             </vaadin-tabs>

//             <div tab="es-tab">
//               ${this._loadTask.render({
//                 pending: () => html`${translate("cargando")}`,
//                 complete: (trans) =>
//                   trans.length === 0
//                     ? html`${translate("sin_transferencias")}`
//                     : html` ${trans.map(
//                         (item) => html`
//                           <vaadin-item
//                             esto-es-un-item
//                             style="line-height: var(--lumo-line-height-m);"
//                           >
//                             <vaadin-horizontal-layout
//                               style="align-items: center; justify-content: space-between;"
//                               theme="spacing"
//                             >
//                               <vaadin-horizontal-layout
//                                 style="align-items: center;"
//                                 theme="spacing"
//                               >
//                                 <vaadin-avatar
//                                   .name="${item.deposito_origen.uuid ===
//                                   this.ingeniero.uuid
//                                     ? "OUT"
//                                     : "IN"}"
//                                 ></vaadin-avatar>
//                                 <vaadin-vertical-layout>
//                                   <span>
//                                     ${item.deposito_origen.nombre} ->
//                                     ${item.deposito_destino.nombre}
//                                   </span>
//                                   <span
//                                     style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
//                                   >
//                                     ${item.fecha}
//                                   </span>
//                                 </vaadin-vertical-layout>
//                               </vaadin-horizontal-layout>

//                               <vaadin-horizontal-layout
//                                 menu-del-item
//                                 style="align-items: center;"
//                                 theme="spacing"
//                               >
//                                 <vaadin-menu-bar
//                                   .items="${this.menu_depo_items(item)}"
//                                   @item-selected=${this.menu_click}
//                                   theme="icon"
//                                 >
//                                   <vaadin-tooltip
//                                     slot="tooltip"
//                                   ></vaadin-tooltip>
//                                 </vaadin-menu-bar>
//                               </vaadin-horizontal-layout>
//                             </vaadin-horizontal-layout>
//                           </vaadin-item>
//                         `
//                       )}`,
//               })}

//             </div>
//           </vaadin-tabsheet>

//         </div>
//         <!-- end body -->
//         <slot></slot>
//       </modal-generico>
