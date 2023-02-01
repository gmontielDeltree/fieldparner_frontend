import { NotificacionController } from "./../navbar-element/notificacion_controller";

import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/context-menu";
import { contextMenuRenderer } from "@vaadin/context-menu/lit.js";
import "@vaadin/icon";
import { badge } from "@vaadin/vaadin-lumo-styles/badge.js";
import "@vaadin/vaadin-lumo-styles/vaadin-iconset";
import { map } from "lit/directives/map.js";
import { notificacion_template } from "../navbar-element/notificacion";

@customElement("campana-notificacion")
export class NotificationPopup extends LitElement {
  private noti_controller = new NotificacionController(this, 10000);

  static styles = [
    badge,
    css`
      vaadin-context-menu {
        /* Wrap the click target around the button */
        display: inline-block;
      }

      span[theme~="badge"] {
        position: absolute;
        transform: translate(-40%, -30%);
      }
    `,
  ];

  // tag::snippet[]
  render() {
    return html`
      <vaadin-context-menu
        open-on="click"
        ${contextMenuRenderer(
          () => html`<div style="padding: var(--lumo-space-l);">
            <ul>
              ${this.noti_controller?.notificaciones?.length > 0
                ? map(
                    this.noti_controller?.notificaciones ?? [],
                    notificacion_template
                  )
                : html`<li>No hay notificaciones</li>`}
            </ul>
          </div>`,
          []
        )}
      >
        <vaadin-button aria-label="notifications" theme="tertiary">
          <vaadin-icon icon="vaadin:bell-o"></vaadin-icon>
          ${this.noti_controller?.notificaciones?.length > 0
            ? html`</span> <span theme="badge error primary small pill">${this.noti_controller?.notificaciones?.length || null}</span>`
            : null}
        </vaadin-button>
      </vaadin-context-menu>
    `;
  }
  // end::snippet[]
}
