//'use strict';

// zuix.controller(function (cp) {
//   const zx = zuix; // shorthand
//   let redraw_count = 0;
//   var modo_edicion = "campo"; // o 'lote'

//   var img_bucket_url =
//     "https://testbucketgarrapollo.s3.us-south.cloud-object-storage.appdomain.cloud/";


//   var emptyGJ = {
//     type: "FeatureCollection",
//     features: [],
//   };

//   const draw = new MapboxDraw({
//     displayControlsDefault: false,
//     // Select which mapbox-gl-draw control buttons to add to the map.
//     controls: {
//       polygon: false,
//       trash: true,
//     },
//     //defaultMode: 'draw_polygon'
//   });

//   let touchEvent = "ontouchstart" in window ? "touchstart" : "click";

//   async function hashMessage(message) {
//     const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
//     const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
//     const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
//     const hashHex = hashArray
//       .map((b) => b.toString(16).padStart(2, "0"))
//       .join(""); // convert bytes to hex string
//     return hashHex;
//   }

//   const layer_visibility = (layer_id, status) => {
//     map.setLayoutProperty(layer_id, "visibility", status ? "visible" : "none");
//   };
//   cp.create = function () {
//     mapboxgl.accessToken =
//       "pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw";

//     map = new mapboxgl.Map({
//       container: "map",
//       style: "mapbox://styles/mapbox/satellite-streets-v11",
//       center: [-59.2965, -35.1923],
//       zoom: 12,
//       attributionControl: true,
//       preserveDrawingBuffer: false,
//     });

//     map.addControl(draw); // Sin controles

//     // Add geolocate control to the map.
//     map.addControl(
//       new mapboxgl.GeolocateControl({
//         positionOptions: {
//           enableHighAccuracy: true,
//         },
//         // When active the map will receive updates to the device's location as it changes.
//         trackUserLocation: true,
//         // Draw an arrow next to the location dot to indicate which direction the device is heading.
//         showUserHeading: true,
//       })
//     );

//     map.on("render", function () {
//       map.resize();
//     });

//     map.resize();

//     map.on("load", function () {
//       campos_layer();
//       sensores_layer();
//       campos_agregar_ctrl();

//       notas_layer();
//       notas_agregar_ctrl();

//       tour();
//     });
//   };

//   const campos_layer = () => {
//     //map.addSource('lotes', { type: 'geojson', data: '/phpiot20/lotes_by_campo_geojson.php?campoid=20' });
//     map.addSource("lotes", { type: "geojson", data: emptyGJ });
//     map.addSource("lotes_internos", { type: "geojson", data: emptyGJ });

//     let lotes_source = map.getSource("lotes");
//     let lotes_collection = emptyGJ;

//     let lotes_internos_source = map.getSource("lotes_internos");
//     let lotes_internos_collection = emptyGJ;

//     const redraw_map = () => {
//       redraw_count += 1;
//       console.log("redraw_count", redraw_count);

//       campos_db
//         .allDocs({
//           include_docs: true,
//           attachments: true,
//         })
//         .then((result) => {
//           cantidad_de_campos = result.total_rows;
          
//           lotes_collection.features = result.rows.map((campo) => {
//             campo_geojson = campo.doc.campo_geojson;
//             campo_geojson.properties = {
//               id: campo.doc["_id"],
//               rev: campo.doc["_rev"],
//               nombre: campo.doc.nombre,
//               //cultivo: campo.attributes.cultivo
//               db_doc: JSON.stringify(campo.doc),
//             };
//             return campo_geojson;
//           });

//           console.log("Set lotes DS", lotes_collection.features);
//           lotes_source.setData(lotes_collection);

//           lotes_internos_collection.features = result.rows.map((campo) => {
//             // campo.doc.lotes
//             return campo.doc.lotes;
//           });

//           lotes_internos_collection.features =
//             lotes_internos_collection.features.flat();

//           console.log(
//             "Set lotes internos DS",
//             lotes_internos_collection.features
//           );
//           lotes_internos_source.setData(lotes_internos_collection);

//           console.log("Redraw Campos", result);
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     };

//     /* Redraw on Changes callback */
//     campos_db
//       .changes({
//         since: "now",
//         live: true,
//       })
//       .on("change", redraw_map);

//     // First Draw
//     //redraw_map();

//     map.addLayer({
//       id: "lotes",
//       type: "fill",
//       source: "lotes",
//       layout: {
//         //"visibility": 'none'
//       },
//       paint: {
//         "fill-color": "red",
//         "fill-opacity": 0.4,
//         "fill-outline-color": "red",
//       },
//     });

