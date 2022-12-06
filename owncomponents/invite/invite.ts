import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/confirm-dialog";
import "@vaadin/horizontal-layout";
import type { ConfirmDialogOpenedChangedEvent } from "@vaadin/confirm-dialog";
import { get, translate, translateUnsafeHTML } from "lit-translate";
import { Router } from "@vaadin/router";
import { Notification } from "@vaadin/notification";
import '@vaadin/avatar';
import '@vaadin/button';
import '@vaadin/icon';
import '@vaadin/icons';
import '@vaadin/notification';
import '@vaadin/vaadin-lumo-styles/vaadin-iconset';
import gbl_state from '../state'
import { Workspace } from '../navbar-element/workspace_types';

@customElement("link-invitacion")
class LinkInvitacion extends LitElement {
  @state()
  private dialogOpened = true;

  @state()
  private status = "";

  @state()
  username: string = "Jonny";

  @state()
  workspacename: string = "Valhalla";
  
  @state()
  rights : string = "view"

  //  get("invitacion.notificacion.ok")

  showNotificationAcepto = () => {
    const notification = Notification.show(html`
    <vaadin-horizontal-layout theme="spacing" style="align-items: center">
      <vaadin-icon
        icon="vaadin:check-circle"
        style="color: var(--lumo-success-color)"
      ></vaadin-icon>
      <div>
        <b style="color: var(--lumo-success-text-color);">${translate("invitacion.notificacion.ok")}</b>
        <div
          style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color)"
        >
        ${translateUnsafeHTML('invitacion.notificacion.okbody',{workspacename:()=>this.workspacename})}
        </div>
      </div>
      <vaadin-button
        theme="tertiary-inline"
        @click="${() => notification.close()}"
        aria-label="Close"
      >
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    </vaadin-horizontal-layout>
  `, {
      position: "top-center",
    });
  };

  showNotificationRechazo = () => {
    const notification = Notification.show(
      get("invitacion.notificacion.rechazada"),
      {
        position: "top-center",
      }
    );
  };

  render() {
    return html`
      <vaadin-confirm-dialog
        header=" ${translate("invitacion.titulo")}"
        reject
        reject-text="${translate("rechazar")}"
        @reject="${() => {
          this.showNotificationRechazo();
          Router.go("/");
        }}"
        confirm-text=${translate("aceptar")}
        @confirm="${() => {
          this.status = "Saved";
          this.showNotificationAcepto();
          Router.go('/')
        }}"
        .opened="${this.dialogOpened}"
        @opened-changed="${this.openedChanged}"
      >
        ${translate("invitacion.body", {
          username: this.username,
          workspacename: this.workspacename,
        })}
      </vaadin-confirm-dialog>
    `;
  }

  openedChanged(e: ConfirmDialogOpenedChangedEvent) {
    this.dialogOpened = e.detail.value;
    let p = gbl_state.router.location.params
    let inv = JSON.parse(decodeURIComponent(atob(p.base64_invitation)))
    this.workspacename = inv.ws
    this.username = inv.origin
    this.rights = inv.rights
    console.log("PARAMETER ",p,atob(inv))
    if (this.dialogOpened) {
      this.status = "";
    }
  }
}
