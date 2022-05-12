import { createMachine, assign } from 'xstate';

export const aplicacionMachine = 
/** @xstate-layout N4IgpgJg5mDOIC5QEEAOAbAlgYwIbcwHsA7AOgEkJ0wBicgOXIGFyB5RUVQ2TAFyOIcQAD0QBaAMwB2ABykJATgBMAFmUAGdTIkyVAGhABPcSvWklANglKArFKXqAjDccXVAX3cG0WPARKkAGZg2AAWuDT0AKIAGgAqQlw8-CRCoghijlI2pDYqNkoysorWEioWBsYIFo65EtJSjuoFumpSnt4YOPgCpKEhvLgATmC4sDQAQshMANKJ3HwCaeKOyqTa6kqOjuXSKmqV4jJK5gpSKscFWTLO7V4gPt3+ZP3YgyNjkbEJSCBJi6lfuksrkLPsZDJmhJNttpIcMsdTudLltZLcOg8un5ephiLAAK4AW0Ik2mc1+-xSgiBiBBNjBF0hNmhW0ccKM4jK8mZUgkbJZJV0GMe2ICuIJxK+8XmySWNIQjjkMhsxykFmybPy+wk8LZuQUmlWMhqLMhd06vh6YrxRJJrDiACV2BSFlTlgqQep7LoFNJmRILIH4ZJatt1Cp6mVjgoIebMZbnqRsNxeNxSbMZQDqaBgVJQeCmSzYVJ4TU6g0mi19mdhVirWRk7BU+NotKXbLATnaXn6QWoTC2SWOQq7KQVFslLyIzZlL6bLWE71k4SwMR3kRxlMM+2s+66QyIf3Weyqk0FGOpNklNftUVVgunkvCCu18MN1KfpxXXKuwhr7UFEcWxLFWQp6hjXU8lIJwshUbIwQsAp53uEV61IWBwhGD9MzdeVFBUMcLGVCx1EAyxx20SCCJg854PKJDPHuYhCAgOAhFQxNKGoHCfxEEwVWggN1BqBQ8nVPlgy5FwFFE5RVjsOxbAfUUyGCMJcB4zs+IySc8zg6QbhUJp1HAmxJII6TZK2UTsnsZCLUfAJXneUZ4B3XDfzEGNSDcRQ7Bk1ZNHOSSTicGSZ2shS7OUtDxVtTTs20oDakvL0jIKC5EKUHVhy2dZI2uCNVHqJQYsTRtmwS90xCKaCpANG4ZF9Sx6py09mVySdxwuNQ7GcCQyqfF9124Kr5WS0hUvOZxVGNAo2tpGdJpsGxwxW+jfXDQaAkCXExt-C48x0JpbCImo3AqYdnHPbJVvyMSZ2hFRtrIDDhjAfbtL5AjjjUA0FEDCQeSHdqbpWtaHs256ULrZ5PvSMQLlCoSRLE3lHGDZwciUMiyj5VVFRkRj3CAA */
createMachine(
{
  context: { id: "", fecha: "", superficie: 0, insumos: [], comentarios: "" },
  id: "Aplicacion",
  initial: "idle",
  context: {fecha:"102"},
  states: {
    idle: {
      on: {
        INICIO: {
          target: "fecha",
        },
      },
    },
    fecha: {
      on: {
        NEXT: {
          target: "hectareas",
        },
        CHANGE: {
          actions: assign({fecha: (context, event) => context.fecha = event.value})
        }
      },
      exit: assign({fecha : (context,event) => context.fecha = "32"}),
    },
    hectareas: {
      on: {
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
          target: "costos",
        },
        OTRO: {},
      },
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
);


