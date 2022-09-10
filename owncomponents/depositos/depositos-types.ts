import { PartType } from "lit-html/directive";
import uuid4 from "uuid4";
import {
  Contratista,
  empty_contratista,
} from "../contratistas/contratista-types";
import { Insumo } from "../insumos/insumos-types";

interface IHash<T> {
  [index: string]: T;
}

interface Deposito {
  _id: string;
  uuid: string;
  nombre: string;
  posicion: number[];
}

interface LineaInsumo {
  uuid: string; //Id de la linea
  uuid_insumo: string; // Id del producto
  nombre: string;
  unidad: string;
  cantidad: number;
}

interface Entrada {
  _id: string;
  ts: number;
  deposito_id: string;
  uuid: string;
  tipo: string;
  insumos: LineaInsumo[];
}

interface TablaStockLinea {
  uuid_insumo: string;
  entradas: number;
  salidas: number;
  stock: number;
}

const get_empty_deposito = () => {
  let uuid = uuid4();
  const empty_depo: Deposito = {
    _id: "deposito:" + uuid,
    uuid: uuid,
    nombre: "",
    posicion: [0, 0],
  };

  return { ...empty_depo };
};

const get_empty_entrada = () => {
  let uuid = uuid4();

  const empty_entrada: Entrada = {
    _id: "entrada:",
    uuid: uuid,
    ts: 0,
    deposito_id: "",
    tipo: "entrada",
    insumos: [],
  };

  return { ...empty_entrada };
};

type LineaDosis =  { uuid:string, insumo: Insumo; motivos:string[], dosis: number; total: number }

type DetallesAplicacion = {
  fecha_ejecucion_tentativa: string;
  hectareas: number;
  dosis: LineaDosis[];
};

type DetallesCosecha = {
  fecha_ejecucion_tentativa: string;
  hectareas: number;
  rinde: number;
  comentario: string;
  humedad: string;
  
};

type DetallesSiembra = {
  fecha_ejecucion_tentativa: string;
  insumo: Insumo;
  peso_1000: number;
  densidad_objetivo: number;
  semillas_totales: number;
  distancia: number;
  hectareas: number;
  comentario: string;
  adjuntos: any;
};

interface Actividad {
  _id: string;
  uuid: string;
  ts_generacion: number;
  tipo: string;
  lote_uuid: string;
  contratista: Contratista;
  comentario: string;
  adjuntos: string[];
  estado: string;
  detalles: DetallesSiembra | DetallesCosecha | DetallesAplicacion;
  fecha? : string;
  color? : string;
  texto? : string;
  posicion? : number[];
  _attachments?: any;
}

const get_empty_aplicacion = () => {
  const a: Actividad = {
    _id: "",
    uuid: uuid4(),
    ts_generacion: 0,
    tipo: "aplicacion",
    lote_uuid: "",
    contratista: { ...empty_contratista },
    comentario: "",
    adjuntos: [],
    estado: "pendiente",
    detalles: {
      fecha_ejecucion_tentativa: "",
      hectareas: 0,
      motivos:"",
      dosis: [],
    } as DetallesAplicacion,
  };

  return {...a}
};

const sumar_entradas = (entradas: Entrada[]) => {
  let tabla: IHash<TablaStockLinea>;

  /* Itero Entrada */
  entradas.forEach((entrada) => {
    let lista_insumos = entrada.insumos;
    /* Itero Insumos y sumo */
    lista_insumos.forEach((i) => {
      let cantidad = i.cantidad;
      let uuid = i.uuid_insumo;
      tabla[uuid].uuid_insumo = uuid;
      tabla[uuid].entradas = tabla[uuid].entradas + cantidad;
    });
  });

  return tabla;
};

const sumar_salida = (actividades: Actividad[]) => {
  let tabla: IHash<TablaStockLinea>;

  /* Itero Entrada */
  actividades.forEach((actividad) => {
    if (actividad.tipo === "siembra") {
      let insumo: Insumo = actividad.detalles.insumo;
      tabla[insumo.uuid].uuid_insumo = insumo.uuid;
      tabla[insumo.uuid].salidas = tabla[insumo.uuid].salidas + 1;
    }

    if (actividad.tipo === "cosecha") {
    }

    if (actividad.tipo === "aplicacion") {
    }
  });

  return tabla;
};

export {
  Deposito,
  Entrada,
  TablaStockLinea,
  Actividad,
  get_empty_deposito,
  get_empty_entrada,
  get_empty_aplicacion,
  DetallesSiembra,
  DetallesAplicacion,
  LineaDosis
};
