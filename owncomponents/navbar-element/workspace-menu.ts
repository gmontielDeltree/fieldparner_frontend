import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { gblStateLoaded } from "../state";
import gbl_state from "../state";
import "@spectrum-web-components/action-menu/sp-action-menu.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/menu/sp-menu-divider.js";

import "@spectrum-web-components/theme/sp-theme";
import "@spectrum-web-components/theme/src/themes";

import { StateController } from "@lit-app/state";

import { translate, get } from "lit-translate";
import uuid4 from "uuid4";
import { map } from "lit/directives/map.js";
import { Router } from '@vaadin/router';

interface Workspace {
  _id: string;
  uuid: string;
  nombre: string;
  owner: string;
  propio: boolean;
  rights: string;
}

@customElement("workspace-menu")
export class className extends LitElement {
  @state()
  workspaces: Workspace [] = [];

  @state()
  selected_workspace: Workspace;

  @state({hasChanged:(v,ov)=>false})
  loaded: boolean = false;

  stateBind = new StateController(this, gbl_state);

  willUpdate() {
    console.count("WillUpdate Workspaces");
    if (!this.loaded && gblStateLoaded()) {
      this.listWorkspaces();
    }
  }

  listWorkspaces() {
    gbl_state.user_db
      .allDocs({
        include_docs: true,
        startkey: "workspace:",
        endkey: "workspace:\ufff0",
      })
      .then(({ rows }) => {
        console.log("Amigos del Futbol", rows);
        let docs = rows.map((r) => r.doc);
        this.workspaces = docs as unknown as Workspace[];
        this.selected_workspace = this.workspaces[0];
        this.loaded = true;
      });
  }

  createWorkspace(nombre) {
    let id = "workspace:" + uuid4();
    let new_ws: Workspace = {
      _id: id,
      uuid: id,
      nombre: nombre,
      owner: gbl_state.user.sub,
      propio: true,
      rights : 'admin'
    };

    gbl_state.user_db.put(new_ws);
    this.workspaces.push(new_ws);
    this.workspaces = [...this.workspaces];
  }

  selectWorkspace(ws) {
    this.selected_workspace = ws;
    // Cambiar DB de ws
    // gbl_state.db = new Pouch()
  }

  openPermisos(ws) {
    // Router go to
    Router.go('/rights/' + ws['_id'])
  }

  borrar(ws) {
    if (confirm(get("confirmar_borrar"))) {
        gbl_state.user_db.get(ws["_id"]).then((doc)=>{
            gbl_state.user_db.remove(doc)
            this.listWorkspaces()
        })
    }
  }

  render() {
    let workspace = (ws: Workspace) => html` <sp-menu-item id="submenu-item-1">
      ${ws.nombre}
      <sp-menu slot="submenu">
        <sp-menu-item @click=${() => this.selectWorkspace(ws)}
          >${translate("navbar.workspace.seleccionar")}</sp-menu-item
        >
        <sp-menu-item @click=${() => this.openPermisos(ws)}
          >${translate("navbar.workspace.permisos")}</sp-menu-item
        >
        ${ws.propio
          ? html`<sp-menu-item @click=${() => this.borrar(ws)}
              >${translate("borrar")}</sp-menu-item
            >`
          : null}
      </sp-menu>
    </sp-menu-item>`;

    return html`
      <sp-theme scale="medium" color="light">
        <!-- End content requiring theme application. -->

        <sp-action-menu>
          <sp-icon-show-menu slot="icon"
            >${this.selected_workspace?.nombre ? this.selected_workspace.nombre : "Default"}</sp-icon-show-menu
          >
          <sp-menu-group role="none">
            ${map(this.workspaces, workspace)}
            <sp-menu-divider></sp-menu-divider>
            <sp-menu-item
              @click=${() => {
                let nombre = prompt(
                  get("navbar.workspace.agregar"),
                  "Workspace ZZZ"
                );
                if (nombre) {
                  //Add Workspace
                  this.createWorkspace(nombre);
                }
              }}
            >
              ${translate("navbar.workspace.agregar")}
            </sp-menu-item>
          </sp-menu-group>
        </sp-action-menu>
      </sp-theme>
    `;
  }
}
