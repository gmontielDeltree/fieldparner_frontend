import { Ambiente, Dosis, machine } from "./machine";
import { assign, fromPromise } from "xstate";
import { uuidv7 } from "uuidv7";
import axios from "axios";
import { fromUrl } from "geotiff";
import { showCanvasOnMap } from "./geotiff-helpers";
import { plot as Pplot, addColorScale } from "plotty";
import { Map, Popup } from "mapbox-gl";

import { BorderAllRounded } from "@mui/icons-material";

const scale = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

const mymin = (data) =>
  Math.min.apply(
    null,
    data.filter(function (n) {
      return !isNaN(n);
    })
  );

const mymax = (data) =>
  Math.max.apply(
    null,
    data.filter(function (n) {
      return !isNaN(n);
    })
  );

const deepcopy = (o) => JSON.parse(JSON.stringify(o));

// const sever_base_url = "https://agrotools.qts-ar.com.ar/satimages";
const sever_base_url = import.meta.env.VITE_COGS_SERVER_URL;
const poligonize_url = sever_base_url + "/zoning/polygonize";
const shapefile_url = sever_base_url + "/zoning/geojson_shp";

const indices_base_url = sever_base_url + "/files/indices/";

const pixel_sup = 100 / 10000; // has per pixel

export const provideMachine = () => {
  return machine.provide({
    actors: {
      fetchGeojson: fromPromise(async ({ input }) => {
        console.log("Fetch Geojson", input);
        const { data } = await axios.post(poligonize_url, {
          bins: input.rangos,
          base_file: input.base_image_url,
        });
        console.log("dsdsd", data);
        return data;
      }),

      fetchShapefile: fromPromise(async ({ input }) => {
        console.log("Fetch Shapefile", input);
        let response = await axios.post(
          shapefile_url,
          {
            geojson: input.result_geojson,
          },
          { responseType: "blob" }
        );
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);

        // create "a" HTML element with href to file & click
        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", uuidv7() + ".zip"); //or any other extension
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        return response;
      }),

      fetchBaseImage: fromPromise(async ({ input }) => {
        const tiff = await fromUrl(
          indices_base_url + input.base_image_url + ".tiff"
        );
        const image = await tiff.getImage();
        const data = await image.readRasters();
        return { image, data };
      }),
    },
    actions: {
      assignBaseImage: assign({
        base_image: ({ context, event }) => {
          return event.output;
        },
      }),
      assignPolygonizeResult: assign({
        result_geojson: ({ context, event }) => {
          return event.output;
        },
      }),
      updateAmbientes: assign({
        ambientes: ({ context, event }, params) => {
          console.log("updateAmbientes", event, params);

          let ambientes_cpy: Ambiente[] = JSON.parse(
            JSON.stringify(context.ambientes)
          );
          // evt tiene 3 partes ambiente_id, field, value
          let ambiente_idx = ambientes_cpy.findIndex(
            (a) => a.id === event.ambiente_id
          );

          ambientes_cpy[ambiente_idx][params.field] = event.value;
          return ambientes_cpy;
        },
      }),
      inicializarAmbientes: assign({
        ambientes: ({ context, event }, params) => {
          console.log("inicializarAmbientes", params);
          let num_amb = params?.ambientes_iniciales ?? event.ambientes;

          let default_palette = [
            "#e41a1c",
            "#377eb8",
            "#4daf4a",
            "#984ea3",
            "#ff7f00",
            "#ffff33",
            "#a65628",
            "#f781bf",
          ];

          let ambientes = [...Array(num_amb).keys()].map((a, index) => {
            return {
              nombre: "Ambiente " + (index + 1),
              color: default_palette[index],
              orden: index,
              id: uuidv7(),
              superficie: undefined,
              dosis: [],
            };
          });
          return ambientes;
        },
      }),
      inicializarRanges: assign({
        rangos:({context,event},params) =>{
          let num_amb = 2;
          let new_ranges_A = [...Array(num_amb - 1).keys()].map(
            (a) => (a + 1) * (2 / num_amb) - 1
          ); // va desde -1 a 1
      
          // scalar entre min y max
          let min = mymin(context.base_image.data[0]);
          let max = mymax(context.base_image.data[0]);
          let new_ranges = new_ranges_A.map((r) => scale(r, -1, 1, min, max));
          
          console.log("MMM", min, max, new_ranges_A, new_ranges);
          return new_ranges.sort()
        }
      }),
      updateRanges: assign({
        rangos: ({ context, event }) => event.new_ranges.sort(),
      }),

      paintMap: ({ context, event }) => {
        /* recalcular con rangos */
        let rangos = [...context.rangos, 1];

        /* Reclasificar */
        let cdta = context.base_image.data[0].map((pixval) => {
          if (isNaN(pixval)) return NaN;

          let retval = NaN;

          for (let i = 0; i < rangos.length; i++) {
            if (pixval < rangos[i]) {
              retval = rangos[i];
              break;
            }
          }
          return retval;
        });

        // renderCanvas(cdta, context.canvas, context.base_image.image.getWidth(), context.base_image.image.getHeight(), context.rangos, context.ambientes.map(a=>a.color))

        // Scale ranges to 0-1

        let scaled_ranges = [...context.rangos, 1].map((r) =>
          scale(r, -1, 1, 0, 1)
        );
        let colors = context.ambientes.map((a) => a.color);

        console.log("scaled, colors", scaled_ranges, colors);

        addColorScale("mycolor", colors, scaled_ranges);

        console.log("paintMap", context, context.map.current, cdta);

        /*  if(context.plot !== undefined){
  
              console.log("UNICO", context.plot.getCanvas());
              context.plot.setData(cdta, context.base_image.image.getWidth(), context.base_image.image.getHeight());
              context.plot.setColorScale("mycolor")
              context.plot.render();
            }else */
        {
          context.plot = new Pplot({
            useWebGL: false,
            canvas: context.canvas,
            data: cdta,
            width: context.base_image.image.getWidth(),
            height: context.base_image.image.getHeight(),
            domain: [-1, 1],
            colorScale: "mycolor",
          });
          context.plot.render();
        }

        const [gx1, gy1, gx2, gy2] = context.base_image.image.getBoundingBox();
        let coor = [
          [gx1, gy1],
          [gx2, gy1],
          [gx2, gy2],
          [gx1, gy2],
        ].reverse();
        console.log("COORDINATES", coor);

        showCanvasOnMap(
          context.map.current,
          context.canvas,
          coor,
          "indice-espectral"
        );
        let elMapa = context.map.current as Map;
        elMapa.fitBounds([coor[2], coor[0]], {
          padding: { top: 10, bottom: 10, left: 10, right: 10 },
        });

        context.map.current.setLayoutProperty(
          "indice-espectral",
          "visibility",
          "visible"
        );
      },

      showError: ({ context, event }) => {
        alert("ERROR");
        console.error("ERROR", context, event);
      },

      clearMap: ({ context, event }) => {
        console.log("clearMap");
        // context.map.current.getLayer('indice-espectral')
        context.map.current.setLayoutProperty(
          "indice-espectral",
          "visibility",
          "none"
        );
        context.map.current.getLayer("polygonized") &&
          context.map.current.setLayoutProperty(
            "polygonized",
            "visibility",
            "none"
          );
      },
      drawVectorInMap: ({ context, event }) => {
        let source = context.map.current.getSource("polygonized");

        let geojson_base = context.result_geojson;

        // Add color field on properties
        context.result_geojson.features = geojson_base.features.map((f, i) => {
          let ambiente_index = f.properties.value;
          f.properties.color = context.ambientes[ambiente_index].color;
          f.properties.nombre = context.ambientes[ambiente_index].nombre;

          return f;
        });

        //console.log("drawVectorInMap", context.result_geojson);

        if (source === undefined) {
          context.map.current.addSource("polygonized", {
            type: "geojson",
            data: context.result_geojson,
          });
        } else {
          source.setData(context.result_geojson);
        }

        let layer = context.map.current.getLayer("polygonized");
        if (layer === undefined) {
          context.map.current.addLayer({
            id: "polygonized",
            type: "fill",
            source: "polygonized", // reference the data source
            layout: {},
            paint: {
              "fill-color": ["get", "color"],
              "fill-opacity": 0.5,
            },
          });

          // Create a popup, but don't add it to the map yet.
          const popup = new Popup({
            closeButton: false,
            closeOnClick: false,
          });

          context.map.current.on("mouseenter", "polygonized", (e) => {
            // Change the cursor style as a UI indicator.
            context.map.current.getCanvas().style.cursor = "pointer";

            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.nombre;

            //console.log(e, coordinates, description);

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            // }
            // Populate the popup and set its coordinates
            // based on the feature found.
            popup
              .setLngLat(e.lngLat)
              .setHTML(description)
              .addTo(context.map.current);
          });

          context.map.current.on("mouseleave", "polygonized", () => {
            context.map.current.getCanvas().style.cursor = "";
            popup.remove();
          });
        }

        context.map.current.setLayoutProperty(
          "polygonized",
          "visibility",
          "visible"
        );
      },

      updateDosis: assign({
        dosis: ({ context, event }) => {
          let key = event.ambiente_id + "_" + event.insumo_id;

          context.dosis.set(key, event.value);
          //console.log("DEEFE", context.dosis);
          return context.dosis;
        },

        result_geojson: ({ context, event }) => {
          // event.ambiente_id + "_" +  event.insumo_id;
          let indice_del_ambiente_del_evento = context.ambientes.findIndex(
            (a) => a.id === event.ambiente_id
          );

          let nf = context.result_geojson.features.map((f) => {
            let indice_amb = f.properties.value;

            // Si event.ambiente_id es igual a el ambiente del map
            if (indice_amb === indice_del_ambiente_del_evento) {
              context.insumos.forEach((v, k) => {
                f.properties[v.nombre] = event.value;
              });
            }

            return f;
          });

          context.result_geojson.features = nf;
          return context.result_geojson;
        },
      }),

      addInsumo: assign({
        insumos: ({ context, event }) => {
          let l = context.insumos.size;
          context.insumos.set(uuidv7(), {
            nombre: "Insumo " + l,
            unidad: "Kg/ha",
          });
          return context.insumos;
        },
      }),

      deleteInsumo: assign({
        insumos: ({ context, event }) => {
          context.insumos.delete(event.id);
          return context.insumos;
        },
      }),
    },
  });
};
