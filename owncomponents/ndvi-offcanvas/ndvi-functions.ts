import PouchDB from "pouchdb";
import { hashMessage } from "../helpers";
import { isToday, parse } from "date-fns";
import { is } from "date-fns/locale";
import mapboxgl, { Map } from "mapbox-gl";
//import geoblaze from "geoblaze";
// const geoblaze = import('geoblaze')
let geoblaze;
import('geoblaze').then(({default:a})=>{
  geoblaze=a
})
import * as d3 from "d3";
import * as rastertools from 'raster-marching-squares/build/raster-marching-squares.js'

let ndvi_db = new PouchDB(
  "https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/ndvi"
);

export const ndvi_generado_hoy = async (geometry) => {
  //let geometry = this.lote_doc.geometry;
  try {
    let clean_json = JSON.stringify(geometry, Object.keys(geometry).sort());
    let lote_hash = await hashMessage(clean_json);
    console.log("Lote Hash", lote_hash);
    // Build y  Mostrar la Galeria
    let ndvi_doc = await ndvi_db.get(lote_hash);
    console.log("NDVI DOC", ndvi_doc);

    let fecha_generacion = parse(
      ndvi_doc.ultima_generacion,
      "yyyyMMdd",
      new Date()
    );
    console.log("Fecha Gen", fecha_generacion);

    return isToday(fecha_generacion);
  } catch (e) {
    if (e.error === "not_found") {
      return false; // To force generation
    }
  }
};

// https://bl.ocks.org/shimizu/5f4cee0fddc7a64b55a9
// https://geoexamples.com/d3-raster-tools-docs/code_samples/raster-pixels-page.html
export class D3GeoblazeOnMapbox {
  map: Map;
  geoblaze_raster: any;
  container: any;
  canvas: any;
  context: any;
  csImageData: any;

  canvasRaster: any;
  contextRaster: any;

  invGeoTransform: any;

  id: any;
  data: any;

  scaleWidth = 256;

  constructor(geoblaze_raster, map: Map) {
    this.map = map;
    this.geoblaze_raster = geoblaze_raster;
    // Contenedor de todos los canvas
    this.container = map.getCanvasContainer();

    // Dimensiones del raster
    let width = geoblaze_raster.width; //map.getCanvas().width;
    let height = geoblaze_raster.height; // map.getCanvas().height;

    var geoTransform = [
      geoblaze_raster.xmin,
      geoblaze_raster.pixelWidth,
      0,
      geoblaze_raster.ymax,
      0,
      -1 * geoblaze_raster.pixelHeight,
    ];

    this.invGeoTransform = [
      -geoTransform[0] / geoTransform[1],
      1 / geoTransform[1],
      0,
      -geoTransform[3] / geoTransform[5],
      0,
      1 / geoTransform[5],
    ];

    this.canvas = d3
      .select(this.container)
      .append("canvas")
      .attr("id", "ndvi")
      .attr("width", width)
      .attr("height", height);
    //.style("position", "absolute")
    //.style("z-index", 1);

    this.context = this.canvas.node().getContext("2d");

    //Creating the color scale https://github.com/santilland/plotty/blob/master/src/plotty.js
    var cs_def = {
      positions: [0, 0.25, 0.5, 0.75, 1],
      colors: ["#f5a442", "#92c5de", "#eded26", "#69b3a2", "#69b3a2"],
    };

    var canvasColorScale = d3
      .select(this.container)
      .append("canvas")
      .attr("width", this.scaleWidth)
      .attr("height", 1)
      .style("display", "none");

    var contextColorScale = canvasColorScale.node().getContext("2d");

    var gradient = contextColorScale.createLinearGradient(
      0,
      0,
      this.scaleWidth,
      1
    );

    for (var i = 0; i < cs_def.colors.length; ++i) {
      gradient.addColorStop(cs_def.positions[i], cs_def.colors[i]);
    }
    contextColorScale.fillStyle = gradient;
    contextColorScale.fillRect(0, 0, this.scaleWidth, 1);

    this.csImageData = contextColorScale.getImageData(
      0,
      0,
      this.scaleWidth - 1,
      1
    ).data;

    //Drawing the image. Mismas dimensiones que el canvas del mapa
    this.canvasRaster = d3
      .select(this.container)
      .append("canvas")
      .attr("id", "rasterd3")
      .attr("width", width)
      .attr("height", height)
      .style("display", "none");

    this.contextRaster = this.canvasRaster.node().getContext("2d");

    // id==ImageData
    this.id = this.contextRaster.createImageData(width, height);
    this.data = this.id.data;

    this.generar_canvas_data(height, width);

    //console.log('Data',data)
    //https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#pre-render_similar_primitives_or_repeating_objects_on_an_offscreen_canvas
    this.contextRaster.putImageData(this.id, 0, 0);
    this.context.drawImage(this.canvasRaster.node(), 0, 0);

    this.map.addSource("canvas-source", {
      type: "canvas",
      canvas: this.canvasRaster.node(),
      coordinates: [
        [geoblaze_raster.xmin, geoblaze_raster.ymax],
        [geoblaze_raster.xmax, geoblaze_raster.ymax],
        [geoblaze_raster.xmax, geoblaze_raster.ymin],
        [geoblaze_raster.xmin, geoblaze_raster.ymin],
      ],
    });

    this.map.addLayer({
      id: "radar-layer",
      type: "raster",
      source: "canvas-source",
      paint: {
        "raster-fade-duration": 0,
      },
    });
  }

