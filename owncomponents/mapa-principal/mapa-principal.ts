import { LitElement, html, unsafeCSS, css } from "lit";
import { touchEvent, layer_visibility } from "../helpers";
import { Map } from "mapbox-gl";
import mapboxgl from "mapbox-gl";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import bbox from "@turf/bbox";
import { property } from "lit/decorators.js";
import mapbox_geocoder_style from "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import mapbox_style from "mapbox-gl/dist/mapbox-gl.css";
import mapbox_draw_style from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "@spectrum-web-components/action-menu/sp-action-menu.js";
import "@spectrum-web-components/menu/sp-menu-item.js";

import "@spectrum-web-components/theme/sp-theme";
import "@spectrum-web-components/theme/src/themes";

/** Modifica 'features' agregado color y cultivo a las 'properties'
 *  basado en las actividades
 */
const colorear_lotes = (features, cultivos) => {
  // features[].properties.actividades
  // Para cada lote
  features.map(({ properties }) => {
    if ("actividades" in properties) {
      let cultivo = tiene_cultivo_este_lote(properties.actividades);
      let color = cultivo_to_color(cultivo, cultivos);
      properties.cultivo = cultivo;
      properties.color = color;
    } else {
      properties.cultivo = "Cultivo Desconocido";
      properties.color = "grey";
    }
  });
};

const cultivo_to_color = (cultivo, cultivos) => {
  if (cultivo === "Barbecho") {
    return "grey";
  } else if (cultivo === "Cultivo Desconocido") {
    return "green";
  }

  for (const cultivo_map in cultivos) {
    if (Object.hasOwnProperty.call(cultivos, cultivo_map)) {
      const element = cultivos[cultivo_map];
      if (element.nombre === cultivo) {
        return element.color;
      }
    }
  }

  // Custom Colors

  return "blue";
};

const tiene_cultivo_este_lote = (actividades) => {
  /**
   * Es un array (Ordenado) que contiene todas las actividades historicas en el lote
   */

  // Filtrar Cosechas
  let cosechas = actividades.findIndex((a) => a.tipo === "cosechas");

  // Filtrar Siembras
  let siembras = actividades.findIndex((a) => a.tipo === "siembra");

  if (siembras > -1) {
    if (cosechas > -1) {
      if (siembras < cosechas) {
        // Ultima evento es siembra
        return actividades[siembras].detalles.cultivo;
      } else {
        return "Barbecho";
      }
    } else {
      // No hay cosechas
      return actividades[siembras].detalles.cultivo;
    }
  } else {
    return "Cultivo Desconocido";
  }
};

export class MapaPrincipal extends LitElement {
  @property({
    hasChanged(newVal: Map, oldVal: Map) {
      return false;
    },
  })
  map: Map;

  @property({
    hasChanged(newVal: MapboxDraw, oldVal: MapboxDraw) {
      return false;
    },
  })
  draw: MapboxDraw;

  @property()
  campos: any; //es el allDocs desde campos

  @property()
  settings: any;

  static override styles = [
    unsafeCSS(mapbox_geocoder_style),
    unsafeCSS(mapbox_draw_style),
    unsafeCSS(mapbox_style),
    css`
      .add-button {
        position: absolute;
        bottom: 70px;
        right: 20px;
        background-color: blue;
      }

      .add-button label {
        color: white;
      }
    `,
    css`
      #map {
        position: absolute;
        top: 46px;
        bottom: 0;
        width: 100%;
        height: calc(100vh - 46px) !important;
      }

      .mapboxgl-ctrl-group button + button {
        border-top: none;
      }

      .mapboxgl-ctrl-top-right {
        z-index: 0 !important;
      }
    `,
  ];

  constructor() {
    super();
    mapboxgl.accessToken =
      "pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw";
  }

  // createRenderRoot() {
  //   return this;
  // }

