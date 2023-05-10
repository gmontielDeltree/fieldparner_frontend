
import { gbl_state } from "../state";
import {
  deepcopy,
  gbl_docs_starting,
  only_docs,
  format_iso_c,
} from "../helpers";
import uuid4 from "uuid4";
import { Tercero } from "../tipos/terceros";
import { uuidv7 } from 'uuidv7';

export const listar_terceros = () => {
  return gbl_docs_starting("tercero", true)
    .then(only_docs)
    .then((depos) => depos as unknown as Tercero[]);
};

/** Devuelve un item en blanco */
export const nuevo_tercero = () => {
  let uuid = uuidv7();
  let newdepo: Tercero = {
    uuid: uuid,
    _id: "tercero:" + uuid,
    tipo:"tercero",

    created: { created: "", created_by: {} },
    last_updated: { last_updated: "", last_updated_by: {} },
  };

  return deepcopy(newdepo) as Tercero;
};

export const cargar_tercero = async (uuid: string) => {
  return gbl_state.db.get("tercero:" + uuid).then((d) => d as Tercero);
};

export const guardar_tercero = (item: Tercero) => {
  if ("_rev" in item) {
    // Editar

    // Cambiar last update
    item.last_updated.last_updated = format_iso_c(new Date());
    item.last_updated.last_updated_by = gbl_state.user;
    return gbl_state.db.put(item as unknown);
  } else {
    // Nuevo

    // Created y last update
    item.created.created = format_iso_c(new Date());
    item.created.created_by = gbl_state.user;
    return gbl_state.db.put(item as unknown);
  }
};

export const borrar_tercero = (item: Tercero) => {
  return gbl_state.db.remove(item as unknown as PouchDB.Core.RemoveDocument);
};

/** Expo/Impo */
export const exportar_lista_terceros = () => {};

export const importar_lista_terceros = () => {};
