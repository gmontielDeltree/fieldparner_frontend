import { LitElement, html, css, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import Offcanvas from "bootstrap/js/dist/offcanvas.js";
import area from "@turf/area";
import uuid4 from "uuid4";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import centroid from "@turf/centroid";
import { GeoJSONSource, LngLatLike, Map, Popup } from "mapbox-gl";
import { Router, RouterLocation } from "@vaadin/router";
import { StateController } from "@lit-app/state";
import gbl_state from "../state.js";

import { translate } from "lit-translate";
import bbox from "@turf/bbox";
import { MagrisRecord, MagrisReporte } from "./magris-types";
import { Task, TaskStatus } from "@lit-labs/task";
import { base_url } from "../helpers.js";
import PouchDB from "pouchdb";
import { format, isWithinInterval, parse } from "date-fns";
import { NumberFieldEventMap } from "@vaadin/number-field";
import { Estado } from "../../src/types/index";
import { DatePicker, DatePickerChangeEvent } from "@vaadin/date-picker";
import { base_i18n } from "../lote-offcanvas/repetir-aplicacion/date-picker-i18n.js";
import "@vaadin/date-time-picker";

let e2s = ["Idle", "CARGA", "DESCARGA"];

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
      this.inicio_date = format(
        new Date(1000 * +this.reporte.data[this.reporte.data.length - 1].ts),
        "yyyy-MM-dd'T'HH:mm"
      );
      this.fin_date = format(
        new Date(1000 * +this.reporte.data[0].ts),
        "yyyy-MM-dd'T'HH:mm"
      );
      this.min_date = this.inicio_date;
      this.max_date = this.fin_date;
      console.log("LOG INICIIO", this.inicio_date);
      this.dibujarElMapa(this.reporte.data);
    },
    () => []
  );

  private _detallesOffcanvas: Offcanvas;
  private min_date;
  private max_date;
  private inicio_date;
  private fin_date;

  bindState = new StateController(this, gbl_state);

  dibujarElMapa(repo: MagrisRecord[]) {
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

    let puntos: number[][] = [];

    // Filtrar solo las primeras ocurrencias del los estados
    // https://stackoverflow.com/questions/30716829/how-to-remove-repeated-entries-from-an-array-while-preserving-non-consecutive-du
    let b = repo.filter((item, pos, arr) => {
      // Always keep the 0th element as there is nothing before it
      // Then check if each element is different than the one before it
      return (
        pos === 0 ||
        (item.estado !== 0 &&
          item.estado !== arr[pos - 1].estado &&
          item.posicion[0] !== 0)
      );
    });

    repo.forEach((r) => {
      let punto: number[] = [r.posicion[0] / 1000000, r.posicion[1] / 1000000];
      if (punto[0] !== 0) {
        puntos.push(punto);
      }
    });

    b.forEach((r) => {
      if (r.estado !== 0) {
        let e = {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [],
            type: "Point",
          },
        };
        e.properties.estado = "<strong>Fin de " + e2s[r.estado] + "</strong><p>"+ format(new Date(+r.ts * 1000), "dd-MM-yy HH:mm") +"</p>";
        e.properties.tiempo = format(new Date(+r.ts * 1000), "dd-MM-yy HH:mm");
        e.geometry.coordinates = [
          +r.posicion[0] / 1000000,
          +r.posicion[1] / 1000000,
        ];
        geojson.features.push(e);
      }
    });

    // Create a popup, but don't add it to the map yet.
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


      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
      });
  
      
      gbl_state.map.on("mouseenter", "carga", (e) => {
        // Change the cursor style as a UI indicator.
        gbl_state.map.getCanvas().style.cursor = "pointer";
  
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.estado;
  
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
  
        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(gbl_state.map);
      });
  
      gbl_state.map.on("mouseleave", "carga", () => {
        gbl_state.map.getCanvas().style.cursor = "";
        popup.remove();
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

  filterReport(report: MagrisReporte, inicio_str, fin_str) {
    let inicio = parse(inicio_str, "yyyy-MM-dd'T'HH:mm", new Date());
    let fin = parse(fin_str, "yyyy-MM-dd'T'HH:mm", new Date());
    console.log("i f", inicio, fin, inicio_str, fin_str);
    return report.data.filter((r) => {
      let ts = new Date(+r.ts * 1000);
      return isWithinInterval(ts, { start: inicio, end: fin });
    });
  }

  show() {
    this._detallesOffcanvas.show();
  }

  render() {
    let id_tolva = (this.location.params.id as string).split(":")[1];

    const item = (record: MagrisRecord) => {
      // let start_ts = (+record.id.split(":")[2])*1000
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
        <div>
          <vaadin-date-time-picker
            label="Inicio"
            .i18n=${base_i18n}
            .value=${this.inicio_date}
            .min=${this.min_date}
            .max=${this.fin_date}
            @change=${(e: DatePickerChangeEvent) => {
              this.inicio_date = e.target.value;
              this.dibujarElMapa(
                this.filterReport(this.reporte, this.inicio_date, this.fin_date)
              );
            }}
          ></vaadin-date-time-picker>
          <vaadin-date-time-picker
            label="Fin"
            .i18n=${base_i18n}
            .value=${this.fin_date}
            .min=${this.inicio_date}
            .max=${this.max_date}
            @change=${(e: DatePickerChangeEvent) => {
              this.fin_date = e.target.value;
              this.dibujarElMapa(
                this.filterReport(this.reporte, this.inicio_date, this.fin_date)
              );
            }}
          ></vaadin-date-time-picker>
        </div>
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
