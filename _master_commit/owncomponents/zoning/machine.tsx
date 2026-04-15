import { GeoTIFFImage, ReadRasterResult } from "geotiff";
import { createMachine, assign } from "xstate";

export interface InsumoMap {
  [id: string]: { nombre: string; unidad: string };
}

export interface DosisMap {
  [ambiente_id_insumo_id: string]: number;
}

export interface Ambiente {
  nombre: string;
  color: string;
  orden: number;
  superficie: number;
  id: string;
}

export interface ZoningCtx {
  /* Para el dibujado */
  base_image_name: string;
  base_image_url: string;
  base_image: any;
  canvas: HTMLCanvasElement;
  plot: any;

  /* El objetivo */
  ambientes: Ambiente[];
  dosis: DosisMap;
  insumos: InsumoMap;
  rangos: number[];

  border_geojson: Object;
  result_geojson: Object;
}

export const machine = createMachine(
  {
    context: ({ input }) => ({
      base_image_name: input.base_image_name,
      base_image_url: input.base_image_url,
      base_image: undefined,
      map: input.map,
      canvas: input.canvas,
      plot: undefined,
      ambientes: input.ambientes,
      dosis: new Map<string, number>(),
      rangos: input.rangos,
      insumos: new Map<
        string,
        {
          nombre: string;
          unidad: string;
        }
      >(),
      border_geojson: input.border_geojson,
      result_geojson: input.result_geojson,
      dosis_en_edit: { insumo: "Insumo #", unidad: "Kg/ha" },
    }),
    id: "zoning",
    initial: "Initial state",
    states: {
      "Initial state": {
        always: {
          target: "settingBaseImage",
        },
      },
      settingBaseImage: {
        invoke: {
          src: "fetchBaseImage",
          id: "invoke-f0kyv",
          input: ({ context }) => ({ ...context }),
          onDone: [
            {
              target: "settingParameters",
              actions: [
                {
                  type: "assignBaseImage",
                },
                {
                  type: "inicializarAmbientes",
                  params: {
                    ambientes_iniciales: 2,
                  },
                },
                {type: "inicializarRanges"}
              ],
            },
          ],
          onError: [
            {
              target: "settingBaseImage",
              actions: {
                type: "showError",
              },
            },
          ],
        },
      },
      settingParameters: {
        entry: {
          type: "paintMap",
        },
        on: {
          POLYGONIZE: {
            target: "fetchingGeojson",
          },
          SET_NOMBRE: {
            target: "settingParameters",
            actions: {
              type: "updateAmbientes",
              params: {
                field: "nombre",
              },
            },
            reenter: true,
          },
          SET_COLOR: {
            target: "settingParameters",
            actions: {
              type: "updateAmbientes",
              params: {
                field: "color",
              },
            },
            reenter: true,
          },
          SET_NUM_AMBIENTES: {
            target: "settingParameters",
            actions: [
              {
                type: "updateRanges",
              },
              {
                type: "inicializarAmbientes",
              },
            ],
            reenter: true,
          },
          SET_RANGES: {
            target: "settingParameters",
            actions: {
              type: "updateRanges",
            },
            reenter: true,
          },
          VOLVER: {
            target: "settingBaseImage",
          },
        },
      },
      fetchingGeojson: {
        invoke: {
          src: "fetchGeojson",
          id: "invoke-c8cn5",
          input: ({ context }) => ({ ...context }),
          onDone: [
            {
              target: "settingDosis",
              actions: [
                {
                  type: "clearMap",
                },
                {
                  type: "assignPolygonizeResult",
                },
                {
                  type: "drawVectorInMap",
                },
              ],
            },
          ],
          onError: [
            {
              target: "settingParameters",
              actions: {
                type: "showError",
              },
            },
          ],
        },
      },
      settingDosis: {
        on: {
          VOLVER: {
            target: "settingParameters",
            actions: {
              type: "clearMap",
            },
          },
          SET_DOSIS: {
            target: "settingDosis",
            actions: {
              type: "updateDosis",
            },
          },
          DOWNLOAD_SHP: {
            target: "fetchingShapefile",
          },
          SEND_TO_JDOC: {
            target: "settingDosis",
          },
          ADD_DOSIS: {
            target: "settingDosis",
          },
          ADD_INSUMO: {
            target: "settingDosis",
            actions: {
              type: "addInsumo",
            },
          },
          DELETE_INSUMO: {
            target: "settingDosis",
            actions: {
              type: "deleteInsumo",
            },
          },
        },
      },
      fetchingShapefile: {
        invoke: {
          src: "fetchShapefile",
          id: "invoke-a3md5",
          input: ({ context }) => ({ ...context }),
          onDone: [
            {
              target: "settingDosis",
            },
          ],
          onError: [
            {
              target: "settingDosis",
              actions: {
                type: "showError",
              },
            },
          ],
        },
      },
      "New state 1": {},
    },
    types: {
      events: {} as
        | { type: "VOLVER" }
        | { type: "ADD_DOSIS" }
        | { type: "SET_COLOR" }
        | { type: "SET_DOSIS" }
        | { type: "ADD_INSUMO" }
        | { type: "POLYGONIZE" }
        | { type: "SET_NOMBRE" }
        | { type: "SET_RANGES" }
        | { type: "DOWNLOAD_SHP" }
        | { type: "SEND_TO_JDOC" }
        | { type: "DELETE_INSUMO" }
        | { type: "SET_NUM_AMBIENTES" },
    },
  },
  {
    actions: {
      paintMap: ({ context, event }) => {},
      assignBaseImage: ({ context, event }) => {},
      inicializarAmbientes: ({ context, event }) => {},
      showError: ({ context, event }) => {},
      updateAmbientes: ({ context, event }) => {},
      updateRanges: ({ context, event }) => {},
      clearMap: ({ context, event }) => {},
      assignPolygonizeResult: ({ context, event }) => {},
      drawVectorInMap: ({ context, event }) => {},
      updateDosis: ({ context, event }) => {},
      addInsumo: ({ context, event }) => {},
      deleteInsumo: ({ context, event }) => {},
    },
    actors: {
      fetchBaseImage: createMachine({
        /* ... */
      }),
      fetchGeojson: createMachine({
        /* ... */
      }),
      fetchShapefile: createMachine({
        /* ... */
      }),
    },
    guards: {},
    delays: {},
  }
);
