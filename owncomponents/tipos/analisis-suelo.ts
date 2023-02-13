import { CreatedTag, LastUpdateTag } from './../depositos/depositos-types';
import { format_min } from './../helpers';
import { Campo } from './campos';
import { Lote } from './lotes';
import { CampoOffcanvas } from './../campo-offcanvas/campo-offcanvas';
import { Attachment } from './attachments';
export interface AnalisisSuelo{
    _id:string
    _rev?:string
    attachments?: Attachment[]
    uuid: string
    tipo: "analisis-suelo",
    fecha: string
    laboratorio: string
    referencia_laboratorio: string
    nombre_responsable: string
    matricula_responsable: string
    campo: Campo
    lote: Lote
    caracterizacion: CaracterizacionSuelo
    textura: TexturaSuelo
    profundidad: number
    carbono_organico?:number 
    materia_organica?:number
    fosforo_bray?:number
    fosforo_ii?:number
    fosforo_iii?:number
    calcio?:number
    potasio?:number
    sodio?:number
    ph?:number
    azufre?:number
    zinc_zn?:number
    nitratos_no3?:number
    sulfatos_s_so4?:number
    nitratos_n_n03?:number
    conductividad_electrica?:number
    humedad?:number
    nitrogeno_total?:number
    created: CreatedTag
    last_updated: LastUpdateTag
}

export interface CaracterizacionSuelo{
    uuid:string
    caracterizacion_suelo:string
}

export interface TexturaSuelo{
    uuid:string
    textura_suelo:string
}


export interface RangoVariable{
    uuid:string
    nombre_variable:string
    min:number
    max:number
}

export interface RangosVariables{
    [nombre_variable:string]:RangoVariable
}
/*
• Laboratorio que lo realizo (por el momento dejarlo como texto libre)
• Nro de Informe del estudio generado por el laboratorio
• Nombre responsable del análisis
• Matricula del responsable del análisis
• Campo  debe venir automático del sistema
• Lote   debe venir automático del sistema
• Caracterización
• Textura
• Profundidad (cm)
• Carbonato Orgánico (C.O. - %)
• Materia Orgánica (M.O - %)
• Fosforo (P Bray 1 - ppm)
• Fosforo II
• Fosforo III
• Calcio
• Potasio
• Sodio
• PH
• Azufre
• Zinc (ZN - ppm)
• Nitratos (NO3 – ppm)
• Sulfatos (S-SO4 - ppm)
• Nitratos (N-NO3 – ppm)
• Cond. Eléctrica
• Humedad %
• Nitrógeno total
*/