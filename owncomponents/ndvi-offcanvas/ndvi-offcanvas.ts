import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import { get_lote_doc, layer_visibility } from "../helpers";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { property, state } from "lit/decorators.js";
import {
  CanvasSource,
  GeoJSONSource,
  MapMouseEvent,
  Popup,
  Source,
} from "mapbox-gl";
import { parse, format } from "date-fns";
import es from "date-fns/locale/es";

import * as d3 from "d3";
import "./card-observacion";

import "./leyenda";
// import { utils, writeFile } from "xlsx";
let read, writeFile, utils;
import("xlsx").then((mod) => {
  read = mod.read;
  writeFile = mod.writeFile;
  utils = mod.utils;
});

import { StateController } from "@lit-app/state";
import gbl_state from "../state.js";
import { Router } from "@vaadin/router";
import bbox from "@turf/bbox";
import { repeat } from "lit/directives/repeat.js";

//import geoblaze from "geoblaze";
let geoblaze;
import("geoblaze").then(({ default: a }) => {
  geoblaze = a;
});

const img_bucket_url =
  "https://testbucketgarrapollo.s3.us-south.cloud-object-storage.appdomain.cloud/";

const lista_indices = [
  { nombre: "NDVI", value: "ndvi", banda: 0 },
  // { nombre: "ReCL", value: "recl", banda: 1 },
  { nombre: "NDRE", value: "ndre", banda: 1 },
  { nombre: "NDMI", value: "ndmi", banda: 2 },
  { nombre: "MSAVI", value: "msavi", banda: 3 },
];

export class NdviOffcanvas extends LitElement {
  //@property()
  //map: Map;

  bindState = new StateController(this, gbl_state);

  @property({ type: Object })
  location = gbl_state.router.location;

  @state()
  lote_doc: any;

  @state()
  indice: any = lista_indices[0];

  @state()
  lote_uuid: string;

  // @state()
  // selected_obs: any;

  @state()
  escala_dinamica: boolean = false;

  @state({
    hasChanged(newVal: Offcanvas, oldVal: Offcanvas) {
      return false;
    },
  })
  offcanvas: Offcanvas;

  // @state()
  // ndvi_geoblaze_raster: any;

  @state()
  ambientes_raster: any;

  @state()
  fechas: string[] = [];

  // @state()
  // lista_georasters: {fecha:string, georaster:Object, pending: boolean};

  @state()
  histograma_show: boolean = false;

  @state()
  seleccion: { fecha: any; stats: any };

  @state()
  selected_georaster: any;

  @state()
  cuanto_muestro = 5;

  private selected_canvas: HTMLCanvasElement;

  static override styles = unsafeCSS(bootstrap);

  item_selected = async (e: CustomEvent) => {
    console.log("Seleccion de Observacion");

    this.enabledMapEvent(false);

    let geoblaze_raster = e.detail.georaster;
    this.selected_georaster = geoblaze_raster;
    this.selected_canvas = e.detail.canvas;

    if (gbl_state.map.getSource("canvas-source")) {
      let s = gbl_state.map.getSource("canvas-source") as CanvasSource;
      console.log("Souce Existe", s);
      s.canvas = e.detail.canvas;
      s.setCoordinates([
        [geoblaze_raster.xmin, geoblaze_raster.ymax],
        [geoblaze_raster.xmax, geoblaze_raster.ymax],
        [geoblaze_raster.xmax, geoblaze_raster.ymin],
        [geoblaze_raster.xmin, geoblaze_raster.ymin],
      ]);
    }

    /* stats de la seleccion */
    this.seleccion = {
      fecha: e.detail.fecha,
      stats: await geoblaze.stats(geoblaze_raster, this.lote_doc),
    };
    console.log("STATS", this.seleccion, await this.seleccion);
    this.enabledMapEvent(true);

  };

