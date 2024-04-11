import { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import { featureCollection } from '@turf/helpers';

interface Field {
  _id: string;
  nombre: string;
  campo_geojson: any;
}

export const showOnlyFieldBordersAndLotes = (map: MapboxMap,fieldId : string)=>{
  map.setFilter('campos-fill', ["!",[
    "in",
    "id",
    fieldId]])
  // map.setLayoutProperty(`campos-fill`, 'visibility', 'none');
}

export const showOnlyFieldFillAndLotes = (map: MapboxMap)=>{
  map.setLayoutProperty(`campos-fill`, 'visibility', 'visible');
}

export const clearLotesFromMap = (map: MapboxMap)=>{
  let baseName = "lotes"
  if (map.getSource(baseName)) {
    map.getSource(baseName).setData({
      type: "FeatureCollection",
      features: []
    });
  } else {
    map.addSource(baseName, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: []
      }
    });
  }

}

export const addLotesToMap = (map: MapboxMap, field: Field) =>{


  if (map) {

    let fc = featureCollection(field.lotes)
    

  let baseName = "lotes"
    console.log("feature collection",fc)

    if (map.getSource(baseName)) {
      map.getSource(baseName).setData(fc);
    } else {
      map.addSource(baseName, {
        type: "geojson",
        data: fc
      });
    }

  

    if (!map.getLayer(`${baseName}-fill`)) {
      map.addLayer({
        id: `${baseName}-fill`,
        type: "fill",
        source: baseName,
        layout: {},
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.6,
        }
      });
    }

    if (!map.getLayer(`${baseName}-line`)) {
      map.addLayer({
        id: `${baseName}-line`,
        type: "line",
        source: baseName,
        layout: {},
        paint: {
          "line-color": "red",
          "line-width": 2
        }

      });
    }

    if (!map.getLayer(`${baseName}-selected-line`)) {
      map.addLayer({
        id: `${baseName}-selected-line`,
        type: "line",
        source: baseName,
        layout: {},
        paint: {
          "line-color": "blue",
          "line-width": 6,
          'line-dasharray': [0, 4, 3]
        },
        filter:['in',"id",""]
      });
    }

    if (!map.getLayer(`${baseName}-label`)) {
      map.addLayer({
        id: `${baseName}-label`,
        type: "symbol",
        source: baseName,
        layout: {
          "text-field": [
            "format",
            ["upcase", ["get", "nombre"]],
            { "font-scale": 0.8 },
            "\n",
            {},
            //['downcase', ['get', 'Comments']],
            //{ 'font-scale': 0.6 }
          ],
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
  
}


export const setFieldAsSelected  = (map : MapboxMap, fieldId : string) => {
  map.setFilter('campos-selected-line', [
    'in',
    'id',
    fieldId
]);
}

export const unsetFieldAsSelected  = (map : MapboxMap) => {
  map.setFilter('campos-selected-line', [
    'in',
    'id',
    ""
]);
}

/**
 * Agrega los campos pero usando una sola source y 3 layers (fill, line, label)
 * @param map 
 * @param fields 
 */
export const addFieldsToMapSingleLayer = (map: MapboxMap, fields: Field[]) => {



  if (map) {

    let fc = featureCollection(fields.map((f)=>{
    
      return {...f.campo_geojson,properties:{...f.campo_geojson.properties, id:f._id, nombre:f.nombre}}
    }))


    console.log("feature collection",fc)

    if (map.getSource("campos")) {
      map.getSource("campos").setData(fc);
    } else {
      map.addSource("campos", {
        type: "geojson",
        data: fc
      });
    }

    let fieldId = "campos"

    if (!map.getLayer(`${fieldId}-fill`)) {
      map.addLayer({
        id: `${fieldId}-fill`,
        type: "fill",
        source: fieldId,
        layout: {},
        paint: {
          "fill-color": "red",
          "fill-opacity": 0.3
        },
        filter:["!",['in',"id",""]]
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

    if (!map.getLayer(`${fieldId}-selected-line`)) {
      map.addLayer({
        id: `${fieldId}-selected-line`,
        type: "line",
        source: fieldId,
        layout: {},
        paint: {
          "line-color": "blue",
          "line-width": 6,
          'line-dasharray': [0, 4, 3]
        },
        filter:['in',"id",""]
      });
    }

    if (!map.getLayer(`${fieldId}-label`)) {
      map.addLayer({
        id: `${fieldId}-label`,
        type: "symbol",
        source: fieldId,
        layout: {
          "text-field": [
            "format",
            ["upcase", ["get", "nombre"]],
            { "font-scale": 0.8 },
            "\n",
            {},
            //['downcase', ['get', 'Comments']],
            //{ 'font-scale': 0.6 }
          ],
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
  
};

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
