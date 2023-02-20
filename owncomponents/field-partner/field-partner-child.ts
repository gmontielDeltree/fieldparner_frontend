import { routes } from "./../routes";
import "../mapa-principal/mapa-principal";
import { LitElement, html, PropertyValueMap} from "lit";
import { property, state } from "lit/decorators.js";
import { Router } from "@vaadin/router";
import("../contratistas/contratista-crud");
import("../contratistas/contratistas-lista");
import("../sensores/sensores-offcanvas");
import("../nueva-geometria/nueva-geometria");
import("../nuevo-campo/nuevo-campo.js");
import("../notas-offcanvas/nota-target");
import("../insumos/insumos-lista");
import("../lista-centrales-cercanas/lista-centrales-cercanas");
import("../sensores/lista-de-sensores");
import "../navbar-element/new-app-layout";
import("../invite/invite");
import("../lote-offcanvas/repetir-aplicacion/repetir-aplicacion");
import("../sensores/devices-route");

import centroid from "@turf/centroid";
import { Map } from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import uuid4 from "uuid4";
import { Actividad } from "../depositos/depositos-types";
import { DailyTelemetryCard } from "../sensores/sensores-types";
import { Devices } from "../sensores/sensores";

import gbl_state from "../state.js";


export class FieldPartnerChild extends LitElement {
  // NO estamos usando el shadow dom (createRenderRoot=>this)
  //static override styles = [unsafeCSS(bootstrap)];

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

  @property({ hasChanged: (v, ov) => false })
  settings: any;

  private initialized: boolean = false;

  constructor() {
    super();

    window.addEventListener("DOMContentLoaded", () => {
      const parsedUrl = new URL(window.location as unknown as string);
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

    this.addEventListener("lote-seleccionado", (e: CustomEvent) => {
      document.getElementById("nota-share-target").seleccion(e.detail);
    });

    /* Izar map y draw a este componente para que los otros puedan usarlo */
    this.addEventListener("map-loaded", (e: CustomEvent) => {
      this.map = e.detail.map;

      gbl_state.map = e.detail.map;
      this.draw = e.detail.draw;
      gbl_state.draw = e.detail.draw;

      let devices = new Devices();
      devices.add_markers_to_map(this.map);

      //devices.get_timeseries_by_name('1111111111111111','radiacion',0,10000000000)
    });

    /* Click en ver lista de contratistas */
    this.addEventListener("ver-contratistas-click", (e) => {
      document.getElementById("contratistas-lista").show();
    });

    /* Click en ver lista de insumos */
    this.addEventListener("ver-insumos-click", (e) => {
      document.getElementById("insumos-lista").show();
    });

    this.addEventListener("save-settings", (e) => {
      this.db.put(this.settings);
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
    if (!this.initialized) {
      this.init_the_whole_thing();
    }
    console.log("FieldPartner-WillUpdate", _changedProperties);
  }

  async init_the_whole_thing() {
    let sitio = window.location.hostname;
    console.log("Init the whole thing");
    this.load_campos_y_settings();
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

    //settings_doc.user_cultivos = cultivos_default;

    this.db.put(settings_doc).then(() => console.log("Settings Grabadas"));

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
    gbl_state.router.setRoutes(routes);
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

      <contratista-crud id="contratista-crud" .db=${this.db}></contratista-crud>

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

      <div id="container-multiproposito"></div>
    `;
  }
}

customElements.define("field-partner-child", FieldPartnerChild);
