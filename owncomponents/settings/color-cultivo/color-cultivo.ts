import { LitElement, html, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import booleanIcons from "bootstrap-icons/font/bootstrap-icons.css?inline";
import gbl_state from "../../state";
interface CultivosDoc {
  _id: string;
  nombre: string;
  color: string;
}

export class ColorCultivo extends LitElement {
  static styles = [unsafeCSS(bootstrap), unsafeCSS(booleanIcons)];



  @state()
  cultivos: CultivosDoc[] = [];

  loadCultivos() {
    let db = gbl_state.db;
    db.allDocs({
      include_docs: true,
      startkey: "cultivo:",
      endkey: "cultivo:\ufff0",
    }).then(({ rows }) => {
      this.cultivos = rows.map(({ doc }) => {
        return doc;
      });
    });
  }

  firstUpdated() {
    this.loadCultivos();
  }

  willUpdate(props) {

  }


  update_color_settings(color, doc) {
    doc.color = color;
    gbl_state.db.put(doc);

    this.sendEvent("cambio-de-color", null);
    //this.sendEvent("save-settings", null);
  }

  sendEvent = (name, details) => {
    let event = new CustomEvent(name, {
      detail: details,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  };

  nuevoCultivo(nombre: string) {
    let doc = {
      _id: "cultivo:" + encodeURIComponent(nombre.toLowerCase()),
      nombre: nombre,
      color: "#ffffff",
    };

    gbl_state.db
      .put(doc)
      .then(() => {
        this.loadCultivos();
      })
      .catch((reason) => {
        alert(reason);
      });
  }

  deleteCultivo(doc) {
    if (confirm("¿Desea Eliminar?") == true) {
      gbl_state.db.remove(doc);
      this.loadCultivos();
    }
  }

  render() {
    const nuevo_fake_item = () => {
      return html`<a
        href="#"
        class="list-group-item list-group-item-action bg-light row"
        aria-current="true"
      >
        <button
          type="button"
          @click=${() => {
            let nombre = prompt("Ingrese el nombre del Cultivo");
            if (nombre) {
              this.nuevoCultivo(nombre);
            }
          }}
          class="btn btn-primary"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        >
          Nuevo
        </button>
      </a>`;
    };


    const item = (doc: CultivosDoc) => {
      return html`<a
        class="list-group-item list-group-item-action bg-light row"
        aria-current="true"
      >
        <div class="row">
          <button
            class="btn btn-danger btn-sm col-2"
            @click=${() => this.deleteCultivo(doc)}
          >
            <i class="bi bi-trash3"></i>
          </button>

          <label for="exampleColorInput" class="form-label col-8 col-form-label"
            >${doc.nombre}</label
          >
          <input
            type="color"
            class="form-control form-control-color col-2"
            @change=${(e) => this.update_color_settings(e.target.value, doc)}
            id="exampleColorInput"
            value=${doc.color}
            title="Choose your color"
          />
        </div>
      </a>`;
    };


        
       


    return html`
     <div class="list-group">
        ${nuevo_fake_item()}
        ${this.cultivos.map((doc) => item(doc))}</div>
    `;
  }
}

customElements.define("color-cultivo", ColorCultivo);
