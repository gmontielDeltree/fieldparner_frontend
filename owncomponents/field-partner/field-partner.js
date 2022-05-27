import { LitElement, html } from "lit-element";
import PouchDb from "pouchdb";
import { base_url } from "../helpers";
import createAuth0Client from "@auth0/auth0-spa-js";
import { TouchPitchHandler } from "mapbox-gl";

export class FieldPartner extends LitElement {
  static properties = {
    map: {},
    draw: {},
    campos: {},
    campos_db: {},
    remote_campos_db: {},
    user: {},
    auth0Client: {},
    logged_in: {},
    loading: {}
  };

  constructor() {
    super();

    /* Sensible Defaults */
    this.logged_in = false;
    this.user = {}
    this.user.name = "demo";
    this.loading = true;
   

    this.crear_dbs(this.user)

    /* Clicks en varios botones */
    this.addEventListener("ver-campo-detalles", (e) => {
      this.campos_db.get(e.detail.campo_id).then((campo_doc) => {
        document.getElementById("campo-oc").campo_doc = campo_doc;
        document.getElementById("campo-oc").show();
      });
    });

    this.addEventListener("ver-lote-detalles", (e) => {
      document.getElementById("lote-oc").lote_nombre = e.detail.nombre;
      document.getElementById("lote-oc").campo_id = e.detail.campo_parent_id;
      document.getElementById("lote-oc").show();
    });

    this.addEventListener("nuevo-campo-click", (e) => {
      document.getElementById("nuevo-campo-oc").show = true;
    });

    this.addEventListener("nueva-nota-click", (e) => {});

    /* Izar map y draw a este componente para que los otros puedan usarlo */
    this.addEventListener("map-loaded", (e) => {
      this.map = e.detail.map;
      this.draw = e.detail.draw;
    });

    /* Click en ver lista de campos */
    this.addEventListener("ver-lista-campos", (e) => {
      document.getElementById("lista-de-campos").show();
    });

    // Login
    this.addEventListener("login-click", () => {
      this.loginet();
    });
  }

  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    let sitio = window.location.hostname;

    if (sitio === "agrotools.netlify.app") {
      // 'Production' - Normal flow
    } else {
      // Development - Especial flow
      // Logged in
      
      // Default Databases
    }

    await this.buildAuth0Client();
    await this.handleRedirectCallback();
    // Campos 
    this.campos_db
      .allDocs({ include_docs: true })
      .then((result) => (this.campos = result));
  }

  /* AUTH0 Stuff */
  async buildAuth0Client() {
    this.auth0Client = await createAuth0Client({
      domain: "dev-xa9-5ghc.us.auth0.com",
      client_id: "gQx1JtypOHAcCgGBr0ukd3YDQM5k8FtW",
    });
  }

  /** En esta funcion ocurre la authenticacion y creacion de DBs */
  async handleRedirectCallback() {
    const isAuthenticated = await this.auth0Client.isAuthenticated();

    this.logged_in = isAuthenticated;

    if (isAuthenticated) {
      /* Cargar el ususario y las bases apropiadas*/
      this.user = await this.auth0Client.getUser();
      this.crear_dbs(this.user)
    }

    if (!isAuthenticated) {
      const query = window.location.search;
      if (query.includes("code=") && query.includes("state=")) {
        await this.auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
      }
    }
  }

  async loginet() {
    const isAuthenticated = await this.auth0Client.isAuthenticated();

    if (!isAuthenticated) {
      await this.auth0Client.loginWithRedirect({
        redirect_uri: window.location.origin,
      });
    } else {
      // await this.logout();
    }
  }

  async logout() {
    this.auth0Client.logout({
      returnTo: window.location.origin,
    });
  }
  /**** FIN AUTH0 Stuff */

  /* Bases de Datos */
  crear_dbs(user) {
    let username = user.name.replaceAll(' ', '_').toLowerCase();

    // Nombres validos solo en minusculas
    this.campos_db = new PouchDB("campos_" + username);
    let campos_db_uri = base_url + "campos_" + username;
    console.log('campos_db_uri', campos_db_uri)
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

    /* Redraw on cambios en campos_db */
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

  /**** FIN Bases de Datos */

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

      <lote-offcanvas id="lote-oc" ._db=${this.campos_db}></lote-offcanvas>
      <nuevo-campo
        id="nuevo-campo-oc"
        .map=${this.map}
        .draw=${this.draw}
        .campos_db=${this.campos_db}
      ></nuevo-campo>

      <lista-de-campos
        id="lista-de-campos"
        .map=${this.map}
        .campos=${this.campos}
      ></lista-de-campos>
      <login-modal id="login-modal" .show=${!this.logged_in}></login-modal>
    `;
  }
}

customElements.define("field-partner", FieldPartner);
