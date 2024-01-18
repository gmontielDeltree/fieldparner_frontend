import { GeoTIFFImage, ReadRasterResult, TypedArray } from "geotiff";
import { CanvasSource, Map, MapMouseEvent, Popup } from "mapbox-gl";
import { fromUrl } from "geotiff";
import { plot as Pplot } from "plotty";



function transform(a: number, b: number, M: number[], roundToInt = false) {
  const round = (v: number) => (roundToInt ? v | 0 : v);
  return [round(M[0] + M[1] * a + M[2] * b), round(M[3] + M[4] * a + M[5] * b)];
}

export const tif_identify = (
  long: number,
  lat: number,
  image: GeoTIFFImage,
  rasters: ReadRasterResult
) => {
  // Construct the WGS-84 forward and inverse affine matrices:
  const { ModelPixelScale: s, ModelTiepoint: t } = image.fileDirectory;
  let [sx, sy, sz] = s;
  let [px, py, k, gx, gy, gz] = t;
  sy = -sy; // WGS-84 tiles have a "flipped" y component

  const pixelToGPS = [gx, sx, 0, gy, 0, sy];
  //   console.log(`pixel to GPS transform matrix:`, pixelToGPS);

  const gpsToPixel = [-gx / sx, 1 / sx, 0, -gy / sy, 0, 1 / sy];
  //   console.log(`GPS to pixel transform matrix:`, gpsToPixel);

  // Convert a GPS coordinate to a pixel coordinate in our tile:
  const [gx1, gy1, gx2, gy2] = image.getBoundingBox();
  if(long<gx1 || long>gx2){
    return NaN
  }
  //   const lat = lerp(gy1, gy2, Math.random());
  //   const long = lerp(gx1, gx2, Math.random());
  //   console.log(
  //     `Looking up GPS coordinate (${lat.toFixed(6)},${long.toFixed(6)})`
  //   );

  const [x, y] = transform(long, lat, gpsToPixel, true);
  //   console.log(`Corresponding tile pixel coordinate: [${x}][${y}]`);

  // Finally, retrieve the elevation associated with this pixel's geographic area:
  //   const rasters = await image.readRasters();
  const { width, [0]: raster} = rasters;
  const elevation: number | undefined = (raster as TypedArray)[x + y * width];
  //   console.log(
  //     `The elevation at (${lat.toFixed(6)},${long.toFixed(6)}) is ${elevation}m`
  //   );
  return elevation;
};


export const showPopupOnMove = (
  map: Map,
  valfn: (lng: number, lat: number) => number,
  prev_handler: MouseEventHandler
) => {
  let timer: any;

  let popup = new Popup();

  const show_popup = (e: MapMouseEvent) => {

    let value = valfn(e.lngLat.lng, e.lngLat.lat);

    if (value === undefined || isNaN(value)) {
      popup.remove();
      return;
    }

    // console.log("EVENT mousemove", e, value);
    // map.getCanvas().style.cursor = 'pointer';
    popup
      .setLngLat(e.lngLat)
      .setHTML("Pixel value: " + value?.toFixed(2))
      .addTo(map);
  };

  // map._mis_handlers = {"popup", }
  const mousemove_handler = (e : MapMouseEvent) => {
    popup.setLngLat(e.lngLat);
    clearTimeout(timer);
    timer = setTimeout(() => show_popup(e), 20);
  };

  map.off("mousemove",prev_handler );
  console.log("listeners added");
  map.on("mousemove", mousemove_handler);
  return mousemove_handler
};

export const showCanvasOnMap = (
  map: Map,
  canvas: HTMLCanvasElement,
  coordenadas: number[][],
  layer_id: string
) => {
  let source = map.getSource(layer_id) as CanvasSource;
  if (source === undefined) {
    map.addSource(layer_id, {
      type: "canvas",
      canvas: canvas,
      coordinates: coordenadas,
    });

    source = map.getSource(layer_id) as CanvasSource;
  }
  source.canvas = canvas;
  source.setCoordinates(coordenadas);

  if (map.getLayer(layer_id) === undefined) {
    map.addLayer({
      id: layer_id,
      type: "raster",
      source: layer_id,
      paint: {
        "raster-fade-duration": 0,
        "raster-resampling": "nearest",
      },
    });
  }
};


export const mostrarTIFEnMapa = async (
  url: string,
  map: Map,
  colormap: string,
  // prev_handlers: MouseEventHandler[]
) => {
  const tiff = await fromUrl(url);
  const image = await tiff.getImage();
  const data = await image.readRasters();
  console.log("DATA TIFF", data);

  const canvas = document.createElement("canvas");

  const plot = new Pplot({
    canvas,
    data: data[0],
    width: image.getWidth(),
    height: image.getHeight(),
    domain: [-1, 1],
    colorScale: colormap,
  });
  plot.render();

  const [gx1, gy1, gx2, gy2] = image.getBoundingBox();
  let coor = [
    [gx1, gy1],
    [gx2, gy1],
    [gx2, gy2],
    [gx1, gy2],
  ].reverse();
  // console.log("COORDINATES",coor)

  showCanvasOnMap(map, canvas, coor, "indice-espectral");

  map._myMouseHandler = showPopupOnMove(map, (lng, lat) => tif_identify(lng, lat, image, data),  map._myMouseHandler);
};


export const removeIndicesLayersSources = (map : Map) =>{ 
  map.removeLayer("indice-espectral")
  map.removeSource("indice-espectral")
}

export const removeEventHandlers = (map : Map) =>{
  map._myMouseHandler ? map.off("mousemove",map._myMouseHandler) : null
}


export function histogram(data, size) {
  let min = Infinity;
  let max = -Infinity;

  for (const item of data) {
      if(isNaN(item)) continue;
      if (item < min) min = item;
      else if (item > max) max = item;
  }


  const bins = Math.ceil((max - min ) / size);

  const histogram = new Array(bins).fill(0);
  let limits = new Array(bins).fill(0).map((l,i) => i * size + min);

  console.log("MAX MMIN", max , min, limits)


  for (const item of data) {
    if(isNaN(item)) continue;

      histogram[Math.floor((item - min) / size)]++;
  }

  return [histogram, limits];
}



export const renderCanvas = (data_og : number[], canvas : HTMLCanvasElement, width, height, rangos, colors) => {
  console.log("renderCanvas",data_og,canvas, width, height, rangos, colors);

  let contextRaster = canvas.getContext("2d");

  var id = contextRaster?.createImageData(width,height);
  var data = id.data;
  console.log("data", data)
  var pos = 0;
  for(var j = 0; j<height; j++){
    for(var i = 0; i<width; i++){

        let value = data_og[j*width+i];

        let extended_range = [...rangos,1];

        // let color = colors[value]

        var alpha = 200;
        if (isNaN(value)){
          alpha = 0;
        }
        
        data[pos]   = 255
        data[pos+1]   = 0;
        data[pos+2]   = 0;
        data[pos+3]   = alpha;
        pos = pos + 4
      
    }
  }
  
  contextRaster?.putImageData( id, 0, 0);

}