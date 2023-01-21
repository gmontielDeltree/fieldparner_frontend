import { LitElement, html, PropertyValueMap } from "lit";
import { property, state } from "lit/decorators.js";
import { Router } from "@vaadin/router";
import PouchDB from "pouchdb";
import {
  base_url,
  normalizar_username,
  gbl_docs_starting,
  only_docs,
} from "../helpers";
import "../loading-modal/loading-modal.js";
import "../color-cultivo/color-cultivo";
import cultivos_default from "../jsons/cultivos.json";
import "../notas-offcanvas/notas-offcanvas";
import "../ndvi-offcanvas/ndvi-offcanvas.ts";
import "../variedades-loader/variedades-loader.js";
import "../depositos/deposito-upsert/deposito-upsert.js";
import "../depositos/depositos-lista/depositos-lista.ts";
import "../depositos/depositos-lista/depositos-listado";
import "../contratistas/contratista-crud.ts";
import "../contratistas/contratistas-lista.ts";
import "../sensores/sensores-offcanvas.ts";
import "../campo-offcanvas/campo-offcanvas.js";
import "../lote-offcanvas/lote-offcanvas.js";
import "../lote-offcanvas/lote-offcanvas-side.js";
import "../nueva-geometria/nueva-geometria.ts";
import "../nuevo-campo/nuevo-campo.js";
import "../lista-de-campos/lista-de-campos.js";
import "../navbar-element/navbar-element";
import "../mapa-principal/mapa-principal.js";
import "../login-modal/login-modal.ts";
import "../notas-offcanvas/nota-target.ts";
import "../insumos/insumos-lista.ts";
import "../lista-centrales-cercanas/lista-centrales-cercanas.ts";
import "../sensores/lista-de-sensores.ts";
import "../navbar-element/workspace-rigths.ts";
import "../navbar-element/new-app-layout.ts";
import "../null-component";
import "../invite/invite";
import "../lote-offcanvas/repetir-aplicacion/repetir-aplicacion.ts";
import "../lote-offcanvas/upsert-aplicacion/upsert-aplicacion";
import "../lote-offcanvas/upsert-ejecucion/upsert-ejecucion";

import "../sensores/devices-route";

import { use, get, registerTranslateConfig, translate } from "lit-translate";

import centroid from "@turf/centroid";
import { Map } from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import uuid4 from "uuid4";
import {
  download_lista_de_insumos,
  get_empty_insumo,
  Insumo,
} from "../insumos/insumos-types";
import { Actividad } from "../depositos/depositos-types";
import { DailyTelemetryCard } from "../sensores/sensores-types";
import { format, parse } from "date-fns";
import { Devices } from "../sensores/sensores";

import { StateController } from "@lit-app/state";
import gbl_state from "../state.js";

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

export class FieldPartnerChild extends LitElement {
  @property({ hasChanged: (v, ov) => false })
  map: Map;

  @property({ hasChanged: (v, ov) => false })
  draw: MapboxDraw;

  @state()
  campos: any;

  @property({ hasChanged: (v, ov) => false })
  db: PouchDB.Database;

  @property({ hasChanged: (v, ov) => false })
  remote_campos_db: PouchDB.Database;

  @property({ hasChanged: (v, ov) => false })
  user: any;

  @property({ hasChanged: (v, ov) => false })
  logged_in: boolean = false;

  @state()
  loading: boolean = true;

  @property({ hasChanged: (v, ov) => false })
  settings: any;

  private initialized : boolean = false;

