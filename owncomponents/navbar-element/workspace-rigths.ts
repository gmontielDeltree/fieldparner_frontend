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
        { user_mail: "aaa@ccc", rights: "admin", nombre: "YOmi" },
      ];
      this.loaded = true;
    });
  }

  close() {}

  edit(args) {
    console.log("args", args);
  }

  menu_more_click({ detail }) {
    let valor = detail.value.value;
    if (valor === "delete") {
      this.deleteDialogOpened = true;
      this.dialogOpened = false;
    } else if (valor === "resend_value") {
      console.log("resend_link");
      this.resend_link();
    } else if (valor === "edit") {
      console.log("");
      this.editDialogOpened = true;
      this.dialogOpened = false;
    }
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
                path="user_mail"
              ></vaadin-grid-column>
              <vaadin-grid-column
                header="Nombre"
                path="nombre"
              ></vaadin-grid-column>
              <vaadin-grid-column
                header="Role"
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
                <vaadin-text-field label="Email"></vaadin-text-field>
                <vaadin-text-field label="${translate('nombre')}"></vaadin-text-field>
                <vaadin-combo-box
                  label="${translate('workspaceRights.permisos')}"
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
              <vaadin-button @click="${this.close}">Cancel</vaadin-button>
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
                <span>sophia.willlina</span>
                <vaadin-text-field label="${translate('nombre')}"></vaadin-text-field>
                <vaadin-combo-box
                  label="${translate('workspaceRights.permisos')}"
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
              <vaadin-button @click="${this.close}">Cancel</vaadin-button>
              <vaadin-button theme="primary" @click="${this.close}"
                >Add note</vaadin-button
              >
            `,
          []
        )}
      ></vaadin-dialog>
      <!-- fin edit dialog -->

      <!-- confirm delete dialog -->
      <vaadin-confirm-dialog
        header='Delete "Report Q4"?'
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
        Are you sure you want to permanently delete this item?
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

  private menuBarRenderer = () => {
    const items = [{ component: this.makeIcon(), children: this.items }];
    return html`<vaadin-menu-bar
      .items=${items}
      theme="tertiary"
      @item-selected=${this.menu_more_click}
    ></vaadin-menu-bar>`;
  };
}