//     map.addLayer({
//       id: "lotes_internos",
//       type: "fill",
//       source: "lotes_internos",
//       layout: {
//         visibility: "none",
//       },
//       paint: {
//         "fill-color": "green",
//         "fill-opacity": 0.9,
//         "fill-outline-color": "green",
//       },
//     });

//     map.addLayer({
//       id: "lotes_border",
//       type: "line",
//       source: "lotes",
//       // layout: {
//       //   visibility: "none",
//       // },
//       paint: {
//         'line-color': 'rgba(255, 0, 0, 1)',
//         'line-width': 4
//       }
//     }, "lotes");

//     map.addSource("ndvi", {
//       type: "image",
//       url: "favicon.png",
//       coordinates: [
//         [-80.425, 46.437],
//         [-71.516, 46.437],
//         [-71.516, 37.936],
//         [-80.425, 37.936],
//       ],
//     });

//     map.addLayer({
//       id: "ndvi-layer",
//       type: "raster",
//       source: "ndvi",
//       paint: {
//         "raster-fade-duration": 0,
//       },
//       layout: { visibility: "none" },
//     });

//     redraw_map();

//     /** Mapbox handler para mostrar el offcanvas de detalles  'lotes', */
//     map.on(touchEvent, "lotes", (e) => {
//       // NDVI not visible
//       console.log("Click en Campo", e.features[0]);

//       layer_visibility("lotes", false);
//       layer_visibility("lotes_internos", true);
//       layer_visibility("lotes_border", true);

//       // Fly to
//       map.fitBounds(turf.bbox(e.features[0]));
//       const campo_doc = e.features[0].properties;
//       let campo_geojson = JSON.parse(campo_doc.db_doc).campo_geojson
      
//       document.getElementById("campo-oc").campo_doc = campo_doc;
//       document.getElementById("campo-oc").campo_geojson = campo_geojson;
      
//       document.getElementById("campo-oc").map = map;
//       document.getElementById("campo-oc").draw = draw;
//       document.getElementById("campo-oc").nuevo_lote_callback = () => {
//         lotes_edit_sm(0);
//       };
//       document.getElementById("campo-oc").guardar_lote_callback = () => {
//         guardar_lote(campo_doc);
//       };
//       document.getElementById("campo-oc").borrar_lote_callback = () => {
//         campos_db.remove(campo_doc.id, campo_doc.rev);
//       };
//       document.getElementById("campo-oc").show();
//       // showCampoOffcanvas(e.features[0].properties.id, e.features[0].properties.rev)
//       // new mapboxgl.Popup()
//       // 	.setLngLat(e.lngLat)
//       // 	.setHTML(e.features[0].properties.nombre)
//       // 	.addTo(map);
//     });

//     // NDVI Offcanvas Object
//     const ndvi_oc = new bootstrap.Offcanvas(
//       document.getElementById("offcanvas-lote-ndvi")
//     );

//     // Mostrar layers al cerrar el offcanvas de NDVI
//     document
//       .getElementById("offcanvas-lote-ndvi")
//       .addEventListener("hide.bs.offcanvas", () => {
//         // Show Campos
//         map.setLayoutProperty("lotes", "visibility", "visible");
//         // Hide Lotes
//         map.setLayoutProperty("lotes_internos", "visibility", "none");
//         // Hide NDVI
//         map.setLayoutProperty("ndvi-layer", "visibility", "none");
//         // Bordes
//         map.setLayoutProperty("lotes_border", "visibility", "none");
//         //
//         document.getElementById("map-overlay").style.display = "none";
//       });

//     map.on(touchEvent, "lotes_internos", (e) => {
//       console.log("Click en lotes Internos", e.features[0]);
//       let { nombre, campo_parent_id } = e.features[0].properties;

//       document.getElementById("lote-oc").username = couch_username;
//       document.getElementById("lote-oc").lote_nombre = nombre;
//       document.getElementById("lote-oc").campo_id = campo_parent_id;
//       document.getElementById("lote-oc").show();

//     });

