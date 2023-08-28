import { GeoTIFFImage, ReadRasterResult } from "geotiff";
import { CanvasSource, Map, Popup } from "mapbox-gl";

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
  //   const [gx1, gy1, gx2, gy2] = image.getBoundingBox();
  //   const lat = lerp(gy1, gy2, Math.random());
  //   const long = lerp(gx1, gx2, Math.random());
  //   console.log(
  //     `Looking up GPS coordinate (${lat.toFixed(6)},${long.toFixed(6)})`
  //   );

  const [x, y] = transform(long, lat, gpsToPixel, true);
  //   console.log(`Corresponding tile pixel coordinate: [${x}][${y}]`);

  // Finally, retrieve the elevation associated with this pixel's geographic area:
  //   const rasters = await image.readRasters();
  const { width, [0]: raster } = rasters;
  const elevation: number | undefined = raster[x + y * width];
  //   console.log(
  //     `The elevation at (${lat.toFixed(6)},${long.toFixed(6)}) is ${elevation}m`
  //   );
  return elevation;
};

export const showPopupOnMove = (
  map: Map,
  valfn: (lng: number, lat: number) => number
) => {
  let popup = new Popup();
  let timer: any;

  const show_popup = (e) => {
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

  const mousemove_handler = (e) => {
    popup.setLngLat(e.lngLat);
    clearTimeout(timer);
    timer = setTimeout(() => show_popup(e), 20);
  };

  console.log("listeners added");
  map.off("mousemove", mousemove_handler);
  map.on("mousemove", mousemove_handler);
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
      },
    });
  }
};
