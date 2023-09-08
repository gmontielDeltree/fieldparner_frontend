import { gbl_state } from "../state"
import { Recorrida } from "./recorrida-types"


export const getRecorrida = async (id : string)=>{
	return await gbl_state.db.get(id)
}

export const saveRecorrida = async (r : Recorrida) => {
	return Promise.resolve("IMPLEMENTAR")
}