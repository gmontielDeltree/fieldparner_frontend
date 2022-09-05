import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import PouchDB from "pouchdb";
import { base_url, normalizar_username } from "../helpers";
import createAuth0Client from "@auth0/auth0-spa-js";
import "../loading-modal/loading-modal.js";
import "../color-cultivo/color-cultivo";
import cultivos_default from "./cultivos.json";
import "../notas-offcanvas/notas-offcanvas.js";
import "../ndvi-offcanvas/ndvi-offcanvas.js";
import "../variedades-loader/variedades-loader.js";
import "../depositos/deposito-upsert/deposito-upsert.js";
import "../depositos/depositos-lista/depositos-lista.ts";
import "../contratistas/contratista-crud.ts";
import "../contratistas/contratistas-lista.ts";
import "../sensores/sensores-offcanvas.ts";
import "../campo-offcanvas/campo-offcanvas.js";
import "../lote-offcanvas/lote-offcanvas.js";
import "../nueva-geometria/nueva-geometria.js";
import "../nuevo-campo/nuevo-campo.js";
import "../lista-de-campos/lista-de-campos.js";
import "../navbar-element/navbar-element.js";
import "../mapa-principal/mapa-principal.js";
import "../login-modal/login-modal.ts";
import "../notas-offcanvas/nota-target.ts";
import "../insumos/insumos-lista.ts";
import "../lista-centrales-cercanas/lista-centrales-cercanas.ts"
import "../sensores/lista-de-sensores.ts"

import centroid from "@turf/centroid";
import { Map } from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import uuid4 from "uuid4";
import { get_empty_insumo, Insumo } from "../insumos/insumos-types";
import { Actividad } from "../depositos/depositos-types";
import { DailyTelemetryCard } from "../sensores/sensores-types";
import { format, parse } from "date-fns";

var wentOffline, wentOnline;

function handleConnectionChange(event) {
  if (event.type == "offline") {
    console.log("You lost connection.");
    wentOffline = new Date(event.timeStamp);
  }
  if (event.type == "online") {
    console.log("You are now back online.");
    wentOnline = new Date(event.timeStamp);
    console.log(
      "You were offline for " + (wentOnline - wentOffline) / 1000 + "seconds."
    );
  }
}

export class FieldPartner extends LitElement {
  @property()
  map: Map;

  @property()
  draw: MapboxDraw;

  @property()
  campos: any;

  @property()
  campos_db: PouchDB.Database;

  @property()
  shared_db_remote: PouchDB.Database;
  @property()
  remote_campos_db: PouchDB.Database;
  @property()
  changes_db: PouchDB.Database;
  @property()
  remote_changes_db: PouchDB.Database;
  @property()
  user: any;

  @property()
  auth0Client: any;
  @property()
  logged_in: boolean;
  @property()
  loading: boolean;
  @property()
  settings: any;

  constructor() {
    super();

    /* Sensible Defaults */
    this.logged_in = false;
    this.user = {};
    this.user.name = "demo";
    this.loading = true;

    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);

    window.addEventListener("DOMContentLoaded", () => {
      const parsedUrl = new URL(window.location);
      // searchParams.get() will properly handle decoding the values.
      console.log("Title shared: " + parsedUrl.searchParams.get("title"));
      console.log("Text shared: " + parsedUrl.searchParams.get("text"));
      console.log("URL shared: " + parsedUrl.searchParams.get("url"));
    });

    /* Clicks en varios botones */
    this.addEventListener("ver-campo-detalles", (e: any) => {
      this.campos_db.get(e.detail.campo_id).then((campo_doc) => {
        document.getElementById("campo-oc").campo_doc = campo_doc;
        document.getElementById("campo-oc").show();
      });
    });

    this.addEventListener("ver-lote-detalles", (e) => {
      document.getElementById("campo-oc").hide();
      document.getElementById("lote-oc").lote_nombre = e.detail.nombre;
      document.getElementById("lote-oc").campo_id = e.detail.campo_parent_id;
      document.getElementById("lote-oc").show();
    });

    this.addEventListener("nuevo-campo-click", (e) => {
      document.getElementById("nuevo-campo-oc").show = true;
    });

    this.addEventListener("ver-ndvi-click", (e) => {
      document.getElementById("ndvi-oc").lote_doc = e.detail.lote;
      document.getElementById("ndvi-oc").show();
    });

    this.addEventListener("nuevo-deposito-click", () => {
      document.getElementById("deposito-upsert").show();
    });

