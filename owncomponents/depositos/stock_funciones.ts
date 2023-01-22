import { listar_transferencias } from "./transferencias_funciones";
import { LineaStock, Stock } from "../tipos/depositos-transferencias";
import { gbl_state } from "../state";
import { gbl_docs_starting, only_docs } from "../helpers";
import { filter } from "jszip";
import { Ejecucion } from "./depositos-types";

// IMHAPPY

export const calcular_stock = async (depo_uuid) => {
  let stock: Stock = {};

  let transfers = await listar_transferencias(depo_uuid);

  /* Filtrar ejecuciones que involucren a este depo */
  let todas_ejecuciones = (await gbl_docs_starting("ejecucion", true).then(
    only_docs
  )) as unknown as Ejecucion[];
  let ejecuciones_del_depo = todas_ejecuciones.filter((e) => {
    if (e.deposito_origen) {
      return e.deposito_origen.uuid === depo_uuid;
    }
    return false;
  });

  // Iterar por cada trasfer
  transfers.forEach((t) => {
    t.lineas.forEach((l) => {
      if (!(l.insumo.uuid in stock)) {
        // No esta en stock aun
        stock[l.insumo.uuid] = { insumo: l.insumo, cantidad: 0, valoracion: 0 };
      }

      if (t.deposito_destino.uuid === depo_uuid) {
        //Incoming Sumo
        stock[l.insumo.uuid].cantidad += l.cantidad;
      } else {
        // Resto
        stock[l.insumo.uuid].cantidad -= l.cantidad;
      }
    });
  });

  // Iterar por cada ejecucion
  ejecuciones_del_depo.forEach((e) => {
    e.detalles.dosis.forEach((l) => {
      if (!(l.insumo.uuid in stock)) {
        // No esta en stock aun
        stock[l.insumo.uuid] = { insumo: l.insumo, cantidad: 0, valoracion: 0 };
      }

      // Siempre Resto en ejecuciones
      stock[l.insumo.uuid].cantidad -= l.dosis;
    });
  });

  return stock;
};
