import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { format, formatDistanceToNow, parse } from "date-fns";
import es from "date-fns/locale/es";

import geoblaze from "geoblaze";
import * as d3 from "d3";
import booleanContains from "@turf/boolean-contains";
import { point } from "@turf/helpers";
import { Task, TaskStatus } from "@lit-labs/task";
import bbox from "@turf/bbox";

import PouchDB from "pouchdb";

const img_bucket_url =
  "https://testbucketgarrapollo.s3.us-south.cloud-object-storage.appdomain.cloud/";

const saveOnLocalDB = (url: string, georaster) => {
  let db = new PouchDB("indices_espectrales");
  // let attachment = new Blob(georaster_values);

  // let doc = {
  //   id: url,
  //   _attachments: {
  //     values: { content_type: "application/octet-stream", data: attachment },
  //   },
  // };

  let doc = {
    _id: url,
    json_object: JSON.stringify(georaster),
  };
  db.put(doc);
};

const isOnDB = async (url) => {
  let db = new PouchDB("indices_espectrales");
  let d = await db.allDocs({
    keys: [url],
    include_docs: true,
    // attachments: true,
  });
  if (d.total_rows) {
    console.log("Existe un procesamiento ", d.rows[0]);
    let doc = d.rows[0];
    return JSON.parse(doc.doc.json_object);
  } else {
    return;
  }
};

const fetch_georaster = async (fecha_obj, uuid, lote_doc) => {
  let bboxs = bbox(lote_doc);
  let fecha = format(fecha_obj, "yyyy-MM-dd");
  let url_tentativa = img_bucket_url + uuid + "_" + fecha + ".geotiff";

  // // Buscar En DB
  // let t = await isOnDB(url_tentativa);
  // if (t) {
  //   return t;
  // }

  // console.log("fecha uuid bboz", fecha, uuid, bboxs);
  // Test URL
  //url_tentativa = "/aaaaa_20220418.geotiff";
  // parse array buffer
  try {
    const response = await fetch(url_tentativa);
    //https://towardsdev.com/how-to-handle-404-500-and-more-using-fetch-api-in-javascript-f4e301925a51
    if (!response.ok) {
      if (response.status == 404) {
        console.log("404 -> Generando...");
        let response_gen = await call_generator(fecha, uuid, bboxs);
        if (!response_gen.ok) {
          throw Error(response_gen.statusText);
        }
        const arrayBuffer = await response_gen.arrayBuffer();
        const georaster = await geoblaze.parse(arrayBuffer);

        clip_raster(georaster, lote_doc);
        // Georaster is clipped
        return georaster;
      }
    }
    const arrayBuffer = await response.arrayBuffer();
    const georaster = await geoblaze.parse(arrayBuffer);
    clip_raster(georaster, lote_doc);
    return georaster;
  } catch (e) {
    console.log("ERROR al FETCH", e);
  }
};

const clip_raster = (georaster, geojson) => {
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
        for (var banda = 0; banda < georaster.numberOfRasters - 1; banda++) {
          /* for each band!! */
          georaster.values[banda][j][i] = -9999;
        }
      }
    }
  }
};

const call_generator = async (fecha, uuid, bboxs) => {
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
};

@customElement("observacion-card")
export class ObservacionCard extends LitElement {
  static override styles = unsafeCSS(bootstrap);

  @state()
  geoblaze_raster: any; // El raster Original

  @property()
  fecha: any;

  @property()
  escala_dinamica: boolean = false;

  @property()
  lote_geojson: Object; // Para clippear

  @property()
  uuid: string;

  @property()
  indice: { nombre: string; value: string; banda: number };

  // @state()
  // georaster_indice: any;

