import { gbl_state } from '../state';
export const listar_sensores = async ()=>{
	return gbl_state.db_sensores_pro.get("lista_public_devices:unico")
	.then(({ public_devices }: any) => {
		return public_devices as string[]
	});
}

export const sensores_detalles =  async (uuid)=>{
	return gbl_state.db_sensores_pro.get(uuid + ":detalles").then((d)=>{
		return d
	})
}