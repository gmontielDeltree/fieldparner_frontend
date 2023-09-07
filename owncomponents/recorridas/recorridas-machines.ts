import { createMachine } from "xstate";
import { PuntoRecorrida, Recorrida } from './recorrida-types';
import { Map } from "mapbox-gl";

export interface RecorridaMachineCtx {
	recorrida : Recorrida
	map : Map
  punto_editando: PuntoRecorrida 
  
}

export const machine = createMachine(
  {
    id: "recorrida",
    initial: "inicial",
    states: {
      inicial: {
        always: [
          {
            target: "loadRecorrida",
            cond: "editarRecorrida",
            actions: {
              type: "assignMap",
              params: {},
            },
          },
          {
            target: "#recorrida.loaded.empty",
            actions: {
              type: "assignMap",
              params: {},
            },
          },
        ],
      },
      loadRecorrida: {
        entry: {
          type: "initiCtx",
          params: {},
        },
        invoke: {
          src: "fetchRecorrida",
          id: "invoke-m7wb9",
          onDone: [
            {
              target: "loaded",
            },
          ],
          onError: [
            {
              target: "failedFetch",
            },
          ],
        },
      },
      loaded: {
        initial: "mostrandoRecorrida",
        states: {
          mostrandoRecorrida: {
            entry: {
              type: "refreshMapa",
              params: {},
            },
            on: {
              SELECCIONAR_PUNTO: {
                target: "editandoPunto",
                actions: {
                  type: "seleccionarPunto",
                  params: {},
                },
              },
              NUEVO_PUNTO: {
                target: "editandoPunto",
                actions: {
                  type: "initPuntoNuevo",
                  params: {},
                },
              },
              EDIT_RECORRIDA_DATA: {
                actions: {
                  type: "editRecorridaData",
                  params: {},
                },
                internal: true,
              },
            },
          },
          editandoPunto: {
            entry: [
              {
                type: "centrarMapaEnAccion",
                params: {},
              },
              {
                type: "initEditMapMode",
                params: {},
              },
            ],
            exit: {
              type: "salirEditMapMode",
              params: {},
            },
            on: {
              NUEVA_FOTO: {
                actions: {
                  type: "addFoto",
                  params: {},
                },
                internal: true,
              },
              PUNTO_GUARDADO: {
                target: "mostrandoRecorrida",
                actions: {
                  type: "guardarPunto",
                  params: {},
                },
              },
              EDIT_POSICION: {
                actions: {
                  type: "assignPosicion",
                  params: {},
                },
                internal: true,
              },
              BORRAR_PUNTO: {
                target: "mostrandoRecorrida",
                actions: {
                  type: "borrarPunto",
                  params: {},
                },
              },
              SELECCIONAR_PUNTO: {
                actions: {
                  type: "seleccionarPunto",
                  params: {},
                },
                internal: true,
              },
            },
          },
          empty: {
            entry: {
              type: "emptyRecorrida",
              params: {},
            },
            on: {
              NUEVO_PUNTO: {
                target: "editandoPunto",
                actions: {
                  type: "initPuntoNuevo",
                  params: {},
                },
              },
            },
          },
        },
        on: {
          GUARDAR: {
            actions: {
              type: "guardarRecorrida",
              params: {},
            },
            internal: true,
          },
          GENERAR_REPORTE: {
            actions: {
              type: "generarReporteEnNuevaPestana",
              params: {},
            },
            internal: true,
          },
        },
      },
      failedFetch: {
        type: "final",
      },
    },
    schema: {
      events: {} as
        | { type: "GUARDAR" }
        | { type: "GENERAR_REPORTE" }
        | { type: "SELECCIONAR_PUNTO" }
        | { type: "NUEVO_PUNTO" }
        | { type: "EDIT_RECORRIDA_DATA" }
        | { type: "NUEVA_FOTO" }
        | { type: "PUNTO_GUARDADO" }
        | { type: "EDIT_POSICION" }
        | { type: "BORRAR_PUNTO" },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      initiCtx: (context, event) => {},

      refreshMapa: (context, event) => {},

      centrarMapaEnAccion: (context, event) => {},

      initEditMapMode: (context, event) => {},

      salirEditMapMode: (context, event) => {},

      guardarRecorrida: (context, event) => {},

      generarReporteEnNuevaPestana: (context, event) => {},

      seleccionarPunto: (context, event) => {},

      initPuntoNuevo: (context, event) => {},

      editRecorridaData: (context, event) => {},

      addFoto: (context, event) => {},

      guardarPunto: (context, event) => {},

      assignPosicion: (context, event) => {},

      borrarPunto: (context, event) => {},

      assignMap: (context, event) => {},

      emptyRecorrida: (context, event) => {},
    },
    services: { fetchRecorrida: (context, event) => {} },
    guards: { editarRecorrida: (context, event) => false },
    delays: {},
  },
);