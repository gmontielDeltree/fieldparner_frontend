import { Attachment } from "./attachments";
import { LngLatLike } from "mapbox-gl";
import uuid4 from "uuid4";
import { Contratista, empty_contratista, Labor } from "./contractor";
import { Insumo } from "./insumos";
import { Proveedor } from "./proveedores";
import { Ingeniero } from "./ingenieros";
import { DeviceDetalles } from "./sensores";
import { Vehiculo } from "./vehiculos";
import { Campaign } from "@types";

interface IHash<T> {
  [index: string]: T;
}
export interface LastUpdateTag {
  last_updated: string;
  last_updated_by: Object;
}

export interface CreatedTag {
  created: string;
  created_by: Object;
}

interface Deposito {
  _id: string;
  _rev?: string;
  uuid: string;
  nombre: string;
  contratista_asociado?: Contratista;
  proveedor_asociado?: Proveedor;
  posicion?: LngLatLike; //Lng Lat
  direccion?: string;
  tipo: "virtual" | "fisico";
  car?: string;
  /** iso dates zulu */
  last_updated: LastUpdateTag;
  created: CreatedTag;
  pais?: string;
  archivado: boolean;
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
    posicion: [0, 0]
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
    insumos: []
  };

  return { ...empty_entrada };
};

type LineaDosis = {
  selectedOption: Insumo;
  deposito: any;
  nro_lote: any;
  ubicacion: any;
  dosificacion: number;
  orden_de_retiro: any;
  uuid: string;
  insumo: Insumo;
  motivos: string[];
  dosis: number;
  total: number;
  precio_estimado: number;
};

type LineaServicio = {
  uuid: string;
  servicio: string;

  contratista: Contratista;
  unidades: number;
  precio_unidad: number;
  costo_total: number;
  comentario: string;
};

type LineaLabor = {
  uuid: string;
  labor: Labor;
  costo: number;
  observacion: string;
};

type LineaDosisEjecucion = {
  uuid: string;
  insumo: Insumo;
  motivos: string[];
  dosis: number;
  total: number;
  precio_estimado: number;
  precio_real: number;
  deposito_origen: Deposito;
};

type DetallesAplicacion = {
  fecha_ejecucion_tentativa: string;
  hectareas: number;
  dosis: LineaDosis[];
  servicios?: LineaServicio[];
};

type DetallesCosecha = {
  fecha_ejecucion_tentativa: string;
  dosis?: LineaDosis[];
  servicios?: LineaServicio[];

  hectareas: number;
  rinde: number;
  humedad: number;
};

type DetallesSiembra = {
  fecha_ejecucion_tentativa: string;
  dosis?: LineaDosis[];
  servicios?: LineaServicio[];

  insumo: Insumo;
  peso_1000: number;
  densidad_objetivo: number;
  semillas_totales: number;
  distancia: number;
  hectareas: number;
  comentario: string;
  adjuntos: any;
};

interface Condiciones {
  temperatura_min: number;
  temperatura_max: number;
  humedad_min: number;
  humedad_max: number;
  velocidad_min: number;
  velocidad_max: number;
}
interface CondicionesEjecucion {
  temperatura: {
    device: DeviceDetalles;
    value: number;
    planificado: { min: number; max: number };
    distancia: number;
  };
  humedad: {
    device: DeviceDetalles;
    value: number;
    planificado: { min: number; max: number };
    distancia: number;
  };
  velocidad: {
    device: DeviceDetalles;
    value: number;
    planificado: { min: number; max: number };
    distancia: number;
  };
  humedad_suelo: {
    device: DeviceDetalles;
    value: number;
    planificado: { min: number; max: number };
    distancia: number;
  };
  temperatura_min: number;
  temperatura_promedio: number;
  humedad_promedio: number;
  velocidad_promedio: number;
  temperatura_max: number;
  humedad_min: number;
  humedad_max: number;
  velocidad_min: number;
  velocidad_max: number;
}

interface Detalles {
  fecha_ejecucion: string;
  fecha_ejecucion_tentativa: string;
  hectareas: number;
  dosis: LineaDosis[];
  costo_labor: LineaLabor[];
  // Cosecha
  rinde_esperado?: number;
  humedad_esperado?: number;
  // Siembra
  peso_1000?: number;
  densidad_objetivo?: number;
  semillas_totales?: number;
  distancia?: number;
  tipo_siembra?: string;
  vehiculos?: Vehiculo[];
  profundidad_siembra?: number;
  inoculado?: { marca: string; formulacion: string };
}

