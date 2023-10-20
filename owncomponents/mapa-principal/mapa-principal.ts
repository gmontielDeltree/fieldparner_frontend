import { ndvi_layers_init } from './ndvi-layers';
import { gbl_state } from "./../state";
import { depositos_update, depositos_layer_init } from "./depositos-layer";
import { LitElement, html, unsafeCSS, css, PropertyValueMap } from "lit";
import { property, query } from "lit/decorators.js";
import {
  touchEvent,
  layer_visibility,
  actividades_y_ejecuciones,
  buscar_ultima_siembra,
  tabla_de_colores,
} from "../helpers";
import { CircleLayer, GeoJSONSource, Layer, Map, SymbolLayer } from "mapbox-gl";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import syncMaps from "@mapbox/mapbox-gl-sync-move";

import mapbox_geocoder_style from "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import mapbox_style from "mapbox-gl/dist/mapbox-gl.css?inline";
import mapbox_draw_style from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css?inline";

import "@spectrum-web-components/action-menu/sp-action-menu.js";
import "@spectrum-web-components/menu/sp-menu-item.js";
import "@spectrum-web-components/theme/sp-theme";
import "@spectrum-web-components/theme/src/themes";
import centroid from "@turf/centroid";
import { isToday, parseISO } from "date-fns";
import { get, translate } from "lit-translate";
import { listar_proveedores } from "../proveedores/proveedores-funciones";
import { map } from "lit/directives/map.js";
import { Feature, FeatureCollection } from "@turf/helpers";
import { Router } from "@vaadin/router";
import { StateController } from "@lit-app/state";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

// https://observablehq.com/@bryik/esri-world-imagery-in-mapbox-gl-js
// https://github.com/kepta/idly/wiki/examples#using-bing-satellite-map
// Tile Lists
// http://www.idesa.gob.ar/2021/03/25/mas-mapas-xyz-tiles/

