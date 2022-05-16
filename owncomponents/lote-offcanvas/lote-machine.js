import { createMachine, assign, actions, interpret } from 'xstate';
import uuid4 from "uuid4";
import insumos from './insumos.json'
// const { createMachine, assign, actions, interpret } = XState;

const push_insumo = (ctx) => {
  ctx.insumos.push({ ...ctx.current_insumo, uuid: uuid4(), dosis: ctx.dosis, unidad: ctx.unidad, total: ctx.dosis * ctx.hectareas, hectareas:ctx.hectareas, motivos:ctx.motivos })
  return ctx.insumos
}

const init_ctx = { fecha: "31-12-2021", hectareas: 0, current_insumo: "", filtrado: [], dosis: 0, insumos: [], unidad: 'lt/ha', comentarios: "", motivos: {}, };
export const aplicacionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEEAOAbAlgYwIbcwHsA7AOgEkJ0wBicgOXIGFyB5RUVQ2TAFyOIcQAD0QBaAMwB2ABykJATgBMAFmUAGdTIkyVAGhABPcSvWklANglKArFKXqAjDccXVAX3cG0WPARKkAGZg2AAWuDT0AKIAGgAqQlw8-CRCoghijlI2pDYqNkoysorWEioWBsYIFo65EtJSjuoFumpSnt4YOPgCpKEhvLgATmC4sDQAQshMANKJ3HwCaeKOyqTa6kqOjuXSKmqV4jJK5gpSKscFWTLO7V4gPt3+ZP3YgyNjkbEJSCBJi6lfuksrkLPsZDJmhJNttpIcMsdTudLltZLcOg8un5ephiLAAK4AW0Ik2mc1+-xSgiBiBBNjBF0hNmhW0ccKM4jK8mZUgkbJZJV0GMe2ICuIJxK+8XmySWNIQjjkMhsxykFmybPy+wk8LZuQUmlWMhqLMhd06vh6YrxRJJrDiACV2BSFlTlgqQep7LoFNJmRILIH4ZJatt1Cp6mVjgoIebMZbnqRsNxeNxSbMZQDqaBgVJQeCmSzYVJ4TU6g0mi19mdhVirWRk7BU+NotKXbLATnaXn6QWoTC2SWOQq7KQVFslLyIzZlL6bLWE71k4SwMR3kRxlMM+2s+66QyIf3Weyqk0FGOpNklNftUVVgunkvCCu18MN1KfpxXXKuwhr7UFEcWxLFWQp6hjXU8lIJwshUbIwQsAp53uEV61IWBwhGD9MzdeVFBUMcLGVCx1EAyxx20SCCJg854PKJDPHuYhCAgOAhFQxNKGoHCfxEEwVWggN1BqBQ8nVPlgy5FwFFE5RVjsOxbAfUUyGCMJcB4zs+IySc8zg6QbhUJp1HAmxJII6TZK2UTsnsZCLUfAJXneUZ4B3XDfzEGNSDcRQ7Bk1ZNHOSSTicGSZ2shS7OUtDxVtTTs20oDakvL0jIKC5EKUHVhy2dZI2uCNVHqJQYsTRtmwS90xCKaCpANG4ZF9Sx6py09mVySdxwuNQ7GcCQyqfF9124Kr5WS0hUvOZxVGNAo2tpGdJpsGxwxW+jfXDQaAkCXExt-C48x0JpbCImo3AqYdnHPbJVvyMSZ2hFRtrIDDhjAfbtL5AjjjUA0FEDCQeSHdqbpWtaHs256ULrZ5PvSMQLlCoSRLE3lHGDZwciUMiyj5VVFRkRj3CAA */
  createMachine(
    {
      id: "Aplicacion",
      initial: "idle",
      context: init_ctx,
      states: {
        idle: {
          on: {
            NEXT: {
              target: 'editing',
              actions: assign({
                filtrado: (ctx, e) => insumos.filter((i) => { return (i.name.toUpperCase().indexOf('') > -1) }).slice(0, 7)
              }),
            }
          }
        },
        editing: {
          initial: 'fecha',
          on: {
            CANCEL: {
              target: 'idle',
              actions: assign((ctx) => init_ctx)
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
                    filtrado: (ctx, e) => insumos.filter((i) => { return (i.name.toUpperCase().indexOf(e.value.toUpperCase()) > -1) }).slice(0, 7)
                  }),
                },
                SELECTED: {
                  actions: [assign({
                    current_insumo: (ctx, e) => e.value,
                  }),
                  () => console.log("3dsd")
                  ]
                }

              },
            },
            dosis: {
              on: {
                BACK: { target: "insumo" },
                NEXT: { target: 'motivo' },
                CHANGE: {
                  actions: assign({
                    dosis: (ctx, e) => e.value
                  })
                },
              },
            },
            motivo: {
              on: {
                BACK: { target: "dosis" },
                NEXT: { target: 'masinsumos' },
                TICK: {
                  actions: assign({
                    motivos: (ctx, e) => {
                      ctx.motivos[e.name] = e.value
                      return ctx.motivos
                    }
                  })
                },
              },
            },
            masinsumos: {
              on: {
                BACK: { target: "motivo" },
                SI: {
                  target: "insumo",
                  actions: assign({
                    insumos: push_insumo
                  })
                },
                NO: {
                  target: 'comentario',
                  actions: assign({
                    insumos: push_insumo
                  })
                }
              }
            },
            comentario: {
              on: {
                CHANGE:{
                  actions: assign({
                    comentarios: (ctx, e) => e.value
                  })
                },
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


