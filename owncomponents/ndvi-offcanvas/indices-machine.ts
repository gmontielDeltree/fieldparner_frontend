import { Machine, MachineConfig, createMachine } from "xstate";
import {
  Feature,
  FeatureCollection,
  GeoJSONObject,
  feature,
  featureCollection,
} from "@turf/helpers";
import { IndiceEspectral, list_of_indexes } from "./indices-types";

interface IndicesMachineContext {
  data1: any,
  data2: any,
  featureCollection: FeatureCollection;
  selectedFeature1: Feature | undefined;
  selectedFeature2: Feature | undefined;
  selectedIndice1: IndiceEspectral;
  selectedIndice2: IndiceEspectral;
  geojson: GeoJSONObject;
  lote_id: string;
}

// export const indices_machine  = createMachine<IndicesMachineContext>({
// 	id:"indices",
// 	context: {featureCollection:featureCollection([]),selectedFeature:undefined, selectedIndice:list_of_indexes[0]},
// 	states:{

// 	}
// })

export const machine = createMachine(
  {
    context: {
      data1: {},
      data2: {},
      geojson: {},
      lote_id: "",
      dualmapControl: {},
      selectedIndice1: {},
      selectedIndice2: {},
      selectedFeature1: {},
      selectedFeature2: {},
      featureCollection: {},
    },
    id: "IndexStudio",
    initial: "empty",
    states: {
      empty: {
        entry: {
          type: "assignLoteId",
          params: {},
        },
        invoke: {
          src: "getGeojson",
          id: "invoke-jx7rw",
          onDone: [
            {
              target: "withGeojson",
              actions: {
                type: "assignGeojson",
                params: {},
              },
            },
          ],
        },
      },
      withGeojson: {
        entry: [
          {
            type: "limpiarMap1y2",
            params: {},
          },
          {
            type: "assignDualMapControl",
            params: {},
          },
          {
            type: "addDualMapControl",
            params: {},
          },
        ],
        invoke: {
          src: "getFeatures",
          id: "invoke-nt3gq",
          onDone: [
            {
              target: "fetchImagenInicial",
              actions: [
                {
                  type: "assignFeatures",
                  params: {},
                },
                {
                  type: "selectLastFeature1",
                  params: {},
                },
                {
                  type: "centerMapOnFeature1",
                  params: {},
                },
              ],
            },
          ],
          onError: [
            {
              target: "failed",
              actions: {
                type: "notificarError",
                params: {},
              },
            },
          ],
        },
      },
      fetchImagenInicial: {
        invoke: {
          src: "fetchImagenInicial",
          id: "invoke-o16z2",
          onDone: [
            {
              target: "loaded",
              actions: [
                {
                  type: "updateMap1",
                  params: {},
                },
                {
                  type: "assignData1",
                  params: {},
                },
              ],
            },
          ],
          onError: [
            {
              target: "loaded",
              actions: {
                type: "notificarError",
                params: {},
              },
            },
          ],
        },
      },
      failed: {
        on: {
          RETRY: {
            target: "withGeojson",
          },
        },
      },
      loaded: {
        initial: "pantallaEntera",
        states: {
          pantallaEntera: {
            on: {
              TOGGLE: {
                target: "pantallaDividida",
                actions: {
                  type: "showDualMap",
                  params: {},
                },
              },
            },
          },
          pantallaDividida: {
            on: {
              TOGGLE: {
                target: "pantallaEntera",
                actions: {
                  type: "showSingleMap",
                  params: {},
                },
              },
            },
          },
          hist: {
            history: "shallow",
            type: "history",
          },
        },
        on: {
          DOWNLOAD_PNG: {
            actions: {
              type: "downloadPNG",
              params: {},
            },
            internal: true,
          },
          DOWNLOAD_XLS: {
            actions: {
              type: "downloadXLS",
              params: {},
            },
            internal: true,
          },
          SELECTED_INDICE_1_CHANGED: {
            target: "loadNuevaImagen1",
            actions: {
              type: "updateIndex1",
              params: {},
            },
          },
          SELECTED_FEATURE_1: {
            target: "loadNuevaImagen1",
            actions: {
              type: "updateFeature1",
              params: {},
            },
          },
          SELECTED_FEATURE_2: {
            target: "loadNuevaImagen2",
            actions: {
              type: "updateFeature2",
              params: {},
            },
          },
          SELECTED_INDICE_2_CHANGED: {
            target: "loadNuevaImagen2",
            actions: {
              type: "updateIndex2",
              params: {},
            },
          },
        },
      },
      loadNuevaImagen1: {
        invoke: {
          src: "fetchImagen",
          id: "invoke-kr9hc",
          onDone: [
            {
              target: "#IndexStudio.loaded.hist",
              actions: [
                {
                  type: "updateMap1",
                  params: {},
                },
                {
                  type: "assignData1",
                  params: {},
                },
              ],
            },
          ],
          onError: [
            {
              target: "#IndexStudio.loaded.hist",
              actions: {
                type: "notificarError",
                params: {},
              },
            },
          ],
        },
      },
      loadNuevaImagen2: {
        invoke: {
          src: "fetchImagen",
          id: "invoke-kr9hc",
          onDone: [
            {
              target: "#IndexStudio.loaded.hist",
              actions: [
                {
                  type: "updateMap2",
                  params: {},
                },
                {
                  type: "assignData2",
                  params: {},
                },
              ],
            },
          ],
          onError: [
            {
              target: "#IndexStudio.loaded.hist",
              actions: {
                type: "notificarError",
                params: {},
              },
            },
          ],
        },
      },
      done: {
        entry: [
          {
            type: "removeDualMapControl",
            params: {},
          },
          {
            type: "showSingleMap",
            params: {},
          },
          {
            type: "deleteMapSourcesLayers",
            params: {},
          },
          {
            type: "removeHandlers",
            params: {},
          },
        ],
        type: "final",
      },
    },
    on: {
      CERRAR: {
        target: ".done",
        internal: true,
      },
    },
    schema: {
      events: {} as
        | { type: "TOGGLE" }
        | { type: "DOWNLOAD_PNG" }
        | { type: "DOWNLOAD_XLS" }
        | { type: "SELECTED_INDICE_1_CHANGED" }
        | { type: "SELECTED_FEATURE_1" }
        | { type: "SELECTED_FEATURE_2" }
        | { type: "RETRY" }
        | { type: "SELECTED_INDICE_2_CHANGED" }
        | { type: "CERRAR" },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      limpiarMap1y2: (context, event) => {},

      assignDualMapControl: (context, event) => {},

      addDualMapControl: (context, event) => {},

      assignLoteId: (context, event) => {},

      removeDualMapControl: (context, event) => {},

      showSingleMap: (context, event) => {},

      deleteMapSourcesLayers: (context, event) => {},

      removeHandlers: (context, event) => {},

      showDualMap: (context, event) => {},

      downloadPNG: (context, event) => {},

      downloadXLS: (context, event) => {},

      updateIndex1: (context, event) => {},

      updateFeature1: (context, event) => {},

      updateFeature2: (context, event) => {},

      assignFeatures: (context, event) => {},

      selectLastFeature1: (context, event) => {},

      centerMapOnFeature1: (context, event) => {},

      notificarError: (context, event) => {},

      updateMap2: (context, event) => {},

      assignData2: (context, event) => {},

      updateMap1: (context, event) => {},

      assignData1: (context, event) => {},

      updateIndex2: (context, event) => {},

      assignGeojson: (context, event) => {},
    },
    services: {
      getFeatures: (context, event) => {},

      fetchImagen: (context, event) => {},

      getGeojson: (context, event) => {},

      fetchImagenInicial: (context, event) => {},
    },
    guards: {},
    delays: {},
  },
);