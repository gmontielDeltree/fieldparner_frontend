import centroid from "@turf/centroid";

const googleMapsLinkGoTo = (lote_doc) => {
  let centroide = centroid(lote_doc);
  let latitud = centroide.geometry.coordinates[1];
  let longitud = centroide.geometry.coordinates[0];
  let link_template = `https://google.com/maps?q=${latitud},${longitud}`;
  return link_template;
};

export { googleMapsLinkGoTo };
