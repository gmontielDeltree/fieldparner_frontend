import { createMachine, assign, actions, interpret } from 'xstate';

// const { createMachine, assign, actions, interpret } = XState;

export const cosechaMachine =
  createMachine(
    {
      id: "Cosecha",
      initial: "idle",
      context: { fecha: "31/12/2021", hectareas: 0, rinde: 0, humedad: 0, comentario:"", adjuntos:[]  },
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
                }
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