  @state({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  canvasColorScale: any;

  @state({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  canvasRaster: any;

  @state()
  render_once: boolean = false;

  @state()
  img_data_url: string = "";

  @state({
    hasChanged(newVal, oldVal) {
      return false;
    },
  })
  worker: Worker;

  private _loadDataTask = new Task(
    this,
    async ([fecha, uuid, lote_doc]) => {
      // Esta funcion se ejectuta cada vez que haya cambios en los argumentos
      let fecha_date = parse(fecha, "yyyy-MM-dd", new Date());
      let georaster = await fetch_georaster(fecha_date, uuid, lote_doc);
      return georaster;
    },
    () => [this.fecha, this.uuid, this.lote_geojson] // Funcion que devuelve un array de argumentos.
    // tener en cuenta cuando estos argumentos se actualizan. Cuando son referencias a objetos, cuando son valores literales
    // cuando son objectos que son el resultado de una funcion (el valor puede ser el 'mismo' pero al ser objetos nuevos, el argumento cambia).
  );

  addCanvas() {
    //let container = this.shadowRoot.getElementById("container");
    // No hace falta agregarlo al DOM
    let container = document.createElement("div");

    //console.log("Container del Canvas",container)
    // Dimensiones del raster
    let width = this.geoblaze_raster.width;
    let height = this.geoblaze_raster.height;

    // Escala de color. No se muestra pero se usa para obtener
    // una matriz con el mapeo de colores
    this.canvasColorScale = d3
      .select(container)
      .append("canvas")
      .attr("width", 255)
      .attr("height", 1)
      .style("display", "none");

    //Drawing the image. Mismas dimensiones que el canvas del mapa
    this.canvasRaster = d3
      .select(container)
      .append("canvas")
      .attr("id", "rasterd3")
      .attr("width", width)
      .attr("height", height)
      .style("display", "none");
  }

  setEscalasAndPrepare() {
    // Dimensiones del raster
    let width = this.geoblaze_raster.width;
    let height = this.geoblaze_raster.height;

    //Creating the color scale https://github.com/santilland/plotty/blob/master/src/plotty.js
    let cs;

    if (this.escala_dinamica) {
      cs = ["#001aff", "#ff1100", "#25a305"];
    } else {
      cs = ["#ff0000", "#ffff0d", "#1aff00"];
    }

    var cs_def = {
      positions: [0, 0.5, 1],
      colors: cs,
    };

    var contextColorScale = this.canvasColorScale.node().getContext("2d");

    var gradient = contextColorScale.createLinearGradient(0, 0, 255, 1);

    for (var i = 0; i < cs_def.colors.length; ++i) {
      gradient.addColorStop(cs_def.positions[i], cs_def.colors[i]);
    }
    contextColorScale.fillStyle = gradient;
    contextColorScale.fillRect(0, 0, 255, 1);

    let csImageData = contextColorScale.getImageData(0, 0, 255 - 1, 1).data;

    let contextRaster = this.canvasRaster.node().getContext("2d");

    // id==ImageData
    let id = contextRaster.createImageData(width, height);
    let data = id.data;
  }
  rerender_img() {
    //let container = this.shadowRoot.getElementById("container");

    // Dimensiones del raster
    let width = this.geoblaze_raster.width;
    let height = this.geoblaze_raster.height;

    //Creating the color scale https://github.com/santilland/plotty/blob/master/src/plotty.js
    let cs;

    if (this.escala_dinamica) {
      cs = ["#001aff", "#ff1100", "#25a305"];
    } else {
      cs = ["#ff0000", "#ffff0d", "#1aff00"];
    }

    var cs_def = {
      positions: [0, 0.5, 1],
      colors: cs,
    };

    var contextColorScale = this.canvasColorScale.node().getContext("2d");

    var gradient = contextColorScale.createLinearGradient(0, 0, 255, 1);

    for (var i = 0; i < cs_def.colors.length; ++i) {
      gradient.addColorStop(cs_def.positions[i], cs_def.colors[i]);
    }
    contextColorScale.fillStyle = gradient;
    contextColorScale.fillRect(0, 0, 255, 1);

    let csImageData = contextColorScale.getImageData(0, 0, 255 - 1, 1).data;

    let contextRaster = this.canvasRaster.node().getContext("2d");

    // id==ImageData
    let id = contextRaster.createImageData(width, height);
    let data = id.data;

    //this.georaster_indice = this.geoblaze_raster; //await geoblaze.bandArithmetic(this.geoblaze_raster, "(a * 1)");

    this.generar_canvas_data(
      this.geoblaze_raster,
      data,
      height,
      width,
      255,
      csImageData
    );

    // Escribir la data en el canvas.
    contextRaster.putImageData(id, 0, 0);

    //let img_el = this.shadowRoot.getElementById("img") as HTMLImageElement;
    //img_el.src = this.canvasRaster.node().toDataURL();
    this.img_data_url = this.canvasRaster.node().toDataURL();
  }

  generar_canvas_data(raster, data, h, w, scaleWidth, csImageData) {
    // Indice sobre ImageData data
    var pos = 0;
    // itero sobre cada pixel del canvas que estoy dibujando.
    // 1ro proyecto el pixel del canvas a LatLong
    // 2do LanLong a que pixel corresponde del tiff
    // 3ro extraigo el valor

    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        let value = raster.values[this.indice.banda][j][i];

        // c 0-255 dependiendo del valor. 0,99 para dejar en offside al -1
        var c = Math.round((scaleWidth - 1) * ((value + 0.99) / 2));
        var alpha = 255;
        if (c < 0 || c > scaleWidth - 1) {
          alpha = 0;
        }
        data[pos] = csImageData[c * 4];
        data[pos + 1] = csImageData[c * 4 + 1];
        data[pos + 2] = csImageData[c * 4 + 2];
        data[pos + 3] = alpha;
        // }

        // Actualizo el indice, siempre
        pos = pos + 4;
      }
    }
  }

  async willUpdate(props) {
    if (
      !this.render_once &&
      this._loadDataTask.status === TaskStatus.COMPLETE
    ) {
      //console.log("Load Georaster task Completed", this.fecha,this._loadDataTask.status )
      this.geoblaze_raster = this._loadDataTask.value;
      this.addCanvas();
      this.rerender_img();
      this.render_once = true;
    }

    if (this.render_once && props.has("indice")) {
      this.rerender_img();
    }
    if (this.render_once && props.has("escala_dinamica")) {
      this.rerender_img();
    }
  }

  seleccionado(geo) {
    let e = new CustomEvent("obs-selected", {
      detail: {
        fecha: parse(this.fecha, "yyyy-MM-dd", new Date()),
        georaster: geo,
        canvas: this.canvasRaster.node(),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(e);
  }

  render() {
    let fecha_obk = parse(this.fecha, "yyyy-MM-dd", new Date());
    let fecha_card = format(fecha_obk, "d 'de' MMMM yyyy", {
      locale: es,
    });

    let hace_tiempo = formatDistanceToNow(fecha_obk, {
      addSuffix: true,
      locale: es,
    });

    return html`${this._loadDataTask.render({
      pending: () => html`<div class="spinner-border text-success" role="status">
      <span class="visually-hidden">Loading...</span>
    </div> Procesando Imagen...`,
      error: () => html`Error al fetching`,
      complete: (georaster) => html`<div
        class="card text-dark bg-light mb-3"
        @click=${() => this.seleccionado(georaster)}
        style="max-width: 540px;"
      >
        <div class="row g-0 my-1">
          <div id="container" class="col mx-auto d-flex justify-content-center">
            <img
              id="img"
              width="50"
              height="50"
              src=${this.img_data_url}
              class="img-fluid img-thumbnail rounded-start"
              alt="..."
            />
          </div>
          <div class="col-8">
            <div class="card-body">
              <h5 class="card-title">${fecha_card}</h5>
              <p class="card-text">
                <small class="text-muted">${hace_tiempo}</small>
              </p>
            </div>
          </div>
        </div>
      </div>`,
    })} `;
  }
}
