import { init } from "events";
import { createMachine, assign } from "xstate";
import booleanContains from "@turf/boolean-contains";

/**
 *
 * @param {*} ctx
 * @param {*} e
 * @returns Una nueva geometria con el nuevo punto
 */

const initial_ctx = {
  es_lote: true,
  campo_feature: {},
  feature: null,
  guardar_enable: false,
  nombre: "",
};

const es_dentro_del_campo = (ctx, e) => {
  if(!ctx.es_lote){
    return true;
  }
  console.log("EVAL", ctx, e);

  let feature = ctx.feature;
  let parent_feature = ctx.campo_feature;
  return booleanContains(parent_feature, feature);
};

const es_fuera_del_campo = (ctx, e) => {
  if(!ctx.es_lote){
    return false;
  }
  console.log("ES FUERA", ctx);
  return !booleanContains(ctx.campo_feature, ctx.feature);
};

const read_kml = (ctx, e) => {};

const nuevaGeometriaMachine = createMachine(
  {
    id: "nueva-geometria-machine",
    initial: "idle",
    context: initial_ctx,
    states: {
      idle: {
        id: "idle",
        on: { START: { target: "editing" } },
      },
      editing: {
        initial: "pregunta",
        on: {
          CANCEL: { target: "idle" },
          TERMINADO: { target: "idle" },
        },
        states: {
          pregunta: {
            on: {
              SUBIR: { target: "subir_archivo" },
              DIBUJAR: { target: "dibujando" },
            },
          },
          dibujando: {
            initial: "abierto",
            states: {
              abierto: {
                on: {
                  CERRO: {
                    target: "analizando",
                    actions: assign({ feature: (ctx, e) => e.feature }),
                  },
                },
              },
              analizando: {
                always: [
                  { target: "cerrado_fuera", cond: "es_fuera" },
                  { target: "cerrado_dentro", cond: "es_dentro" },
                ],
              },
              cerrado_fuera: {
                entry: assign({ guardar_enable: () => false }),
                always: {
                  target: "cerrado_dentro",
                  cond: "es_dentro",
                },
                on: {
                  UPDATE_POLIGONO: {
                    actions: assign({ feature: (_, e) => e.feature }),
                  },
                  CHANGE: {
                    actions: assign({ nombre: (_, e) => e.value }),
                  },
                },
              },
              cerrado_dentro: {
                entry: assign({ guardar_enable: () => true }),
                always: {
                  target: "cerrado_fuera",
                  cond: "es_fuera",
                },
                on: {
                  UPDATE_POLIGONO: {
                    actions: assign({ feature: (_, e) => e.feature }),
                  },
                  CHANGE: {
                    actions: assign({ nombre: (_, e) => e.value }),
                  },
                  GUARDAR: { target: "#idle" },
                },
              },
            },
          },
          subir_archivo: {
            on: {
              KML: {
                actions: assign({ feature: read_kml }),
              },
              SUBIDO: {
                target: "nombre",
                actions: [
                  assign({
                    feature: (_, e) => e.feature,
                    nombre: (_, e) => e.feature.properties.name || "",
                    guardar_enable: (ctx) => (ctx.es_lote === false) ? true : ctx.guardar_enable,
                  }),
                ],
              },
              SUBIDO_MULTIPLE: {
                target: "modal_multiple"
              },
              ERROR: "error",
            },
          },
          modal_multiple:{
            on:{
              GUARDAR:"#idle",
            }
          },
          error: {
            on: { NEXT: "#idle" },
          },
          nombre: {
            id: "nombre",
            on: {
              CHANGE: {
                actions: assign({ nombre: (_, e) => e.value }),
              },
              GUARDAR: "#idle",
            },
          },
        },
      },
    },
  },
  {
    guards: {
      es_dentro: es_dentro_del_campo,
      es_fuera: es_fuera_del_campo,
    },
  }
);

export {nuevaGeometriaMachine, initial_ctx};
