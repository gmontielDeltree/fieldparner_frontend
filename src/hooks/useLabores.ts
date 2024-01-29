import { useState } from "react"


const tablaLabores = [
    { name: "Siembra", id: "1" },
    { name: "Cosecha", id: "3" },
    { name: "Aplicación Aerea", id: "4" },
    { name: "Aplicación Terrestre", id: "5" },
    { name: "Cincel", id: "6" },
    { name: "Disco", id: "7" },
    { name: "Fertilización al Voleo", id: "8" },
    { name: "Riego", id: "9" }
  ];
  
export const  useLabores = ()=>{
 const [labores, setLabores] = useState(tablaLabores )

 const getLaborLabelFromId = (id)=>{
    let c = labores.find((a)=>a.id===id)
    if(c){
        return c.name
    }
 }


 return {labores, getLaborLabelFromId}

}