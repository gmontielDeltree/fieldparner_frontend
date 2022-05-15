import { createMachine, assign, actions, interpret } from 'xstate';

// const { createMachine, assign, actions, interpret } = XState;

export const siembraMachine =
  createMachine(
    {
      id: "Siembra",
      initial: "idle",
      context: { fecha: "31/12/2021", cultivo: "", variedad: "", peso_1000: 0, densidad_objetivo:0, semillas_totales:0, distancia:0, superficie_real:0, hectareas: 0, rinde: 0, comentario:"", adjuntos:[]  },
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
            }
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
                NEXT: { target: 'adjuntos' },
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
                BACK: { target: 'adjuntos' },
                NEXT: { target: 'resumiendo' },
              }
            },
            resumiendo: {
              on: {
                BACK: { target: 'comentario' },
                GUARDAR: { target: 'fin' }
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


