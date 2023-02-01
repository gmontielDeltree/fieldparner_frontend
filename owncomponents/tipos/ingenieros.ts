import { LastUpdateTag, CreatedTag } from '../depositos/depositos-types';
export interface Ingeniero {
  _id: string;
  _rev?: string;
  nombre: string;
  uuid: string;
  cuit: string;
  direccion: string;
  telefono: string;
  obs: string;
  last_updated: LastUpdateTag,
  created: CreatedTag,
}