    this.addEventListener("lote-seleccionado", (e) => {
      document.getElementById("nota-share-target").seleccion(e.detail);
    });

    /* Izar map y draw a este componente para que los otros puedan usarlo */
    this.addEventListener("map-loaded", (e) => {
      this.map = e.detail.map;
      this.draw = e.detail.draw;
      // Cuando se carga el mapa considero que terminó la carga
      this.loading = false;
    });

    /* Click en ver lista de campos */
    this.addEventListener("ver-lista-campos", (e) => {
      document.getElementById("lista-de-campos").show();
    });

    /* Click en ver lista de depositios */
    this.addEventListener("ver-depositos-click", (e) => {
      document.getElementById("depositos-lista").show();
    });

    /* Click en ver lista de contratistas */
    this.addEventListener("ver-contratistas-click", (e) => {
      document.getElementById("contratistas-lista").show();
    });

    /* Click en ver lista de insumos */
    this.addEventListener("ver-insumos-click", (e) => {
      document.getElementById("insumos-lista").show();
    });

    /* Click en ver lista de campos */
    this.addEventListener("ver-colores-cultivos", (e) => {
      document.getElementById("colores-cultivos").show();
    });

    this.addEventListener("save-settings", (e) => {
      this.campos_db.put(this.settings);
    });

    // Login
    this.addEventListener("login-click", () => {
      this.loginet();
    });

    this.addEventListener("logout-click", () => {
      this.logout();
    });

    this.addEventListener("nuevo-contratista-click", () => {
      document.getElementById("contratista-crud").nuevo();
    });

    this.addEventListener('ver-lista-de-sensores', (e)=>{
      const el = document.createElement('lista-de-sensores')
      document.getElementById('container-multiproposito').appendChild(el)
      el.map = this.map;
      el.show()
    })

    this.addEventListener('ver-centrales-cercanas', (e : CustomEvent)=>{
      let item = (e.detail as Actividad)
      let lote_uuid = (item.lote_uuid)
      let lote_geojson = undefined
      this.campos?.rows.map(({doc})=>{
        let lotes = doc.lotes as any[];
        let lote_candidato= lotes.find((lote) => lote.id === lote_uuid)
        if(lote_candidato){
          lote_geojson = lote_candidato
        }
      })

      console.log("dfsdfsdfsdfs", lote_geojson);


      const el = document.createElement('centrales-cercanas-lista')
      document.getElementById('container-multiproposito').appendChild(el)
      //"fecha_ejecucion_tentativa": "2022-08-27",
      el.fecha = item.detalles.fecha_ejecucion_tentativa
      el.posicion = lote_geojson ? centroid(lote_geojson).geometry.coordinates : [] //lon lat
      el.show();
    })

    this.addEventListener('ver-telemetria-del-dia', (e : CustomEvent)=>{
      let daily_card = (e.detail as DailyTelemetryCard)
      document.getElementById('sensores-oc').show(daily_card)
    })


    // Borrar un Campo
    this.addEventListener("borrar-campo", (e) => {
      this.campos_db.remove(e.detail.campo_doc).then(() => {
        alert("Campo borrado");
        this.load_campos_y_settings();
      });
    });


    // Share Campo
    this.addEventListener("share-campo", (e: any) => {
      console.log("share campo", e.detail);

      let nuevo_shared_campo = { ...e.detail.campo_doc };
      nuevo_shared_campo.shared = true;
      nuevo_shared_campo.share_with = [...e.detail.share_with];
      // Me agrego a mi mismo para compartir

      nuevo_shared_campo.share_with.push(normalizar_username(this.user.name));
      //
      nuevo_shared_campo.owner = this.user;
      // Lo grabo en campos_db
      this.campos_db
        .put(nuevo_shared_campo)
        .then(() => alert("Campo compartido"));

      // Lo upserto en shared_db
      // this.shared_db_remote.get(nuevo_shared_campo._id).then(old_doc => {
      //   nuevo_shared_campo._rev = old_doc._rev
      //   this.shared_db_remote.put(nuevo_shared_campo)
      // }).catch((e)=>{
      //   if(e.reason === 'missing'){
      //     // debe tener _rev si es nuevo
      //     //delete nuevo_shared_campo._rev
      //     //this.shared_db_remote.put(nuevo_shared_campo).catch((e)=>{
      //     //console.log("Error al crear nuevo shared_campo",e)
      //     // })
      //   }
      // });
    });