//     /**
//      * Evento Mostrar NDVI
//      */
//     document.getElementById("map").addEventListener("show-ndvi", (e) => {
//       console.log("NDVI");
//       let geometry = e.detail.lote.geometry;
//       let clean_json = JSON.stringify(geometry, Object.keys(geometry).sort());
//       hashMessage(clean_json).then((lote_hash) => {
//         console.log("Lote Hash", lote_hash);
//         // Build y  Mostrat la Galeria
//         ndvi_db
//           .get(lote_hash)
//           .then(ndvi_gallery)
//           .catch(() => {
//             console.log("Error NDVI: Aun no existe ningun registro");
//             alert("Error NDVI: Aun no existe ningun registro");
//           });
//       });
//     });

//     document.getElementById("map").addEventListener("DIBUJAR", (e) => {
//       draw.changeMode("draw_polygon");
//     });

//     ndvi_db
//       .changes({
//         since: "now",
//         live: true,
//       })
//       .on("change", () => {
//         console.log("Cambios en NDVI");
//       });

//     /**
//      * Renderiza la galeria de NDVI en los detalles del campo
//      * @param {} result
//      */
//     const ndvi_gallery = async (result) => {
//       /**
//        * NDVI Layer Visible
//        */
//       if (map.getLayer("ndvi-layer")) {
//         map.setLayoutProperty("ndvi-layer", "visibility", "visible");

//         map.moveLayer("ndvi-layer");
//       }

//       const create_update_ndvi_source = (img_src, bbox) => {
//         // If e
//         if (map.getSource("ndvi")) {
//           // EXISTE la source -> Update
//           const mySource = map.getSource("ndvi");
//           mySource.updateImage({
//             url: img_src,
//             coordinates: bbox,
//           });
//         } else {
//           // No existe la source crear
//           map.addSource("ndvi", {
//             type: "image",
//             url: img_src,
//             coordinates: bbox,
//           });

//           map.addLayer({
//             id: "ndvi-layer",
//             type: "raster",
//             source: "ndvi",
//             paint: {
//               "raster-fade-duration": 0,
//             },
//           });

//           map.moveLayer("ndvi-layer");
//         }
//       };

//       const update_overlay_info = (info) => {
//         const overlay = document.getElementById("map-overlay");

//         const title_div = document.createElement("div");

//         const title = document.createElement("strong");
//         title.textContent = "Estadisticas ";
//         title_div.appendChild(title);

//         if (info.std < 0.1 && info.media < 0.1) {
//           const condicion = document.createElement("span");
//           condicion.textContent = "Nubosidad Severa";
//           condicion.classList.add("badge");
//           condicion.classList.add("bg-danger");
//           // condicion.classList.add("text-dark")
//           title_div.appendChild(condicion);
//         } else if (info.min < 0) {
//           const condicion = document.createElement("span");
//           condicion.textContent = "Nubosidad";
//           condicion.classList.add("badge");
//           condicion.classList.add("bg-warning");
//           condicion.classList.add("text-dark");
//           title_div.appendChild(condicion);
//         }

//         const media = document.createElement("div");
//         media.textContent = "Promedio: " + info.media.toFixed(2);
//         const std = document.createElement("div");
//         std.textContent = "Desviación Estándar: " + info.std.toFixed(2);

//         const max = document.createElement("div");
//         max.textContent = "Máximo: " + info.max.toFixed(2);

//         const min = document.createElement("div");
//         min.textContent = "Mínimo: " + info.min.toFixed(2);

//         overlay.innerHTML = "";
//         overlay.style.display = "block";

//         overlay.appendChild(title_div);

//         overlay.appendChild(media);
//         overlay.appendChild(std);
//         overlay.appendChild(max);
//         overlay.appendChild(min);
//       };

//       /**
//        * Dibuja la miniatura del NDVI
//        * @param {ob} observacion
//        */
//       const renderNdviThumb = (ob) => {
//         //bbox, fecha, png_url
//         const ndvi_div = document.getElementById("lote-ndvi");
//         const fecha = ob.fecha;
//         const img_src = img_bucket_url + ob.png_url;

//         const year = +fecha.substring(0, 4);
//         const month = +fecha.substring(4, 6);
//         const day = +fecha.substring(6, 8);

//         const obs_date = new Date(year, month - 1, day);
//         const dias_diff = Math.floor(
//           (new Date().getTime() - obs_date.getTime()) / (1000 * 3600 * 24)
//         );

//         //const fechastr = obs_date.toString()

//         bbox = [
//           [ob.bbox.left, ob.bbox.top],
//           [ob.bbox.right, ob.bbox.top],
//           [ob.bbox.right, ob.bbox.bottom],
//           [ob.bbox.left, ob.bbox.bottom],
//         ];

//         /**
//          * Dibuja el render sobre el mapa
//          */

