import {
  nuevo_deposito,
  guardar_deposito,
  cargar_depo,
} from "../depositos/depositos-funciones";
import { gbl_state } from "../state";
import { Deposito } from "../depositos/depositos-types";
import {
  deepcopy,
  gbl_docs_starting,
  only_docs,
  format_iso_c,
} from "../helpers";
import uuid4 from "uuid4";
import { formatISO } from "date-fns";
import { Ingeniero } from "../tipos/ingenieros";
import { uuidv7 } from 'uuidv7';
import { Proveedor } from '../tipos/proveedores';

export const listar_ingenieros = () => {
  return gbl_docs_starting("ingeniero", true)
    .then(only_docs)
    .then((depos) => depos as unknown as Ingeniero[]);
};

/** Devuelve un depo en blanco */
export const nuevo_ingeniero = () => {
  let uuid = uuidv7();
  let newdepo: Ingeniero = {
    uuid: uuid,
    _id: "ingeniero:" + uuid,
    nombre: "",
    cuit: "",
    obs: "",
    direccion: "",
    telefono: "",
    created: { created: "", created_by: {} },
    last_updated: { last_updated: "", last_updated_by: {} },
  };

  return deepcopy(newdepo) as Ingeniero;
};

export const cargar_ingeniero = async (uuid: string) => {
  return gbl_state.db.get("ingeniero:" + uuid).then((d) => d as Ingeniero);
};

export const guardar_ingeniero = (ing: Ingeniero) => {
  if ("_rev" in ing) {
    // Editar
    // Cambiar last update
    ing.last_updated.last_updated = format_iso_c(new Date());
    ing.last_updated.last_updated_by = gbl_state.user;
    return gbl_state.db.put(ing as unknown);
  } else {
    // Nuevo
    // Created y last update
    ing.created.created = format_iso_c(new Date());
    ing.created.created_by = gbl_state.user;
    return gbl_state.db.put(ing as unknown);
  }
};

export const borrar_ingeniero = (prov: Proveedor) => {
  return gbl_state.db.remove(prov as unknown as PouchDB.Core.RemoveDocument);
};

/** Expo/Impo */
export const exportar_lista_ingenieroes = () => {};

export const importar_lista_ingenieroes = () => {};
