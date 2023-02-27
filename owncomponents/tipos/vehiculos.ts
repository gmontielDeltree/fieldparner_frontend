import { CreatedTag, LastUpdateTag } from "../depositos/depositos-types";

export interface TipoVehiculo {
    uuid:string,
    nombre:string,
    key?:string,
}
export interface TipoCombustible{
    uuid:string,
    nombre:string,
    key?:string,
}

export interface Vehiculo{
    _id: string,
    _rev?: string,
    uuid: string,
    last_updated: LastUpdateTag,
	created: CreatedTag,
    tipo:"vehiculo",
    tipo_vehiculo: TipoVehiculo,
    nombre:string, // Es la combinacion de tipo_vehiculo + marca + model
    descripcion: string,
    status:string,
    placa: string,
    marca:string,
    modelo:string,
    ano:string,
    tara?:number,
    neto?:number,
    bruto?:number,
    tipo_combustible?: TipoCombustible,
    capacidad_combustible?:string,
    unidad_medida?:string,
    conectividad?:string,
    propietario?:string,
    propiedad?:string,
    conductor?:string,
    ultimo_mantenimiento?:string,
    seguro?:string,
    seguro_compania?: string,
    seguro_tipo_de_cobertura?: string,
    seguro_numero_de_poliza?:string,
    seguro_fecha_de_inicio?:string,
    seguro_fecha_de_vencimiento?:string,
    distancia_entre_picos?:number,
    ancho?:number,
}