    this.addEventListener("lote-detalles-hide", (e) => {
      console.log("HIDE LOTE DETALLES");
      document.getElementById("campo-oc").show();
    });

    this.init_the_whole_thing();
  }

  createRenderRoot() {
    return this;
  }

  delete_insumos = async () => {};

  inicializar_insumos = async () => {
    try {
      let settings = await this.campos_db.get("settings");

      if (!settings.insumos_inicializados) {
        console.log("No hay insumos...Fetching");
        let data = await fetch("/products.json").then((response) =>
          response.json()
        );
        let products = data.products;
        let insumos = products.map((p: any) => {
          let i: Insumo = get_empty_insumo();
          i.marca_comercial = p.commercial_brand;
          i.principio_activo = p.supply?.active_substance || "";
          i.tipo = p.type?.name || "";
          i.subtipo = p.subtype?.name || "";
          i.unidad = p.unit.name || "";
          return i;
        });

        // this.campos_db.bulkDocs(insumos).then((d)=>{
        //   settings.insumos_inicializados=true;
        //   this.campos_db.put(settings)
        //   this.settings = settings;
        // });

        console.log("INSUMOS", insumos);
      } else {
        console.log("Los Insumos ya fueron Inicializados");
      }
    } catch (e) {
      console.error("No settings", e);
    }
  };

  async init_the_whole_thing() {
    let sitio = window.location.hostname;

    if (sitio === "agrotools.netlify.app") {
      // 'Production' - Normal flow

      await this.buildAuth0Client();
      console.log("Normal Flow - AUTH Flow");
      await this.handleRedirectCallback();
    } else if (sitio === "dev--agrotools.netlify.app") {
      // Development - Especial flow
      console.log("Especial Development Flow - Demo User");
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
  async crear_dbs(user) {
    let username = user.name.replaceAll(" ", "_").toLowerCase();

    // Nombres validos solo en minusculas
    this.campos_db = new PouchDB("campos_" + username + "v3");

    try {
      let campos_db_uri = base_url + "campos_" + username;
      console.log("CrearDBS - campos_db_uri", campos_db_uri);
      this.remote_campos_db = new PouchDB(campos_db_uri);

      let result_info_local = await this.campos_db.info();
      let local_is_empty = result_info_local.doc_count === 0 ? true : false;

      let result_info_remote = await this.remote_campos_db.info();
      let remote_is_empty = result_info_remote.doc_count === 0 ? true : false;

      console.log("Local Exists?", !local_is_empty);
      console.log("Remote Exists?", !remote_is_empty);

      /* Caso 1
      0-0 Nuevo Local - Nuevo Remoto
      */

      /* Inicializar lo Necesario */
      if (remote_is_empty && local_is_empty) {
        await this.init_settings();
        this.replicar_y_sincronizar();
        return;
      }

      /* Caso 2
      0-1 Nuevo Local - Remoto Existe
      */
      if (!remote_is_empty && local_is_empty) {
        this.cargar_desde_remoto();
        this.replicar_y_sincronizar();
        return;
      }

      /* Caso 3
      1-0 Local Existe - Nuevo Remoto
      */
      if (remote_is_empty && !local_is_empty) {
        this.replicar_y_sincronizar();
        this.load_campos_y_settings();
        return;
      }

      /* Caso 4
      1-1 Local Existe - Remoto Existe
      */
      if (!remote_is_empty && !local_is_empty) {
        this.replicar_y_sincronizar();
        this.load_campos_y_settings();
        return;
      }
    } catch (e) {
      console.log("CrearDBs failed!!! Offline?");
      // Cargar Local
      this.load_campos_y_settings();
      this.sincronizar_cuando_online();
    }

    // this.load_campos_y_settings(); // Carga para acelerar y no esperar

    // Caso 1-1

    // this.campos_db
    //   .sync(this.remote_campos_db, {
    //     live: true,
    //     retry: true,
    //   })
    //   .on("change", function (change) {
    //     // yo, something changed!
    //   })
    //   .on("paused", function (info) {
    //     // replication was paused, usually because of a lost connection
    //   })
    //   .on("active", function (info) {
    //     // replication was resumed
    //   })
    //   .on("error", function (err) {
    //     // totally unhandled error (shouldn't happen)
    //   });

    /** Init Settings */
    // this.campos_db
    //   .get("settings")
    //   .then((doc) => {
    //     console.info("Settings Loaded", doc);
    //     this.settings = doc;
    //   })
    //   .catch((e) => {
    //     console.log("Settings error", e);
    //     if (e.reason === "missing") {
    //       console.log("No existe 'Settings'");
    //       this.init_settings();
    //     }
    //   });

    /** Replicacion hacia arriba cuando se comparte un campo */
    // this.shared_db_remote = new PouchDb(base_url + "shared_campos");
    // this.campos_db
    //   .replicate.to(this.shared_db_remote, {
    //     live: true,
    //     retry: true,
    //     filter: "share/by_sharing_status",
    //   })
    // .on("change", function (result) {
    //   if (change.deleted) {
    //     // remove
    //   } else {
    //     // upsert
    //   }
    // });

    /** Replicacion bi */
    // this.campos_db
    //   .sync(this.shared_db_remote, {
    //     live: true,
    //     retry: true,
    //     filter: "share/by_share_with_list",
    //     query_params: { my_self: normalizar_username(this.user.name) },
    //   })
    //   .on("change", function (result) {
    //     if (change.deleted) {
    //       // remove
    //     } else {
    //       // upsert
    //       console.log("Alguien me compartio un Campo");
    //     }
    //   });


  }


  init_ndvi_dbs(){
        // Changes Lotes para generar NDVI
    this.remote_changes_db = new PouchDB("https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/campos_changes")
    this.changes_db = new PouchDB("campos_changes")

    // console.log("Changes Sync Set");
    this.changes_db.replicate.to(this.remote_changes_db, {
        live: true
    }).on('complete', function () {
        // yay, we're done!
        console.log("Changes Uploaded")
    }).on('error', function (err) {
        // boo, something went wrong!
        console.log("Error Changes")
    });
  }

  cargar_desde_remoto() {
    // Get Campos
    this.remote_campos_db
      .allDocs({
        include_docs: true,
        startkey: "campos_",
        endkey: "campos_\ufff0",
      })
      .then((result) => (this.campos = result));

    // Get Settings
    this.remote_campos_db
      .get("settings")
      .then((settings_doc) => {
        this.settings = settings_doc;
      })
      .catch((e) => {
        if (e?.reason === "missing") {
        }
        console.error("Load Settings desde Remote", e);
      });
  }

  sincronizar_cuando_online() {
    var opts = { live: true, retry: true };
    // then two-way, continuous, retriable sync
    this.campos_db
      .sync(this.remote_campos_db, opts)
      .on("change", function (change) {
        // yo, something changed!
        console.info("Change...Sync");
      })
      .on("error", (e) => {
        console.error("SyncError", e);
      });

    // /* Redraw on cambios en campos_db */
    this.campos_db
      .changes({
        since: "now",
        live: true,
      })
      .on("change", () => {
        this.load_campos_y_settings();
        console.log("CHANGES!!");
      });

    this.init_ndvi_dbs()
  }

  replicar_y_sincronizar() {
    // https://pouchdb.com/api.html#sync
    // do one way, one-off sync from the server until completion
    var opts = { live: true, retry: true };

    this.campos_db.replicate
      .from(this.remote_campos_db)
      .on("complete", (info) => {
        console.log("Replication Completed");

        this.load_campos_y_settings();

        // then two-way, continuous, retriable sync
        this.campos_db.sync(this.remote_campos_db, opts).on("error", (e) => {
          console.error("SyncError", e);
        });

        // /* Redraw on cambios en campos_db */
        this.campos_db
          .changes({
            since: "now",
            live: true,
          })
          .on("change", () => {
            this.load_campos_y_settings();
            console.log("CHANGES!!");
          });

          this.init_ndvi_dbs();
      })
      .on("error", (e) => {
        // Puede llegar aca si la app se abre offline
        console.error(e);
      });
  }

  /** Crea el objeto settings y lo graba en la db
   * Crea settings y contratistas
   */
  async init_settings() {
    let settings_doc = {
      _id: "settings",
      tipo: "settings",
      uuid: uuid4(),
      insumos_inicializados: false,
      user_cultivos: {},
    };

    settings_doc.user_cultivos = cultivos_default;

    try {
      console.log("No hay insumos...Fetching");
      let data = await fetch("/products.json").then((response) =>
        response.json()
      );
      let products = data.products;

      let insumos = products.map((p: any) => {
        let i: Insumo = get_empty_insumo();
        i.marca_comercial = p.commercial_brand;
        i.principio_activo = p.supply?.active_substance || "";
        i.tipo = p.type?.name || "";
        i.subtipo = p.subtype?.name || "";
        i.unidad = p.unit.name || "";
        return i;
      });

      console.log("BulkDocs Insumos");
      this.campos_db.bulkDocs(insumos).then((d) => {
        settings_doc.insumos_inicializados = true;
        // Grabar Settings DOC
        this.campos_db.put(settings_doc);
        this.settings = settings_doc;
      });

      // Creando Contratista
      let contratista_doc = { _id: "contratistas", contratistas: {} };
      this.campos_db.put(contratista_doc);

      console.log("INSUMOS", insumos);
    } catch (e) {
      console.error("Error Fetch Insumos", e);
      // Grabo de todas maneras el resto de settings
      this.campos_db.put(settings_doc);
      console.log("Settings Grabadas");
      this.settings = settings_doc;
    }
  }

  /** Recarga los campos y settings.
   * Fuerza un redibujado de los cambios
   */
  load_campos_y_settings() {
    // Get Campos
    this.campos_db
      .allDocs({
        include_docs: true,
        startkey: "campos_",
        endkey: "campos_\ufff0",
      })
      .then((result) => (this.campos = result));

    // Get Settings
    this.campos_db
      .get("settings")
      .then((settings_doc) => {
        this.settings = settings_doc;
        // agregar insump solo si existe settings
        // this.inicializar_insumos();
      })
      .catch((e) => {
        if (e?.reason === "missing") {
          // this.init_settings();
        }
        console.error("Load Settings", e);
      });

    // this.campos_db
    //   .compact()
    //   .then((result) => {
    //     // handle result
    //     console.log("Compactacion Local DB Completada");

    //     // Get Campos
    //     this.campos_db
    //       .allDocs({
    //         include_docs: true,
    //         startkey: "campos_",
    //         endkey: "campos_\ufff0",
    //       })
    //       .then((result) => (this.campos = result));

    //     // Get Settings
    //     this.campos_db
    //       .get("settings")
    //       .then((settings_doc) => {
    //         this.settings = settings_doc;
    //         this.inicializar_insumos();
    //       })
    //       .catch((e) => {
    //         if (e?.reason === "missing") {
    //           this.init_settings();
    //         }
    //         console.error("Load Settings", e);
    //       });
    //   })
    //   .catch(function (err) {
    //     console.log(err);
    //   });
  }
  /**** FIN Bases de Datos */
  // #endregion

  render() {
    return html`
      <mapa-principal
        .campos=${this.campos}
        .settings=${this.settings}
      ></mapa-principal>

      <navbar-element .map=${this.map}></navbar-element>

      <campo-offcanvas
        id="campo-oc"
        .map=${this.map}
        .draw=${this.draw}
        .campos_db=${this.campos_db}
        .local_campos_changes=${this.changes_db}
        .user=${this.user}
      ></campo-offcanvas>

      <lote-offcanvas
        id="lote-oc"
        .map=${this.map}
        .db=${this.campos_db}
        .settings=${this.settings}
      ></lote-offcanvas>

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

      <contratista-crud
        id="contratista-crud"
        .db=${this.campos_db}
      ></contratista-crud>
      <contratistas-lista
        id="contratistas-lista"
        .db=${this.campos_db}
      ></contratistas-lista>
      <color-cultivo
        id="colores-cultivos"
        .cultivos=${this.settings?.user_cultivos}
      ></color-cultivo>
      <ndvi-offcanvas id="ndvi-oc" .map=${this.map}></ndvi-offcanvas>

      <sensores-oc id='sensores-oc' .map=${this.map}></sensores-oc>

      <nota-share-target
        id="nota-share-target"
        .map=${this.map}
        .db=${this.campos_db}
      ></nota-share-target>

      <insumos-lista id="insumos-lista" .db=${this.campos_db}></insumos-lista>

      <deposito-upsert
        id="deposito-upsert"
        .db=${this.campos_db}
        .draw=${this.draw}
      ></deposito-upsert>
      <depositos-lista
        id="depositos-lista"
        .db=${this.campos_db}
      ></depositos-lista>

      <login-modal id="login-modal" .show=${!this.logged_in}></login-modal>
      
    <div id='container-multiproposito'>
    <loading-modal .show=${this.loading}></loading-modal>
    </div>
    `;
  }
}

customElements.define("field-partner", FieldPartner);
