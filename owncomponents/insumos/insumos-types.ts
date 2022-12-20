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
  _rev?:string,
  uuid: string;
  marca_comercial: string;
  principio_activo: string;
  tipo: string;
  subtipo: string;
  unidad: string;
  precio: number;
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
    precio: 0.0,
    se_aplica_a: []
    } ;

  return {...empty_insumo};
}

const get_empty_cultivo = ()=>{
  let uuid = uuid4()

  const empty_cultivo : CultivoAplicacion = {
    cultivo : "",
    uuid : uuid,
    estadio_desde : "",
    estadio_hasta : "",
    dosis_max : 0,
    dosis_min : 0,
    dosis_sugerida: 0,
  }

  return {...empty_cultivo};
}

const getInsumos = async (db : PouchDB.Database)=>{
  let result = await db.allDocs({
    include_docs: true,
    startkey: "insumo:",
    endkey: "insumo:_\ufff0",
  });

  if (result.rows?.length > 0) {
    // Hay Rows
    let docs = result.rows.map((r) => r.doc); // Extraer los docs
    return docs as Insumo[];
  } else {
    return []; // Retorna una promesa vacia
  }
}
export { Insumo, CultivoAplicacion, get_empty_insumo, get_empty_cultivo, getInsumos };
