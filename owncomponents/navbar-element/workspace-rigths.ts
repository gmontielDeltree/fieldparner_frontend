import { LitElement, html, PropertyValueMap } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Workspace } from "./workspace_types";
import gbl_state from "../state";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/vertical-layout";
import "@vaadin/custom-field";
import "@vaadin/confirm-dialog";
import "@vaadin/grid";
import "@vaadin/icons";
import "@vaadin/dialog";
import "@vaadin/menu-bar";

import {
  dialogFooterRenderer,
  dialogHeaderRenderer,
  dialogRenderer,
} from "@vaadin/dialog/lit.js";

import { columnBodyRenderer } from "@vaadin/grid/lit.js";

import { DialogOpenedChangedEvent } from "@vaadin/dialog";
import { translate, get } from "lit-translate";
import { Router } from "@vaadin/router";

@customElement("workspace-rights")
export class WorkspaceRights extends LitElement {
  @state({ hasChanged: (v, ov) => false })
  workspace: Workspace;

  @state()
  loaded: boolean = false;

  @state()
  dialogOpened: any = true;

  @state()
  inviteDialogOpened: boolean = false;

  @state()
  editDialogOpened: boolean = false;

  @state()
  deleteDialogOpened: boolean = false;

  @state({hasChanged:(v,ov)=>false})
  user_selected : any

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    let params = gbl_state.router.location.params;
    let uuid_workspace = params.uuid_workspace as string;
    console.log("fetching ws", uuid_workspace);
    gbl_state.user_db.get(uuid_workspace).then((doc) => {
      this.workspace = doc as unknown as Workspace;
      this.workspace.users = [
        { user_email: "elon@tsla.com", rights: "admin", nombre: "Elon Musk" },
        { user_email: "lgoharriz@gmail.com", rights: "edit", nombre: "Gastón LeClerc" }
      ];
      this.loaded = true;
    });
  }

  close() {
    this.dialogOpened = false
    Router.go('/')
  }

  edit(args) {
    console.log("args", args);
  }

  menu_more_click(o, clicked_item) {
    console.log('Item Clicked',clicked_item)
    let valor =o.detail.value.value;
    if (valor === "delete") {
      this.deleteDialogOpened = true;
      this.dialogOpened = false;
      this.user_selected =clicked_item
    } else if (valor === "resend_value") {
      console.log("resend_link");
      this.user_selected =clicked_item
      this.resend_link();
    } else if (valor === "edit") {
      console.log("");
      this.editDialogOpened = true;
      this.dialogOpened = false;
      this.user_selected =clicked_item
    }
  }

  link_shareable = ()=>{
    let i = {
      origin: "DemoUser",
      ws: this.workspace.nombre
    }

    let p = btoa(encodeURIComponent(JSON.stringify(i)))
    let link = 'agrotools.netlify.app/invite/'+ p
    return link
  }

  resend_link() {}
  borrar_usuario() {}

  editar_usuario() {}

  render() {
    if (!this.loaded) {
      return null;
    }

    return html`
      <!-- main dialog -->
      <vaadin-dialog
        theme="no-padding"
        header-title=${translate("workspaceRights.titulo")}
        .opened="${this.dialogOpened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) =>
          (this.dialogOpened = e.detail.value)}"
        ${dialogHeaderRenderer(
          () => html`
            <vaadin-button
              theme="primary success"
              @click="${() => {
                this.dialogOpened = false;
                this.inviteDialogOpened = true;
              }}"
              >${translate("workspaceRights.invitar")}</vaadin-button
            >
          `
        )}
        ${dialogRenderer(
          () => html`
            <vaadin-grid
              .items="${this.workspace.users}"
              style="width: 500px; max-width: 100%;"
            >
              <vaadin-grid-column
                header="E-Mail"
                path="user_email"
              ></vaadin-grid-column>
              <vaadin-grid-column
                header="Nombre"
                path="nombre"
              ></vaadin-grid-column>
              <vaadin-grid-column
                header="Rol"
                path="rights"
              ></vaadin-grid-column>
              <vaadin-grid-column
                frozen-to-end
                auto-width
                flex-grow="0"
                ${columnBodyRenderer(this.menuBarRenderer, [])}
              ></vaadin-grid-column>
            </vaadin-grid>
          `,
          this.workspace.users
        )}
        ${dialogFooterRenderer(
          () => html`
            <vaadin-button theme="primary" @click="${this.close}"
              >Cerrar</vaadin-button
            >
          `,
          []
        )}
      ></vaadin-dialog>
      <!-- fin main dialog -->

      <!-- Invite dialog -->
      <vaadin-dialog
        aria-label="Invite User"
        .opened="${this.inviteDialogOpened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.inviteDialogOpened = e.detail.value;
          this.dialogOpened = !this.inviteDialogOpened;
        }}"
        ${dialogHeaderRenderer(
          () => html`
            <h2
              class="draggable"
              style="flex: 1; cursor: move; margin: 0; font-size: 1.5em; font-weight: bold; padding: var(--lumo-space-m) 0;"
            >
              ${translate("workspaceRights.invitar")}
            </h2>
          `,
          []
        )}
        ${dialogRenderer(
          () => html`
            <vaadin-vertical-layout
              theme="spacing"
              style="width: 300px; max-width: 100%; align-items: stretch;"
            >
              <vaadin-vertical-layout style="align-items: stretch;">
                <vaadin-email-field label='Email' ></vaadin-email-field>
                <vaadin-text-field label="${translate('nombre')}"></vaadin-text-field>
                <vaadin-combo-box
                  label="${translate('workspaceRights.permisos')}"
                  .items="${['admin','edit','viewer']}"
                ></vaadin-combo-box>
                ${this.link_shareable()}
              </vaadin-vertical-layout>
            </vaadin-vertical-layout>
          `,
          []
        )}
        ${dialogFooterRenderer(
          () =>
            html`
              <vaadin-button @click="${()=>{
                this.dialogOpened = true
                this.inviteDialogOpened =false
              }}">${translate('cerrar')}</vaadin-button>
              <vaadin-button theme="primary success" @click="${this.close}"
                >${translate('invitar')}</vaadin-button
              >
            `,
          []
        )}
      ></vaadin-dialog>
      <!-- fin invite dialog -->

      <!-- edit dialog -->
      <vaadin-dialog
        aria-label="Invite User"
        .opened="${this.editDialogOpened}"
        @opened-changed="${(e: DialogOpenedChangedEvent) => {
          this.editDialogOpened = e.detail.value;
          this.dialogOpened = !this.editDialogOpened;
        }}"
        ${dialogHeaderRenderer(
          () => html`
            <h2
              class="draggable"
              style="flex: 1; cursor: move; margin: 0; font-size: 1.5em; font-weight: bold; padding: var(--lumo-space-m) 0;"
            >
              ${translate("workspaceRights.editar")}
            </h2>
          `,
          []
        )}
        ${dialogRenderer(
          () => html`
            <vaadin-vertical-layout
              theme="spacing"
              style="width: 300px; max-width: 100%; align-items: stretch;"
            >
              <vaadin-vertical-layout style="align-items: stretch;">
                <span>${this.user_selected?.user_email}</span>
                <vaadin-text-field value=${this.user_selected.nombre}
                @input=${(e)=>this.user_selected.nombre = e.target.value}
                label="${translate('nombre')}"></vaadin-text-field>
                <vaadin-combo-box
                  label="${translate('workspaceRights.permisos')}"
                  value="${this.user_selected.rights}"

                  .items="${['admin','edit','viewer']}"
                ></vaadin-combo-box>
              </vaadin-vertical-layout>
            </vaadin-vertical-layout>
          `,
          []
        )}
        ${dialogFooterRenderer(
          () =>
            html`
              <vaadin-button @click="${()=>{
                this.dialogOpened =true
                this.editDialogOpened = false
              }}">${translate('cerrar')}</vaadin-button>
              <vaadin-button theme="primary" @click="${this.editar_usuario}"
                >${translate('guardar')}</vaadin-button
              >
            `,
          []
        )}
      ></vaadin-dialog>
      <!-- fin edit dialog -->

      <!-- confirm delete dialog -->
      <vaadin-confirm-dialog
        header=${translate('borrar')}
        cancel
        @cancel="${() => {
          this.dialogOpened = true;
          this.deleteDialogOpened = false;
        }}"
        confirm-text="Delete"
        confirm-theme="error primary"
        @confirm="${this.borrar_usuario}"
        .opened="${this.deleteDialogOpened}"
        @opened-changed="${(e) => {
          this.deleteDialogOpened = e.detail.value;
          this.dialogOpened = !this.deleteDialogOpened;
        }}"
      >
        ${translate('confirmar_borrar')}
      </vaadin-confirm-dialog>
      <!-- fin confirm delete dialog -->
    `;
  }

  private items = [
    { text: "Edit", value: "edit" },
    { text: "Resend Link", value: "resend_link" },
    { text: "Delete", value: "delete" },
  ];

  makeIcon() {
    const item = document.createElement("vaadin-context-menu-item");
    item.textContent = "•••";
    item.setAttribute("aria-label", "More options");
    return item;
  }

  private menuBarRenderer = (clicked_item) => {
    const items = [{ component: this.makeIcon(), children: this.items }];
    return html`<vaadin-menu-bar
      .items=${items}
      theme="tertiary"
      @item-selected=${(e)=>this.menu_more_click(e,clicked_item)}
    ></vaadin-menu-bar>`;
  };
}
