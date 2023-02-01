import { listar_depositos } from "./depositos_funciones";
import { gbl_state } from "../state";
import { Deposito, Ejecucion } from "./depositos-types";
import {
  deepcopy,
  gbl_docs_starting,
  only_docs,
  format_iso_c,
} from "../helpers";
import uuid4 from "uuid4";
import { formatISO, isBefore, parseISO } from "date-fns";

export const listar_depositos = () => {
  return gbl_docs_starting("deposito", true)
    .then(only_docs)
    .then((depos) => depos as unknown as Deposito[]);
};

export const listar_solo_depositos = () => {
  return listar_depositos().then((des) => {
    return des.filter(
      (d) => d.proveedor_asociado == null && d.contratista_asociado == null
    );
  });
};

export const listar_solo_depositos_contratistas = () => {
  return listar_depositos().then((des) => {
    return des.filter((d) => d.contratista_asociado != null);
  });
};

export const cargar_depo = (uuid: string) => {
  return gbl_state.db.get("deposito:" + uuid).then((d) => d as Deposito);
};

/** Devuelve un depo en blanco */
export const nuevo_deposito = () => {
  let uuid = uuid4();
  let newdepo: Deposito = {
    uuid: uuid,
    archivado: false,
    _id: "deposito:" + uuid,
    nombre: "",
    posicion: [],
    last_updated: { last_updated: "", last_updated_by: {} },
    created: { created: "", created_by: {} },
  };
  return deepcopy(newdepo) as Deposito;
};

export const guardar_deposito = (depo: Deposito) => {
  if ("_rev" in depo) {
    // Editar
    // Cambiar last update
    depo.last_updated.last_updated = format_iso_c(new Date());
    depo.last_updated.last_updated_by = gbl_state.user;
    console.log("Depo Guardado", depo);
    return gbl_state.db.put(depo as unknown);
  } else {
    // Nuevo
    // Created y last update
    depo.created.created = formatISO(new Date());
    depo.created.created_by = gbl_state.user;
    console.log("Depo Guardado", depo);
    return gbl_state.db.put(depo as unknown);
  }
};

export const borrar_deposito = (depo: Deposito) => {
  return gbl_state.db.remove(depo as unknown as PouchDB.Core.RemoveDocument);
};

export const listar_ejecuciones_por_depo = (depo_uuid: string) => {
  return gbl_docs_starting("ejecucion:", true)
    .then(only_docs)
    .then((exes) => {
      let filtradas: Ejecucion[] = (exes as Ejecucion[]).filter(
        // Filtrar ejecuciones que tengan
        // insumos desde este depo
        (e) => {
          let deeste = e.detalles.dosis.filter(
            (i) => i?.deposito_origen?.uuid === depo_uuid
          );
          console.log("DEESTE", deeste);
          // Si encuentro algo -> hay
          return deeste.length > 0 ? true : false;
        }
      );

      filtradas = filtradas.sort((a, b) =>
        isBefore(
          parseISO(a.detalles.fecha_ejecucion),
          parseISO(b.detalles.fecha_ejecucion)
        )
          ? -1
          : 1
      );

      return filtradas;
    });
};

/** Expo/Impo */
export const exportar_lista_depositos = () => {};

export const importar_lista_depositos = () => {};
