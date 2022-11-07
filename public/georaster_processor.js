onmessage = function (e) {
  console.log("Worker: Message received from main script", e);
  let d = e.data;

  let raster = d.raster;
  let data = d.data;
  let h = d.h;
  let w = d.w;
  let scaleWidth = s.scaleWidth;
  let csImageData = s.csImageData;
  let banda = s.banda;
  generar_canvas_data(raster, data, h, w, scaleWidth, csImageData, banda);

  //data tiene la imagen

  postMessage(data);
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
