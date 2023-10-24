import { customElement, state } from "lit/decorators.js";
import { LitElement, PropertyValueMap, html } from "lit";
import { base_url, gbl_docs_starting, only_docs } from "./helpers";
import { gbl_state } from "./state";
import { get, translate, use, registerTranslateConfig } from "lit-translate";

import createAuth0Client from "@auth0/auth0-spa-js";
import uuid4 from "uuid4";
import { Lenguaje } from "./tipos/tipos-varios";
import PouchDB from "pouchdb";
// import './depositos/depositos-lista/depositos-listado';
import './depositos/deposito-transferencias/deposito-nuevo-transferencias';
import './depositos/deposito-detalles/deposito-detalles';

/**
 * La mision de este componente es login, cargar/sinc las dbs.
 * y renderizar fieldpartner una vez que todo easta listo
 */
@customElement("devel-app-loader")
export class DevelAppLoader extends LitElement {
  @state()
  ready: boolean = false;

  private auth0Client: any;
  private db: PouchDB.Database;
  private remote_db: PouchDB.Database;
  private user: any = { name: "", sub: "" };
  private logged_in: boolean;
  private online: boolean = false;

  createRenderRoot() {
    return this;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    /* Traducciones */
    registerTranslateConfig({
      loader: (lang) =>
        fetch(`/assets/i18n/${lang}.json`).then((res) => res.json()),
    });

    this.init_the_whole_thing();
  }

  render() {
    if (!this.ready && !gbl_state.online) {
      return html`Not Ready...Offline...Loading Local DBs`;
    }
    if (!this.ready) {
      return html`Not Ready...Loading DBs`;
    }

    // Elemento a testear
    return html`<deposito-detalles .location=${{params : {uuid:'8eb90c81-bb62-4d2f-b090-bdd1955be664'}}}/>`;
    // return html`<deposito-nuevo-transferencias .location=${{params : {uuid:''}}}/>`;
  }

  async init_the_whole_thing() {
    // Check si estoy on/offline
    gbl_state.online = window.navigator.onLine;

    // Handlers para registrar on/offline
    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);

    let sitio = window.location.hostname;

    if (sitio === "agrotools.netlify.app") {
      // 'Production' - Normal flow

      await this.buildAuth0Client();
      console.log("Normal Flow - AUTH Flow");
      await this.handleRedirectCallback();
    } else if (sitio === "dev--agrotools.netlify.app") {
      // Development - Especial flow
      console.log("Especial Development Flow - Demo User");
      this.user.sub = "demo-userdb";
      // Logged in
      this.logged_in = true;
      // Default Databases
      this.crear_dbs(this.user);
    } else {
      console.log("Especial Development Flow - Randy User");
      // Logged in
      this.logged_in = true;
      this.user.name = "randy";
      // Default Databases
      this.user.sub = "randy-userdb";
      this.crear_dbs(this.user);
    }

    console.log("Init the whole thing");
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
    let isAuthenticated = await this.auth0Client.isAuthenticated();

    this.logged_in = isAuthenticated;

    if (isAuthenticated) {
      /* Cargar el ususario y las bases apropiadas*/
      console.log("User is Authenticated");
      this.user = await this.auth0Client.getUser();
      this.crear_dbs(this.user);
    }

