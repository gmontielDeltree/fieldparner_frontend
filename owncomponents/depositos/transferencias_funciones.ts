import { gbl_state } from "../state";
import { Deposito } from "./depositos-types";
import { deepcopy, gbl_docs_starting, only_docs, format_iso_c } from '../helpers';
import uuid4 from 'uuid4';
import { formatISO } from 'date-fns';
import { DepositosTransferencia } from "../tipos/depositos-transferencias";
import { translate } from 'lit-translate';

export const listar_transferencias = (depo_uuid : string)=>{
	return gbl_docs_starting('transfer').then((result)=>{
		let rows = result.rows
		let deestedepo = rows.filter((t)=> t.id.includes(depo_uuid))
		let only_keys = deestedepo.map((t)=>t.key)
		return gbl_state.db.allDocs({include_docs:true,keys:only_keys}).then(only_docs).then((tis)=>tis as unknown as DepositosTransferencia[])
	})
}

/** Devuelve un depo en blanco */
export const nueva_transfer = ()=>{
	let uuid = uuid4()
	let newt : DepositosTransferencia = {
		uuid : uuid,
		_id : "transfer:",
		fecha : "",
		pais:"",
		es_ingreso: false,
		deposito_destino : null,
		deposito_origen: null,
		obs:"",
		lineas: [],
		last_updated : {last_updated:"",last_updated_by:null},
		created : {created:"",created_by:null}
	}
	
	return deepcopy(newt) as DepositosTransferencia
}

export const guardar_transfer = (trans : DepositosTransferencia) =>{
	if('_rev' in trans){
		// Editar 
		// Cambiar last update
		// checkear que origen destino sean los mismos
		trans.last_updated.last_updated = format_iso_c(new Date())
		trans.last_updated.last_updated_by = gbl_state.user
		return gbl_state.db.put(trans as unknown)
	}else{
		// Nuevo
		// Created y last update
		trans.uuid = uuid4()
		let id = "transfer:"+ trans.deposito_origen.uuid + ":" + trans.deposito_destino.uuid + ":" + trans.uuid
		trans._id = id;
		trans.created.created = format_iso_c(new Date())
		trans.created.created_by = gbl_state.user
		return gbl_state.db.put(trans as unknown)
	}
}

export const borrar_transfer = (transfer : DepositosTransferencia) => {
	return gbl_state.db.remove(transfer as unknown as PouchDB.Core.RemoveDocument)
}

/** Expo/Impo */
export const exportar_lista_transfers = () =>{

}

export const importar_lista_transfers = () => {

}