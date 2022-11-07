importScripts("https://unpkg.com/@turf/turf@6/turf.min.js");

onmessage = function (e) {
  console.log("Worker: Message received from main script to Clip Georaster", e.data);
  let {
    georaster_values,
    w,
    h,
    xmin,
    ymax,
    pixelWidth,
    pixelHeight,
    numberOfRasters,
    geojson,
  } = e.data;

  clip_raster(
    georaster_values,
    w,
    h,
    xmin,
    ymax,
    pixelWidth,
    pixelHeight,
    numberOfRasters,
    geojson
  );

  //data tiene la imagen

  postMessage(georaster_values);
};

const clip_raster = (
  georaster_values,
  w,
  h,
  xmin,
  ymax,
  pixelWidth,
  pixelHeight,
  numberOfRasters,
  geojson
) => {

  // console.log(
  //   georaster_values,
  //   w,
  //   h,
  //   xmin,
  //   ymax,
  //   pixelWidth,
  //   pixelHeight,
  //   numberOfRasters,
  //   geojson)

  let width = w;
  let height = h;

  for (var j = 0; j < height; j++) {
    for (var i = 0; i < width; i++) {

      let long = i * pixelWidth + xmin;
      let lat = ymax - j * pixelHeight;
      // lat long de este pixel
      let punto = turf.point([long, lat]);
      let is_contained = turf.booleanContains(geojson, punto);
      if (!is_contained) {
        for (var banda = 0; banda < numberOfRasters - 1; banda++) {
          /* for each band!! */
          georaster_values[banda][j][i] = -9999;
        }
      }
    }
  }
};

const generar_canvas_data = (
  raster,
  data,
  h,
  w,
  scaleWidth,
  csImageData,
  banda
) => {
  // Indice sobre ImageData data
  var pos = 0;
  // itero sobre cada pixel del canvas que estoy dibujando.
  // 1ro proyecto el pixel del canvas a LatLong
  // 2do LanLong a que pixel corresponde del tiff
  // 3ro extraigo el valor

  for (var j = 0; j < h; j++) {
    for (var i = 0; i < w; i++) {
      let value = raster.values[banda][j][i];

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
};
