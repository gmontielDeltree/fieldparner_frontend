import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import PouchDB from "pouchdb";
import { get_lote_doc, hashMessage, layer_visibility } from "../helpers";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { property, state } from "lit/decorators.js";
import {
  ImageSource,
  Map,
  MapMouseEvent,
  Popup,
  Source,
  SourceVectorLayer,
} from "mapbox-gl";
import { isThisSecond, formatDistanceToNow, parse, format } from "date-fns";
import es from "date-fns/locale/es";
import geoblaze from "geoblaze";
import * as d3 from "d3";
import "./card-observacion";

import "./leyenda";
import { utils, writeFile } from "xlsx";
import { D3GeoblazeOnMapbox, drawGeotiffOnMap } from "./ndvi-functions";

import { StateController } from "@lit-app/state";
import gbl_state from "../state.js";
import { Router } from "@vaadin/router";
import bbox from "@turf/bbox";
import booleanContains from "@turf/boolean-contains";
import { point } from "@turf/helpers";

const img_bucket_url =
  "https://testbucketgarrapollo.s3.us-south.cloud-object-storage.appdomain.cloud/";

const lista_indices = [
  { nombre: "NDVI", value: "ndvi", banda: 0 },
  // { nombre: "ReCL", value: "recl", banda: 1 },
  { nombre: "NDRE", value: "ndre", banda: 1 },
  { nombre: "NDMI", value: "ndmi", banda: 2 },
  // { nombre: "MSAVI", value: "msavi", banda: 3 },
];

export class NdviOffcanvas extends LitElement {
  //@property()
  //map: Map;

  @property({ type: Object })
  location = gbl_state.router.location;

  bindState = new StateController(this, gbl_state);

  @property()
  ndvi_db: PouchDB.Database;

  @property()
  lote_doc: any;

  @state()
  indice: any = lista_indices[0];

  @state()
  lote_uuid: string;

  @state()
  obs: any[] = [];

  @state()
  selected_obs: any;

  @state()
  escala_dinamica: boolean = false;