//         const ndvi_on_click = (e) => {
//           layer_visibility("lotes_internos", false);
//           create_update_ndvi_source(img_src, bbox);
//           update_overlay_info(ob.estadisticas);
//         };

//         card_html = `<div class="card bg-dark text-white my-1">
// 							<img src="${img_src}" class="card-img" alt="...">
// 							<div class="card-img-overlay">
// 								<h5 class="card-title">${fecha}</h5>
// 								<p class="card-text">Hace ${dias_diff} dias</p>
// 							</div>
// 							</div>`;
//         card_element = document.createElement("div");
//         card_element.classList.add("col-2");
//         card_element.innerHTML = card_html;
//         card_element.addEventListener("click", (e) => ndvi_on_click(e));
//         ndvi_div.appendChild(card_element);
//       };

//       // Borro Lo anterior
//       ndvi_div = document.getElementById("lote-ndvi");
//       ndvi_div.textContent = "";

//       /** Aplico para cada observacion */
//       obs = result.obs;
//       obs.forEach((ob) => renderNdviThumb(ob));
//       ndvi_oc.show();
//       document.getElementById("campo-oc").hide();
//       document.getElementById("lote-oc").hide();
//     };
//   };

//   const sensores_layer = () => {
//     map.loadImage(
//       "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
//       (error, image) => {
//         if (error) throw error;
//         map.addImage("custom-marker", image);
//         // map.addSource('sensores', { type: 'geojson', data: '/phpiot20/apiv0/posiciones_devices.php' });
//         // map.addLayer({
//         // 	"id": "sensores",
//         // 	"type": "symbol",
//         // 	"source": "sensores",
//         // 	"layout": {
//         // 		'icon-image': 'custom-marker',
//         // 		'text-field': ['get', 'deveui'],
//         // 		'text-offset': [0, 1.25],
//         // 		'text-anchor': 'top'
//         // 		//"visibility": 'none'
//         // 	}
//         // });
//       }
//     );

//     // Sensores PopUp
//     map.on(touchEvent, "sensores", (e) => {
//       // Copy coordinates array.
//       console.log(e.features);
//       const coordinates = e.features[0].geometry.coordinates.slice();
//       //const description = JSON.stringify(e.features[0].properties);
//       const description = '<button class="popup-detalles">Detalles</button>';

//       // Ensure that if the map is zoomed out such that multiple
//       // copies of the feature are visible, the popup appears
//       // over the copy being pointed to.
//       while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
//       }

//       new mapboxgl.Popup()
//         .setLngLat(coordinates)
//         .setHTML(description)
//         .addTo(map);

//       // Hook on click detalles
//       $(".popup-detalles").on("click", () => {
//         console.log(coordinates);
//         showSensorDetails();
//       });
//     }); //End Sensores PopUp
//   }; // Enb sensores_layer()

//   const campos_agregar_ctrl = () => {
//     /* ------------add campo -------------*/
//     // map.on("draw.create", polygon_created_event);
//     // map.on("draw.delete", updateArea);
//     // map.on("draw.update", polygon_created_event);
//     // map.on("draw.render", renderCB);

//     function polygon_created_event(args) {
//       console.log("Poligono Creado Event", args);
//       window.eventBus.emit("poligono-creado", null, "a", "b");
//     }

//     function polygon_deleted_event(args) {}

//     var toast_step = 0;

//     function renderCB(args) {
//       if (modo_edicion === "campo") {
//         if (toast_step < 3 && draw.getMode() === "draw_polygon") {
//           const current_feature_coll = draw.getAll();
//           const features = current_feature_coll.features;
//           const geometry_coor =
//             features[features.length - 1].geometry.coordinates[0];
//           if (toast_step === 0 && geometry_coor.length === 3) {
//             // Primer punto añadido
//             console.log("Un punto añadido");
//             //toast_updated_flag = true
//             toast_step = 1;
//             const toast_body = document.getElementById("toast-body");
//             toast_body.innerHTML = "Indica el siguiente punto";
//           }
//           if (toast_step === 1 && geometry_coor.length === 4) {
//             // Primer punto añadido
//             console.log("Un punto añadido");
//             //toast_updated_flag = true
//             toast_step = 2;
//             const toast_body = document.getElementById("toast-body");
//             toast_body.innerHTML = "Indica el siguiente punto";
//           }

