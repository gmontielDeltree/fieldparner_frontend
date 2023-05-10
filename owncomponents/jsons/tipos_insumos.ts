import { get } from 'lit-translate';
import { TipoInsumo } from '../insumos/insumos-types';


const v = (uuid:string,key:string) => {
    return {uuid:uuid,key:key,nombre:get(key)}
}

export const old_tipo_2_new = (ot : string )=>{
    let min_ot = ot.toLowerCase()
    let new_insumo = tipos_insumos.find((i)=>i.key===min_ot)
    // console.log("new tipo",new_insumo,min_ot)
    return new_insumo as TipoInsumo;
}

export const tipo_insumo_conv_si_necesario = (a : any)=>{
    if(typeof a === 'string'){
        return old_tipo_2_new(a)
    }else{
        // asumir nuevo o undef
        return a;
    }
}
export const tipos_insumos = [
    v('ti1','semillas'),
    v('ti2',"fertilizantes"),
    v('ti3',"agroquímicos"),
    v('ti4',"combustible"),
    v('ti5',"sin_especificar"),
]