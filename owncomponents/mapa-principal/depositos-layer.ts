import { get } from "lit-translate";
import { Feature } from "@turf/helpers";
import { Router } from "@vaadin/router";
import mapboxgl from "mapbox-gl";
import { listar_depositos } from "../depositos/depositos-funciones";
import { Deposit } from "../../src/types/index";

// export const depositos_layer_init = (map, clickCallback) => {
//   if (!map.getSource("depositos-src")) {
//     map.addSource("depositos-src", {
//       type: "geojson",
//       data: {
//         type: "FeatureCollection",
//         features: [],
//       },
//     });
//   }

//   if (!map.getLayer("depositos-layer")) {
//     // Add a circle layer
//     map.addLayer({
//       id: "depositos-layer",
//       type: "circle",
//       source: "depositos-src",
//       backgroundImage: `url('/centralmeteorologica70_90.webp')`;
//       // paint: {
//       //   "circle-color": "#fb42bd",
//       //   "circle-radius": 8,
//       //   "circle-stroke-width": 2,
//       //   "circle-stroke-color": "#ffffff",
//       // },
//     });

//     // Create a popup, but don't add it to the map yet.
//     const popup = new mapboxgl.Popup({
//       closeButton: false,
//       closeOnClick: false,
//     });

//     map.on("mouseenter", "depositos-layer", (e) => {
//       // Change the cursor style as a UI indicator.
//       // map.getCanvas().style.cursor = "pointer";

//       // Copy coordinates array.
//       const coordinates = e.features[0].geometry.coordinates.slice();
//       const description = e.features[0].properties.description;

//       // Ensure that if the map is zoomed out such that multiple
//       // copies of the feature are visible, the popup appears
//       // over the copy being pointed to.
//       while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
//       }

//       // Populate the popup and set its coordinates
//       // based on the feature found.
//       popup.setLngLat(coordinates).setHTML(description).addTo(map);
//     });

//     map.on("mouseleave", "depositos-layer", () => {
//       // map.getCanvas().style.cursor = "";
//       popup.remove();
//     });

//     map.on(touchEvent, "depositos-layer", (e) => {
//       // map.getCanvas().style.cursor = "";
//       popup.remove();
//       if (clickCallback) {
//         clickCallback(e.features[0].properties.url);
//       } else {
//         Router.go(e.features[0].properties.url);
//       }
//     });
//   }
// };

// export const depositos_layer_init = (map, clickCallback) => {
//   if (!map.getSource("depositos-src")) {
//     map.addSource("depositos-src", {
//       type: "geojson",
//       data: {
//         type: "FeatureCollection",
//         features: [], // Tus datos geojson
//       },
//     });
//   }

//   Remplazamos la capa de círculos por marcadores personalizados
//   const features = map.getSource("depositos-src")._data.features;

//   features.forEach((feature) => {
//     const coordinates = feature.geometry.coordinates.slice();
//     const description = feature.properties.description;
//     const url = feature.properties.url;

//     Crear un elemento div para el marcador personalizado
//     const el = document.createElement("div");
//     el.className = "marker";
    
//     Establecer la imagen de fondo
//     el.style.backgroundImage = `url('/businessbang.jpg')`; 
//     el.style.backgroundSize = "cover";
//     el.style.width = `35px`;
//     el.style.height = `45px`;
//     el.style.cursor = "pointer";

//     Crear un popup
//     const popup = new mapboxgl.Popup({
//       closeButton: false,
//       closeOnClick: false,
//     }).setHTML(description);

//     Añadir el marcador personalizado al mapa
//     const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
//       .setLngLat(coordinates)
//       .setPopup(popup) // Asignar el popup al marcador
//       .addTo(map);

//     Evento de clic en el marcador
//     marker.getElement().addEventListener("click", () => {
//       if (clickCallback) {
//         clickCallback(url); // Ejecutar el callback
//       } else {
//         Router.go(url); // Navegar a la URL
//       }
//     });

//     Eventos de mouse
//     marker.getElement().addEventListener("mouseenter", () => {
//       marker.togglePopup();
//     });
//     marker.getElement().addEventListener("mouseleave", () => {
//       marker.togglePopup();
//     });
//   });
// };

export const depositos_layer_init = (map, clickCallback) => {
  if (!map.getSource("depositos-src")) {
    map.addSource("depositos-src", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
  }

  const features = map.getSource("depositos-src")._data.features;

  features.forEach((feature) => {
    const coordinates = feature.geometry.coordinates.slice();
    const description = feature.properties.description;
    const url = feature.properties.url;
    const item = feature.properties.item;

    
    let imageUrl = '/deposit.jpg'; 
    if (item.siloBag) {
      imageUrl = '/businessbang.jpg';
    } else if (item.hopper) {
      imageUrl = '/tolva.png'; 
    } else if (item.silo) {
      imageUrl = '/silo.png';
    } else if (item.deposit) {
      imageUrl = '/deposit.jpg'; 
    }

    
    const el = document.createElement("div");
    el.className = "marker";
    el.style.backgroundImage = `url('${imageUrl}')`;
    el.style.backgroundSize = "80%"; 
    el.style.backgroundPosition = "center"; 
    el.style.backgroundRepeat = "no-repeat"; 
    el.style.width = `30px`;  
    el.style.height = `40px`;  
    el.style.cursor = "pointer";
    el.style.borderRadius = "10px"; 

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    }).setHTML(description);

   
    const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(coordinates)
      .setPopup(popup) 
      .addTo(map);

   
    marker.getElement().addEventListener("click", () => {
      if (clickCallback) {
        clickCallback(url); 
      } else {
        Router.go(url); 
      }
    });

    
    marker.getElement().addEventListener("mouseenter", () => {
      marker.togglePopup();
    });
    marker.getElement().addEventListener("mouseleave", () => {
      marker.togglePopup();
    });
  });
};



export const depositos_update = (map) => {
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
          description: `<strong style='font-size:16px'>${
            d.nombre
          }</strong><br><div>${get("deposito")}</div>`,
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
};

export const addDepositosToMap = (map, depos: Deposit[], clickCallback ) => {
  depositos_layer_init(map, clickCallback);

  
    // Filtrar solo los que tengan posicion
    let conpos = depos.filter((d) => {
      return d.geolocation != null;
    });

    let features = conpos.map((d) => {
      let feature: Feature = {
        type: "Feature",
        properties: {
          item: d,
          url: "/init/overview/list-stock?depositId=" + d._id,
          description: `<strong style='font-size:16px'>${
            d.description
          }</strong><br><div>${"Deposito"}</div>`,
        },
        geometry: {
          type: "Point",
          coordinates: [d.geolocation.lng, d.geolocation.lat],
        },
      };
      return feature;
    });
    let src = map.getSource("depositos-src").setData({
      type: "FeatureCollection",
      features: features,
    });
  ;
};