  generar_canvas_data(h, w) {
    // Indice sobre ImageData data
    var pos = 0;
    // itero sobre cada pixel del canvas que estoy dibujando.
    // 1ro proyecto el pixel del canvas a LatLong
    // 2do LanLong a que pixel corresponde del tiff
    // 3ro extraigo el valor

    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        let value = this.geoblaze_raster.values[0][j][i];

        // c 0-255 dependiendo del valor. 0,99 para dejar en offside al -1
        var c = Math.round((this.scaleWidth - 1) * ((value + 0.99) / 2));
        var alpha = 255;
        if (c < 0 || c > this.scaleWidth - 1) {
          alpha = 0;
        }
        this.data[pos] = this.csImageData[c * 4];
        this.data[pos + 1] = this.csImageData[c * 4 + 1];
        this.data[pos + 2] = this.csImageData[c * 4 + 2];
        this.data[pos + 3] = alpha;
        // }

        // Actualizo el indice, siempre
        pos = pos + 4;
      }
    }
  }


  render_isobands() {
    var intervalsTemp = [-1, 0, 0.25, 1];

    let tempData = this.geoblaze_raster.values[0];

    let geoTransform = [
      this.geoblaze_raster.xmin,
      this.geoblaze_raster.pixelWidth,
      0,
      this.geoblaze_raster.ymax,
      0,
      -1 * this.geoblaze_raster.pixelHeight,
    ];

    var bandsTemp = rastertools.isobands(tempData, geoTransform, intervalsTemp);

    console.log("ISOBANDAS",bandsTemp)
    var colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);

    // bandsTemp.features.forEach(function (d, i) {
    //   this.context.beginPath();
    //   this.context.globalAlpha = 0.8;
    //   this.context.fillStyle = colorScale(intervalsTemp[i]);
    //   //path(d);
    //   this.context.fill();
    // });

  }

  render() {
    this.canvas.style("display", "");

    // Dimensiones del map
    let width = this.geoblaze_raster.width; //this.map.getCanvas().width;
    let height = this.geoblaze_raster.height; //this.map.getCanvas().height;

    this.id = this.contextRaster.createImageData(width, height);
    this.data = this.id.data;

    // Coordenadas geograficas del bbox del raster (el ymin geografico (lat) es el ymax en raster)
    // xmin,ymin es la esquina superior izquierda
    // xmax,ymax es la esquina inferior derecha
    // let xmin = this.geoblaze_raster.xmin
    // let xmax = this.geoblaze_raster.xmax
    // let ymin = this.geoblaze_raster.ymax
    // let ymax = this.geoblaze_raster.ymin

    // let x_start, x_end, y_start, y_end;

    // let p1 = this.map.project({lng:xmin, lat:ymin})
    // x_start = p1.x < 0 ? 0 :  Math.round( p1.x)
    // y_start = p1.y < 0 ? 0 :  Math.round(p1.y)

    // let p2 = this.map.project({lng:xmax, lat:ymax})
    // x_end = p2.x > width ? width :  Math.round(p2.x)
    // y_end = p2.y > height ? height :  Math.round(p2.y)

    // console.log('xs,xe,ys,ys',x_start,x_end,y_start,y_end)

    this.generar_canvas_data(height, width);

    //console.log('Data Updates',this.data)
    this.contextRaster.putImageData(this.id, 0, 0);

    this.context.clearRect(0, 0, width, height);
    this.context.drawImage(this.canvasRaster.node(), 0, 0);
  }

  clear() {
    this.canvas.style("display", "none");
  }
}

/**
 *
 * @param geoblaze_raster Dibuja el raster sobre un canvas superpuesto al mapa.
 * Metodo original desde varias fuentes
 * https://bl.ocks.org/shimizu/5f4cee0fddc7a64b55a9
 * https://geoexamples.com/d3-raster-tools-docs/code_samples/raster-pixels-page.html
 * @param map
 */
