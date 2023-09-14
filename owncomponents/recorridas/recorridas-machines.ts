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
        on: {
          START: [
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
      },
      loadRecorrida: {
        entry: {
          type: "initCtx",
          params: {},
        },
        invoke: {
          src: "fetchRecorrida",
          id: "invoke-m7wb9",
          onDone: [
            {
              target: "loaded",
              actions: {
                type: "assignRecorrida",
                params: {},
              },
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
                actions: [
                  {
                    type: "initPuntoNuevo",
                    params: {},
                  },
                  {
                    type: "notificarPuntoNuevo",
                    params: {},
                  },
                ],
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
                target: "final",
                actions: [
                  {
                    type: "guardarRecorrida",
                    params: {},
                  },
                  {
                    type: "notificarRecorridaGuardada",
                    params: {},
                  },
                ],
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
                actions: [
                  {
                    type: "guardarPunto",
                    params: {},
                  },
                  {
                    type: "notificarPuntoGuardado",
                    params: {},
                  },
                ],
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
              NOTIFICAR_POSICION_MANUAL: {
                actions: {
                  type: "notificarPosicion",
                  params: {},
                },
                internal: true,
              },
            },
          },
          final: {
            entry: [
              {
                type: "limpiarMapa",
                params: {},
              },
              {
                type: "goBack",
                params: {},
              },
            ],
            type: "final",
          },
          empty: {
            entry: {
              type: "emptyRecorrida",
              params: {},
            },
            on: {
              NUEVO_PUNTO: {
                target: "editandoPunto",
                actions: [
                  {
                    type: "initPuntoNuevo",
                    params: {},
                  },
                  {
                    type: "notificarPuntoNuevo",
                    params: {},
                  },
                ],
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
        | { type: "VOLVER" }
        | { type: "GUARDAR" }
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
        | { type: "NOTIFICAR_POSICION_MANUAL" }
        | { type: "START" },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      initCtx: (context, event) => {},

      refreshMapa: (context, event) => {},

      centrarMapaEnAccion: (context, event) => {},

      initEditMapMode: (context, event) => {},

      salirEditMapMode: (context, event) => {},

      emptyRecorrida: (context, event) => {},

      limpiarMapa: (context, event) => {},

      goBack: (context, event) => {},

      generarReporteEnNuevaPestana: (context, event) => {},

      seleccionarPunto: (context, event) => {},

      initPuntoNuevo: (context, event) => {},

      notificarPuntoNuevo: (context, event) => {},

      editRecorridaData: (context, event) => {},

      addFoto: (context, event) => {},

      guardarPunto: (context, event) => {},

      notificarPuntoGuardado: (context, event) => {},

      assignPosicion: (context, event) => {},

      borrarPunto: (context, event) => {},

      assignMap: (context, event) => {},

      assignPuntoData: (context, event) => {},

      assignAddField: (context, event) => {},

      guardarRecorrida: (context, event) => {},

      notificarRecorridaGuardada: (context, event) => {},

      notificarPosicion: (context, event) => {},

      assignRecorrida: (context, event) => {},
    },
    services: { fetchRecorrida: (context, event) => {} },
    guards: { editarRecorrida: (context, event) => false },
    delays: {},
  },
);
