import { createMachine, assign, actions, interpret } from "xstate";
import { Actividad } from "../depositos/depositos-types";
import {empty_contratista} from "../contratistas/contratista-types";
import { get_empty_insumo } from "../insumos/insumos-types";


// const { createMachine, assign, actions, interpret } = XState;
const initial_context : Actividad = {
  _id: "",
  uuid: "",
  ts_generacion: 0,
  tipo:"siembra",
  estado:"pendiente",
  lote_uuid:"",
  detalles:{
    fecha_ejecucion_tentativa:"",
    peso_1000: 0,
    densidad_objetivo: 0,
    semillas_totales: 0,
    distancia: 0,
    hectareas: 0,
    insumo:get_empty_insumo(),
  },
  comentario: "",
  adjuntos: [],
  contratista:{...empty_contratista},
};

export const siembraMachine = createMachine({
  id: "Siembra",
  initial: "idle",
  context: initial_context,
  states: {
    idle: {
      on: {
        NEXT: {
          target: "editing",
        },
      },
    },
    editing: {
      initial: "fecha",
      on: {
        CANCEL: {
          target: "idle",
        },
        GUARDAR: {
          target: "idle",
        },
      },
      states: {
        fecha: {
          on: {
            NEXT: {
              target: "hectareas",
            },
            CHANGE: {
              actions: assign({
                detalles: (ctx, event) => {ctx.detalles.fecha_ejecucion_tentativa = event.value;
                                            return ctx.detalles},
              }),
            },
            ASSIGN_CONTRATISTA:{
              actions: assign({
                contratista: (ctx, e) => ctx.contratista = e.value,
              })
            }
          },
        },
        hectareas: {
          on: {
            CHANGE: {
              actions: assign({
                detalles: (ctx, e) => {ctx.detalles.hectareas = e.value;
                  return ctx.detalles},
              }),
            },
            BACK: {
              target: "fecha",
            },
            NEXT: {
              target: "cultivo",
            },
          },
        },
        cultivo: {
          on: {
            BACK: {
              target: "hectareas",
            },
            NEXT: {
              target: "peso_1000",
            },
            SELECTED: {
              actions: assign({
                detalles: (ctx : Actividad, e) => {ctx.detalles.insumo = e.value; 
                  return ctx.detalles;},
              }),
            },
          },
        },
        variedad: {
          on: {
            BACK: { target: "cultivo" },
            NEXT: { target: "peso_1000" },
            CHANGE: {
              actions: assign({
                variedad: (ctx, e) => e.value,
              }),
            },
          },
        },
        peso_1000: {
          on: {
            BACK: { target: "cultivo" },
            NEXT: { target: "densidad" },
            CHANGE: {
              actions: assign({
                detalles: (ctx, e) => {ctx.detalles.peso_1000 = e.value;
                  return ctx.detalles;
                },
              }),
            },
          },
        },
        densidad: {
          on: {
            BACK: { target: "peso_1000" },
            NEXT: { target: "distancia" },
            CHANGE: {
              actions: assign({
                detalles: (ctx, e) => {
                  ctx.detalles.densidad = e.value;
                  return ctx.detalles;
                },
              }),
            },
          },
        },
        distancia: {
          on: {
            BACK: { target: "densidad" },
            NEXT: { target: "comentario" },
            CHANGE: {
              actions: assign({
                detalles: (ctx, e) => {ctx.detalles.distancia = e.value;
                  return ctx.detalles;
                },
              }),
            },
          },
        },
        adjuntos: {
          on: {
            BACK: { target: "distancia" },
            NEXT: { target: "comentario" },
            ADJUNTAR: {
              actions: assign({
                adjuntos: (ctx, e) => {
                  ctx.adjuntos.push(e.value);
                  return ctx.adjuntos;
                },
              }),
            },
          },
        },
        comentario: {
          on: {
            BACK: { target: "distancia" },
            NEXT: { target: "resumiendo" },
            CHANGE: {
              actions: assign({
                comentario: (ctx, e) => e.value,
              }),
            },
          },
        },
        resumiendo: {
          on: {
            BACK: { target: "comentario" },
          },
        },
        fin: {
          type: "final",
        },
      },
    },
  },
});