//           if (toast_step === 2 && geometry_coor.length === 5) {
//             // Primer punto añadido
//             console.log("Un punto añadido");
//             //toast_updated_flag = true
//             toast_step = 3;
//             const toast_body = document.getElementById("toast-body");
//             toast_body.innerHTML =
//               "Toca el primer punto para completar el campo";
//           }
//         }
//       } else if (modo_edicion === "lote") {
//       }
//     }

//     function updateArea(e) {
//       if (modo_edicion === "campo") {
//         const data = draw.getAll();
//         const answer = document.getElementById("toast-body");
//         const next_btn = document.getElementById("agregar-campo-siguiente-btn");

//         console.log(data.features);
//         if (data.features.length > 0) {
//           // Canpo fue agragado
//           const area = turf.area(data);
//           // Restrict the area to 2 decimal points.
//           const rounded_area = Math.round((area / 10000) * 100) / 100;
//           answer.innerHTML = `El campo seleccionado tiene ${rounded_area} has`;
//           next_btn.removeAttribute("disabled");
//           $("#offcanvas-1-title").text("1 campo seleccionado");
//         } else {
//           answer.innerHTML = "";
//           if (e.type !== "draw.delete")
//             alert("Click the map to draw a polygon.");
//         }
//       } else if (modo_edicion === "lote") {
//         const data = draw.getAll();

//         if (data.features.length > 0) {
//           // Canpo fue agragado
//           const area = turf.area(data);
//           // Restrict the area to 2 decimal points.
//           const rounded_area = Math.round((area / 10000) * 100) / 100;
//           console.log("Poligono Completado");
//           document.getElementById("campo-oc").enable_siguiente();
//         } else {
//         }
//       }
//     }

//     // const salir_btn = document.getElementById("salir-edicion-btn");
//     // const next_btn = document.getElementById("agregar-campo-siguiente-btn");

//     // salir_btn.addEventListener("click", () => {
//     //   salir_edit_mode();
//     //   var offcanvas = document.getElementById("offcanvasBottom");
//     //   offcanvas.classList.remove("show");
//     // });

//     // next_btn.addEventListener("click", () => {
//     //   draw.changeMode("simple_select");
//     // });

//     var toast;

//     /* Boton Agregar Campos */
//     var agregar_campos_btn = document.getElementById("agregar-campos-btn");
//     document.getElementById("nuevo-campo-oc").map = map;
//     document.getElementById("nuevo-campo-oc").draw = draw;
//     if (agregar_campos_btn) {
//       agregar_campos_btn.addEventListener("click", function () {
//         // Nueva Geometria Campo
//         document.getElementById('nuevo-campo-oc').show = true;
//       });
//       // Rellenar Campo #
//     }

//     // /* Guardar Campo ----------------------------------------*/
//     // var guardar_btn = document.getElementById("guardar-campo-btn");
//     // guardar_btn.addEventListener("click", () => {
//     //   var offcanvas = document.getElementById("offcanvasCampoForm");
//     //   offcanvas.classList.remove("show");

//     //   nombre = $("#inputNombreCampo").val();
//     //   variedad = $("#variedad-input").val();
//     //   cultivo = $("#cultivo-btn").text();
//     //   id = $("#input-cultivo").val();

//     //   campo_geojson = draw.getAll().features[0];

//     //   console.log("GeoJSON", campo_geojson);
//     //   console.log("Guardar Campo '", nombre); //, "' con", cultivo, "variedad", variedad)

//     //   campo_geojson.properties.hectareas =
//     //     Math.round((turf.area(campo_geojson) / 10000) * 100) / 100;

//     //   campos_db.put(
//     //     {
//     //       _id: "campos_" + nombre,
//     //       nombre: nombre,
//     //       campo_geojson: campo_geojson,
//     //       lotes: [],
//     //     },
//     //     (err, result) => {
//     //       if (!err) {
//     //         console.log("Successfully posted a Campo!");
//     //       } else {
//     //         console.log(err);
//     //       }
//     //     }
//     //   );

//     //   salir_edit_mode();
//     // });

//     /* Cerrar btn */
//     // var offcanvas_paso_1_cerrar = document.getElementById("map-edit-btn");
//     // offcanvas_paso_1_cerrar.addEventListener("click", function () {
//     //   /* Guardar */
//     //   salir_edit_mode();
//     // });

//     // var offcanvas_cultivo = document.getElementById("offcanvas-cultivo");
//     // var bs_offcanvas_cultivo = new bootstrap.Offcanvas(offcanvas_cultivo);

