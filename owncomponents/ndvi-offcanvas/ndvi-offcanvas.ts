import { LitElement, html, unsafeCSS } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import PouchDB from "pouchdb";
import { hashMessage, layer_visibility } from "../helpers";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { property, state } from "lit/decorators.js";
import { ImageSource, Map, MapMouseEvent, Popup } from "mapbox-gl";
import { isThisSecond, formatDistanceToNow, parse, format } from "date-fns";
import es from "date-fns/locale/es";
import geoblaze from "geoblaze";
import * as d3 from "d3";

import "./leyenda";
import { utils, writeFile } from "xlsx";
import { D3GeoblazeOnMapbox, drawGeotiffOnMap } from "./ndvi-functions";

const img_bucket_url =
  "https://testbucketgarrapollo.s3.us-south.cloud-object-storage.appdomain.cloud/";

export class NdviOffcanvas extends LitElement {
  @property()
  map: Map;

  @property()
  ndvi_db: PouchDB.Database;

  @property()
  lote_doc: any;

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
  ambientes_raster :  any;

  @state()
  histograma_show: boolean = false;

  constructor() {
    super();
    this.ndvi_db = new PouchDB(
      "https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/ndvi"
    );
  }

  static override styles = unsafeCSS(bootstrap);

  firstUpdated() {
    this.offcanvas = new Offcanvas(
      this.shadowRoot.getElementById("offcanvas-lote-ndvi")
    );

    this.shadowRoot
      .getElementById("offcanvas-lote-ndvi")
      .addEventListener("hidden.bs.offcanvas", () => {
        layer_visibility(this.map, "campos", true);
        layer_visibility(this.map, "campos_border", true);
        layer_visibility(this.map, "lotes", false);
        layer_visibility(this.map, "lotes_border", false);
        layer_visibility(this.map, "nombres_campos", true);

        /* Hide NDVI */
        layer_visibility(this.map, "ndvi-layer", false);
        layer_visibility(this.map, "borde_de_este_lote", false);
        this.map.removeLayer("borde_de_este_lote");
        this.map.removeSource("borde_de_este_lote");
        this.map.removeLayer("ndvi-layer");
        this.map.removeSource("ndvi");

        this.autodestruirme();

        //console.log("CHILDEREN",parent.children)
      });
  }

  show() {
    let geometry = this.lote_doc.geometry;
    let clean_json = JSON.stringify(geometry, Object.keys(geometry).sort());
    hashMessage(clean_json).then((lote_hash) => {
      console.log("Lote Hash", lote_hash);
      // Build y  Mostrar la Galeria
      this.ndvi_db
        .get(lote_hash)
        .then(this.generar_ndvi_gallery)
        .catch((e) => {
          console.log("Error NDVI: Aun no existe ningun registro", e);
          this.offcanvas.hide();
          alert(
            "Error NDVI: Aun no existe ningun registro. Si recien creo el lote espere unos instantes hasta que se recopilen las imagenes satelitales"
          );
          this.autodestruirme();
        });
    });
  }

