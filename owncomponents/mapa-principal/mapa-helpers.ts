import { FeatureCollection, GeoJSONObject } from "@turf/helpers";
import { GeoJSONSource, Map } from "mapbox-gl";
import { uuidv7 } from "uuidv7";

 
export const showFeatureCollectionOnMap = (
	map: Map,
	geojson: FeatureCollection,
	layer_id : string = uuidv7(),
      ) => {
	let source = map.getSource(layer_id) as GeoJSONSource;
	if (source === undefined) {
	  map.addSource(layer_id, {
	    type: "geojson",
	  });
      
	  source = map.getSource(layer_id) as GeoJSONSource;
	}
	source.setData(geojson)
      
	if (map.getLayer(layer_id) === undefined) {
	  map.addLayer({
	    id: layer_id,
	    type: "circle",
	    source: layer_id,
	  });
	}
      };