//     // offcanvas_cultivo.addEventListener("hide.bs.offcanvas", () => {
//     //   var offcanvas = document.getElementById("offcanvasCampoForm");
//     //   //offcanvas.setAttribute("show","")
//     //   var bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
//     //   bsOffcanvas.show();
//     // });

//     const salir_edit_mode = () => {
//       // hide toast
//       toast.hide();
//       draw.deleteAll();
//       draw.changeMode("simple_select");
//       next_btn.setAttribute("disabled", "");
//     };
//   };

//   const notas_agregar_ctrl = () => {
//     var nota_marker;

//     async function getImage(imageUrl, imageName) {
//       const response = await axios.get(imageUrl, { responseType: "blob" });
//       const mimeType = response.headers["content-type"];
//       const imageFile = new File([response.data], imageName, {
//         type: mimeType,
//       });
//       return imageFile;
//     }

//     //return a promise that resolves with a File instance
//     function urltoFile(url, filename, mimeType) {
//       return fetch(url)
//         .then(function (res) {
//           return res.arrayBuffer();
//         })
//         .then(function (buf) {
//           return new File([buf], filename, { type: mimeType });
//         });
//     }

//     var offcanvas_nueva_nota_el = document.getElementById(
//       "offcanvas-nueva-nota"
//     );
//     const offcanvas_nueva_nota = new bootstrap.Offcanvas(
//       offcanvas_nueva_nota_el
//     );

//     offcanvas_nueva_nota_el.addEventListener("hide.bs.offcanvas", () => {
//       nota_marker.remove();
//     });

//     $("#nueva-nota-btn").click(() => {
//       // Marker
//       nota_marker = new mapboxgl.Marker().setLngLat(map.getCenter()).addTo(map);

//       map.on("move", () => {
//         nota_marker.setLngLat(map.getCenter());
//       });

//       // Reset/Clean controls
//       document.getElementById("img-preview").textContent = "";
//       document.getElementById("nota-comentario-input").value = "";
//       document.getElementById("audio-div").textContent = "";
//       new_audio = document.createElement("audio-recorder");
//       document.getElementById("audio-div").append(new_audio);

//       // Show Campos
//       map.setLayoutProperty("lotes", "visibility", "visible");
//       // Hide Lotes
//       map.setLayoutProperty("lotes_internos", "visibility", "visible");
//       // Hide NDVI
//       map.setLayoutProperty("ndvi-layer", "visibility", "none");
//       // Bordes
//       map.setLayoutProperty("lotes_border", "visibility", "none");

//       offcanvas_nueva_nota.show();
//     });

//     $("#anadir-foto-btn").click(() => {
//       document.getElementById("foto-upload-input").click();
//     });

//     img_input = document.getElementById("foto-upload-input");

//     img_input.addEventListener("change", function () {
//       const file = this.files[0];
//       if (file.type.startsWith("image/")) {
//         const img = document.createElement("img");
//         const watermarkPreview = document.getElementById("img-preview");

//         //img.classList.add("img-fluid");
//         img.classList.add("col-4");
//         img.classList.add("col-md-2");
//         img.classList.add("mx-1");
//         img.classList.add("nota-img");
//         img.classList.add("img-thumbnail");
//         img.setAttribute("style", "height:100px; object-fit: cover;");
//         img.file = file;

//         watermarkPreview.appendChild(img);

//         img.addEventListener("click", (e) => {
//           // Show Modal
//           var exampleModal = document.getElementById("detalle-imagen-modal");
//           //console.log(e.target.src);
//           const index_of_this_el = Array.prototype.indexOf.call(
//             watermarkPreview.children,
//             e.target
//           );
//           document
//             .getElementById("borrar-img-btn")
//             .setAttribute("data-bs-index", index_of_this_el);

//           modal_body = document.getElementById("imagen-modal-preview");
//           modal_body.setAttribute("src", e.target.src);

//           var modal_el = document.getElementById("detalle-imagen-modal");
//           const myModal = new bootstrap.Modal(modal_el);
//           myModal.show();
//         });

//         const reader = new FileReader();
//         reader.onload = (function (aImg) {
//           return function (e) {
//             aImg.src = e.target.result;
//           };
//         })(img);
//         reader.readAsDataURL(file);
//       }
//     });

//     /* Modal Detalles */
//     /* Boton Borrar IMG */
//     document.getElementById("borrar-img-btn").addEventListener("click", (e) => {
//       const index = e.target.getAttribute("data-bs-index");
//       console.log("Borrar index", index);
//       const children = document.getElementById("img-preview").children;
//       children[index].remove();
//       var myModal = bootstrap.Modal.getInstance(
//         document.getElementById("detalle-imagen-modal")
//       );
//       myModal.hide();
//     });

