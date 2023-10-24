import { LitElement, html, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import gbl_state from "../../state";
import cultivos from "../../jsons/cultivos";
import { Cultivo } from "../../insumos/insumos-types";

function djb2(str) {
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

function hashStringToColor(str) {
  var hash = djb2(str);
  var r = (hash & 0xff0000) >> 16;
  var g = (hash & 0x00ff00) >> 8;
  var b = hash & 0x0000ff;
  return (
    "#" +
    ("0" + r.toString(16)).substr(-2) +
    ("0" + g.toString(16)).substr(-2) +
    ("0" + b.toString(16)).substr(-2)
  );
}

/*
  Color de cultivos en un doc.
*/
interface CultivosDoc {
  _id: string;
  _rev?: string;
  colors: CultivoColor;
}

interface CultivoColor {
  // soja : azul
  [key: string]: string;
}

export class ColorCultivo extends LitElement {
  static styles = [unsafeCSS(bootstrap) ];

  @state()
  cultivo_color_tabla: CultivoColor = {};

  private cultivos: Cultivo[] = cultivos;
  private color_doc: CultivosDoc = {_id:"cultivo_color",colors:null};

  loadCultivos() {
    let db = gbl_state.user_db;
    db.allDocs({
      include_docs: true,
      startkey: "cultivo_color",
      endkey: "cultivo_color\ufff0",
    }).then((doc) => {
      if (doc.rows.length > 0) {
        let tabla = doc.rows[0].doc as unknown as CultivosDoc;
        this.color_doc = doc.rows[0].doc as unknown as CultivosDoc;
        let colores = this.color_doc.colors;
        // Build extended table
        cultivos.forEach((cultivo) => {
          if (cultivo.key in colores) {
            // nada
          } else {
            colores[cultivo.key] = hashStringToColor(cultivo.key);
          }
        });
        this.cultivo_color_tabla = colores;
        this.requestUpdate()
      } else {
        cultivos.forEach((cultivo) => {
          this.cultivo_color_tabla[cultivo.key] = hashStringToColor(
            cultivo.key
          );
        })
        this.requestUpdate()

      }
    });
  }

  firstUpdated() {
    this.loadCultivos();
  }

  willUpdate(props) {}

  update_color_settings(color, key) {

    this.cultivo_color_tabla[key] = color;
    if(this.color_doc){
      this.color_doc.colors = this.cultivo_color_tabla
      console.log("COLOR DOC",this.color_doc)
      gbl_state.user_db.put(this.color_doc);
    }

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
   
    const item = (key, value) => {
      return html`<a
        class="list-group-item list-group-item-action bg-light row"
        aria-current="true"
      >
        <div class="row">
          <label for="exampleColorInput" class="form-label col-8 col-form-label"
            >${key}</label
          >
          <input
            type="color"
            class="form-control form-control-color col-2"
            @change=${(e) => this.update_color_settings(e.target.value, key)}
            value=${value}
            title="Choose your color"
          />
        </div>
      </a>`;
    };

    return html`
      <div class="list-group">
        ${Object.entries(this.cultivo_color_tabla).map(([key,value]) => {
          return item(key,value);
        })}
      </div>
    `;
  }
}

customElements.define("color-cultivo", ColorCultivo);
