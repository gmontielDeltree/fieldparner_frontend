import { content } from "html2canvas/dist/types/css/property-descriptors/content";
import { assign, createActor, createMachine, fromPromise, setup } from "xstate";
import { dbContext } from "../../services";



const lotemachine = createMachine({
    context: {
        data: { loteId: "tttt", nombre:"chato" },
        id:""
      },
      initial:"unico",
      states:{
        unico:{
            
        }
      }
      
})
const campomachine = (id) => setup({
  actors:{
    loadfromdb: fromPromise(({input})=>{
      return dbContext.fields.get(id)
    })
  }
}).createMachine({
  context: {
    data: {id:id},
  },
  initial: "loading",
  states: {
    loading:{
invoke: {
        src:'loadfromdb',
        onDone:{
          target:"ready",
          actions:[
            assign({data:({context,event})=>{
              return event.output
            }})
          ]
        }
      }
    },
    ready: {
      
    },
  },
});



const EngineMachine = setup({
  actors: {
    loadcampos: fromPromise(({input})=>{
      return dbContext.fields.allDocs()
    }),
  },
}).createMachine({
  context: {
    campos: [],
  },
  initial: "loading",
  states: {
    loading:{
     invoke:{
        src:'loadcampos',
        onDone:{
          target:'ready',
          actions:[
            assign({
              campos:({context,event,spawn})=>{
                let spawned = event.output.rows.map((r)=>spawn(campomachine(r.id)))
                return spawned
              }
            })
          ]
        }
      }, 
    },
    ready: {
      
      on:{
        getCampos:{
          actions:[
            ({context})=>console.log(context.campos)
          ]
        }
      }
    },
  },
});

const Engine = createActor(EngineMachine);


// Engine.start();

// Engine.subscribe((snapshot)=>console.log("CHANGE",snapshot))

// Lista de campos


// console.log("Campos", Engine.getSnapshot().context.campos)
// Engine.send({type:"getCampos"})
// console.log("Campos 2", Engine.getSnapshot().context.campos)