//     function pointInPolygon(pnt, geometry) {
//       return turf.booleanPointInPolygon([pnt.lng, pnt.lat], geometry);
//     }

//     function getCampoFromPoint(pnt) {
//       let c = map.querySourceFeatures("lotes").filter((campo) => {
//         return pointInPolygon(map.getCenter(), campo.geometry);
//       });

//       return c.length ? c[0].properties.nombre : "No Especificado";
//     }

//     function getLoteFromPoint(pnt) {
//       let c = map.querySourceFeatures("lotes_internos").filter((campo) => {
//         return pointInPolygon(map.getCenter(), campo.geometry);
//       });

//       return c.length ? c[0].properties.nombre : "No Especificado";
//     }

//     function getSelectedColor() {
//       if (document.getElementById("btnradio-danger").checked) {
//         return "red";
//       } else if (document.getElementById("btnradio-warning").checked) {
//         return "yellow";
//       } else {
//         return "green";
//       }
//     }

//     document
//       .getElementById("guardar-nueva-nota-btn")
//       .addEventListener("click", () => {
//         const nota = {
//           _id: "nota_" + uuidv4(),
//           username: couch_username,
//           campo_id: getCampoFromPoint(nota_marker.getLngLat()),
//           lote_id: getLoteFromPoint(nota_marker.getLngLat()),

//           color: getSelectedColor(),
//           texto: document.getElementById("nota-comentario-input").value,
//           fecha: "2022-05-09T01:30:00.000-05:00",
//           posicion: nota_marker.getLngLat(),
//           _attachments: {},
//         };

//         img_el = document.getElementsByClassName("nota-img");
//         audios_el = document
//           .querySelector("audio-recorder")
//           .shadowRoot.querySelectorAll(".nota-audio");
//         console.log("AudioEL", audios_el);
//         img_sources = Array.from(img_el).map((imagen) => {
//           return imagen.getAttribute("src");
//         });

//         audio_promise = Array.from(audios_el).map((audio) => {
//           return urltoFile(audio.getAttribute("src"), uuidv4(), "audio/*");
//         });

//         console.log("AP", audio_promise);

//         promises = img_sources.map((img_src) => {
//           return urltoFile(img_src, uuidv4(), "image/*");
//         });

//         console.log(promises);

//         Promise.all(promises).then((files) => {
//           // Fotos OK
//           //files.map(file => { formData.append(`files.fotos`, file, file.name) })
//           files.map((file) => {
//             nota._attachments["foto_" + uuidv4()] = {
//               content_type: "image/*",
//               data: file,
//             };
//           });

//           Promise.all(audio_promise).then((audio_files) => {
//             audio_files.map((file) => {
//               nota._attachments["audio_" + uuidv4()] = {
//                 content_type: "audio/*",
//                 data: file,
//               };
//             });

//             // Add uuid y Guardar Nota
//             nota.uuid = uuidv4();
//             notas_db
//               .put(nota)
//               .then()
//               .catch((err) => console.log(err));
//             offcanvas_nueva_nota.hide();
//           });
//         });
//       });
//   };

//   // Notas
//   const notas_layer = () => {
//     const offcanvas_nota = new bootstrap.Offcanvas(
//       document.getElementById("offcanvas-nota")
//     );

//     const redraw_notas = () => {
//       // Remove markers
//       const markers_nota = document.querySelectorAll(".marker-nota");

//       markers_nota.forEach((marker) => {
//         marker.remove();
//       });

//       //Releer
//       notas_db
//         .allDocs({
//           include_docs: true,
//           attachments: true,
//           binary: true,
//         })
//         .then((results) => {
//           console.log("Notas", results);
//           results.rows.map(marcador_from_nota);
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     };

//     redraw_notas();

//     notas_db
//       .changes({
//         since: "now",
//         live: true,
//       })
//       .on("change", redraw_notas);

//     const marcador_from_nota = (nota) => {
//       const el = document.createElement("div");
//       el.className = "marker marker-nota";
//       el.setAttribute("data-id", nota._id);

//       const posicion = nota.doc.posicion;
//       const color = nota.doc.color;
//       const color_2_style = {
//         red: "marker-red",
//         green: "marker-green",
//         yellow: "marker-yellow",
//       };

//       el.classList.add(color_2_style[color]);

