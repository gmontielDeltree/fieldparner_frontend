import { LitElement, PropertyValueMap, css, html, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";

import "@vaadin/button";
import "@vaadin/date-picker";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/scroller";
import "@vaadin/text-area";
import "@vaadin/text-field";
import "@vaadin/vertical-layout";

/**
 * https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_overlay
 */
export class ModalGenerico extends LitElement {
  @property()
  size;

  @property()
  backurl : string

  @property()
  titulo: any = {};

  @property()
  modalOpened: boolean = false;

  static override styles = [
    css`
      .overlay {
        height: 100%;
        width: 100%;
        display: none;
        position: fixed;
        z-index: 1;
        top: 0;
        left: 0;
        background-color: rgb(255, 255, 255);
        background-color: rgba(255, 255, 255, 1);
      }

      .overlay-content {
        position: relative;
        top: 0%;
        width: 100%;
        /* text-align: center; */
        /* margin-top: 30px; */
      }

      .overlay .closebtn {
        position: absolute;
        top: 20px;
        right: 45px;
        font-size: 60px;
      }

      @media screen and (max-height: 450px) {
        .overlay a {
          font-size: 20px;
        }
        .overlay .closebtn {
          font-size: 40px;
          top: 15px;
          right: 35px;
        }
      }
    `,
    css`
      #container {
        align-items: stretch;
        /*border: 1px solid var(--lumo-contrast-20pct);*/
        max-width: 100%;
        height: 100%;
        width: 100%;
      }

      push {
        margin-left: auto;
      }

      header {
        align-items: center;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid var(--lumo-contrast-20pct);
        padding: var(--lumo-space-s);
      }

      header h2 {
        margin: 0;
      }

      header vaadin-icon {
        box-sizing: border-box;
        height: var(--lumo-icon-size-m);
        margin-right: var(--lumo-space-m);
        padding: calc(var(--lumo-space-xs) / 2);
        width: var(--lumo-icon-size-m);
      }

      footer {
        padding: var(--lumo-space-wide-m);
      }

      footer vaadin-button:first-child {
        margin-right: var(--lumo-space-s);
      }
    `,
  ];

  show() {
    //this.shadowRoot.getElementById("myNav").style.display = "block";
  }

  hide() {
    //this.shadowRoot.getElementById("myNav").style.display = "none";
    this.modalOpened = false;
    // Emit
    this.emit_close();
  }

  emit_close() {
    this.dispatchEvent(
      new CustomEvent("modal-closed", { bubbles: true, composed: true })
    );
  }

  render() {
    return html`<!-- Modal -->

      <div
        id="myNav"
        class="overlay"
        style=${this.modalOpened ? "display:block;" : "display:none;"}
      >
        <vaadin-vertical-layout class="overlay-content" id="container">
          <header>
            <a
              href="${this.backurl || "/"}"
              aria-label="Go back"
            >
              <vaadin-icon
                icon="vaadin:arrow-left"
                aria-hidden="true"
              ></vaadin-icon>
            </a>
            <slot name="title"></slot>

            <slot name="menu" class='push'></slot>
          </header>

          <vaadin-scroller
            scroll-direction="vertical"
            style="border-bottom: 1px solid var(--lumo-contrast-20pct); padding: var(--lumo-space-m);"
          >
            <slot name="body"></slot>
          </vaadin-scroller>

          <footer>
            <slot name="footer"></slot>
          </footer>
        </vaadin-vertical-layout>
      </div> `;
  }
}

customElements.define("modal-generico", ModalGenerico);

// <div
// class="modal fade"
// id="modal"
// tabindex="-1"
// aria-labelledby="exampleModalLabel"
// aria-hidden="true"
// >
// <div class="modal-dialog modal-fullscreen">
//   <div class="modal-content">
//     <div class="modal-header">

//       <slot name='title'></slot>
//       <slot name='menu'></slot>
//       <button
//         type="button"
//         class="btn-close"
//         data-bs-dismiss="modal"
//         aria-label="Close"
//       ></button>
//     </div>
//     <div class="modal-body">

//       <slot name='body'></slot>

//     </div>
//     <div class="modal-footer">

//       <slot name='footer'></slot>

//     </div>
//   </div>
// </div>
// </div>
