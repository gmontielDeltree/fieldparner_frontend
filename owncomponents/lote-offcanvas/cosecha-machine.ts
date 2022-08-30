import { createMachine, assign, actions, interpret } from 'xstate';

// const { createMachine, assign, actions, interpret } = XState;
const init_ctx = { fecha: "", hectareas: 0, rinde: 0, humedad: 0, comentario:"", adjuntos:[], contratista:{}, insumos:[]  };

export const cosechaMachine =
  createMachine(
    {
      id: "Cosecha",
      initial: "idle",
      context: init_ctx,
      states: {
        idle: {
          on: {
            NEXT: {
              target: 'editing'
            }
          }
        },
        editing: {
          initial: 'fecha',
          on: {
            CANCEL: {
              target: 'idle',
            },
            GUARDAR: { target: 'idle' }
          },
          states: {
            fecha: {
              on: {
                NEXT: {
                  target: "hectareas",
                },
                CHANGE: {
                  actions: assign({ fecha: (context, event) => context.fecha = event.value })
                },
                ASSIGN_CONTRATISTA:{
                  actions: assign({
                    contratista: (ctx, e) => ctx.contratista = e.value,
                  })
                },
              },
            },
            hectareas: {
              on: {
                CHANGE: {
                  actions: assign({ hectareas: (ctx, e) => ctx.hectareas = e.value })
                },
                BACK: {
                  target: "fecha",
                },
                NEXT: {
                  target: "rinde",
                },
              },
            },
            rinde: {
              on: {
                BACK: {
                  target: "hectareas",
                },
                NEXT: {
                  target: "humedad",
                },
                CHANGE: {
                  actions: assign({
                    rinde: (ctx, e) => e.value
                  })
                }
              },
            },
            humedad: {
              on: {
                BACK: { target: "rinde" },
                NEXT: { target: 'comentario' },
                CHANGE: {
                  actions: assign({
                    humedad : (ctx, e) => e.value
                  })
                },
              },
            },
            adjuntos: {
              on: {
                BACK: { target: "humedad" },
                NEXT: { target: 'comentario' },
                ADJUNTAR: {
                  action: assign({
                    adjuntos : (ctx, e) => {
                      ctx.adjuntos.push(e.value)
                      return ctx.adjuntos
                    }
                  })
                },
              },
            },
            comentario: {
              on: {
                BACK: { target: 'humedad' },
                NEXT: { target: 'resumiendo' },
                CHANGE: {
                  actions: assign({
                    comentario : (ctx, e) => e.value
                  })
                },
              }
            },
            resumiendo: {
              on: {
                BACK: { target: 'comentario' },
              }
            },
            fin: {
              type: "final",
            },
          },
        }

      },
    }
  );