//       const marker = new mapboxgl.Marker(el)
//         .setLngLat([posicion.lng, posicion.lat])
//         .addTo(map);

//       el.addEventListener("click", (e) => {
//         e.stopPropagation();
//         console.log("Click en Nota", nota);
//         nota_mostrar(nota);
//       });
//     };

//     const nota_mostrar = (nota) => {
//       const header = document.getElementById("offcanvas-nota-header");
//       const texto = document.getElementById("nota-texto");
//       const imagenes = document.getElementById("nota-img-preview");
//       const problemas = document.getElementById("nota-problemas");
//       const audios = document.getElementById("nota-audio-players");

//       imagenes.textContent = "";
//       audios.textContent = "";

//       /* Poblar Imagenes */
//       console.log(nota);
//       for (const [key, att] of Object.entries(nota.doc._attachments)) {
//         console.log(`${key}: ${att}`);
//         if (key.includes("foto")) {
//           console.log(att.data);
//           const img = document.createElement("img");
//           img.classList.add("col-4");
//           img.classList.add("col-md-2");
//           img.classList.add("mx-1");
//           img.classList.add("img-thumbnail");
//           img.setAttribute("style", "height:100px; object-fit: cover;");
//           //img.file = att.data;
//           img.setAttribute("src", URL.createObjectURL(att.data));
//           imagenes.append(img);
//         } else if (key.includes("audio")) {
//           const audio = document.createElement("audio");
//           audio.setAttribute("controls", "");
//           const source = document.createElement("source");
//           source.src = URL.createObjectURL(att.data);
//           audio.append(source);
//           audios.append(audio);
//         }
//       }
//       offcanvas_nota.show();
//     };
//   };

//   const guardar_lote = (doc) => {
//     lotes_edit_sm(4);
//     db_doc = JSON.parse(doc.db_doc);

//     nombre_lote = document.getElementById("campo-oc").nombre_lote;
//     console.log("Guardar Lote", nombre_lote);

//     lote_geojson = draw.getAll().features[0];
//     lote_geojson.properties.nombre = nombre_lote;
//     lote_geojson.properties.campo_parent_id = db_doc._id;
//     let this_lote_id = uuidv4();
//     lote_geojson.properties.uuid = this_lote_id;
//     lote_geojson.properties.hectareas =
//       Math.round((turf.area(lote_geojson) / 10000) * 100) / 100;
//     lote_geojson.id = this_lote_id;

//     console.log("Lote GeoJSON", lote_geojson);

//     document.getElementById("campo-oc").show();

//     db_doc.lotes.push(lote_geojson);
//     // Save Lote en campo doc
//     campos_db.put(db_doc);

//     // Notificar Cambio para sincronizar
//     local_campos_changes.put(
//       {
//         _id: this_lote_id,
//         tipo: "add-lote",
//         username: couch_username,
//         details: {
//           campo_id: db_doc._id,
//           db: "campos_" + couch_username,
//           lote_geojson: lote_geojson,
//           username: couch_username,
//         },
//       },
//       (err, result) => {
//         if (!err) {
//           console.log("LocalChanges Successfully posted!");
//         } else {
//           console.log(err);
//         }
//       }
//     );

//     draw.deleteAll();
//   };

//   var campo_limites_json;
//   var edit_state = 0;
//   const lotes_edit_sm = (state) => {
//     if (state === 0) {
//       draw.changeMode("draw_polygon");
//       modo_edicion = "lote";
//       console.log("Dibuje el Poligono");

//       map.setLayoutProperty("lotes", "visibility", "none");
//       map.setLayoutProperty("lotes_border", "visibility", "visible");
//     } else if (state === 1) {
//     } else if (state === 2) {
//     } else if (state === 3) {
//     } else if (state === 4) {
//       draw.changeMode("simple_select");
//       modo_edicion = "campo";
//       // Guardar Lote
//       map.setLayoutProperty("lotes", "visibility", "visible");
//       map.setLayoutProperty("lotes_border", "visibility", "none");
//     }
//   };

//   const tour = ()=>{
//     introJs()
//     .setOptions({
//       "dontShowAgain": true,
//       nextLabel : "Siguiente",
//       doneLabel: "Fin",
//       prevLabel: "Anterior",
//       disableInteraction: false,
//       steps: [
//         {
//           intro: "Bienvenido a Agrotools!!!",
//         },
//         {
//           intro: "Presiona en el boton '+' para agregar tu primer campo",
//         },
//       ],
//     })
//     .start();
//   }

// });
