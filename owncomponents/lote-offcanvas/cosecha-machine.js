import { createMachine, assign, actions, interpret } from 'xstate';

// const { createMachine, assign, actions, interpret } = XState;

export const cosechaMachine =
  createMachine(
    {
      id: "Aplicacion",
      initial: "idle",
      context: { fecha: "102", hectareas: 0, lista_insumos: [{ name: '2,4d' }, { name: 'glifosarto' }, { name: 'peros' }], current_insumo: "", filtrado: [], dosis: 0, insumos:[], comentarios:"",  },
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
                  target: "insumo",
                },
              },
            },
            insumo: {
              on: {
                BACK: {
                  target: "hectareas",
                },
                NEXT: {
                  target: "dosis",
                },
                CHANGE: {
                  actions: assign({
                    filtrado: (ctx, e) => ctx.lista_insumos.filter((i)=>{return (i.name.toUpperCase().indexOf(e.value.toUpperCase()) > -1)} ).slice(0,20)
                  }),
                },
                SELECTED:{
                  actions: assign({
                    current_insumo: (ctx,e) => e.value
                  })
                }

              },
            },
            dosis: {
              on: {
                BACK: { target: "insumo" },
                NEXT: { target: 'motivo' },
                CHANGE: {
                  actions: assign({
                    dosis : (ctx, e) => e.value
                  })
                },
              },
            },
            motivo: {
              on: {
                BACK: { target: "dosis" },
                NEXT: { target: 'masinsumos' },
                CHANGE: {
                  action: assign({
                    motivo : (ctx, e) => e.value
                  })
                },
              },
            },
            masinsumos: {
              on: {
                BACK: { target: "motivo" },
                SI: { target: "insumo" },
                NO: { target: 'comentario' }
              }
            },
            comentario: {
              on: {
                BACK: { target: 'masinsumos' },
                NEXT: { target: 'resumiendo' },
              }
            },
            resumiendo: {
              on: {
                BACK: { target: 'comentario' },
                GUARDAR: { target: 'share' }
              }
            },
            costos: {
              on: {
                BACK: {
                  target: "insumo",
                },
                NEXT: {
                  target: "comentarios",
                },
              },
            },
            comentarios: {
              on: {
                BACK: {
                  target: "costos",
                },
                NEXT: {
                  target: "share",
                },
              },
            },
            fin: {
              type: "final",
            },
            share: {
              on: {
                NEXT: {
                  target: "fin",
                },
              },
            },
          },
        }

      },
    }
  );


