import { LitElement, html } from "lit-element";

export class NdviOffcanvas extends LitElement {
  static properties = {};

  constructor() {
    super();
  }

  render() {
    return html`
      <div
        class="offcanvas offcanvas-bottom h-50"
        tabindex="-1"
        id="offcanvas-lote-ndvi"
        aria-labelledby="offcanvas-campo-header"
        data-bs-backdrop="false"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">NDVI</h5>
          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body small col">
          <div class="row no-wrap" id="lote-ndvi"></div>
        </div>
      </div>
    `;
  }
}

customElements.define("ndvi-offcanvas", NdviOffcanvas);