export const drawGeotiffOnMap = (geoblaze_raster, map: Map) => {
  // Contenedor de todos los canvas
  var container = map.getCanvasContainer();

  // Dimensiones del map
  let width = map.getCanvas().width;
  let height = map.getCanvas().height;

  var canvas = d3
    .select(container)
    .append("canvas")
    .attr("id", "ndvi")
    .attr("width", width)
    .attr("height", height)
    .style("position", "absolute")
    .style("z-index", 2);

  var context = canvas.node().getContext("2d");

  // Transformaciones para ir desde pixel->LatLong y LatLong -> pixel
  //var geoTransform = [geoblaze_raster.xmin, geoblaze_raster.pixelWidth, 0, geoblaze_raster.ymax, 0, -1*geoblaze_raster.pixelHeight];
  //var invGeoTransform = [-geoTransform[0]/geoTransform[1], 1/geoTransform[1],0,-geoTransform[3]/geoTransform[5],0,1/geoTransform[5]];

  //Creating the color scale https://github.com/santilland/plotty/blob/master/src/plotty.js
  var cs_def = {
    positions: [0, 0.25, 0.5, 0.75, 1],
    colors: ["#0571b0", "#92c5de", "#eded26", "#22e345", "#025411"],
  };
  var scaleWidth = 256;
  var canvasColorScale = d3
    .select(container)
    .append("canvas")
    .attr("width", scaleWidth)
    .attr("height", 1)
    .style("display", "none");
  var contextColorScale = canvasColorScale.node().getContext("2d");
  var gradient = contextColorScale.createLinearGradient(0, 0, scaleWidth, 1);

  for (var i = 0; i < cs_def.colors.length; ++i) {
    gradient.addColorStop(cs_def.positions[i], cs_def.colors[i]);
  }
  contextColorScale.fillStyle = gradient;
  contextColorScale.fillRect(0, 0, scaleWidth, 1);

  var csImageData = contextColorScale.getImageData(
    0,
    0,
    scaleWidth - 1,
    1
  ).data;

  // Tiff data. Uso el mismo nombre que el ejemplo
  // TempData en un array 2d donde la primera dimension es la altura y la segunda el ancho.
  // georaster.values es un array 3d. La primera dimension creo que es la banda.
  let tempData = geoblaze_raster.values[0];

  //Drawing the image. Mismas dimensiones que el canvas del mapa
  var canvasRaster = d3
    .select(container)
    .append("canvas")
    .attr("id", "rasterd3")
    .attr("width", map.getCanvas().width)
    .attr("height", map.getCanvas().height)
    .style("display", "none");

  var contextRaster = canvasRaster.node().getContext("2d");

  // id==ImageData
  var id = contextRaster.createImageData(width, height);
  var data = id.data;

  // Indice sobre ImageData data
  var pos = 0;
  // itero sobre cada pixel del canvas que estoy dibujando.
  // 1ro proyecto el pixel del canvas a LatLong
  // 2do LanLong a que pixel corresponde del tiff
  // 3ro extraigo el valor

  for (var j = 0; j < height; j++) {
    for (var i = 0; i < width; i++) {
      // PixelCanvas a LatLog
      //var pointCoords = projection.invert([i, j]);
      var pointCoords: mapboxgl.LngLatLike = map.unproject([i, j]);

      // LatLong a pixeles del tiff
      // Aca se podria usar geoblaze.identify
      //   var px = Math.round(
      //     invGeoTransform[0] + pointCoords.lng * invGeoTransform[1]
      //   );
      //   var py = Math.round(
      //     invGeoTransform[3] + pointCoords.lat * invGeoTransform[5]
      //   );

      let value = geoblaze.identify(geoblaze_raster, [
        pointCoords.lng,
        pointCoords.lat,
      ]);

      if (value) {
        // Hay un valor valido
        value = value[0];

        //   if (
        //     Math.floor(px) >= 0 &&
        //     Math.ceil(px) < geoblaze_raster.width &&
        //     Math.floor(py) >= 0 &&
        //     Math.ceil(py) < geoblaze_raster.height
        //   ) {

        //var value = tempData[py][px];
        //console.log("Value",py,px, value)

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
      }

      // Actualizo el indice, siempre
      pos = pos + 4;
    }
  }

  //console.log('Data',data)
  contextRaster.putImageData(id, 0, 0);
  context.drawImage(canvasRaster.node(), 0, 0);
};


export const canvas_element_from_geotiff = ()=>{

}