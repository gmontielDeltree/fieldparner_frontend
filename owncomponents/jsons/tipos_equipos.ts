import { get } from 'lit-translate';
import { TipoVehiculo, TipoCombustible } from './../tipos/vehiculos';

const v = (uuid:string,key:string) => {
    return {uuid:uuid,key:key,nombre:get(key)}
}

export const tipos_equipos : TipoVehiculo[] = [
    v("v1",'cosechadora'),
    v("v2","pulverizadora"),
    v("v3","tractor"),
    v("v4","camioneta"),
    v("v5","tolva"),
]


export const tipos_combustible : TipoCombustible[] = [
    v("c1",'diesel'),
    v("c2","nafta"),
]