  async get_fechas() {
    let bboxs = encodeURIComponent(JSON.stringify(bbox(this.lote_doc)));
    //https://us-south.functions.appdomain.cloud/api/v1/web/2659fadf-b282-4e49-b323-bf8cd87cd5e6/default/indicesdates?dates=2022-04-01%2F2022-11-01&bbox=%5B-59.08562672796121%2C-35.20733062337166%2C-59.07974430745857%2C-35.20304176165523%5D
    let fechas = encodeURIComponent("2022-04-01/2040-01-01");
    let r = await fetch(
      "https://us-south.functions.appdomain.cloud/api/v1/web/2659fadf-b282-4e49-b323-bf8cd87cd5e6/default/indicesdates?dates=" +
        fechas +
        "&bbox=" +
        bboxs
    );
    return r.json();
  }

  async firstUpdated() {
    this.offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-lote-ndvi")
    );

    this.offcanvas.show();
    /* Esto deberia ocurrir si map y db estan caragado */

    this.shadowRoot
      .getElementById("offcanvas-lote-ndvi")
      .addEventListener("hide.bs.offcanvas", () => {
        this.enabledMapEvent(false);

        // Reestablecer Mapa
        layer_visibility(gbl_state.map, "campos", true);
        layer_visibility(gbl_state.map, "campos_border", true);
        layer_visibility(gbl_state.map, "lotes", false);
        layer_visibility(gbl_state.map, "lotes_border", false);
        layer_visibility(gbl_state.map, "nombres_campos", true);
        //layer_visibility(gbl_state.map, "seleccion_lotes", false);
        layer_visibility(gbl_state.map, "seleccion_lotes_fill", false);

        /* Hide NDVI */
        //layer_visibility(gbl_state.map, "ndvi-layer", false);
        layer_visibility(gbl_state.map, "borde_de_este_lote", false);
        layer_visibility(gbl_state.map, "radar-layer", false);
        layer_visibility(gbl_state.map, "frontera_de_este_lote", false);
        gbl_state.map.getSource("canvas-source").pause();
        // gbl_state.map.removeLayer("borde_de_este_lote");
        // gbl_state.map.removeLayer("frontera_de_este_lote");
        // gbl_state.map.removeSource("borde_de_este_lote");
        // //gbl_state.map.removeLayer("ndvi-layer");
        // //gbl_state.map.removeSource("ndvi");
        // gbl_state.map.removeLayer("radar-layer");
        // gbl_state.map.removeSource("canvas-source");
      });

    this.lote_uuid = this.location.params.uuid as string;
    console.time("Tiempo de carga Indices");
    this.lote_doc = await get_lote_doc(gbl_state.db, this.lote_uuid);
    console.timeLog("Tiempo de carga Indices");
    this.fechas = await this.get_fechas();
    this.fechas.reverse();
    console.timeEnd("Tiempo de carga Indices");
    console.log("FECHAS de Indices", this.fechas);

