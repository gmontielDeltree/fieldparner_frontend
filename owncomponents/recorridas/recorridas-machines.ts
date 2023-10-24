import { createMachine } from "xstate";
import { PuntoRecorrida, Recorrida } from './recorrida-types';
import { Map, Marker } from "mapbox-gl";

export interface RecorridaMachineCtx {
	recorrida : Recorrida
	map : Map
  punto_editando: PuntoRecorrida 
  marker: Marker 
  fields: Object []
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
              },
            },
            {
              target: "loaded",
              actions: [
                {
                  type: "assignMap",
                },
                {
                  type: "emptyRecorrida",
                },
                {
                  type: "notificarSinPuntos",
                },
              ],
            },
          ],
        },
      },
      loadRecorrida: {
        entry: {
          type: "initCtx",
        },
        invoke: {
          src: "fetchRecorrida",
          id: "invoke-m7wb9",
          onDone: [
            {
              target: "loaded",
              actions: {
                type: "assignRecorrida",
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
            },
            on: {
              SELECCIONAR_PUNTO: {
                target: "editandoPunto",
                actions: {
                  type: "seleccionarPunto",
                },
              },
              NUEVO_PUNTO: {
                target: "editandoPunto",
                actions: [
                  {
                    type: "initPuntoNuevo",
                  },
                  {
                    type: "notificarPuntoNuevo",
                  },
                ],
              },
              EDIT_RECORRIDA_DATA: {
                actions: {
                  type: "editRecorridaData",
                },
                internal: true,
              },
              BORRAR_PUNTO: {
                actions: {
                  type: "borrarPunto",
                },
                internal: true,
              },
              GUARDAR: {
                target: "final",
                actions: [
                  {
                    type: "guardarRecorrida",
                  },
                  {
                    type: "notificarRecorridaGuardada",
                  },
                ],
              },
            },
          },
          editandoPunto: {
            entry: [
              {
                type: "centrarMapaEnAccion",
              },
              {
                type: "initEditMapMode",
              },
            ],
            exit: {
              type: "salirEditMapMode",
            },
            initial: "idle",
            states: {
              idle: {
                on: {
                  ADD_PUNTO_FIELD: [
                    {
                      target: "fetchingFields",
                      cond: "fieldsEmpty",
                    },
                    {
                      target: "mostrarFields",
                    },
                  ],
                },
              },
              fetchingFields: {
                invoke: {
                  src: "fetchFields",
                  id: "invoke-6snbw",
                  onDone: [
                    {
                      target: "mostrarFields",
                      actions: {
                        type: "assignFields",
                      },
                    },
                  ],
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
                    },
                  },
                },
              },
            },
            on: {
              NUEVA_FOTO: {
                actions: {
                  type: "addFoto",
                },
                internal: true,
              },
              PUNTO_GUARDADO: {
                target: "mostrandoRecorrida",
                actions: [
                  {
                    type: "guardarPunto",
                  },
                  {
                    type: "notificarPuntoGuardado",
                  },
                ],
              },
              EDIT_POSICION: {
                actions: {
                  type: "assignPosicion",
                },
                internal: true,
              },
              SELECCIONAR_PUNTO: {
                actions: {
                  type: "seleccionarPunto",
                },
                internal: true,
              },
              EDIT_PUNTO_DATA: {
                actions: {
                  type: "assignPuntoData",
                },
                internal: true,
              },
              VOLVER: {
                target: "mostrandoRecorrida",
              },
              NOTIFICAR_POSICION_MANUAL: {
                actions: {
                  type: "notificarPosicion",
                },
                internal: true,
              },
            },
          },
          final: {
            entry: [
              {
                type: "limpiarMapa",
              },
              {
                type: "goBack",
              },
            ],
            type: "final",
          },
        },
        on: {
          GENERAR_REPORTE: {
            actions: {
              type: "generarReporteEnNuevaPestana",
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
        | { type: "START" }
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
        | { type: "NOTIFICAR_POSICION_MANUAL" },
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

      limpiarMapa: (context, event) => {},

      goBack: (context, event) => {},

      assignRecorrida: (context, event) => {},

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

      emptyRecorrida: (context, event) => {},

      notificarSinPuntos: (context, event) => {},

      assignPuntoData: (context, event) => {},

      assignAddField: (context, event) => {},

      guardarRecorrida: (context, event) => {},

      notificarRecorridaGuardada: (context, event) => {},

      notificarPosicion: (context, event) => {},

      assignFields: (context, event) => {},
    },
    services: {
      fetchRecorrida: createMachine({
        /* ... */
      }),

      fetchFields: createMachine({
        /* ... */
      }),
    },
    guards: {
      editarRecorrida: (context, event) => false,

      fieldsEmpty: (context, event) => false,
    },
    delays: {},
  },
);