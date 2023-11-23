import { Map as MapboxMap } from "mapbox-gl";

interface Field {
  _id: string;
  nombre: string;
  campo_geojson: any;
}

export const addFieldsToMap = (map: MapboxMap, fields: any[]) => {
  if (map) {
    fields.forEach((field) => {
      const fieldGeoJson = field.campo_geojson;
      const fieldName = field.nombre;

      if (fieldGeoJson && fieldGeoJson.geometry) {
        const fieldId = field._id;

        map.addSource(fieldId, {
          type: "geojson",
          data: fieldGeoJson
        });

        map.addLayer({
          id: `${fieldId}-fill`,
          type: "fill",
          source: fieldId,
          layout: {},
          paint: {
            "fill-color": "red",
            "fill-opacity": 0.3
          }
        });

        map.addLayer({
          id: `${fieldId}-line`,
          type: "line",
          source: fieldId,
          layout: {},
          paint: {
            "line-color": "red",
            "line-width": 2
          }
        });

        map.addLayer({
          id: `${fieldId}-label`,
          type: "symbol",
          source: fieldId,
          layout: {
            "text-field": fieldName,
            "text-size": 16,
            "text-anchor": "center",
            "text-offset": [0, 0.5]
          },
          paint: {
            "text-color": "black"
          }
        });
      }
    });
  }
};
