import { gbl_state } from "../state"


export const getRecorrida = async (id : string)=>{
	return await gbl_state.db.get(id)
}