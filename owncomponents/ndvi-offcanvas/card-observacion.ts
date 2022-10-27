import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import { format, formatDistanceToNow } from "date-fns";
import es from "date-fns/locale/es";

import geoblaze from "geoblaze";
import * as d3 from "d3";

@customElement("observacion-card")
export class ObservacionCard extends LitElement {
  static override styles = unsafeCSS(bootstrap);

  @property()
  geoblaze_raster: any; // El raster Original

  @property()
  fecha: any;

  @property()
  escala_dinamica: boolean = false;

  @property()
  lote_geojson: any; // Para clippear

  @property()
  indice: { nombre: string; value: string; banda: number };

  @state()
  georaster_indice: any;

  @state()
  canvasColorScale: any;

  @state()
  canvasRaster: any;

  @state()
  render_once : boolean = false;

  async firstUpdated() {
    
    this.georaster_indice = this.geoblaze_raster;

    let container = this.shadowRoot.getElementById("container");

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

    
    this.rerender_img()
    this.render_once = true;
  }

  rerender_img() {
    let container = this.shadowRoot.getElementById("container");

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

    this.georaster_indice = this.geoblaze_raster; //await geoblaze.bandArithmetic(this.geoblaze_raster, "(a * 1)");

    this.generar_canvas_data(
      this.georaster_indice,
      data,
      height,
      width,
      255,
      csImageData
    );

    // Escribir la data en el canvas.
    contextRaster.putImageData(id, 0, 0);

    let img_el = this.shadowRoot.getElementById("img") as HTMLImageElement;
    img_el.src = this.canvasRaster.node().toDataURL();
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
    if (this.render_once && props.has("indice")) {
       this.rerender_img()
    }
    if(this.render_once && props.has('escala_dinamica')){
        this.rerender_img()
    }
  }

  seleccionado(geo) {
    let e = new CustomEvent('obs-selected',{detail: {fecha:this.fecha, georaster: geo, canvas:this.canvasRaster.node()}, bubbles:true, composed:true})
    this.dispatchEvent(e)
  }

  render() {
    return html` <div
      class="card text-dark bg-light mb-3"
      @click=${() => this.seleccionado(this.geoblaze_raster)}
      style="max-width: 540px;"
    >
      <div class="row g-0">
        <div id="container" class="col-md-4">
          <img id="img" src="" class="img-fluid mt-2 rounded-start ms-2" alt="..." />
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">
              ${format(this.fecha, "d 'de' MMMM yyyy", {
                locale: es,
              })}
            </h5>
            <p class="card-text">
              <small class="text-muted"
                >${formatDistanceToNow(this.fecha, {
                  addSuffix: true,
                  locale: es,
                })}</small
              >
            </p>
          </div>
        </div>
      </div>
    </div>`;
  }
}