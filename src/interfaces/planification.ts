import PouchDB from 'pouchdb';
import { CreatedTag, LastUpdateTag } from './activity';

export enum TTipoActividadPlanificada {
    SIEMBRA = "siembra",
    COSECHA = "cosecha",
    APLICACION = "aplicacion",
    OTRO = "otro"
}

interface FPAccountBaseDoc {
    accountId : string,
    created : {userId:string,date: string},
    modified : {userId:string,date: string},
}

type FPDocument = PouchDB.Core.Document<FPAccountBaseDoc>

export interface IInsumosPlanificacion {
    uuid: string,
    insumoId: string,
    dosis: number,
    totalCantidad: number,
    hectareas: number,
    precioUnitario : number,
    totalCosto:number
}

export interface ILaboresPlanificacion {
    uuid: string,
    laborId: string,
    costoPorHectarea:number,
    hectareas: number,
    totalCosto: number,
    comentario?: string,
}

export interface IActividadPlanificacion extends FPDocument {

    tipo : TTipoActividadPlanificada,
    insumos : IInsumosPlanificacion[],
    labores : ILaboresPlanificacion[],
    fecha : string,
    totalCosto : number,
    area: number,
    rindeEstimado ?: number 
    contratistaId?: string,
    cicloId: string,
    campanaId:string,
    planId:string,
    campoId:string,
    loteId:string,
    ejecutada:boolean,
    ejecucionId?:string,
}


export interface ICiclosPlanificacion extends FPDocument {
    fechaInicio : string,
    fechaFin : string,
    actividades : IActividadPlanificacion[],
    campanaId:string,
    planId:string,
    campoId:string,
    loteId:string,
    costoTotal : number,
    cultivoId : string
}

export interface IPlanificacion extends FPDocument {
    ciclos : ICiclosPlanificacion [],
    campanaId: string,
    locked : boolean,
}

