import { createMachine, assign, actions, interpret } from 'xstate';

// const { createMachine, assign, actions, interpret } = XState;

export const siembraMachine =
  createMachine(
    {
      id: "Siembra",
      initial: "idle",
      context: { fecha: "31/12/2021", cultivo: "", variedad: "", peso_1000: 0, densidad_objetivo:0, semillas_totales:0, distancia:0, superficie_real:0, hectareas: 0, comentario:"", adjuntos:[]  },
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
            GUARDAR:{
              target: 'idle'
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
                  target: "variedad",
                },
                CHANGE: {
                  actions: assign({
                    cultivo: (ctx, e) => e.value
                  })
                }
              },
            },
            variedad: {
              on: {
                BACK: { target: "cultivo" },
                NEXT: { target:'peso_1000' },
                CHANGE: {
                  actions: assign({
                    variedad : (ctx, e) => e.value
                  })
                },
              },
            },
            peso_1000: {
              on: {
                BACK: { target: "variedad" },
                NEXT: { target: 'densidad' },
                CHANGE: {
                  actions: assign({
                    peso_1000 : (ctx, e) => e.value
                  })
                },
                
              },
            },
            densidad: {
              on: {
                BACK: { target: 'peso_1000' },
                NEXT: { target: 'distancia' },
                CHANGE: {
                  actions: assign({
                    densidad_objetivo : (ctx, e) => e.value
                  })
                },
              }
            },
            distancia: {
              on: {
                BACK: { target: 'densidad' },
                NEXT: { target: 'comentario' },
                CHANGE: {
                  actions: assign({
                    distancia : (ctx, e) => e.value
                  })
                },
              }
            },
            adjuntos:{
              on:{
                BACK: { target: 'distancia' },
                NEXT: { target: 'comentario' },
                  ADJUNTAR: {
                    actions: assign({
                      adjuntos : (ctx, e) => {
                        ctx.adjuntos.push(e.value)
                        return ctx.adjuntos
                      }
                    })
                 },
              }
            },
            comentario:{
              on:{
                BACK: { target: 'distancia' },
                NEXT: { target: 'resumiendo' },
                CHANGE: {
                  actions: assign({
                    comentario : (ctx, e) => e.value
                  })
                },
              }
            },
            resumiendo:{
              on:{
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


