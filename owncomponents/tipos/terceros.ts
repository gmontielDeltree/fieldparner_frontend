import { CreatedTag, LastUpdateTag } from "../depositos/depositos-types";

export interface Tercero{
	_id:string,
	_rev?:string,
	uuid: string,
	tipo:"tercero",
	last_updated: LastUpdateTag,
	created: CreatedTag,
	nombre:string,
}