  autodestruirme() {
    /* Auto destruirme */
    let parent = this.parentElement;
    let children_els = [...parent.children];
    let myself = children_els.find((e) => (e.id = this.id));
    parent.removeChild(myself);
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

  mostrar_en_mapa = async (ob) => {
    let bbox = [
      [ob.bbox.left, ob.bbox.top],
      [ob.bbox.right, ob.bbox.top],
      [ob.bbox.right, ob.bbox.bottom],
      [ob.bbox.left, ob.bbox.bottom],
    ];
    const img_src = this.img_url(ob);

    //layer_visibility(this.map, "lotes_internos", false);
    this.create_or_update_ndvi_source(img_src, bbox);

    /* Hide all polygons */
    layer_visibility(this.map, "campos", false);
    layer_visibility(this.map, "campos_border", false);
    layer_visibility(this.map, "lotes", false);
    layer_visibility(this.map, "lotes_border", false);
    layer_visibility(this.map, "nombres_campos", false);

    /* Inicialmente dibujo el borde */
    if (!this.map.getSource("borde_de_este_lote")) {
      this.map.addSource("borde_de_este_lote", {
        type: "geojson",
        data: this.lote_doc,
      });

      this.map.addLayer({
        id: "borde_de_este_lote",
        type: "fill",
        source: "borde_de_este_lote",
        paint: {
          "fill-color": "#FFFFFF",
          "fill-outline-color": "#FF0000",
          "fill-opacity": 0,
          //    "line-color": "rgb(60, 183, 251)",

          //    "line-width": 4,
        },
      });
    }

    // Crear el NDVI raster
    this.ndvi_geoblaze_raster = await geoblaze.bandArithmetic(
      this.geotiff_url(ob),
      "(a * 2/255)-1"
    );

    console.log("RASTER", this.ndvi_geoblaze_raster);

    this.selected_obs = ob;
  };

  queryNDVIValore(lngLat) {
    return geoblaze.identify(this.ndvi_geoblaze_raster, lngLat);
  }

  create_or_update_ndvi_source = (img_src, bbox) => {
    // If e
    if (this.map.getSource("ndvi")) {
      // EXISTE la source -> Update
      const mySource = this.map.getSource("ndvi") as ImageSource;
      mySource.updateImage({
        url: img_src,
        coordinates: bbox,
      });
    } else {
      // No existe la source crear
      this.map.addSource("ndvi", {
        type: "image",
        url: img_src,
        coordinates: bbox,
      });

      this.map.addLayer({
        id: "ndvi-layer",
        type: "raster",
        source: "ndvi",
        paint: {
          "raster-fade-duration": 0,
          "raster-resampling": "nearest",
        },
      });

      this.map.on("mouseenter", ["borde_de_este_lote"], () => {
        console.log(
          "A mouseenter event occurred on a visible portion of the water layer."
        );

        const popup = new Popup({
          closeButton: false,
        });

        this.map.getCanvas().style.cursor = "pointer";

        const onMouseMove = (e: MapMouseEvent) => {
          //console.log("A mouseover event has occurred.", e.lngLat);
          let ndvi_value = this.queryNDVIValore([e.lngLat.lng, e.lngLat.lat]);
          console.log("NDVI", ndvi_value);
          popup
            .setLngLat(e.lngLat)
            .setText(ndvi_value[0].toFixed(2))
            .addTo(this.map);
        };

        this.map.on("mousemove", ["borde_de_este_lote"], onMouseMove);

        this.map.on("mouseleave", ["borde_de_este_lote"], () => {
          this.map.getCanvas().style.cursor = "";
          popup.remove();
          this.map.off("mousemove", "borde_de_este_lote", onMouseMove);
        });
      });

      console.log("EVENTOS ADDED");
    }

    //this.map.moveLayer("ndvi-layer");
  };

  nubosidad(obs) {
    let info = obs.estadisticas;
    if (info.std < 0.1 && info.media < 0.1) {
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
    if (this.map.getLayer("ndvi-layer")) {
      this.map.setLayoutProperty("ndvi-layer", "visibility", "visible");

      this.map.moveLayer("ndvi-layer");
    }

    let obs = result.obs;
    this.obs = result.obs;

    // Muestro el Offcanvas en si mismo
    this.offcanvas.show();
    this.obs[0] ? this.mostrar_en_mapa(this.obs[0]) : null;
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

    const ambientador = (a, t)=>{
      if(a < -0.99){
        return a;
      }
      return a > t ? 1 : -0.97
    }

    // Initialize with 50 bins
    update(50, 0.5);
    this.ambientes_raster = await geoblaze.rasterCalculator(this.ndvi_geoblaze_raster,(a) => ambientador(a,0.5))

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
        let t1 = this.shadowRoot.getElementById("ambientacion").value
        this.ambientes_raster = await geoblaze.rasterCalculator(this.ndvi_geoblaze_raster,(a) => ambientador(a,t1))
        d3tiff.geoblaze_raster = this.ambientes_raster
        d3tiff.render()
      }
    );

    //console.log("Geoblaze Histo", valid_pixels);

    // Dibujar
    // new d3GeotiffonMap
    // map events -> render
    // drawGeotiffOnMap(this.ndvi_geoblaze_raster,this.map);
    let d3tiff = new D3GeoblazeOnMapbox(this.ambientes_raster, this.map);

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

  render() {
    let back_button = () =>
      html`<div @click=${() => (this.histograma_show = false)}>back</div>`;

    let fecha_date_selected = this.selected_obs
      ? parse(this.selected_obs.fecha, "yyyyMMdd", new Date())
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
          <h5 class="offcanvas-title">NDVI</h5>

          <div
            class="btn btn-info"
            @click=${() => {
              this.escala_dinamica = !this.escala_dinamica;
              this.mostrar_en_mapa(this.selected_obs);
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
            @click=${() => this.offcanvas.hide()}
            aria-label="Close"
          ></button>
        </div>

        ${this.histograma_show
          ? html`
              <!--Histograma-->
              <div class="offcanvas-body small container-fluid row">
                <div id="my_dataviz"></div>
                <p>
                  <label># bins</label>
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
              <div class="offcanvas-body small container-fluid row">
                <div class="row">
                  ${this.selected_obs
                    ? html`<a
                          class="btn btn-primary btn-sm col col-4 m-1"
                          href=${this.img_url(this.selected_obs)}
                          download="ndvi.png"
                          >Descargar Img</a
                        >
                        <a
                          class="btn btn-primary btn-sm col col-4 m-1"
                          @click=${this.geoblaze_to_excel}
                          >Descargar XLS</a
                        >
                        <a
                          class="btn btn-primary btn-sm col col-4 m-1"
                          @click=${this.histograma}
                          >Hist</a
                        > `
                    : null}
                </div>
                <div class="row">
                  ${this.selected_obs
                    ? html`
                        <div class="">
                          <h5 class="mb-1">
                            ${format(fecha_date_selected, "d 'de' MMMM yyyy", {
                              locale: es,
                            })}
                          </h5>
                          <p class="mb-1">
                            Media:
                            ${this.selected_obs.estadisticas.media.toFixed(2)}
                          </p>
                          <p class="mb-1">
                            Mínimo:
                            ${this.selected_obs.estadisticas.min.toFixed(2)}
                          </p>
                          <p class="mb-1">
                            Máximo:
                            ${this.selected_obs.estadisticas.max.toFixed(2)}
                          </p>
                          <p class="mb-1">
                            Desviación Estándar:
                            ${this.selected_obs.estadisticas.std.toFixed(2)}
                          </p>
                        </div>
                      `
                    : null}
                </div>

                <div class="row overflow-auto">
                  <div class="row mb-1"></div>
                  <!--CARDS con observaciones-->
                  ${this.obs.map((ob) => {
                    let fecha_date = parse(ob.fecha, "yyyyMMdd", new Date());
                    return html` <div
                      class="card text-dark bg-light mb-3"
                      @click=${() => this.mostrar_en_mapa(ob)}
                      style="max-width: 540px;"
                    >
                      <div class="row g-0">
                        <div class="col-md-4">
                          <img
                            src="${this.img_url(ob)}"
                            class="img-fluid mt-2 rounded-start"
                            alt="..."
                          />
                        </div>
                        <div class="col-md-8">
                          <div class="card-body">
                            <h5 class="card-title">
                              ${format(fecha_date, "d 'de' MMMM yyyy", {
                                locale: es,
                              })}
                            </h5>
                            <p class="card-text">${this.nubosidad(ob)}</p>
                            <p class="card-text">
                              <small class="text-muted"
                                >${formatDistanceToNow(fecha_date, {
                                  addSuffix: true,
                                  locale: es,
                                })}</small
                              >
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>`;
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

customElements.define("ndvi-offcanvas", NdviOffcanvas);

declare global {
  interface HTMLElementTagNameMap {
    "ndvi-offcanvas": NdviOffcanvas;
  }
}
