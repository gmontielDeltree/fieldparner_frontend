import { gbl_state } from '../state';
import { get_lista_insumos } from './insumos-types';
import { only_docs } from '../helpers';

export const listar_insumos = ()=>{
	return get_lista_insumos(gbl_state.db)
}