  @state({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
  offcanvas: Offcanvas;

  @state()
  ndvi_geoblaze_raster: any;

  @state()
  ambientes_raster: any;

  @state()
  fechas: string[] = [];

  @state()
  lista_georasters: any[] = [];

  @state()
  histograma_show: boolean = false;

  @state()
  canvas_element: HTMLCanvasElement;

  @state()
  seleccion: { fecha: string; stats: any };

  constructor() {
    super();
    this.ndvi_db = new PouchDB(
      "https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/ndvi"
    );

    this.addEventListener("obs-selected", async (e: CustomEvent) => {
      console.log("SAELELELELE");
      let geoblaze_raster = e.detail.georaster;

      if (gbl_state.map.getSource("canvas-source")) {
        let s = gbl_state.map.getSource("canvas-source") as Source;
        console.log("SouceExiste", s);
        s.canvas = e.detail.canvas;
      } else {
        // No existe
        console.log("SourceNo Existe");

        gbl_state.map.addSource("canvas-source", {
          type: "canvas",
          canvas: e.detail.canvas,
          coordinates: [
            [geoblaze_raster.xmin, geoblaze_raster.ymax],
            [geoblaze_raster.xmax, geoblaze_raster.ymax],
            [geoblaze_raster.xmax, geoblaze_raster.ymin],
            [geoblaze_raster.xmin, geoblaze_raster.ymin],
          ],
        });
      }

      if (!gbl_state.map.getLayer("radar-layer")) {
        //No existe
        console.log("Layer No Existe");

        gbl_state.map.addLayer({
          id: "radar-layer",
          type: "raster",
          source: "canvas-source",
          paint: {
            "raster-fade-duration": 0,
          },
        },'borde_de_este_lote');
      }

      /* stats de la seleccion */
      this.seleccion = {
        fecha: e.detail.fecha,
        stats: await geoblaze.stats(geoblaze_raster, this.lote_doc),
      };
      console.log("STATS", this.seleccion, await this.seleccion);
    });
  }

  static override styles = unsafeCSS(bootstrap);

  async get_fechas() {
    let bboxs = encodeURIComponent(JSON.stringify(bbox(this.lote_doc)));
    //https://us-south.functions.appdomain.cloud/api/v1/web/2659fadf-b282-4e49-b323-bf8cd87cd5e6/default/indicesdates?dates=2022-04-01%2F2022-11-01&bbox=%5B-59.08562672796121%2C-35.20733062337166%2C-59.07974430745857%2C-35.20304176165523%5D
    let fechas = encodeURIComponent("2022-04-01/2023-01-01");
    let r = await fetch(
      "https://us-south.functions.appdomain.cloud/api/v1/web/2659fadf-b282-4e49-b323-bf8cd87cd5e6/default/indicesdates?dates=" +
        fechas +
        "&bbox=" +
        bboxs
    );
    return r.json();

    //    return ["2022-04-18", "2022-04-23", "2022-04-25"];
  }

  async firstUpdated() {
    this.offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-lote-ndvi")
    );

    /* Esto deberia ocurri si map y db estan caragado */

    this.shadowRoot
      .getElementById("offcanvas-lote-ndvi")
      .addEventListener("hidden.bs.offcanvas", () => {
        layer_visibility(gbl_state.map, "campos", true);
        layer_visibility(gbl_state.map, "campos_border", true);
        layer_visibility(gbl_state.map, "lotes", false);
        layer_visibility(gbl_state.map, "lotes_border", false);
        layer_visibility(gbl_state.map, "nombres_campos", true);

        /* Hide NDVI */
        //layer_visibility(gbl_state.map, "ndvi-layer", false);
        layer_visibility(gbl_state.map, "borde_de_este_lote", false);
        layer_visibility(gbl_state.map, "radar-layer", false);

        gbl_state.map.removeLayer("borde_de_este_lote");
        gbl_state.map.removeSource("borde_de_este_lote");
        //gbl_state.map.removeLayer("ndvi-layer");
        //gbl_state.map.removeSource("ndvi");
        gbl_state.map.removeLayer("radar-layer");
        gbl_state.map.removeSource("canvas-source");

        this.autodestruirme();

        //console.log("CHILDEREN",parent.children)
      });

    this.lote_uuid = this.location.params.uuid as string;
    this.lote_doc = await get_lote_doc(gbl_state.db, this.lote_uuid);

    console.log(this.lote_doc);

    this.fechas = await this.get_fechas();
    console.log("FECHAS", this.fechas);
    this.populate_lista_georaster(this.fechas, this.lote_doc);

    // Show
    console.log("Indice", this.indice, this.lote_uuid);

    this.show();
  }

  async populate_lista_georaster(fechas, lote_doc) {
    fechas.map(async (fecha) => {
      let geo = await this.fetch_georaster(
        fecha,
        this.lote_uuid,
        bbox(lote_doc)
      );

      if (geo) {
        let e = { fecha: fecha, georaster: geo };
        this.lista_georasters.push(e);
        this.render();
      }
    });
  }

  async show() {
    this.init_layers();

    this.offcanvas.show();

    //this.generar_ndvi_gallery(this.fechas);

    // let clean_json = JSON.stringify(geometry, Object.keys(geometry).sort());
    // hashMessage(clean_json).then((lote_hash) => {
    //   console.log("Lote Hash", lote_hash);
    //   // Build y  Mostrar la Galeria
    //   this.ndvi_db
    //     .get(lote_hash)
    //     .then(this.generar_ndvi_gallery)
    //     .catch((e) => {
    //       console.log("Error NDVI: Aun no existe ningun registro", e);
    //       this.offcanvas.hide();
    //       alert(
    //         "Error NDVI: Aun no existe ningun registro. Si recien creo el lote espere unos instantes hasta que se recopilen las imagenes satelitales"
    //       );
    //       this.autodestruirme();
    //       Router.go("/");
    //     });
    // });
  }

  autodestruirme() {
    /* Auto destruirme */
    let parent = this.parentElement;
    let children_els = [...parent.children];
    let myself = children_els.find((e) => (e.id = this.id));
    parent.removeChild(myself);
  }

  async fetch_georaster(fecha, uuid, bboxs) {
    let url_tentativa = img_bucket_url + uuid + "_" + fecha + ".geotiff";
    console.log("fecha uuid bboz", fecha, uuid, bboxs);
    // Test URL
    //url_tentativa = "/aaaaa_20220418.geotiff";
    // parse array buffer
    try {
      const response = await fetch(url_tentativa);
      //https://towardsdev.com/how-to-handle-404-500-and-more-using-fetch-api-in-javascript-f4e301925a51
      if (!response.ok) {
        if (response.status == 404) {
          console.log("404 -> Generando...");
          let response_gen = await this.call_generator(fecha, uuid, bboxs);
          if (!response_gen.ok) {
            throw Error(response_gen.statusText);
          }
          const arrayBuffer = await response_gen.arrayBuffer();
          const georaster = await geoblaze.parse(arrayBuffer);
          this.clip_raster(georaster, this.lote_doc);
          return georaster;
        }
      }
      const arrayBuffer = await response.arrayBuffer();
      const georaster = await geoblaze.parse(arrayBuffer);
      this.clip_raster(georaster, this.lote_doc);
      return georaster;
    } catch (e) {
      console.log("ERROR al FETCH", e);
    }
  }

  clip_raster(georaster, geojson) {
    let width = georaster.width;
    let height = georaster.height;

    georaster.noDataVal = -9999;
    georaster.noDataValue = -9999;

    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++) {
        let value = georaster.values[0][j][i];
        let long = i * georaster.pixelWidth + georaster.xmin;
        let lat = georaster.ymax - j * georaster.pixelHeight;
        // lat long de este pixel
        let punto = point([long, lat]);
        let is_contained = booleanContains(geojson, punto);
        if (!is_contained) {
          for (var banda = 0; banda < (georaster.numberOfRasters-1); banda++) {
            /* for each band!! */
            georaster.values[banda][j][i] = -9999;
          }
        }
      }
    }
  }

  async call_generator(fecha, uuid, bboxs) {
    try {
      let bboxs_enc = encodeURIComponent(JSON.stringify(bboxs));
      let url_generador =
        "https://us-south.functions.appdomain.cloud/api/v1/web/2659fadf-b282-4e49-b323-bf8cd87cd5e6/default/geotiff_for_date?date=" +
        fecha +
        "&bbox=" +
        bboxs_enc +
        "&uuid=" +
        uuid;
      const response = fetch(url_generador);
      console.log("CALL GENERATOR", response);
      return response;
    } catch (e) {
      console.log("ERROR al FETCH", e);

      return;
    } finally {
    }
  }

  img_url = (ob) => {
    if (this.escala_dinamica) {
      return img_bucket_url + ob.png_dinamica_url;
    } else {
      return img_bucket_url + ob.png_fija_url;
    }
  };

  geotiff_url = (ob) => {
    return img_bucket_url + ob.geotiff_url;
  };

  geoblaze_to_excel = () => {
    let xmin = this.ndvi_geoblaze_raster._metadata.xmin;
    let ymax = this.ndvi_geoblaze_raster._metadata.ymax;
    let pw = this.ndvi_geoblaze_raster.pixelWidth;
    let ph = this.ndvi_geoblaze_raster.pixelHeight;
    let w = this.ndvi_geoblaze_raster.width;
    let h = this.ndvi_geoblaze_raster.height;

    let array_resultado = [["lat", "lon", "ndvi"]];
    for (let i = 0; i < w; i++) {
      for (let vs = 0; vs < h; vs++) {
        let point = [xmin + pw * i, ymax - ph * vs];
        let n = geoblaze.identify(this.ndvi_geoblaze_raster, point);
        if (n && n > -1) {
          array_resultado.push([point[1], point[0], n]);
        }
      }
    }

    /* Guardar Libro */
    const worksheet = utils.aoa_to_sheet(array_resultado);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "NDVI");
    writeFile(workbook, "NDVI.xlsx");
  };

  init_layers = () => {
    // let bboxs = [
    //   [ob.bbox.left, ob.bbox.top],
    //   [ob.bbox.right, ob.bbox.top],
    //   [ob.bbox.right, ob.bbox.bottom],
    //   [ob.bbox.left, ob.bbox.bottom],
    // ];
    // const img_src = this.img_url(ob);

    // //layer_visibility(gbl_state.map, "lotes_internos", false);
    // this.create_or_update_ndvi_source(img_src, bboxs);

    /* Hide all polygons */
    layer_visibility(gbl_state.map, "campos", false);
    layer_visibility(gbl_state.map, "campos_border", false);
    layer_visibility(gbl_state.map, "lotes", false);
    layer_visibility(gbl_state.map, "lotes_border", false);
    layer_visibility(gbl_state.map, "nombres_campos", false);

    /* Inicialmente dibujo el borde */
    if (!gbl_state.map.getSource("borde_de_este_lote")) {
      console.log("addSource", this.lote_doc);
      gbl_state.map.addSource("borde_de_este_lote", {
        type: "geojson",
        data: this.lote_doc,
      });

      gbl_state.map.addLayer({
        id: "borde_de_este_lote",
        type: "line",
        source: "borde_de_este_lote",
        paint: {
          //"fill-color": "#FFFFFF",
          //"fill-outline-color": "#FF0000",
          //"fill-opacity": 1,
          "line-color": "rgb(60, 183, 251)",
          "line-width": 4,
        },
      });
    }
  };

  queryNDVIValore(lngLat) {
    return geoblaze.identify(this.ndvi_geoblaze_raster, lngLat);
  }

  create_or_update_ndvi_source = (img_src, bbox) => {
    // If e
    if (gbl_state.map.getSource("ndvi")) {
      // EXISTE la source -> Update
      const mySource = gbl_state.map.getSource("ndvi") as ImageSource;
      mySource.updateImage({
        url: img_src,
        coordinates: bbox,
      });
    } else {
      // No existe la source crear
      gbl_state.map.addSource("ndvi", {
        type: "image",
        url: img_src,
        coordinates: bbox,
      });

      gbl_state.map.addLayer({
        id: "ndvi-layer",
        type: "raster",
        source: "ndvi",
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      });

      gbl_state.map.on("mouseenter", ["borde_de_este_lote"], () => {
        console.log(
          "A mouseenter event occurred on a visible portion of the water layer."
        );

        const popup = new Popup({
          closeButton: false,
        });

        gbl_state.map.getCanvas().style.cursor = "pointer";

        const onMouseMove = (e: MapMouseEvent) => {
          //console.log("A mouseover event has occurred.", e.lngLat);
          let ndvi_value = this.queryNDVIValore([e.lngLat.lng, e.lngLat.lat]);
          console.log("NDVI", ndvi_value);
          popup
            .setLngLat(e.lngLat)
            .setText(ndvi_value[0].toFixed(2))
            .addTo(gbl_state.map);
        };

        gbl_state.map.on("mousemove", ["borde_de_este_lote"], onMouseMove);

        gbl_state.map.on("mouseleave", ["borde_de_este_lote"], () => {
          gbl_state.map.getCanvas().style.cursor = "";
          popup.remove();
          gbl_state.map.off("mousemove", "borde_de_este_lote", onMouseMove);
        });
      });

      console.log("EVENTOS ADDED");
    }

    //gbl_state.map.moveLayer("ndvi-layer");
  };

  nubosidad(obs) {
    //  let info = obs.estadisticas;
    let info = obs[0];

    if (info.min < 0.1 && info.mean < 0.1) {
      return "Nubosidad Severa";
    } else if (info.min < 0) {
      return "Nubosidad";
    } else {
      return "";
    }
  }

  /**
   * Renderiza la galeria de NDVI en los detalles del campo
   * @param {} result Es el doc de ndvi desde la DB.
   */
  generar_ndvi_gallery = async (result) => {
    /**
     * NDVI Layer Visible
     */
    // if (gbl_state.map.getLayer("ndvi-layer")) {
    //   gbl_state.map.setLayoutProperty("ndvi-layer", "visibility", "visible");
    //   gbl_state.map.moveLayer("ndvi-layer");
    // }
    // let obs = result.obs;
    // this.obs = result.obs;
    // Muestro el Offcanvas en si mismo
    //this.offcanvas.show();
    //this.obs[0] ? this.mostrar_en_mapa(this.obs[0]) : null;
  };

  async histograma() {
    this.histograma_show = true;
    await this.updateComplete;

    //let h = geoblaze.histogram(this.ndvi_geoblaze_raster,null,{ scaleType: "nominal" })
    let pixels: Number[] = geoblaze.get(
      this.ndvi_geoblaze_raster,
      null,
      "flat"
    );

    let valid_pixels = pixels[0].filter((e) => e > -1);
    console.log("Pixels", pixels, "valid", valid_pixels);

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 40 },
      width = 380 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3
      .select(this.shadowRoot.getElementById("my_dataviz"))
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // console.log("SVG", svg)

    // Data section
    // X axis: scale and draw:
    const x = d3
      .scaleLinear()
      .domain([d3.min(valid_pixels), d3.max(valid_pixels)]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y axis: initialization
    const y = d3.scaleLinear().range([height, 0]);
    const yAxis = svg.append("g");

    let line = svg.append("line");

    // A function that builds the graph for a specific value of bin
    function update(nBin, thres) {
      // set the parameters for the histogram
      const histogram = d3
        .histogram()
        .value(function (d) {
          //console.log("d",d)
          return d;
        }) // I need to give the vector of value
        .domain(x.domain()) // then the domain of the graphic
        .thresholds(x.ticks(nBin)); // then the numbers of bins

      // And apply this function to data to get the bins
      const bins = histogram(valid_pixels);
      //console.log("BINS", bins);
      // Y axis: update now that we know the domain
      y.domain([
        //////
        0,
        d3.max(bins, function (d) {
          return d.length;
        }),
      ]); // d3.hist has to be called before the Y axis obviously
      yAxis.transition().duration(1000).call(d3.axisLeft(y));

      // Join the rect with the bins data
      const u = svg.selectAll("rect").data(bins);

      // Manage the existing bars and eventually the new ones:
      u.join("rect") // Add a new rect for each new elements
        .transition() // and apply changes to all of them
        .duration(1000)
        .attr("x", 1)
        .attr("transform", function (d) {
          return `translate(${x(d.x0)}, ${y(d.length)})`;
        })
        .attr("width", function (d) {
          return x(d.x1) - x(d.x0) - 1;
        })
        .attr("height", function (d) {
          return height - y(d.length);
        })
        //.style("fill", "#69b3a2");
        .style("fill", function (d) {
          if (d.x0 < thres) {
            return "orange";
          } else {
            return "#69b3a2";
          }
        });

      line
        .attr("x1", x(thres))
        .attr("x2", x(thres))
        .attr("y1", y(0))
        .attr("y2", y(1600))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4");

      // svg
      //   .append("text")
      //   .attr("x", x(thres + 10))
      //   .attr("y", y(1400))
      //   .text("threshold: " + thres)
      //   .style("font-size", "15px");
    }

    const ambientador = (a, t) => {
      if (a < -0.99) {
        return a;
      }
      return a > t ? 1 : -0.97;
    };

    // Initialize with 50 bins
    update(50, 0.5);
    this.ambientes_raster = await geoblaze.rasterCalculator(
      this.ndvi_geoblaze_raster,
      (a) => ambientador(a, 0.5)
    );

    // Listen to the button -> update if user change it
    d3.select(this.shadowRoot.getElementById("nBin")).on("input", function () {
      update(+this.value, 0.5);
    });

    // Listen to the button -> update if user change it
    d3.select(this.shadowRoot.getElementById("ambientacion")).on(
      "input",
      async () => {
        update(50, this.shadowRoot.getElementById("ambientacion").value);
        //console.log("consoe", this.value)
        let t1 = this.shadowRoot.getElementById("ambientacion").value;
        this.ambientes_raster = await geoblaze.rasterCalculator(
          this.ndvi_geoblaze_raster,
          (a) => ambientador(a, t1)
        );
        d3tiff.geoblaze_raster = this.ambientes_raster;
        d3tiff.render();
      }
    );

    //console.log("Geoblaze Histo", valid_pixels);

    // Dibujar
    // new d3GeotiffonMap
    // map events -> render
    // drawGeotiffOnMap(this.ndvi_geoblaze_raster,gbl_state.map);
    let d3tiff = new D3GeoblazeOnMapbox(this.ambientes_raster, gbl_state.map);

    d3tiff.render_isobands();

    function rerender() {
      d3tiff.render();
    }

    function clear() {
      d3tiff.clear();
    }

    // //this.map.on("viewreset", rerender);
    // this.map.on("movestart", clear);
    // this.map.on("moveend", rerender);
  }

  close() {
    this.offcanvas.hide();
    Router.go("/");
  }

  render() {
    let back_button = () =>
      html`<div @click=${() => (this.histograma_show = false)}>BACK</div>`;

    let fecha_date_selected = this.seleccion
      ? parse(this.seleccion.fecha, "yyyy-MM-dd", new Date())
      : new Date();

    return html`
      <div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvas-lote-ndvi"
        aria-labelledby="offcanvas-campo-header"
        data-bs-backdrop="false"
      >
        <div class="offcanvas-header">
          ${this.histograma_show ? back_button() : null}
          <h5 class="offcanvas-title">Índices</h5>

          <div
            class="btn btn-info"
            @click=${() => {
              this.escala_dinamica = !this.escala_dinamica;
            }}
          >
            ${this.escala_dinamica
              ? "Ver en Escala Fija"
              : "Ver en Escala Dinámica"}
          </div>

          <button
            type="button"
            class="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            @click=${this.close}
            aria-label="Close"
          ></button>
        </div>

        ${this.histograma_show
          ? html`
              <!--Histograma-->
              <div class="offcanvas-body container-fluid">
                <div id="my_dataviz"></div>
                <p>
                  <label># Particiones</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="10"
                    value="50"
                    id="nBin"
                  />
                </p>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  class="form-range"
                  id="ambientacion"
                />
              </div>
            `
          : html` <!--Imágenes-->
              <div class="offcanvas-body container-fluid">
                <div class="row">
                  <vaadin-combo-box
                    id="indice-combo"
                    class="py-0"
                    label="Seleccione Índice Espectral"
                    item-label-path="nombre"
                    item-value-path="value"
                    .selectedItem=${this.indice}
                    .items="${lista_indices}"
                    @selected-item-changed=${(e) => {
                      this.indice = e.detail.value;
                    }}
                  ></vaadin-combo-box>

                  <div class="row mx-auto">
                    ${this.seleccion
                      ? html`<a
                            class="btn btn-primary btn-sm col col-3 m-1"
                            href=""
                            download="ndvi.png"
                            >&#11015;&#65039; PNG</a
                          >
                          <a
                            class="btn btn-primary btn-sm col col-3 m-1"
                            @click=${this.geoblaze_to_excel}
                            >&#11015;&#65039; XLS</a
                          >
                          <a
                            class="btn btn-primary btn-sm col m-1"
                            @click=${this.histograma}
                            >&#128202; Histograma</a
                          > `
                      : null}
                  </div>
                </div>
                <div class="row">
                  ${this.seleccion
                    ? html`
                        <div class="">
                          <h5 class="mb-1">
                            Selección
                            <strong
                              >${format(
                                this.seleccion.fecha,
                                "d 'de' MMMM yyyy",
                                {
                                  locale: es,
                                }
                              )}
                            </strong>
                          </h5>
                          <p class="mb-1">
                            Media:
                            ${this.seleccion.stats[
                              this.indice.banda
                            ].mean.toFixed(2)}
                          </p>
                          <p class="mb-1">
                            Mínimo:
                            ${this.seleccion.stats[
                              this.indice.banda
                            ].min.toFixed(2)}
                          </p>
                          <p class="mb-1">
                            Máximo:
                            ${this.seleccion.stats[
                              this.indice.banda
                            ].max.toFixed(2)}
                          </p>
                        </div>
                      `
                    : null}
                </div>

                <div class="row overflow-auto">
                  <div class="row mb-1"></div>
                  <!--CARDS con observaciones-->
                  ${this.lista_georasters?.map(({ fecha, georaster }) => {
                    let fecha_date = parse(fecha, "yyyy-MM-dd", new Date());

                    return html`<observacion-card
                      .fecha=${fecha_date}
                      .indice=${this.indice}
                      .escala_dinamica=${this.escala_dinamica}
                      .lote_geojson=${this.lote_doc}
                      .geoblaze_raster=${georaster}
                    ></observacion-card>`;
                  })}
                </div>
              </div>`}
      </div>

      <leyenda-ndvi
        .escala=${this.escala_dinamica ? "dinamica" : "fija"}
      ></leyenda-ndvi>
    `;
  }
}

//                            <!-- <p class="card-text">${this.nubosidad(geoblaze.stats(georaster,this.lote_doc))}</p> -->

customElements.define("ndvi-offcanvas", NdviOffcanvas);

declare global {
  interface HTMLElementTagNameMap {
    "ndvi-offcanvas": NdviOffcanvas;
  }
}
