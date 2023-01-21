import { gbl_state } from "../state";
import { Deposito } from "./depositos-types";
import { deepcopy, gbl_docs_starting, only_docs, format_iso_c } from '../helpers';
import uuid4 from 'uuid4';
import { formatISO } from 'date-fns';
import { Proveedor } from "../tipos/proveedores";

export const listar_proveedores = ()=>{
	return gbl_docs_starting('proveedor',true).then(only_docs).then((depos)=>depos as unknown as Proveedor[])
}

/** Devuelve un depo en blanco */
export const nuevo_proveedor = ()=>{
	let newdepo : Proveedor;
	newdepo.uuid = uuid4()
	newdepo._id = "proveedor:" + newdepo.uuid
	newdepo.nombre = ""
	newdepo.cuit = ""
	newdepo.obs = ""
	newdepo.direccion = ""
	newdepo.telefono = ""
	newdepo.created = null
	newdepo.last_updated = null

	return deepcopy(newdepo) as Proveedor
}

export const guardar_proveedor = (prov : Proveedor) =>{
	if('_rev' in prov){
		// Editar 
		// Cambiar last update
		prov.last_updated.last_updated = format_iso_c(new Date())
		prov.last_updated.last_updated_by = gbl_state.user
		return gbl_state.db.put(prov as unknown)
	}else{
		// Nuevo
		// Created y last update
		prov.created.created = format_iso_c(new Date())
		prov.created.created_by = gbl_state.user
		return gbl_state.db.put(prov as unknown)
	}
}

export const borrar_proveedor = (prov : Proveedor) => {
	return gbl_state.db.remove(prov as unknown as PouchDB.Core.RemoveDocument)
}

/** Expo/Impo */
export const exportar_lista_proveedores = () =>{

}

export const importar_lista_proveedores = () => {

}