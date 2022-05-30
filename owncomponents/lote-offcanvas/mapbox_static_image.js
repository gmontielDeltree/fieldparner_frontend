import gp from "geojson-precision";
import centroid from "@turf/centroid";
const base_url = (geojson) =>
  `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/static/geojson(${geojson})/auto/500x300?access_token=pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw`;

export const mapbox_static_img = (campo_doc, lote_doc) => {
  console.log("CAMPO", campo_doc);
  console.log("LOTE", lote_doc);

  // Campo GeoJson - Copy
  let campo_geojson = {};
  campo_geojson["type"] = "Feature";
  campo_geojson.geometry = campo_doc.campo_geojson.geometry;
  campo_geojson.properties = { stroke: "#cc0000", "fill-opacity": 0 };

  let not_selected_props = {
    stroke: "#204a87",
    "stroke-width": 2,
    "stroke-opacity": 1,
    fill: "#204a87",
    "fill-opacity": 0.6,
  };

  let selected_props = {
    stroke: "#4e9a06",
    "stroke-width": 4,
    "stroke-opacity": 1,
    fill: "#4e9a06",
    "fill-opacity": 0.6,
  };

  let feature_collection = { type: "FeatureCollection", features: [] };
  feature_collection.features.push(campo_geojson);

  let lotes = [...campo_doc.lotes];
  lotes.map((lote) => {
    let new_lote = { type: "Feature", geometry: {}, properties: {} };
    new_lote.geometry = lote.geometry;
    if (lote.properties.nombre === lote_doc.properties.nombre) {
      // Selecionado
      new_lote.properties = selected_props;
    } else {
      new_lote.properties = not_selected_props;
    }
    feature_collection.features.push(new_lote);
  });

  let center_marker = centroid(lote_doc)
  center_marker.properties =  {
    "marker-size": "medium",
    "marker-symbol": "lighthouse-JP",
    "marker-color": "#ace",
  }

  feature_collection.features.push(center_marker)

  console.log("FCOLL", feature_collection);

  let trimmed = gp.parse(feature_collection, 5);

  let json_str = JSON.stringify(trimmed);
  let json_str_ns = json_str.replace(/\s+/g, "");
  console.log("No space", json_str_ns);
  let encoded = encodeURIComponent(json_str_ns);
  let url = base_url(encoded);
  console.log("URL", url);
  console.log("URL Length", url.length);
  return url;
};
