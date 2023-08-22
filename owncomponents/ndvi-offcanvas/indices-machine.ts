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
    id: "IndexStudio",
    context: {
      lote_id: "",
      selectedIndice1: {},
      selectedIndice2: {},
      selectedFeature1: {},
      selectedFeature2: {},
      featureCollection: {},
      geojson: {},
    },
    initial: "Empty",
    states: {
      Empty: {
        entry: {
          type: "limpiarMap1y2",
          params: {},
        },
        invoke: {
          src: "getFeatures",
          id: "invoke-nt3gq",
          onDone: [
            {
              target: "Loaded",
              actions: {
                type: "assignFeatures",
                params: {},
              },
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
      Loaded: {
        initial: "PantallaEntera",
        states: {
          PantallaEntera: {
            on: {
              TOGGLE: {
                target: "PantallaDividida",
              },
            },
          },
          PantallaDividida: {
            on: {
              TOGGLE: {
                target: "PantallaEntera",
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
              type: "updateDate1",
              params: {},
            },
          },
          SELECTED_FEATURE_2: {
            target: "loadNuevaImagen2",
            actions: {
              type: "updateDate2",
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
      failed: {
        on: {
          RETRY: {
            target: "Empty",
          },
        },
      },
      loadNuevaImagen1: {
        invoke: {
          src: "fetchImagen",
          id: "invoke-kr9hc",
          onDone: [
            {
              target: "#IndexStudio.Loaded.hist",
              actions: {
                type: "updateMap1",
                params: {},
              },
            },
          ],
          onError: [
            {
              target: "#IndexStudio.Loaded.hist",
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
              target: "#IndexStudio.Loaded.hist",
              actions: {
                type: "updateMap2",
                params: {},
              },
            },
          ],
          onError: [
            {
              target: "#IndexStudio.Loaded.hist",
              actions: {
                type: "notificarError",
                params: {},
              },
            },
          ],
        },
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
        | { type: "SELECTED_INDICE_2_CHANGED" },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import("./indices-machine.typegen").Typegen0,
  },
  {
    actions: {
      limpiarMap1y2: ({ context, event, action }) => {
        // ...
      },

      updateIndex1: ({ context, event, action }) => {
        // ...
      },

      updateDate1: ({ context, event, action }) => {
        // ...
      },

      updateDate2: ({ context, event, action }) => {
        // ...
      },

      assignFeatures: ({ context, event, action }) => {
        // ...
      },

      downloadXLS: ({ context, event, action }) => {
        // ...
      },

      downloadPNG: ({ context, event, action }) => {
        // ...
      },

      updateMap2: ({ context, event, action }) => {
        // ...
      },

      updateMap1: ({ context, event, action }) => {
        // ...
      },

      updateIndex2: ({ context, event, action }) => {
        // ...
      },

      notificarError: ({ context, event, action }) => {
        // ...
      },
    },
    services: {
      getFeatures: (context, event) => {},

      fetchImagen: (context, event) => {},
    },
    guards: {},
    delays: {},
  }
);
