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

const renderDepositMarkers = (map, features, clickCallback) => {
  // Remove previous markers if any
  if (map.__depositMarkers && Array.isArray(map.__depositMarkers)) {
    map.__depositMarkers.forEach((m) => m.remove());
  }
  map.__depositMarkers = [];

  const ensureDepositPopupStyle = () => {
    if (document.getElementById("deposit-popup-style")) return;
    const style = document.createElement("style");
    style.id = "deposit-popup-style";
    style.textContent = `
      .deposit-popup .mapboxgl-popup-content {
        background: transparent;
        padding: 0;
        border: none;
        box-shadow: none;
      }
      .deposit-popup .mapboxgl-popup-tip {
        border-top-color: transparent;
        border-bottom-color: transparent;
      }
    `;
    document.head.appendChild(style);
  };

  // Blanco con acento sutil por tipo
  const getAccentColors = (item) => {
    if (item?.siloBag) return ["#e8f5ef", "#8bc8a5"]; // verde suave
    if (item?.hopper) return ["#eef3fb", "#92b5e5"]; // azul pastel
    if (item?.silo) return ["#f0eef7", "#a5a4c6"]; // lila tenue
    return ["#f3f4f6", "#aeb6c2"]; // gris claro base
  };

  const createMarkerElement = (item) => {
    const [primary, secondary] = getAccentColors(item);

    const container = document.createElement("div");
    container.className = "deposit-marker";
    Object.assign(container.style, {
      width: "38px",
      height: "48px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "2px",
      cursor: "pointer",
    });

    const bubble = document.createElement("div");
    Object.assign(bubble.style, {
      width: "32px",
      height: "32px",
      borderRadius: "12px",
      background: "#ffffff",
      boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1px solid ${secondary}`,
      transition: "transform 140ms ease, box-shadow 140ms ease",
    });

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("width", "16");
    icon.setAttribute("height", "16");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", secondary);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M4 10.5 12 6l8 4.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm3 .8V19h3v-4h4v4h3v-7L12 9z"
    );
    icon.appendChild(path);
    bubble.appendChild(icon);

    const tail = document.createElement("div");
    Object.assign(tail.style, {
      width: "10px",
      height: "10px",
      background: "#ffffff",
      transform: "translateY(-5px) rotate(45deg)",
      borderRadius: "2px",
      boxShadow: `0 5px 10px rgba(0,0,0,0.08), 0 0 0 1px ${secondary}`,
    });

    container.appendChild(bubble);
    container.appendChild(tail);

    container.addEventListener("mouseenter", () => {
      bubble.style.transform = "translateY(-2px) scale(1.05)";
      bubble.style.boxShadow = "0 10px 18px rgba(0,0,0,0.14)";
    });
    container.addEventListener("mouseleave", () => {
      bubble.style.transform = "translateY(0) scale(1)";
      bubble.style.boxShadow = "0 6px 12px rgba(0,0,0,0.12)";
    });

    return container;
  };

  ensureDepositPopupStyle();

  features.forEach((feature) => {
    const coordinates = feature.geometry.coordinates.slice();
    const description = feature.properties.description;
    const url = feature.properties.url;
    const item = feature.properties.item;

    const el = createMarkerElement(item);

    const popupContent = `<div style="
      background:#ffffff;
      color:#1f2937;
      padding:10px 12px;
      border-radius:10px;
      box-shadow:0 10px 25px rgba(0,0,0,0.12);
      border:1px solid #e5e7eb;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size:13px;
      line-height:1.4;
      min-width:160px;
    ">${description}</div>`;

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      closeOnMove: false,
      offset: 10,
      maxWidth: "240px",
      className: "deposit-popup",
    }).setHTML(popupContent);

    const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(coordinates)
      .addTo(map);

    marker.getElement().addEventListener("click", () => {
      if (clickCallback) {
        clickCallback(url);
      } else {
        Router.go(url);
      }
    });

    const showPopup = () => popup.setLngLat(coordinates).addTo(map);
    const hidePopup = () => popup.remove();
    marker.getElement().addEventListener("mouseenter", showPopup);
    marker.getElement().addEventListener("mouseleave", hidePopup);

    map.__depositMarkers.push(marker);
  });
};

export const depositos_layer_init = (map, _clickCallback) => {
  if (!map.getSource("depositos-src")) {
    map.addSource("depositos-src", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
  }
};



export const depositos_update = (map, clickCallback) => {
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
          description: `<strong style='font-size:16px'>${d.nombre
            }</strong><br><div>${get("deposito")}</div>`,
        },
        geometry: {
          type: "Point",
          coordinates: [d.posicion.lng, d.posicion.lat],
        },
      };
      return feature;
    });
    map.getSource("depositos-src").setData({
      type: "FeatureCollection",
      features: features,
    });
    renderDepositMarkers(map, features, clickCallback);
  });
};

export const addDepositosToMap = (map, depos: Deposit[], clickCallback) => {
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
        description: `<strong style='font-size:16px'>${d.description
          }</strong><br><div>${"Deposito"}</div>`,
      },
      geometry: {
        type: "Point",
        coordinates: [d.geolocation.lng, d.geolocation.lat],
      },
    };
    return feature;
  });
  map.getSource("depositos-src").setData({
    type: "FeatureCollection",
    features: features,
  });
  renderDepositMarkers(map, features, clickCallback);
};


