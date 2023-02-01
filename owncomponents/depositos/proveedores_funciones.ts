import {
  nuevo_deposito,
  guardar_deposito,
  cargar_depo,
} from "./depositos_funciones";
import { gbl_state } from "../state";
import { Deposito } from "./depositos-types";
import {
  deepcopy,
  gbl_docs_starting,
  only_docs,
  format_iso_c,
} from "../helpers";
import uuid4 from "uuid4";
import { formatISO } from "date-fns";
import { Proveedor } from "../tipos/proveedores";

export const listar_proveedores = () => {
  return gbl_docs_starting("proveedor", true)
    .then(only_docs)
    .then((depos) => depos as unknown as Proveedor[]);
};

/** Devuelve un depo en blanco */
export const nuevo_proveedor = () => {
  let uuid = uuid4();
  let newdepo: Proveedor = {
    uuid: uuid,
    _id: "proveedor:" + uuid,
    nombre: "",
    cuit: "",
    obs: "",
    direccion: "",
    telefono: "",
    created: { created: "", created_by: {} },
    last_updated: { last_updated: "", last_updated_by: {} },
  };

  return deepcopy(newdepo) as Proveedor;
};

export const cargar_proveedor = async (uuid: string) => {
  return gbl_state.db.get("proveedor:" + uuid).then((d) => d as Proveedor);
};

export const guardar_proveedor = (prov: Proveedor) => {
  if ("_rev" in prov) {
    // Editar
    // Editar Depo por las dudas
    cargar_depo(prov.uuid).then((depo) => {
      depo.nombre = prov.nombre;
      depo.direccion = prov.direccion;
      depo.proveedor_asociado = prov;
      guardar_deposito(depo);
    });
    // Cambiar last update
    prov.last_updated.last_updated = format_iso_c(new Date());
    prov.last_updated.last_updated_by = gbl_state.user;
    return gbl_state.db.put(prov as unknown);
  } else {
    // Nuevo
    // Crear Deposito Asociado
    let depo = nuevo_deposito();
    depo._id = "deposito:" + prov.uuid;
    depo.uuid = prov.uuid;
    depo.proveedor_asociado = prov;
    depo.nombre = prov.nombre;
    depo.direccion = prov.direccion;
    guardar_deposito(depo);

    // Created y last update
    prov.created.created = format_iso_c(new Date());
    prov.created.created_by = gbl_state.user;
    return gbl_state.db.put(prov as unknown);
  }
};

export const borrar_proveedor = (prov: Proveedor) => {
  return gbl_state.db.remove(prov as unknown as PouchDB.Core.RemoveDocument);
};

/** Expo/Impo */
export const exportar_lista_proveedores = () => {};

export const importar_lista_proveedores = () => {};
