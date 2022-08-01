import uuid4 from 'uuid4'

interface CultivoAplicacion {
  cultivo : any;
  uuid: string;
  estadio_desde: string;
  estadio_hasta: string;
  dosis_min: number;
  dosis_max: number;
  dosis_sugerida: number;
}

interface Insumo {
  _id: string,
  uuid: string;
  marca_comercial: string;
  principio_activo: string;
  tipo: string;
  subtipo: string;
  unidad: string;
  se_aplica_a: CultivoAplicacion[];
  
}

const get_empty_insumo = () => {
  let uuid = uuid4();
  const empty_insumo: Insumo = {
    _id: "insumo:" + uuid,
    uuid: uuid,
    marca_comercial: "",
    principio_activo: "",
    tipo: "",
    subtipo: "",
    unidad: "",
    se_aplica_a: []
    } ;

  return empty_insumo;
}


export { Insumo, get_empty_insumo };
