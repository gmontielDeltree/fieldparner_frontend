import { translate } from 'lit-translate';
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/confirm-dialog";
import "@vaadin/horizontal-layout";
import type { ConfirmDialogOpenedChangedEvent } from "@vaadin/confirm-dialog";

export const confirmar_eliminar = (callback: Function) => {
  const notification = <ConfirmarEliminar>(
    document.createElement("confirmar-eliminar")
  );

  notification.dialogOpened = true;
  window.document.body.appendChild(notification);
  notification.addEventListener("opened-changed", () =>
    window.document.body.removeChild(notification)
  );
  notification.addEventListener("confirm", () => {
    console.log("el usuario a confirmado");
    callback();
  });
};

@customElement("confirmar-eliminar")
export class ConfirmarEliminar extends LitElement {
  @property()
  dialogOpened = false;

  @state()
  private status = "";

  render() {
    return html`


        <!-- tag::snippet[] -->
        <vaadin-confirm-dialog
          header='${translate("borrar_este_item")}'
          cancel
          @cancel="${() => (this.status = "Canceled")}"
          confirm-text="${translate("borrar")}"
          confirm-theme="error primary"
          @confirm="${(e) => {
            this.status = "Deleted";
            this.dispatchEvent(
              new CustomEvent("confirm", {
                detail: null,
                bubbles: true,
                composed: true,
              })
            );
          }}"
          .opened="${this.dialogOpened}"
          @opened-changed="${this.openedChanged}"
        >
          ${translate("seguro_de_borrar_este_item")}
        </vaadin-confirm-dialog>

    `;
  }

  openedChanged(e: ConfirmDialogOpenedChangedEvent) {
    this.dialogOpened = e.detail.value;
    if (this.dialogOpened) {
      this.status = "";
    }
    if (!this.dialogOpened) {
      this.dispatchEvent(
        new CustomEvent("opened-changed", {
          detail: null,
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}
