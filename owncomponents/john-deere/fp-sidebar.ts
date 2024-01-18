import { LitElement, css, html } from "lit";

export class FPSidebar extends LitElement {
  static override styles = css`

.sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 25%;
        background-color: #f5f5f5;
        border-radius: 10px;
        z-index: 1;
        display: flex;
        flex-direction: column;
      }

      .title {
        font-size: 24px;
        font-weight: bold;
        /* margin-bottom: 16px; */
        padding: 16px;
      }

      .content {
        /* margin-top: 16px; */
        padding: 16px;
      }

      .close-button {
        position: absolute;
        top: 8px;
        right: 8px;
        background-color: transparent;
        border: none;
        cursor: pointer;
      }
  `;

hideSidebar() {
  this.style.display = 'none';
}
  render() {
    return html`
     <div class="sidebar">
        <button class="close-button" @click="${this.hideSidebar}">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M18.3 5.71a1 1 0 0 1 1.41 1.41L6.41 19.72a1 1 0 0 1-1.41-1.41L18.3 5.71z"/>
            <path fill="none" d="M0 0h24v24H0V0z"/>
          </svg>
        </button>
        <div class="title">
          <slot name="title"></slot>
        </div>
        <div class="content">
          <slot name="content"></slot>
        </div>
      </div>

    `;
  }
}

customElements.define("fp-sidebar", FPSidebar);
