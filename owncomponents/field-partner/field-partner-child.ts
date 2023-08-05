import { routes } from "./../routes";
import { LitElement, html, PropertyValueMap } from "lit";
import { property, state } from "lit/decorators.js";
import { Router } from "@vaadin/router";
import centroid from "@turf/centroid";
import { Map } from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import uuid4 from "uuid4";
import { Actividad } from "../depositos/depositos-types";
import { DailyTelemetryCard } from "../sensores/sensores-types";
import { Devices } from "../sensores/sensores";

import gbl_state from "../state.js";

import "../navbar-element/new-app-layout";
import "../mapa-principal/mapa-principal";
import "../news-bar/news-bar";
import("../contratistas/contratista-crud");
import("../contratistas/contratistas-lista");
import("../sensores/sensores-offcanvas");
import "../nueva-geometria/nueva-geometria";
import "../nuevo-campo/nuevo-campo";
import("../notas-offcanvas/nota-target");
import("../lista-centrales-cercanas/lista-centrales-cercanas");
import("../sensores/lista-de-sensores");
import("../invite/invite");
import("../lote-offcanvas/repetir-aplicacion/repetir-aplicacion");
import("../sensores/devices-route");


export class FieldPartnerChild extends LitElement {
  // NO estamos usando el shadow dom (createRenderRoot=>this)
  //static override styles = [unsafeCSS(bootstrap)];

  @property()
  map: Map;

  draw: MapboxDraw;

  @state()
  campos: any;

  remote_campos_db: PouchDB.Database;
  user: any;
  logged_in: boolean = false;
  settings: any;

  private initialized: boolean = false;

  constructor() {
    super();

    window.addEventListener('vaadin-router-location-changed', e => this.onLocationChanged(e));

    // window.addEventListener("DOMContentLoaded", () => {
    //   const parsedUrl = new URL(window.location as unknown as string);
    //   // searchParams.get() will properly handle decoding the values.
    //   console.log("Title shared: " + parsedUrl.searchParams.get("title"));
    //   console.log("Text shared: " + parsedUrl.searchParams.get("text"));
    //   console.log("URL shared: " + parsedUrl.searchParams.get("url"));
    // });

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
      console.log("MAP LOADED EVT HANDLER");

      gbl_state.map = e.detail.map;
      this.draw = e.detail.draw;
      gbl_state.draw = e.detail.draw;

      let devices = new Devices();
      devices.add_markers_to_map(this.map);

      //devices.get_timeseries_by_name('1111111111111111','radiacion',0,10000000000)
    });


    this.addEventListener("save-settings", (e) => {
      this.db.put(this.settings);
    });

    this.addEventListener("logout-click", () => {
      this.logout();
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

  onLocationChanged(e){
    gbl_state.location_history.push(e.detail.location.pathname);
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
        <div
          id="map-container"
          style="display:flex; flex-flow: column; height: calc(100vh - var(--_vaadin-app-layout-navbar-offset-size));"
        >
          <mapa-principal
            .campos=${this.campos}
            .settings=${this.settings}
            style="flex:1 1 auto;"
          ></mapa-principal>
          <news-bar
            style="flex: 0 1 auto;"
            @hidden=${()=>{gbl_state.map.resize()
              console.log("RESIZE")
            }}
          ></news-bar>
        </div>
      </app-layout-navbar-placement>

      <nuevo-campo
        id="nuevo-campo-oc"
        .map=${this.map}
        .draw=${this.draw}
        .campos_db=${this.db}
      ></nuevo-campo>

      <nota-share-target
        id="nota-share-target"
        .map=${this.map}
        .db=${this.db}
      ></nota-share-target>

      <div id="container-multiproposito"></div>
    `;
  }
}

customElements.define("field-partner-child", FieldPartnerChild);
