
import { gbl_state } from "../state";
import {
  deepcopy,
  gbl_docs_starting,
  only_docs,
  format_iso_c,
} from "../helpers";
import uuid4 from "uuid4";
import { Vehiculo } from "../tipos/vehiculos";
import { uuidv7 } from 'uuidv7';

export const listar_vehiculos = () => {
  return gbl_docs_starting("vehiculo", true)
    .then(only_docs)
    .then((depos) => depos as unknown as Vehiculo[]);
};

/** Devuelve un item en blanco */
export const nuevo_vehiculo = () => {
  let uuid = uuidv7();
  let newdepo: Vehiculo = {
    uuid: uuid,
    _id: "vehiculo:" + uuid,
    tipo:"vehiculo",
    status:"",
    placa:"",
    tipo_vehiculo:"",
    descripcion:"",
    marca:"",
    modelo:"",
    ano:"",

    created: { created: "", created_by: {} },
    last_updated: { last_updated: "", last_updated_by: {} },
  };

  return deepcopy(newdepo) as Vehiculo;
};

export const cargar_vehiculo = async (uuid: string) => {
  return gbl_state.db.get("vehiculo:" + uuid).then((d) => d as Vehiculo);
};

export const guardar_vehiculo = (item: Vehiculo) => {
  item.nombre = `${item.marca} ${item.modelo}`
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

export const borrar_vehiculo = (item: Vehiculo) => {
  return gbl_state.db.remove(item as unknown as PouchDB.Core.RemoveDocument);
};

/** Expo/Impo */
export const exportar_lista_vehiculos = () => {};

export const importar_lista_vehiculos = () => {};
