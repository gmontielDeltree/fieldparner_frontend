import { get } from 'lit-translate';
import { Feature } from "@turf/helpers";
import { Router } from "@vaadin/router";
import mapboxgl from "mapbox-gl";
import { listar_depositos } from "../depositos/depositos-funciones";
import { touchEvent } from "../helpers";

export const depositos_layer_init = (map) => {
    map.addSource("depositos-src", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    // Add a circle layer
    map.addLayer({
      id: "depositos-layer",
      type: "circle",
      source: "depositos-src",
      paint: {
        "circle-color": "#fb42bd",
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.on("mouseenter", "depositos-layer", (e) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = "pointer";

      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });

    map.on("mouseleave", "depositos-layer", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });

    map.on(touchEvent, "depositos-layer", (e) => {
      map.getCanvas().style.cursor = "";
      popup.remove();
      Router.go(e.features[0].properties.url);
    });
  }


export const depositos_update = (map)=>{
    return listar_depositos().then((des) => {
        // Filtrar solo los que tengan posicion
        let conpos = des.filter((d) => {
          return d.posicion != null;
        });
  
        let features = conpos.map((d) => {
          let feature: Feature = {
            type: "Feature",
            properties: {
              item: d,
              url: "/deposito/" + d.uuid,
              description: `<strong style='font-size:16px'>${d.nombre}</strong><br><div>${get("deposito")}</div>`,
            },
            geometry: {
              type: "Point",
              coordinates: [d.posicion.lng, d.posicion.lat],
            },
          };
          return feature;
        });
        let src = map.getSource("depositos-src").setData({
          type: "FeatureCollection",
          features: features,
        });
      });
}