import { CreatedTag, Deposito, LastUpdateTag } from '../depositos/depositos-types';
import { Insumo } from "../insumos/insumos-types";


export interface LineaTransferencia {
    uuid: string,
    insumo:Insumo,
    cantidad: number,
    obs: string,
}

export interface DepositosTransferencia {
    _id: string,
    _rev ?: string,
    uuid: string,
    fecha: string,
    pais?:string,
    referencia ?: string,
    referencia_actividad ?: string,
    es_ingreso: boolean,
    deposito_origen: Deposito ,
    deposito_destino: Deposito,
    lineas : LineaTransferencia [],
    obs: string,
    adjuntos ?: string[]
    last_updated : LastUpdateTag,
    created: CreatedTag
}