    if (!isAuthenticated) {
      console.log("User is NOT Authenticated");
      const query = window.location.search;
      if (query.includes("code=") && query.includes("state=")) {
        // Aca entro si es un redirect desde Auth0
        await this.auth0Client.handleRedirectCallback();
        // Checkeo de nuevo
        let isAuthenticated = await this.auth0Client.isAuthenticated();
        this.logged_in = isAuthenticated;

        if (isAuthenticated) {
          /* Cargar el ususario y las bases apropiadas*/
          console.log("User is NOW Authenticated");
          this.user = await this.auth0Client.getUser();
          this.crear_dbs(this.user);
        }
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

  // #region Bases de Datos
  /**
   * Set gbl user_db
   * Set gbl db
   * Set gbl user
   * Set campana
   * @param user
   * @returns
   */
  async crear_dbs(user) {
    console.count("Crear DBS");

    let username = user.name.replaceAll(" ", "_").toLowerCase();

    // Nombres validos solo en minusculas
    this.db = new PouchDB("campos_" + username + "v6");

    gbl_state.db = this.db;
    gbl_state.user_db = new PouchDB(user.sub);
    gbl_state.user = this.user;

    this.load_local_fast()
  }

  sincronizar_cuando_online() {
    var opts = { live: true, retry: true };
    // then two-way, continuous, retriable sync
    this.db
      .sync(this.remote_db, opts)
      .on("change", function (change) {
        // yo, something changed!
        console.info("Change...Sync");
      })
      .on("error", (e) => {
        console.error("SyncError", e);
      });

    // /* Redraw on cambios en campos_db */
    this.db
      .changes({
        since: "now",
        live: true,
      })
      .on("change", () => {
        //this.load_campos_y_settings();
        console.log("CHANGES!!");
      });

    // Cargar el Idioma y darle Ready
    this.cargar_idioma()
      .then(this.set_idioma)
      .then(this.cargar_campana_seleccionada)
      .then((r) => {
        this.ready = true;
        console.log("Ready...Estado Inicial", gbl_state, r);
      });
  }

  load_local_fast() {
    // Cargar el Idioma
    this.cargar_idioma()
      .then(this.set_idioma)
      .then(this.cargar_campana_seleccionada)
      .then((r) => {
        this.ready = true;
        console.log("Ready...Estado Inicial", gbl_state, r);
      });
  }

  replicar_y_sincronizar() {
    // https://pouchdb.com/api.html#sync
    // do one way, one-off sync from the server until completion
    var opts = { live: true, retry: true };

    this.db.replicate
      .from(this.remote_db)
      .on("complete", (info) => {
        console.log("Replication Completed");

        // Cargar el Idioma
        this.cargar_idioma()
          .then(this.set_idioma)
          .then(this.cargar_campana_seleccionada)
          .then((r) => {
            this.ready = true;
            console.log("Ready...Estado Inicial", gbl_state, r);
          });

        // then two-way, continuous, retriable sync
        this.db.sync(this.remote_db, opts).on("error", (e) => {
          console.error("SyncError", e);
        });
      })
      .on("error", (e) => {
        // Puede llegar aca si la app se abre offline
        console.error(e);
        if (gbl_state.online) {
          //Recargo si estoy online
          console.log("Restarting......");
          window.location.reload();
        }
      });
  }

  async cargar_campana_seleccionada(r) {
    return gbl_state.user_db
      .get("campana_seleccionada")
      .then((campana_selec_doc) => {
        gbl_state.campana_seleccionada =
          campana_selec_doc.seleccionada as Campana;
        console.log("Campaña seleccionada", gbl_state.campana_seleccionada);
      })
      .catch(() => {
        //Missing o error
        gbl_state.campana_seleccionada = {
          nombre: get("sin_temporada"),
          inicio: "2000-01-01",
          fin: "2100-12-31",
        };
        console.log(
          "Error campaña seleccionada",
          gbl_state.campana_seleccionada
        );
      });
  }

  async cargar_idioma() {
    return gbl_state.user_db
      .allDocs({
        startkey: "user_language",
        endkey: "user_language",
        include_docs: true,
      })
      .then((result) => {
        if (result.rows.length > 0) {
          // Existe
          let lang_doc: Lenguaje = result.rows[0].doc as Lenguaje;
          gbl_state.lenguaje_seleccionado = lang_doc;
          console.log("Idioma seleccionado", lang_doc);
          return lang_doc;
        } else {
          // No existe - Use 'es'
          console.log("Idioma seleccionado por defecto", "es");
          gbl_state.lenguaje_seleccionado = { lang: "es" };

          return { lang: "es" };
        }
      });
  }

  async set_idioma(l) {
    await use(l.lang);
    return "set";
  }
  /**** FIN Bases de Datos */
  // #endregion
}

var wentOffline, wentOnline;

function handleConnectionChange(event) {
  if (event.type == "offline") {
    console.log("You lost connection.");
    wentOffline = new Date(event.timeStamp);
    gbl_state.online = false;
  }
  if (event.type == "online") {
    console.log("You are now back online.");
    wentOnline = new Date(event.timeStamp);
    gbl_state.online = true;
    console.log(
      "You were offline for " + (wentOnline - wentOffline) / 1000 + "seconds."
    );
  }
}
