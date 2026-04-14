import PouchDB from 'pouchdb';
import { CreatedTag, LastUpdateTag } from './activity';
import { Business } from '@types';
import type { Deposit, WithdrawalOrder } from '../types';

export enum TTipoActividadPlanificada {
    SIEMBRA = "siembra",
    COSECHA = "cosecha",
    APLICACION = "aplicacion",
    OTRO = "otro",
    PREPARADO = "preparado"
}

interface FPAccountBaseDoc {
    accountId : string,
    created : {userId:string,date: string},
    modified : {userId:string,date: string},
}

export type FPDocument = PouchDB.Core.Document<FPAccountBaseDoc>

export interface IInsumosPlanificacion extends FPDocument {
    insumoId: string,
    dosis: number,
    totalCantidad: number,
    hectareas: number,
    precioUnitario : number,
    totalCosto:number,
    actividadId?: string,
    deposito?: Partial<Deposit> | null,
    depositoId?: string,
    ubicacion?: string,
    nroLote?: string,
    ordenRetiro?: WithdrawalOrder | null,
}

export interface ILaboresPlanificacion extends FPDocument {
    laborId: string,
    costoPorHectarea:number,
    hectareas: number,
    totalCosto: number,
    comentario?: string,
}

export interface IActividadPlanificacion extends FPDocument {

    tipo : TTipoActividadPlanificada,
    insumosLineasIds : string[],
    laboresLineasIds : string[],
    fecha : string,
    totalCosto : number,
    area: number,
    rindeEstimado ?: number,
    precioEstimadoCosecha ? :number, 
    contratista?: Business,
    cicloId: string,
    campanaId:string,
    campoId:string,
    loteId:string,
    ejecutada:boolean,
    ejecucionId?:string,
}


export interface ICiclosPlanificacion extends FPDocument {
    // Usar un ID ciclo:campanaId:campoId:loteId:uuid
    fechaInicio : string,
    fechaFin : string,
    actividadesIds : string[],
    campanaId:string,
    campoId:string,
    loteId:string,
    cultivoId : string,
    zafra?: string  // Zafra seleccionada de la campaña
}

export interface IPlanificacion extends FPDocument {
    ciclos : ICiclosPlanificacion [],
    campanaId: string,
    locked : boolean,
}