const mapStyle = {
  version: 8,
  sources: {
    worldImagery: {
      type: "raster",
      tiles: [
        //"http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}&s=Ga"
        //"https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "worldImagery",
      type: "raster",
      source: "worldImagery",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
};

/** Modifica 'features' agregado color y cultivo a las 'properties'
 *  basado en las actividades
 */
const colorear_lotes = async (features) => {
  // features[].properties.actividades
  let tabla = await tabla_de_colores()
  console.log("TAbla DE cOLORES",tabla)
  // Para cada lote
  await Promise.all(
    features.map(async ({ properties }) => {
      let uuid = properties.uuid;
      let cultivo = await buscar_ultima_siembra(uuid);

      if (cultivo) {
        let color = tabla[cultivo.key];
        properties.cultivo = cultivo.nombre;
        properties.color = color;
      } else {
        properties.cultivo = "Sin Cultivo";
        properties.color = "grey";
      }
      console.log("COLORSET");
      return;
    })
  );
};

const cultivo_to_color = (cultivo) => {
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

  @property({
    hasChanged(newVal: any, oldVal: any) {
      return false;
    },
  })
  settings: any;

  private layers: Layer[];

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
      /* Pantalla 'Pequeña' */

      .map_box_container {
        position: relative;
        height: 100% !important;
        width: 100% !important;
        display: flex;
        flex-direction: row;
      }

      #map2 {
        width: 100%;
        height: 100%;
      }

      #map {
        position: absolute;
        top: var(--_vaadin-app-layout-navbar-offset-size);
        /*bottom: 3;*/
        width: 100vw;
        z-index: 0;
        height: 100%;
        width: 100%;
        background-color: red;
        position: relative;
        /* height: calc(
          100vh - var(--_vaadin-app-layout-navbar-offset-size)
        ) !important;
      }

      @media only screen and (min-width: 800px) {
        /* Pantalla 'Grande' */
        #map {
          position: absolute;
          top: var(--_vaadin-app-layout-navbar-offset-size);
          /*bottom: 3;*/
          width: 100vw;
          z-index: 0;
          height: 100%;
          width: 50%;
          background-color: green;
          position: relative;

          /* height: calc(
            100vh - var(--_vaadin-app-layout-navbar-offset-size)
          ) !important;
        }
      }

      .mapboxgl-ctrl-group button + button {
        border-top: none;
      }

      .mapboxgl-ctrl-top-right {
        z-index: 0 !important;
      }

      .icon-dual {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --%3E%3Csvg width='29px' height='29px' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM7.49988 1.82689C4.36688 1.8269 1.82707 4.36672 1.82707 7.49972C1.82707 10.6327 4.36688 13.1725 7.49988 13.1726V1.82689Z' fill='%23000000' /%3E%3C/svg%3E");
      }
      
      .mapboxgl-popup-content {
        background-color: #053B50;
        color: #EEEEEE;
        
      }

      .mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
        border-right-color: #053B50;
      }

      .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
        border-top-color: #053b50
      }
    `,
  ];

  constructor() {
    super();
    mapboxgl.accessToken =
      "pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw";
    
    mapboxgl.prewarm();
  }

  firstUpdated() {
    this.mapa_init();
  }

  async mapa_init() {
    /* Para evitar empezar a renderizar el mapa antes de que height sea completamente definida */
    /* Esperar hasta que el update finalice */
    await this.getUpdateComplete();
    console.log("map height", this._map.offsetHeight);

    this.map2 = new Map({
      container: this._map2,
      style: "mapbox://styles/mapbox/satellite-streets-v12?optimize=true",
      center: gbl_state.ultima_posicion ?? {
        lng: -61.19468066139592,
        lat: -31.295018658148038,
      },
      zoom: gbl_state.ultimo_zoom ?? 3.4,
      maxZoom: 17,
      attributionControl: true,
      preserveDrawingBuffer: false,
    });

    this.map2.on("load", () => {
      gbl_state.map2 = this.map2;
    });

    this.map = new Map({
      container: this._map, //this.shadowRoot.getElementById("map"),
      //style: "mapbox://styles/mapbox/outdoors-v12",
      //style: mapStyle,
      style: "mapbox://styles/mapbox/satellite-streets-v12?optimize=true",
      center: gbl_state.ultima_posicion ?? {
        lng: -61.19468066139592,
        lat: -31.295018658148038,
      },
      zoom: gbl_state.ultimo_zoom ?? 3.4,
      maxZoom: 17,
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
      touchBuffer: 50,
      //defaultMode: 'draw_polygon'
    });

    //     this.map.on("render", () => {
    //       this.map.resize();
    //     });

    //this.map.resize();

    this.map.on("load", () => {
      syncMaps(this.map, this.map2);

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries:"ar,br,py",
        marker:false,
        placeholder: "Localidad, Calle, etc."
      });

      // night fog styling
      this.map.setFog({
        range: [5, 20],
        "horizon-blend": 0.3,
        color: "#242B4B",
      });


      this.map.addControl(geocoder);
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.addControl(this.draw); // Sin controles
      //tour();

      const gl_control = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      })

      this.map.addControl(
        gl_control
      );

      // Dirty way de pasar los controles al resto de la app
      this.map._custom_controls = {geolocate: gl_control}

      let layers_names = [];
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

      /* seleccion campo */
      this.map.addSource("seleccion_campo", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      layers_names.push("seleccion_campo_line");

      this.map.addLayer({
        id: "seleccion_campo_line",
        type: "line",
        source: "seleccion_campo",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": "rgba(14, 209, 227, 1)",
          "line-width": 3,
        },
      });
      /* fin seleccion campo */

      /* seleccion lotes */
      this.map.addSource("seleccion_lotes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      layers_names.push("seleccion_lotes_fill");

      this.map.addLayer({
        id: "seleccion_lotes_fill",
        type: "fill",
        source: "seleccion_lotes",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.9,
          "fill-outline-color": "red",
        },
      });

      /* fin seleccion lotes */

      layers_names.push("campos");

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

      layers_names.push("lotes");

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

      layers_names.push("campos_border");

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

      layers_names.push("lotes_border");

      this.map.addLayer({
        id: "lotes_border",
        type: "fill",
        source: "lotes",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.4,
          "fill-outline-color": "red",
        },
      });

      layers_names.push("nombres_campos");

      this.map.addLayer({
        id: "nombres_campos",
        type: "symbol",
        source: "campos",
        layout: {
          "text-field": [
            "format",
            ["upcase", ["get", "nombre"]],
            { "font-scale": 0.8 },
            "\n",
            {},
            //['downcase', ['get', 'Comments']],
            //{ 'font-scale': 0.6 }
          ],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        },
      });

      layers_names.push("posible_seleccion");
      this.map.addSource("posible_seleccion", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      this.map.addLayer({
        id: "posible_seleccion",
        type: "line",
        source: "posible_seleccion",
        paint: {
          "line-color": "rgba(0, 0, 125, 1)",
          "line-width": 4,
        },
      });

      this.map.showSelectedCampo = () => {
        console.log("Show selected Campo Function");
        layer_visibility(this.map, "seleccion_campo_line", true);
        layer_visibility(this.map, "seleccion_lotes_fill", true);
      };

      this.map.selectCampo = (geojson, lotes) => {
        console.log("SELECT", geojson, lotes);
        let source = this.map.getSource("seleccion_campo") as GeoJSONSource;

        let data_campo = {
          type: "FeatureCollection",
          features: [],
        };
        data_campo.features.push = geojson;

        source.setData(geojson);

        let lotes_source = this.map.getSource(
          "seleccion_lotes"
        ) as GeoJSONSource;
        //Pintar
        
        let data_lotes = {
          type: "FeatureCollection",
          features: lotes,
        };

        colorear_lotes(data_lotes.features).then(()=>
        
        lotes_source.setData(data_lotes)
        )
        
      };

      this.map.showAllCampos = () => {
        layer_visibility(this.map, "campos", true);
        layer_visibility(this.map, "campos_border", true);
        layer_visibility(this.map, "nombres_campos", true);
      };

      this.map.hideAllLayers = () => {
        layers_names.forEach((layername) => {
          layer_visibility(this.map, layername, false);
        });
      };

      this.proveedores_layer_init();
      depositos_layer_init(this.map);

      ndvi_layers_init(this.map);
      this.cargar_marcadores();

      this._redraw_map();
      this.map.resize();

      // console.info("Mapa Cargado");
      this.sendEvent("map-loaded", { map: this.map, draw: this.draw });
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    /** Mapbox handler para mostrar el offcanvas de detalles  'lotes', */
    this.map.on(touchEvent, "campos", (e) => {
      // NDVI not visible
      // console.log("Click en Campo", e.features[0]);

      // layer_visibility(this.map, "campos", false);
      // layer_visibility(this.map, "lotes", true);
      // layer_visibility(this.map, "campos_border", true);

      // Fly to

      const campo_doc = e.features[0].properties;

      // Event payload: campo_doc
      this.sendEvent("ver-campo-detalles", { campo_id: campo_doc.id });
    });

    this.map.on(touchEvent, ["lotes", "seleccion_lotes_fill"], (e) => {
      // console.log("Click en lotes Internos", e.features[0]);
      let { nombre, campo_parent_id } = e.features[0].properties;
      this.sendEvent("ver-lote-detalles", { nombre: nombre, campo_parent_id });
    });

    this.map.on(touchEvent, "lotes_border", (e) => {
      // console.log("Click en lotes selector", e.features[0]);
      let { nombre, campo_parent_id } = e.features[0].properties;
      this.sendEvent("lote-seleccionado", { nombre: nombre, campo_parent_id });
    });

    this.map.on("mouseenter", ["lotes", "seleccion_lotes_fill"], async (e) => {
      console.log("OVER EL LOTE", e.features[0].properties);
      let lote_uuid = e.features[0].properties.uuid;
      console.time("Acti Ejecuciones");
      let acts = await actividades_y_ejecuciones(lote_uuid);

      let solo_futuros = acts.filter((act) =>
        act.actividad.tipo !== "nota"
          ? isToday(parseISO(act.actividad.detalles.fecha_ejecucion_tentativa))
          : false
      );
      console.log(solo_futuros);

      let centroide = centroid(e.features[0].geometry);
      console.log(centroide);
      let coordenadas_centroide = centroide.geometry.coordinates; //lng, lat

      let html = "";
      if (solo_futuros.length > 0) {
        let act = solo_futuros[0].actividad;
        let proxima_actividad =
          solo_futuros[0].actividad.detalles.fecha_ejecucion_tentativa;
        html += `<h4 style='color:green;'>Actividad de hoy: ${act.tipo.toUpperCase()}</h4>`;
        html += "<ul>";
        act.detalles.dosis.forEach((i) => {
          html += `<li style='color:red;'>${i.insumo.marca_comercial}</li>`;
        });
        html += "</ul>";
      } else {
        html += get("sin_actividades_para_hoy");
      }

      popup.setLngLat(coordenadas_centroide).setHTML(html).addTo(this.map);
      console.timeEnd("Acti Ejecuciones");
      //popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });

    this.map.on("mouseleave", ["lotes", "seleccion_lotes_fill"], () => {
      console.log("OUT EL LOTE");
      popup.remove();
    });

    this.map.on("mouseenter", ["seleccion_lotes_fill", "campos"], (e) => {
      this.map.getCanvas().style.cursor = "pointer";
      // console.log("Entering ",e)
    });

    this.map.on("mouseleave", ["seleccion_lotes_fill", "campos"], (e) => {
      this.map.getCanvas().style.cursor = "";
    });

    this.map.on("move", (e) => {
      gbl_state.ultima_posicion = this.map.getCenter();
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

  proveedores_layer_init() {
    this.map.addSource("proveedores-src", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    // Add a circle layer
    this.map.addLayer({
      id: "proveedores-layer",
      type: "circle",
      source: "proveedores-src",
      paint: {
        "circle-color": "#4264fb",
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    this.map.on("mouseenter", "proveedores-layer", (e) => {
      // Change the cursor style as a UI indicator.
      this.map.getCanvas().style.cursor = "pointer";

      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(this.map);
    });

    this.map.on("mouseleave", "proveedores-layer", () => {
      this.map.getCanvas().style.cursor = "";
      popup.remove();
    });

    this.map.on(touchEvent, "proveedores-layer", (e) => {
      this.map.getCanvas().style.cursor = "";
      popup.remove();
      Router.go(e.features[0].properties.url);
    });
  }

  cargar_marcadores() {
    listar_proveedores().then((des) => {
      // Filtrar solo los que tengan posicion
      let conpos = des.filter((d) => {
        return d.posicion != null;
      });

      let features = conpos.map((d) => {
        let feature: Feature = {
          type: "Feature",
          properties: {
            item: d,
            url: "/proveedores/" + d.uuid,
            description: `<strong style='font-size:16px'>${
              d.nombre
            }</strong><br><div>${get("proveedor")}</div>`,
          },
          geometry: {
            type: "Point",
            coordinates: [d.posicion.lng, d.posicion.lat],
          },
        };
        return feature;
      });
      let src = this.map.getSource("proveedores-src").setData({
        type: "FeatureCollection",
        features: features,
      });
    });

    depositos_update(this.map);
  }

  _redraw_map = () => {
    console.log("Redrawing Map")
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

    colorear_lotes(lotes_collection.features).then(() => {
      //console.log("LOTES", lotes_collection);
      // console.log("Set lotes internos DS", lotes_collection.features);
      lotes_source?.setData(lotes_collection);


      // Colorear lotes seleccionados
      let a = this.map.getSource('seleccion_lotes')._data
      colorear_lotes(a.features).then(()=>
        this.map.getSource('seleccion_lotes').setData(a)
      )
      

      // console.log("Redraw Campos", this.campos);
      this.map.resize();
    });
  };

  binding = new StateController(this, gbl_dualmap);



  protected willUpdate(_changedProperties: PropertyValueMap<any> | globalThis.Map<PropertyKey, unknown>): void {
    if(_changedProperties.has("campos")){
      this._redraw_map()
    }
  }

  update(props) {
    // Se actualizo, pero no es por cambio de props? -> controller
    // console.log("MAPSIZe",props)
    super.update(props);

    if (this._map !== null && props.size === 0) {
      console.log("Redraw por Dual Map", props);
      this.map2?.resize();
      this.map?.resize();
      //
    }
  }

  render() {
    console.count("mapa-principal render");
    return html`
      <div class="map_box_container">
        <div
          id="map"
          style=${gbl_dualmap.dualmap ? "width:50%" : "width:100%;"}
        ></div>
        <div
          id="map2"
          style=${gbl_dualmap.dualmap ? "width:50%" : "width:0%;"}
        ></div>
      </div>
      <sp-theme scale="medium" color="dark">
        <!-- End content requiring theme application. -->
        <sp-action-menu size="m" class="add-button">
          <span slot="label" style="color:white;">Agregar</span>
          <sp-menu-item
            @click=${() => {
              this.sendEvent("nuevo-campo-click"), null;
            }}
          >
            Agregar un Campo
          </sp-menu-item>
        </sp-action-menu>
      </sp-theme>
    `;
  }
}

customElements.define("mapa-principal", MapaPrincipal);
