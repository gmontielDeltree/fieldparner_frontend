import { Contratista } from "../contratistas/contratista-types";
import { LineaDosis } from "../depositos/depositos-types";
import { Insumo } from "../insumos/insumos-types";

interface LineaInsumoEjecucion {
     uuid:string, 
     insumo: Insumo, 
     motivos:string[],
     area:number,
     dosis: number, 
     total: number,
     precio_lista:number,
     precio_real:number,
     precio_promedio:number,
     costo_total:number,
}

interface LineaLaboresEjecucion {
    uuid:string,
    labor: string,
    area: number,
    costo_total: number,
}

interface Cotizaciones {
    uuid:string
    fecha: string, // ISO 8601
    unidad: string,
    valor: number
}

interface CondicionesMeteorologicas {
    uuid: string,
    fecha_hora_inicio : string,
    fecha_hora_fin: string,
    variable : string,
    valor_promedio_real: number,
    unidad:string,
    valor_minimo_recomendado: number,
    valor_maximo_recomendado:number,
    central_uuid ?: string,
    datos_del_sistema: boolean,
}

interface AporteSocial {
    uuid :string,
    socio : string,
    aporte : number,
    observacion : string,
}

interface ParteDeEjecucion {
   _id : string,
   uuid:string,
   actividad_base_uuid: string,
   fecha_hora_realizacion: string,
   contratista: Contratista,
   insumos : LineaInsumoEjecucion[],
   labores: LineaLaboresEjecucion[],
   cotizaciones_del_dia : Cotizaciones[],
   observaciones:string,
   condiciones_meteorologicas : CondicionesMeteorologicas[],
   carga_de_acta_uuid : string,
   aportes_sociedad ?: AporteSocial[]
}