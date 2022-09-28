import PouchDB from "pouchdb";
import { hashMessage } from "../helpers";
import { isToday, parse } from "date-fns";
import { is } from "date-fns/locale";

let ndvi_db = new PouchDB(
    "https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/ndvi"
  );



export const ndvi_generado_hoy = async (geometry) => {

    //let geometry = this.lote_doc.geometry;
    try{
        let clean_json = JSON.stringify(geometry, Object.keys(geometry).sort());
        let lote_hash = await hashMessage(clean_json)
        console.log("Lote Hash", lote_hash);
          // Build y  Mostrar la Galeria
        let ndvi_doc = await ndvi_db.get(lote_hash)
        console.log("NDVI DOC", ndvi_doc)
    
        let fecha_generacion = parse(ndvi_doc.ultima_generacion,"yyyyMMdd",new Date())
        console.log("Fecha Gen", fecha_generacion)
        
        return isToday(fecha_generacion)

    }catch(e){
        if(e.error==="not_found"){
            return false; // To force generation
        }
    }
   
}
