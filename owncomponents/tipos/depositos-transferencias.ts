import { Attachment } from './attachments';
import { CreatedTag, Deposito, LastUpdateTag } from '../depositos/depositos-types';
import { Insumo } from "../insumos/insumos-types";


export interface LineaTransferencia {
    uuid: string,
    insumo:Insumo,
    cantidad: number,
    precio ?:number,
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
    attachments ?: Attachment[]
    last_updated : LastUpdateTag,
    created: CreatedTag
}

export interface LineaStock {
    insumo : Insumo,
    cantidad : number,
    valoracion : number,
}

export interface Stock {
    [insumo_uuid : string] : LineaStock
}