  firstUpdated() {
    this.map = new Map({
      container: this.shadowRoot.getElementById("map"),
      //style: "mapbox://styles/mapbox/outdoors-v11",
      style: "mapbox://styles/mapbox/satellite-streets-v11?optimize=true",
      center: [-59.2965, -35.1923],
      zoom: 6,
      attributionControl: true,
      preserveDrawingBuffer: false,
    });



    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: false,
        trash: false,
      },
      touchBuffer: 50
      //defaultMode: 'draw_polygon'
    });

    //     this.map.on("render", () => {
    //       this.map.resize();
    //     });

    //this.map.resize();
  

    this.map.on("load", () => {
      // const geocoder = new MapboxGeocoder({
      //   accessToken: mapboxgl.accessToken,
      //   mapboxgl: mapboxgl,
      // });

// night fog styling
this.map.setFog({
  'range': [5, 20],
  'horizon-blend': 0.3,
  'color': '#242B4B'
  });

      // this.map.addControl(geocoder);
      this.map.addControl(this.draw); // Sin controles
      //tour();
      this.map.addSource("campos", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      this.map.addSource("lotes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      this.map.addLayer({
        id: "campos",
        type: "fill",
        source: "campos",
        layout: {
          //"visibility": 'none'
        },
        paint: {
          "fill-color": "red",
          "fill-opacity": 0.4,
          "fill-outline-color": "red",
        },
      });

      this.map.addLayer(
        {
          id: "lotes",
          type: "fill",
          source: "lotes",
          layout: {
            visibility: "none",
          },
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.9,
            "fill-outline-color": ["get", "color"],
          },
        },
        "campos"
      );

      this.map.addLayer(
        {
          id: "campos_border",
          type: "line",
          source: "campos",
          paint: {
            "line-color": "rgba(255, 0, 0, 1)",
            "line-width": 4,
          },
        },
        "campos"
      );
      
      this.map.addLayer(
        {
          id: "lotes_border",
          type: "fill",
          source: "lotes",
          layout: {
            visibility: "none",
          },
          paint: {
            "fill-color": "rgba(255, 127, 0, 1)",
            "fill-opacity": 0.4,
            "fill-outline-color": "red",
          },
        }
      );
      
      
      this.map.addLayer({
        'id': 'nombres_campos',
        'type': 'symbol',
        'source': 'campos',
        'layout': {
        'text-field': [
        'format',
        ['upcase', ['get', 'nombre']],
        { 'font-scale': 0.8 },
        '\n',
        {},
        //['downcase', ['get', 'Comments']],
        //{ 'font-scale': 0.6 }
        ],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
        }
        });

      // console.info("Mapa Cargado");
      this.sendEvent("map-loaded", { map: this.map, draw: this.draw });
      this._redraw_map();
    });

    /** Mapbox handler para mostrar el offcanvas de detalles  'lotes', */
    this.map.on(touchEvent, "campos", (e) => {
      // NDVI not visible
      // console.log("Click en Campo", e.features[0]);

      layer_visibility(this.map, "campos", false);
      layer_visibility(this.map, "lotes", true);
      layer_visibility(this.map, "campos_border", true);

      // Fly to
      this.map.fitBounds(bbox(e.features[0]));
      const campo_doc = e.features[0].properties;

      // Event payload: campo_doc
      this.sendEvent("ver-campo-detalles", { campo_id: campo_doc.id });
    });

    this.map.on(touchEvent, "lotes", (e) => {
      // console.log("Click en lotes Internos", e.features[0]);
      let { nombre, campo_parent_id } = e.features[0].properties;
      this.sendEvent("ver-lote-detalles", { nombre: nombre, campo_parent_id });
    });

    this.map.on(touchEvent, "lotes_border", (e) => {
      // console.log("Click en lotes selector", e.features[0]);
      let { nombre, campo_parent_id } = e.features[0].properties;
      this.sendEvent("lote-seleccionado", { nombre: nombre, campo_parent_id });
    });
  }

  sendEvent = (name, details) => {
    let event = new CustomEvent(name, {
      detail: details,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  };

  _redraw_map = () => {
    let campos_source = this.map.getSource("campos");
    // console.log("CS", campos_source);
    let campos_collection = {
      type: "FeatureCollection",
      features: [],
    };
    let lotes_source = this.map.getSource("lotes");
    let lotes_collection = {
      type: "FeatureCollection",
      features: [],
    };

    campos_collection.features =
      this.campos?.rows.map(({ doc }) => {
        let campo_geojson = { ...doc.campo_geojson };
        campo_geojson.properties = {
          id: doc["_id"],
          rev: doc["_rev"],
          nombre: doc.nombre,
          db_doc: "JSON.stringify(doc)",
        };
        return campo_geojson;
      }) || [];

    // Puede set undefined si la base se carga antes que lo
    // que renderiza por primera vez
    // console.log("Campos", campos_collection);
    campos_source?.setData(campos_collection);

    // Lotes
    lotes_collection.features =
      this.campos?.rows.map((campo) => {
        // campo.doc.lotes
        return campo.doc.lotes;
      }) || [];
    lotes_collection.features = lotes_collection.features.flat();

    colorear_lotes(lotes_collection.features, this.settings?.user_cultivos);

    // console.log("Set lotes internos DS", lotes_collection.features);
    lotes_source?.setData(lotes_collection);
    // console.log("Redraw Campos", this.campos);
  };

  willUpdate(props) {
    if (props.has("campos")) {
      this._redraw_map();
    }
  }

  render() {
    return html`
      <div id="map"></div>

      <sp-theme scale="medium" color="light">
        <!-- End content requiring theme application. -->
        <sp-action-menu size="m" class="add-button">
          <span slot="label" style='color:white;' >Agregar</span>
          <sp-menu-item
            @click=${() => {
              this.sendEvent("nuevo-campo-click"), null;
            }}
          >
            Agregar un Campo
          </sp-menu-item>
          <sp-menu-item
            @click=${() => {
              this.sendEvent("nuevo-contratista-click"), null;
            }}
          >
            Agregar un Contratista
          </sp-menu-item>
          <sp-menu-item
            @click=${() => {
              this.sendEvent("nuevo-deposito-click"), null;
            }}
          >
            Agregar un Deposito
          </sp-menu-item>
        </sp-action-menu>
      </sp-theme>
    `;
  }
}

customElements.define("mapa-principal", MapaPrincipal);
