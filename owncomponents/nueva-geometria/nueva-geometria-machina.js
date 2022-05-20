import { init } from "events";
import { createMachine, assign } from "xstate";

/**
 *
 * @param {*} ctx
 * @param {*} e
 * @returns Una nueva geometria con el nuevo punto
 */
const add_punto = (ctx, e) => {
  ctx.geometry.push(e.value);
  return ctx.geometry;
};
const es_cerrado = (ctx) => {
  return last_point[0] === geometry[0][0] && last_point[1] === geometry[0][1];
};
const es_abierto = (ctx) => !es_cerrado(ctx);
const initial_ctx = { geometry: [], last_point: null };

export const nuevaGeometriaMachine = createMachine({
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
                NUEVO_PUNTO: {
                  target: "cerrado",
                  cond: es_cerrado,
                  actions: assign({
                    geometry: add_punto,
                    last_point: (ctx, e) => e.value,
                  }),
                },
              },
            },
            cerrado: {
              on: {
                NEXT: { target: "#nombre" },
                CHANGE: { target: "abierto", cond: es_abierto },
                DELETED: {target: 'abierto'},
                UPDATED: {target: 'cerrado'}
              },
            },
          },
        },
        subir_archivo: {
          on: {
            SUBIDO: "nombre",
            ERROR: "error",
          },
        },
        error: {
          on: { NEXT: "#idle" },
        },
        nombre: {
          id: "nombre",
          on: {
            CHANGE: assign((ctx, e) => e.value),
            GUARDAR: "#idle",
          },
        },
      },
    },
  },
});
