import { uuidv7 } from 'uuidv7';
import { CreatedTag, LastUpdateTag } from '../depositos/depositos-types';
import { format_iso_c } from '../helpers';
import { gbl_state } from '../state';
import { Attachment } from './../tipos/attachments';

export interface Nota {
    _id:string,
    _rev?:string,
    uuid:string,
    tipo:"nota",
    fecha:string,
    texto: string,
    color: string,
    motivos_nota?: any[],
    modo_geolocalizacion?: string,
    imagenes: any[],
    audio_url?: string,
    attachments ?: Attachment[],
    last_updated?: LastUpdateTag,
    created?: CreatedTag,
    proxima_visita? : string
    url_referencia?: string,
    lote_nombre?: string,
    lote_uuid?:string,
    posicion?:number[],
    _attachments?: any
  }


export const nota_nueva = ()=>{
  let uuid = uuidv7(); 
  let nn : Nota=  { attachments: null, texto:"", 
  fecha:new Date().toISOString().split("T")[0],
  color:"red",
  tipo:"nota",
  modo_geolocalizacion:'mapa',
  _attachments:{},
  motivos_nota:[],
  imagenes:[],
  _id: uuid,
  uuid:uuid,
  created: { created: "", created_by: {} },
  last_updated: { last_updated: "", last_updated_by: {} }
};
return nn;
}

export const nota_remover_adjunto = async (
    act: Nota,
    uuid: string
  ) => {
    act.attachments = act.attachments.filter((a) => a.uuid !== uuid);
    //return guardar_tr(act);
  };

export const nota_adjuntar_archivo = async (
    act: Nota,
    file: File
  ) => {
    if (act.attachments == null) {
      act.attachments = [];
    }
    act.attachments.push({ uuid: uuidv7(), filename: file.name });
    //return guardar_transfer(act);
  };

  export const cargar_nota = async (id: string) => {
    return gbl_state.db.get(id).then((d) => <unknown>d as Nota);
  };

  export const borrar_nota = (prov: Nota) => {
    return gbl_state.db.remove(prov as unknown as PouchDB.Core.RemoveDocument);
  };

  export const guardar_nota = (prov: Nota) => {
    if ("_rev" in prov) {
      // Editar
      // Editar Depo por las dudas
     
      // Cambiar last update
      prov.last_updated.last_updated = format_iso_c(new Date());
      prov.last_updated.last_updated_by = gbl_state.user;
      return gbl_state.db.put(prov as unknown);
    } else {
      // Created y last update
      prov.created.created = format_iso_c(new Date());
      prov.created.created_by = gbl_state.user;
      return gbl_state.db.put(prov as unknown);
    }
  };