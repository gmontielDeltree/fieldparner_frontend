import { LastUpdateTag, CreatedTag } from '../depositos/depositos-types';
export interface Proveedor {
	_id: string,
	_rev ?: string,
	uuid: string,
	nombre: string,
	cuit: string,
	direccion: string,
	telefono: string,
	obs: string,
	last_updated: LastUpdateTag,
	created: CreatedTag,
}