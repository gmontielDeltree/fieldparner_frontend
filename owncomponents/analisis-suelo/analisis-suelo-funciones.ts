import { AnalisisSuelo } from './../tipos/analisis-suelo';
import { uuidv7 } from 'uuidv7';
import { gbl_state } from "../state";
import {
  deepcopy,
  gbl_docs_starting,
  only_docs,
  format_iso_c,
} from "../helpers";

export const listar_analisis_suelo = () => {
  return gbl_docs_starting("anasuelo", true)
    .then(only_docs)
    .then((depos) => depos as unknown as AnalisisSuelo[]);
};

/** Devuelve un depo en blanco */
export const nuevo_analisis_suelo = () => {
  let uuid = uuidv7();
  let newdepo: AnalisisSuelo = {
    uuid: uuid,
    _id: "anasuelo:" + uuid,
    fecha:"",
    laboratorio:"",
    nombre_responsable:"",
    referencia_laboratorio:"",
    matricula_responsable:"",
    campo:null,
    lote:null,
    caracterizacion:null,
    textura:null,
    profundidad:0,
    created: { created: "", created_by: {} },
    last_updated: { last_updated: "", last_updated_by: {} },
  };

  return deepcopy(newdepo) as AnalisisSuelo;
};

export const cargar_analisis_suelo = async (uuid: string) => {
  return gbl_state.db.get("anasuelo:" + uuid).then((d) => d as AnalisisSuelo);
};

export const guardar_proveedor = (ana: AnalisisSuelo) => {
  if ("_rev" in ana) {
    // Editar
    // Cambiar last update
    ana.last_updated.last_updated = format_iso_c(new Date());
    ana.last_updated.last_updated_by = gbl_state.user;
    return gbl_state.db.put(ana as unknown);
  } else {
    // Nuevo
    // Created y last update
    ana.created.created = format_iso_c(new Date());
    ana.created.created_by = gbl_state.user;
    return gbl_state.db.put(ana as unknown);
  }
};

/**
 * 
 * @param ana 
 * @returns True si es valido
 */
export const validate_analisis_suelo = (ana:AnalisisSuelo)=>{
    if(ana.fecha===""){
        return false
    }
}

export const borrar_analisis_suelo = (ana: AnalisisSuelo) => {
  return gbl_state.db.remove(ana as unknown as PouchDB.Core.RemoveDocument);
};

export const analisis_suelo_adjuntar = (act: AnalisisSuelo,file:File)=>{
    if (act.attachments == null) {
        act.attachments = [];
      }
      act.attachments.push({ uuid: uuidv7(), filename: file.name });
}

export const analisis_suelo_remover_adjunto = async (
    act: AnalisisSuelo,
    uuid: string
  ) => {
    act.attachments = act.attachments.filter((a) => a.uuid !== uuid);
  };

/** Expo/Impo */
export const exportar_analisis_suelo = () => {};

export const importar_analisis_suelo = () => {};


