import uuid4 from 'uuid4'

export interface Cultivo{
  uuid: string,
  nombre:string,
  key:string,
}

export interface TipoInsumo{
  uuid: string,
  nombre:string,
  key:string,
}

interface Subtipo{
  uuid: string,
  nombre:string,
}

interface CultivoAplicacion {
  cultivo : Cultivo;
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
  tipo: TipoInsumo;
  subtipo: string;
  unidad: string;
  precio: number;
  se_aplica_a: CultivoAplicacion[];
  cultivo ?:Cultivo; // Si se trata de una semilla
}

const get_empty_insumo = () => {
  let uuid = uuid4();
  const empty_insumo: Insumo = {
    _id: "insumo:" + uuid,
    uuid: uuid,
    marca_comercial: "",
    principio_activo: "",
    tipo: null,
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
    cultivo : null,
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
    endkey: "insumo:\ufff0",
    inclusive_end:true
  });

   console.log("Insumos from DB",result)
  if (result.rows.length > 0) {
    // Hay Rows
    let docs = result.rows.map((r) => r.doc); // Extraer los docs
    return docs as Insumo[];
  } else {
    return []; // Retorna una promesa vacia
  }
}

const get_lista_insumos = async (db:PouchDB.Database)=>{

    let genericos : Insumo [] = await fetch("/insumos_genericos.json").then((response) =>
        response.json()
    );

    let propios : Insumo [] = await getInsumos(db)

    console.log("Insumos Gnericos y propios",genericos, propios)
    // Hay que excluir a los insumos que fueron modificados.
    // Filtro aquellos que tengan el mismo _id
    let ids_propios = propios.map((insumo)=>insumo._id)

    let genericos_filtrados = genericos.filter((insumo)=>!ids_propios.includes(insumo._id))

    // Ahora unimos propios + genericos_filtrados
    let result = [...genericos_filtrados,...propios]
    return result
}

const download_lista_de_insumos = async (db : PouchDB.Database) => {
  let data = await fetch("/products.json").then((response) =>
          response.json()
        );

        let products = data.products;

        // Insumos es la lista de "Insumos genericos/ no modificados"
        let insumos = products.map((p: any) => {
          let i: Insumo = get_empty_insumo();
          i.marca_comercial = p.commercial_brand;
          i.principio_activo = p.supply?.active_substance || "";
          i.tipo = p.type?.name || "";
          i.subtipo = p.subtype?.name || "";
          i.unidad = p.unit.name || "";
          return i;
        });

        downloadObjectAsJson(insumos,"insumos_genericos")
}

  function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

export { Insumo, CultivoAplicacion, get_empty_insumo, get_empty_cultivo, getInsumos, download_lista_de_insumos, get_lista_insumos };