interface DetallesEjecucion {
  fecha_ejecucion: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  hectareas: number;
  dosis: LineaDosisEjecucion[];
  costo_labor: LineaLabor[];
  // Cosecha
  rinde?: number;
  humedad?: number;
  // Siembra
  peso_1000?: number;
  densidad_objetivo?: number;
  semillas_totales?: number;
  distancia?: number;
  tipo_siembra?: string;
  vehiculos?: Vehiculo[];
}

interface Actividad {
  _id: string;
  _rev?: string;
  uuid: string;
  ts_generacion: number;
  tipo: string;
  lote_uuid: string;
  contratista: Contratista;
  ingeniero: Ingeniero;
  comentario: string;
  estado: string;
  detalles: Detalles;
  fecha?: Date;
  color?: string;
  texto?: string;
  posicion?: number[];
  condiciones?: Condiciones;
  attachments?: Attachment[];
  motivos_nota?: any;
  fecha_ejecucion?: Date;
  campaña?: Campaign;
}

interface Ejecucion {
  _id: string;
  _rev?: string;
  actividad_uuid: string;
  uuid: string;
  contratista: Contratista;
  ingeniero: Ingeniero;
  ts_generacion: string;
  tipo: string;
  lote_uuid: string;
  comentario: string;
  estado: string;
  detalles: DetallesEjecucion;
  condiciones?: CondicionesEjecucion;
  deposito_origen?: Deposito;
  attachments?: Attachment[];
}

const getEmptyFeature = () => {
  return {
    _id: "",
    uuid: uuid4(),
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0]
    },
    properties: {
      _id: "",
      orden: 0,
      nombre: "",
      detalles: [
        { name: "", value: "" },
        { name: "", value: "" },
        { name: "", value: "" }
      ],
      last_updated: {
        last_updated: "",
        last_updated_by: ""
      },
      created: {
        created: "",
        created_by: ""
      },
      notas: "",
      fotos: [],
      audio: ""
    }
  };
};

const getEmptyNote = () => {
  const note = {
    uuid: uuid4(),
    lote_uuid: "",
    type: "FeatureCollection",
    tipo: "nota",
    fecha: "",
    nombre: "",
    proxima_visita: "",
    last_updated: {
      last_updated: "",
      last_updated_by: ""
    },
    created: {
      created: "",
      created_by: ""
    },
    features: [],
    _id: "",
    _rev: ""
  };

  return { ...note };
};

const getEmptyActivity = () => {
  const now = new Date();
  const a: Actividad = {
    _id: "",
    uuid: uuid4(),
    ts_generacion: 0,
    tipo: "aplicacion",
    lote_uuid: "",
    contratista: { ...empty_contratista },
    ingeniero: null,
    comentario: "",
    estado: "pendiente",
    detalles: {
      fecha_ejecucion_tentativa: now,
      hectareas: 0,
      motivos: "",
      dosis: [],
      servicios: [],
      costo_labor: []
    } as Detalles,
    condiciones: {
      temperatura_max: 25,
      temperatura_min: 0,
      humedad_min: 45,
      humedad_max: 65,
      velocidad_min: 5,
      velocidad_max: 15
    }
  };

  return { ...a };
};

const deepcopy = (obj: Ejecucion) => {
  return JSON.parse(JSON.stringify(obj));
};

const getEmptyExecution = () => {
  const a: Ejecucion = {
    _id: "",
    uuid: uuid4(),
    actividad_uuid: "",
    ts_generacion: "0",
    tipo: "aplicacion",
    lote_uuid: "",
    comentario: "",
    contratista: { ...empty_contratista },
    ingeniero: null,
    estado: "pendiente",
    detalles: {
      fecha_ejecucion: "",
      fecha_hora_fin: "",
      fecha_hora_inicio: "",
      hectareas: 0,
      dosis: [],
      costo_labor: []
    },
    condiciones: {
      temperatura_max: 25,
      temperatura_min: 0,
      humedad_min: 45,
      humedad_max: 65,
      velocidad_min: 5,
      velocidad_max: 15
    }
  };

  return deepcopy(a);
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

export {
  get_empty_deposito,
  get_empty_entrada,
  getEmptyActivity,
  getEmptyNote,
  getEmptyExecution
};
export type {
  Deposito,
  Entrada,
  TablaStockLinea,
  Actividad,
  DetallesSiembra,
  DetallesAplicacion,
  DetallesCosecha,
  LineaDosis,
  LineaLabor,
  Ejecucion,
  DetallesEjecucion,
  LineaDosisEjecucion,
  LineaServicio
};
