import { content } from "html2canvas/dist/types/css/property-descriptors/content";
import { assign, createActor, createMachine, setup } from "xstate";



const lotemachine = createMachine({
    context: {
        data: { loteId: "tttt", nombre:"chato" },
      },
      initial:"unico",
      states:{
        unico:{
            
        }
      }
      
})
const campomachine = createMachine({
  context: {
    data: { campoId: "dddddd", nombre:"chota" },
    lotesActors: []
  },
  initial: "unico",
  states: {
    unico: {
      entry: [() => console.log("LOAD CAMPO FROM DB"),
      
    ],
    },
  },
});

const EngineMachine = setup({
  actions: {
    loadfromdb: assign({
      campos: ({ context, event, spawn }) => {
        return [spawn(campomachine)];
      },
    }),
  },
}).createMachine({
  context: {
    campos: [],
  },
  initial: "unico",
  states: {
    unico: {
      entry: ["loadfromdb"],
    },
  },
});

const Engine = createActor(EngineMachine);


Engine.start();

console.log(Engine.getSnapshot().context.campos[0].getSnapshot().context.data)