    this.show();
  }

  async show() {
    this.init_layers();
    this.offcanvas.show();
  }

  geoblaze_to_excel = () => {
    let xmin = this.selected_georaster.xmin;
    let ymax = this.selected_georaster.ymax;
    let pw = this.selected_georaster.pixelWidth;
    let ph = this.selected_georaster.pixelHeight;
    let w = this.selected_georaster.width;
    let h = this.selected_georaster.height;
    console.log("Selected Georaster", this.selected_georaster);
    let array_resultado = [["lat", "lon", "ndvi"]];
    for (let i = 0; i < w; i++) {
      for (let vs = 0; vs < h; vs++) {
        let point = [xmin + pw * i, ymax - ph * vs];
        let n = geoblaze.identify(this.selected_georaster, point);
        if (n && n[0] > -1) {
          array_resultado.push([point[1], point[0], n[0]]);
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
    /* Hide all polygons */
    layer_visibility(gbl_state.map, "campos", false);
    layer_visibility(gbl_state.map, "campos_border", false);
    layer_visibility(gbl_state.map, "lotes", false);
    layer_visibility(gbl_state.map, "lotes_border", false);
    layer_visibility(gbl_state.map, "nombres_campos", false);
    //layer_visibility(gbl_state.map, "seleccion_lotes", false);
    layer_visibility(gbl_state.map, "seleccion_lotes_fill", false);

    /* Inicialmente dibujo el borde */
    let borde_src = gbl_state.map.getSource(
      "borde_de_este_lote"
    ) as GeoJSONSource;
    borde_src.setData(this.lote_doc);

    layer_visibility(gbl_state.map, "borde_de_este_lote", true);
    layer_visibility(gbl_state.map, "frontera_de_este_lote", true);
    layer_visibility(gbl_state.map, "radar-layer", true);
    gbl_state.map.getSource("canvas-source").play();

  };

  queryNDVIValore = (lngLat)=>{
    console.log("selected_georaster", this.selected_georaster);
    return geoblaze.identify(this.selected_georaster, lngLat);
  }

  main_function = (e) => {
    console.log(
      "A mouseenter event occurred on a visible portion of the water layer."
    );

    const popup = new Popup({
      closeButton: false,
    });

    gbl_state.map.getCanvas().style.cursor = "pointer";

    const onMouseMove = (e: MapMouseEvent) => {
      //console.log("A mouseover event has occurred.", e.lngLat);
      let ndvi_value = geoblaze.identify(this.selected_georaster,[e.lngLat.lng, e.lngLat.lat]);
      //console.log("NDVI", ndvi_value);
      popup
        .setLngLat(e.lngLat)
        .setText(ndvi_value[this.indice.banda].toFixed(2))
        .addTo(gbl_state.map);
    };

    gbl_state.map.on("mousemove", ["borde_de_este_lote"], onMouseMove);

    gbl_state.map.on("mouseleave", "borde_de_este_lote", () => {
      gbl_state.map.getCanvas().style.cursor = "";
      popup.remove();
      gbl_state.map.off("mousemove", "borde_de_este_lote", onMouseMove);
    });
  };

  enabledMapEvent(is_enabled) {
    if (is_enabled) {
      console.info("Adding Mouse Enter Event");
      gbl_state.map.on("mouseenter", "borde_de_este_lote", this.main_function);
    } else {
      console.info("Removing Mouse Enter Event");
      gbl_state.map.off("mouseenter","borde_de_este_lote", this.main_function);
    }
  }

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

  async histograma() {
    this.histograma_show = true;
    await this.updateComplete;

    //let h = geoblaze.histogram(this.selected_georaster,null,{ scaleType: "nominal" })
    let pixels: Number[] = geoblaze.get(this.selected_georaster, null, "flat");

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

      // Divisoria
      // For each threshold
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
      this.selected_georaster,
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
          this.selected_georaster,
          (a) => ambientador(a, t1)
        );
        //d3tiff.geoblaze_raster = this.ambientes_raster;
        //d3tiff.render();
      }
    );

    //console.log("Geoblaze Histo", valid_pixels);

    // Dibujar
    // new d3GeotiffonMap
    // map events -> render
    // drawGeotiffOnMap(this.ndvi_geoblaze_raster,gbl_state.map);
    // let d3tiff = new D3GeoblazeOnMapbox(this.ambientes_raster, gbl_state.map);

    // d3tiff.render_isobands();

    // function rerender() {
    //   d3tiff.render();
    // }

    // function clear() {
    //   d3tiff.clear();
    // }

    // //this.map.on("viewreset", rerender);
    // this.map.on("movestart", clear);
    // this.map.on("moveend", rerender);
  }

  close() {
    this.offcanvas.hide();
    Router.go("/");
  }

  helper_indice() {
    let c = this.indice.value;
    if (c === "msavi") {
      return "Los valores de MSAVI van de -1 a 1, donde: -1 a 0.2 indican suelo desnudo; 0.2 a 0.4 es la etapa de germinación de la semilla; 0.4 a 0.6 es la etapa de desarrollo de la hoja. Cuando los valores superan 0,6, ya es hora de aplicar NDVI en su lugar. En otras palabras, la vegetación es lo suficientemente densa como para cubrir el suelo.";
    } else if (c === "ndvi") {
      return "NDVI define valores de -1.0 a 1.0, donde los valores negativos se forman principalmente a partir de nubes, agua y nieve, y los valores cercanos a cero se forman principalmente a partir de rocas y suelo desnudo. Valores muy pequeños (0,1 o menos) de la función NDVI corresponden a áreas vacías de rocas, arena o nieve. Los valores moderados (de 0,2 a 0,3) representan arbustos y praderas, mientras que los valores altos (de 0,6 a 0,8) indican bosques templados y tropicales.";
    } else if (c === "ndre") {
      return "NDRE define valores de -1.0 a 1.0, donde de -1 a 0,2 indican suelo desnudo o un cultivo en desarrollo; 0,2 a 0,6 puede interpretarse como una planta enferma o un cultivo que aún no está maduro; 0,6 a 1 son buenos valores que indican cultivos sanos, maduros y maduros.";
    } else if (c === "ndmi") {
      return "El Índice de humedad de diferencia normalizada (NDMI) detecta los niveles de humedad en la vegetación mediante una combinación de bandas espectrales de infrarrojo cercano (NIR) e infrarrojo de onda corta (SWIR). El NDMI solo puede tener valores entre -1 y 1, lo que lo hace muy fácil. interpretar. El estrés hídrico estaría señalado por los valores negativos que se aproximan a -1, mientras que el +1 puede indicar anegamiento.";
    }
    return "";
  }

  download_png() {
    // Convert the canvas to data
    var image = this.selected_canvas.toDataURL();
    // Create a link
    var aDownloadLink = document.createElement("a");
    // Add the name of the file to the link
    aDownloadLink.download = "indice.png";
    // Attach the data to the link
    aDownloadLink.href = image;
    // Get the code to click the download link
    aDownloadLink.click();
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
                    helper-text=${this.helper_indice()}
                    @selected-item-changed=${(e) => {
                      this.indice = e.detail.value;
                    }}
                  ></vaadin-combo-box>

                  <vaadin-horizontal-layout theme="spacing">
                    ${this.seleccion
                      ? html`<a
                            class="btn btn-primary btn-sm col col-3 m-1"
                            @click=${this.download_png}
                            >&#11015;&#65039; PNG</a
                          >
                          <a
                            class="btn btn-primary btn-sm col col-3 m-1"
                            @click=${this.geoblaze_to_excel}
                            >&#11015;&#65039; XLS</a
                          >`
                      : null}
                  </vaadin-horizontal-layout>
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
                  ${repeat(
                    this.fechas.slice(0, this.cuanto_muestro),
                    (f: string) => f,
                    (fecha, index) => {
                      // let fecha_date = parse(fecha, "yyyy-MM-dd", new Date());

                      return html`<observacion-card
                        .fecha=${fecha}
                        .indice=${this.indice}
                        .escala_dinamica=${this.escala_dinamica}
                        .uuid=${this.lote_uuid}
                        .lote_geojson=${this.lote_doc}
                        @obs-selected=${this.item_selected}
                      ></observacion-card>`;
                    }
                  )}

                  <button
                    class="btn btn-info"
                    @click=${() =>
                      (this.cuanto_muestro = this.cuanto_muestro + 5)}
                  >
                    Ver Más
                  </button>

                  <!-- </div> -->
                </div>
              </div>`}
      </div>

      ${this.histograma_show
        ? null
        : html`<leyenda-ndvi
            .escala=${this.escala_dinamica ? "dinamica" : "fija"}
            .index_value=${this.indice.value}
          ></leyenda-ndvi>`}
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

// ${this.fechas?.map((fecha) => {
//   let fecha_date = parse(fecha, "yyyy-MM-dd", new Date());

//   return html`<observacion-card
//     .fecha=${fecha_date}
//     .indice=${this.indice}
//     .escala_dinamica=${this.escala_dinamica}
//     .uuid=${this.lote_uuid}
//     .lote_geojson=${this.lote_doc}
//     .bbox=${bbox(this.lote_doc)}
//   ></observacion-card>`;
// })}
