import { LitElement, html } from "lit-element";
import PouchDb from "pouchdb";
import { base_url } from "../helpers";

export class FieldPartner extends LitElement {
  static properties = {
    map: {},
    draw: {},
    campos: {},
    campos_db: {},
    remote_campos_db: {},
    username: {},
  };

  constructor() {
    super();
    this.username = "demo";
    this.campos_db = new PouchDB("campos_" + this.username);
    let campos_db_uri = base_url + "campos_" + this.username;

    this.remote_campos_db = new PouchDB(campos_db_uri);

    this.campos_db
      .sync(this.remote_campos_db, {
        live: true,
        retry: true,
      })
      .on("change", function (change) {
        // yo, something changed!
      })
      .on("paused", function (info) {
        // replication was paused, usually because of a lost connection
      })
      .on("active", function (info) {
        // replication was resumed
      })
      .on("error", function (err) {
        // totally unhandled error (shouldn't happen)
      });

    this.addEventListener("ver-campo-detalles", (e) => {
      console.log("EVVVVVVV");

      this.campos_db.get(e.detail.campo_id).then((campo_doc) => {
        document.getElementById("campo-oc").campo_doc = campo_doc;
        document.getElementById("campo-oc").show();
      });
    });

    this.addEventListener("map-loaded", (e) => {
      this.map = e.detail.map;
      this.draw = e.detail.draw;
    });

    /* Redraw on Changes callback */
    this.campos_db
      .changes({
        since: "now",
        live: true,
      })
      .on("change", () => {
	this.campos_db
	.allDocs({ include_docs: true })
	.then((result) => (this.campos = result));
      });
  }

  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.campos_db
      .allDocs({ include_docs: true })
      .then((result) => (this.campos = result));
  }

  render() {
    return html`
      <mapa-principal .campos=${this.campos}></mapa-principal>
      <navbar-element></navbar-element>
      <campo-offcanvas
        id="campo-oc"
        .map=${this.map}
        .draw=${this.draw}
        .campos_db=${this.campos_db}
      ></campo-offcanvas>
      <slot></slot>
    `;
  }
}

customElements.define("field-partner", FieldPartner);
