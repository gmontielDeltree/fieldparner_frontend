import { gbl_state } from "../state"
import { Recorrida } from "./recorrida-types"
import { format, parseISO } from 'date-fns';

export const getRecorrida = async (id : string)=>{
	return await gbl_state.db.get(id)
}

export const saveRecorrida = async (r : Recorrida) => {

	console.log("R1",r)
	// Get el documento existente
	if(r._rev){
		let doc : Recorrida = await gbl_state.db.get(r._id)
		if(doc.fecha !== r.fecha){
			// Las fechas son diferentes, borrar el doc existe
			await gbl_state.db.remove(doc)
			delete(r._rev)
		} 
	}

	let nota_uuid = r.uuid
	let fecha = format(parseISO(r.fecha),"yyyyMMdd")

	r._id = "actividad:" + fecha + ":" + nota_uuid;
	console.log("R2",r)

	return gbl_state.db.put(r)
}

export const deleteRecorrida = (r:Recorrida)=>{
	return gbl_state.db.remove((<unknown>r) as PouchDB.Core.RemoveDocument);
}