  constructor() {
    super();



    window.addEventListener("DOMContentLoaded", () => {
      const parsedUrl = new URL(window.location);
      // searchParams.get() will properly handle decoding the values.
      console.log("Title shared: " + parsedUrl.searchParams.get("title"));
      console.log("Text shared: " + parsedUrl.searchParams.get("text"));
      console.log("URL shared: " + parsedUrl.searchParams.get("url"));
    });

    /* Clicks en varios botones */
    this.addEventListener("ver-campo-detalles", (e: any) => {
      let campo_doc_id = e.detail.campo_id; // el ID del doc del campo ("campo:el remanso")
      Router.go("campo/" + encodeURIComponent(campo_doc_id));
    });

    this.addEventListener("ver-lote-detalles", (e: CustomEvent) => {
      let campo_doc_id_enc = encodeURIComponent(e.detail.campo_parent_id);
      let lote_nombre = encodeURIComponent(e.detail.nombre);
      Router.go("campo/" + campo_doc_id_enc + "/lote/" + lote_nombre);
    });

    this.addEventListener("nuevo-campo-click", (e) => {
      document.getElementById("nuevo-campo-oc").show = true;
    });

    this.addEventListener("nuevo-deposito-click", () => {
      document.getElementById("deposito-upsert").show();
    });

    this.addEventListener("lote-seleccionado", (e: CustomEvent) => {
      document.getElementById("nota-share-target").seleccion(e.detail);
    });

    /* Izar map y draw a este componente para que los otros puedan usarlo */
    this.addEventListener("map-loaded", (e: CustomEvent) => {
      this.map = e.detail.map;

      gbl_state.map = e.detail.map;
      this.draw = e.detail.draw;
      gbl_state.draw = e.detail.draw;
      // Cuando se carga el mapa considero que terminó la carga
      this.loading = false;

      let devices = new Devices();
      devices.add_markers_to_map(this.map);
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
      this.db.put(this.settings);
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

    this.addEventListener("ver-lista-de-sensores", (e) => {
      const el = document.createElement("lista-de-sensores");
      document.getElementById("container-multiproposito").appendChild(el);
      el.map = this.map;
      el.show();
    });

    this.addEventListener("ver-centrales-cercanas", (e: CustomEvent) => {
      let item = e.detail as Actividad;
      let lote_uuid = item.lote_uuid;
      let lote_geojson = undefined;
      this.campos?.rows.map(({ doc }) => {
        let lotes = doc.lotes as any[];
        let lote_candidato = lotes.find((lote) => lote.id === lote_uuid);
        if (lote_candidato) {
          lote_geojson = lote_candidato;
        }
      });

      console.log("dfsdfsdfsdfs", lote_geojson);

      const el = document.createElement("centrales-cercanas-lista");
      document.getElementById("container-multiproposito").appendChild(el);
      //"fecha_ejecucion_tentativa": "2022-08-27",
      el.fecha = item.detalles.fecha_ejecucion_tentativa;
      el.posicion = lote_geojson
        ? centroid(lote_geojson).geometry.coordinates
        : []; //lon lat
      el.show();
    });

    this.addEventListener("ver-telemetria-del-dia", (e: CustomEvent) => {
      let daily_card = e.detail as DailyTelemetryCard;

      let fecha = daily_card._id.split(":")[2];
      Router.go(
        gbl_state.router.urlForName("device-route-handler", {
          uuid: daily_card.device_id,
          date: fecha,
        })
      );
    });

    // Borrar un Campo
    this.addEventListener("borrar-campo", (e: CustomEvent) => {
      this.db.remove(e.detail.campo_doc).then(() => {
        alert("Campo borrado");
        this.load_campos_y_settings();
      });
    });

    
  }

  createRenderRoot() {
    return this;
  }

  protected willUpdate(
    _changedProperties:
      | PropertyValueMap<any>
      | globalThis.Map<PropertyKey, unknown>
  ): void {
    if(!this.initialized){
      this.init_the_whole_thing()
    }
    console.log("FieldPartner-WillUpdate", _changedProperties);
  }

  async init_the_whole_thing() {
    let sitio = window.location.hostname;
    console.log("Init the whole thing");
    this.load_campos_y_settings();
  }


  sincronizar_cuando_online() {
    var opts = { live: true, retry: true };
    // then two-way, continuous, retriable sync
    this.db
      .sync(this.remote_campos_db, opts)
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
        this.load_campos_y_settings();
        console.log("CHANGES!!");
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

    this.db
      .put(settings_doc)
      .then(() => console.log("Settings Grabadas"));

    this.settings = settings_doc;
  }

  /** Recarga los campos y settings.
   * Fuerza un redibujado de los cambios
   */
  load_campos_y_settings() {
    // Get Campos
    this.db
      .allDocs({
        include_docs: true,
        startkey: "campos_",
        endkey: "campos_\ufff0",
      })
      .then((result) => {
        this.campos = result;
        gbl_state.campos = this.campos;
      });

    // Get Settings
    this.db
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
      
      this.initialized = true;
  }

  /**** FIN Bases de Datos */
  // #endregion

  firstUpdated() {

    gbl_state.router = new Router(document.getElementById("router-container"));
    gbl_state.router.setRoutes([
      { path: "/", component: "null-component" },
      { path: "/gf", redirect: "/" },
      { path: "/campos", component: "lista-de-campos" },
      { path: "/indices/:uuid", component: "ndvi-offcanvas" },
      { path: "/cultivos", component: "color-cultivo" },
      {
        path: "/campo/:uuid_campo/lote/:uuid_lote/siembra/add",
        component: "lote-offcanvas-side",
      },
      {
        path: "/campo/:uuid_campo/lote/:uuid_lote/siembra/edit",
        component: "lote-offcanvas-side",
      },
      {
        path: "/campo/:uuid_campo/lote/:uuid_lote",
        component: "lote-offcanvas-side",
      },
      {
        path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/:uuid_actividad/repetir",
        component: "repetir-aplicacion",
      },
      {
        path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/nueva/:tipo",
        component: "upsert-aplicacion",
      },
      {
        path: "/campo/:uuid_campo/lote/:uuid_lote/actividad/editar/:uuid",
        component: "upsert-aplicacion",
      },
      {
        path: "/campo/:uuid_campo/lote/:uuid_lote/ejecucion/:uuid/nueva",
        component: "upsert-ejecucion",
      },
      {
        path: "/campo/:uuid_campo/lote/:uuid_lote/ejecucion/:uuid/editar",
        component: "upsert-ejecucion",
      },
      { path: "/campo/add", component: "nuevo-campo" },
      { path: "/campo/:uuid", component: "campo-offcanvas" },
      { path: "/contratistas", component: "contratistas-lista" },
      { path: "/contratistas/add", component: "contratistas-crud" },
      { path: "/depositos", component: "depositos-listado" },
      { path: "/depositos/add", component: "depositos-upsert" },
      { path: "/insumos", component: "insumos-lista" },
      { path: "/rights/:uuid_workspace", component: "workspace-rights" },
      { path: "/invite/:base64_invitation", component: "link-invitacion" },
      {
        path: "/device/:uuid/dashboard/:date",
        component: "device-route-handler",
      },
      { path: "/ejecucion", component: "null" },
    ]);
  }

  render() {
    console.count("FieldPartner Render");

    return html`
      <app-layout-navbar-placement>
        <div id="router-container"></div>
        <mapa-principal
          .campos=${this.campos}
          .settings=${this.settings}
        ></mapa-principal>
      </app-layout-navbar-placement>

      <nuevo-campo
        id="nuevo-campo-oc"
        .map=${this.map}
        .draw=${this.draw}
        .campos_db=${this.db}
      ></nuevo-campo>

      <contratista-crud
        id="contratista-crud"
        .db=${this.db}
      ></contratista-crud>

      <contratistas-lista
        id="contratistas-lista"
        .db=${this.db}
      ></contratistas-lista>

      <nota-share-target
        id="nota-share-target"
        .map=${this.map}
        .db=${this.db}
      ></nota-share-target>

      <insumos-lista id="insumos-lista" .db=${this.db}></insumos-lista>

      <!-- <deposito-upsert
        id="deposito-upsert"
        .db=${this.db}
        .draw=${this.draw}
      ></deposito-upsert> -->
      <depositos-lista
        id="depositos-lista"
        .db=${this.db}
      ></depositos-lista>

      <!-- <login-modal id="login-modal" .show=${!this
        .logged_in}></login-modal> -->

      <div id="container-multiproposito">
        <loading-modal .show=${this.loading}></loading-modal>
      </div>

      <!-- <div id="router-container"></div> -->
    `;
  }
}

customElements.define("field-partner-child", FieldPartnerChild);
