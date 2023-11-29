import { Map as MapboxMap } from "mapbox-gl";

interface Field {
  _id: string;
  nombre: string;
  campo_geojson: any;
}

export const addFieldsToMap = (map: MapboxMap, fields: Field[]) => {
  if (map) {
    fields.forEach((field) => {
      const fieldGeoJson = field.campo_geojson;
      const fieldName = field.nombre;
      const fieldId = field._id;

      if (fieldGeoJson && fieldGeoJson.geometry) {
        if (map.getSource(fieldId)) {
          map.getSource(fieldId).setData(fieldGeoJson);
        } else {
          map.addSource(fieldId, {
            type: "geojson",
            data: fieldGeoJson
          });
        }

        if (!map.getLayer(`${fieldId}-fill`)) {
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
        }

        if (!map.getLayer(`${fieldId}-line`)) {
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
        }

        if (!map.getLayer(`${fieldId}-label`)) {
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
      }
    });
  }
};
