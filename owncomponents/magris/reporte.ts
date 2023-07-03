import { LitElement, html, css, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import Offcanvas from "bootstrap/js/dist/offcanvas.js";
import area from "@turf/area";
import uuid4 from "uuid4";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import centroid from "@turf/centroid";
import { GeoJSONSource, LngLatLike, Map } from "mapbox-gl";
import { Router, RouterLocation } from "@vaadin/router";
import { StateController } from "@lit-app/state";
import gbl_state from "../state.js";

import { translate } from "lit-translate";
import bbox from "@turf/bbox";
import { MagrisRecord, MagrisReporte } from "./magris-types";
import { Task, TaskStatus } from "@lit-labs/task";
import { base_url } from "../helpers.js";
import PouchDB from "pouchdb";
import { format } from "date-fns";
import { NumberFieldEventMap } from "@vaadin/number-field";
import { Estado } from "../../src/types/index";

export class MagrisReporteOC extends LitElement {
  // @property()
  // map: Map;

  //@property()
  //campos: any;
  static override styles = [
    unsafeCSS(bootstrap),
    css`
      table {
        font-family: arial, sans-serif;
        font-size: 0.7rem;
        border-collapse: collapse;
        width: 100%;
      }

      td,
      th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
        word-wrap: break-word;
      }

      tr:nth-child(even) {
        background-color: #dddddd;
      }
    `,
  ];

  @property()
  location: RouterLocation;

  @state()
  reporte: MagrisReporte;

  db: PouchDB.Database = new PouchDB(base_url + "tolva");

  private _loadTask = new Task(
    this,
    async () => {
      let docs = await this.db.allDocs({
        key: this.location.params.id as string,
        include_docs: true,
      });
      this.reporte = docs.rows[0].doc as unknown as MagrisReporte;
      console.log(this.reporte);
      this.dibujarElMapa(this.reporte);
    },
    () => []
  );

  private _detallesOffcanvas: Offcanvas;

  bindState = new StateController(this, gbl_state);

  dibujarElMapa(repo: MagrisReporte) {
    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [],
            type: "LineString",
          },
        },
      ],
    };

    let puntos: number[] = [];
    repo.data.forEach((r) => {
      let punto = [r.posicion[0] / 1000000, r.posicion[1] / 1000000];
      if (punto[0] !== 0) {
        puntos.push(punto);
        if (r.estado !== 0) {
          let e = {
            type: "Feature",
            properties: {},
            geometry: {
              coordinates: [],
              type: "Point",
            },
          };
          e.properties.estado = e.estado;
          e.properties.nombre = "OP";
          e.geometry.coordinates = punto;
          geojson.features.push(e);
        }
      }
    });

    geojson.features[0].geometry.coordinates = puntos.reverse();

    let source: GeoJSONSource = gbl_state.map.getSource(
      "tolva_track"
    ) as GeoJSONSource;
    if (!source) {
      gbl_state.map.addSource("tolva_track", {
        type: "geojson",
        data: geojson,
      });
    } else {
      source = gbl_state.map.getSource("tolva_track") as GeoJSONSource;
      source.setData(geojson);
    }

    try {
      gbl_state.map.addLayer({
        id: "points",
        type: "symbol",
        source: "tolva_track",
        layout: {
          "icon-image": "custom-marker",
          // get the title name from the source's "title" property
          "text-field": ["get", "title"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.25],
          "text-anchor": "top",
        },
        filter: ["==", "$type", "Point"],
      });
      // add a line layer without line-dasharray defined to fill the gaps in the dashed line
      gbl_state.map.addLayer({
        type: "circle",
        source: "tolva_track",
        id: "carga",
        paint: {
          "circle-radius": 6,
          "circle-color": "#B42222",
        },
        filter: ["==", "$type", "Point"],
      });

      // add a line layer without line-dasharray defined to fill the gaps in the dashed line
      gbl_state.map.addLayer({
        type: "line",
        source: "tolva_track",
        id: "line-background",
        paint: {
          "line-color": "yellow",
          "line-width": 6,
          "line-opacity": 0.4,
        },
        filter: ["==", "$type", "LineString"],
      });

      // add a line layer with line-dasharray set to the first value in dashArraySequence
      gbl_state.map.addLayer({
        type: "line",
        source: "tolva_track",
        id: "line-dashed",
        paint: {
          "line-color": "yellow",
          "line-width": 6,
          "line-dasharray": [0, 4, 3],
        },
        filter: ["==", "$type", "LineString"],
      });
    } catch (e) {
      console.log("Error layer");
    }
    // technique based on https://jsfiddle.net/2mws8y3q/
    // an array of valid line-dasharray values, specifying the lengths of the alternating dashes and gaps that form the dash pattern
    const dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ];

    let step = 0;

    function animateDashArray(timestamp) {
      // Update line-dasharray using the next value in dashArraySequence. The
      // divisor in the expression `timestamp / 50` controls the animation speed.
      const newStep = parseInt((timestamp / 50) % dashArraySequence.length);

      if (newStep !== step) {
        gbl_state.map.setPaintProperty(
          "line-dashed",
          "line-dasharray",
          dashArraySequence[step]
        );
        step = newStep;
      }

      // Request the next frame of the animation.
      requestAnimationFrame(animateDashArray);
    }

    // start the animation
    animateDashArray(0);
  }

  firstUpdated() {
    this._detallesOffcanvas = new Offcanvas(
      this.shadowRoot.getElementById("lista-de-campos-oc")
    );

    this.shadowRoot
      .getElementById("lista-de-campos-oc")
      .addEventListener("hidden.bs.offcanvas", () => {
        this._detallesOffcanvas.dispose();
      });

    this._detallesOffcanvas.show();
  }

  show() {
    this._detallesOffcanvas.show();
  }

  render() {
    let id_tolva = (this.location.params.id as string).split(":")[1];

    const item = (record: MagrisRecord) => {
      // let start_ts = (+record.id.split(":")[2])*1000
      let e2s = ["Idle", "Cargando", "Descargando"];
      let ts = format(new Date(+record.ts * 1000), "dd-MM-yy hh:mm:ss");
      return html`
        <tr>
          <td>${ts}</td>
          <td>${e2s[record.estado]}</td>
          <td>${record.peso}</td>
          <td>${record.peso_inicio}</td>
          <td>${record.peso_objetivo}</td>
          <td>${record.patente_o_lote}</td>
        </tr>
      `;
    };

    let offcanvas_html = html`<div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="lista-de-campos-oc"
      aria-labelledby="offcanvasLabel"
      data-bs-scroll="true"
      data-bs-backdrop="false"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasLabel">
          Log Equipo ${id_tolva}
        </h5>
        <button
          type="button"
          @click=${() => {
            this._detallesOffcanvas.hide();
          }}
          class="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <div>Filtro</div>
        <div class="list-group">
          <table>
            <tr>
              <th>Tiempo</th>
              <th>Estado</th>
              <th>Peso</th>
              <th>Peso Inicial</th>
              <th>Peso Objetivo</th>
              <th>Patente/Lote</th>
            </tr>
            ${this._loadTask.render({
              pending: () => html`${translate("cargando")}`,
              complete: (_) => html` ${this.reporte.data.map(item)} `,
            })}
          </table>
        </div>
      </div>
    </div>`;

    return html` ${offcanvas_html} `;
  }
}

customElements.define("magris-reporte", MagrisReporteOC);
