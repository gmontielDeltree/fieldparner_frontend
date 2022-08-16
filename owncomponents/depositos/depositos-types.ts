import { PartType } from "lit-html/directive";
import uuid4 from "uuid4";
import { Contratista } from "../contratistas/contratista-types";
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

type DetallesAplicacion =  {
  fecha: number;
  hectareas: number;
  dosis: { insumo: Insumo; dosis: number; total: number }[];
}

type DetallesCosecha = {

}

type DetallesSiembra = {
  fecha: number;
  insumo: Insumo;
  peso_1000: number;
  densidad_objetivo: number;
  semillas_totales: number;
  distancia: number;
  hectareas: number;
  comentario: string;
  adjuntos: any;
}

interface Actividad {
  _id: string;
  uuid: string;
  ts_generacion: number;
  tipo: string;
  contratista: Contratista;
  comentarios: string;
  adjuntos: string[];
  estado: string;
  detalles: DetallesSiembra | DetallesCosecha | DetallesAplicacion;
}

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
};
