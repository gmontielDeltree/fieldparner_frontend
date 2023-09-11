import { createMachine } from "xstate";
import { PuntoRecorrida, Recorrida } from './recorrida-types';
import { Map, Marker } from "mapbox-gl";

export interface RecorridaMachineCtx {
	recorrida : Recorrida
	map : Map
  punto_editando: PuntoRecorrida 
  marker: Marker 
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
              BORRAR_PUNTO: {
                actions: {
                  type: "borrarPunto",
                  params: {},
                },
                internal: true,
              },
              GUARDAR: {
                actions: {
                  type: "guardarRecorrida",
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
            initial: "idle",
            states: {
              idle: {
                on: {
                  ADD_PUNTO_FIELD: {
                    target: "mostrarFields",
                  },
                },
              },
              mostrarFields: {
                on: {
                  CERRAR_FIELDS: {
                    target: "idle",
                  },
                  SELECCIONAR_FIELD: {
                    target: "idle",
                    actions: {
                      type: "assignAddField",
                      params: {},
                    },
                  },
                },
              },
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
              SELECCIONAR_PUNTO: {
                actions: {
                  type: "seleccionarPunto",
                  params: {},
                },
                internal: true,
              },
              EDIT_PUNTO_DATA: {
                actions: {
                  type: "assignPuntoData",
                  params: {},
                },
                internal: true,
              },
              VOLVER: {
                target: "mostrandoRecorrida",
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
      CERRADO: {
        entry: {
          type: "limpiarMapa",
          params: {},
        },
        type: "final",
      },
    },
    on: {
      CERRAR: {
        target: ".CERRADO",
        internal: true,
      },
    },
    schema: {
      events: {} as
        | { type: "CERRAR" }
        | { type: "NUEVA_FOTO" }
        | { type: "NUEVO_PUNTO" }
        | { type: "BORRAR_PUNTO" }
        | { type: "CERRAR_FIELDS" }
        | { type: "EDIT_POSICION" }
        | { type: "PUNTO_GUARDADO" }
        | { type: "ADD_PUNTO_FIELD" }
        | { type: "EDIT_PUNTO_DATA" }
        | { type: "GENERAR_REPORTE" }
        | { type: "SELECCIONAR_FIELD" }
        | { type: "SELECCIONAR_PUNTO" }
        | { type: "EDIT_RECORRIDA_DATA" }
        | { type: "GUARDAR" }
        | { type: "VOLVER" },
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

      emptyRecorrida: (context, event) => {},

      limpiarMapa: (context, event) => {},

      generarReporteEnNuevaPestana: (context, event) => {},

      seleccionarPunto: (context, event) => {},

      initPuntoNuevo: (context, event) => {},

      editRecorridaData: (context, event) => {},

      addFoto: (context, event) => {},

      guardarPunto: (context, event) => {},

      assignPosicion: (context, event) => {},

      borrarPunto: (context, event) => {},

      assignMap: (context, event) => {},

      assignPuntoData: (context, event) => {},

      assignAddField: (context, event) => {},

      guardarRecorrida: (context, event) => {},
    },
    services: { fetchRecorrida: (context, event) => {} },
    guards: { editarRecorrida: (context, event) => false },
    delays: {},
  },
);
