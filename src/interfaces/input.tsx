export interface Crop {
  uuid: string;
  nombre: string;
  key: string;
}

export interface InputType {
  uuid: string;
  nombre: string;
  key: string;
}

export interface Subtype {
  uuid: string;
  nombre: string;
}

export interface CropApplication {
  cultivo: Crop;
  uuid: string;
  estadio_desde: string;
  estadio_hasta: string;
  dosis_min: number;
  dosis_max: number;
  dosis_sugerida: number;
}

export interface Input {
  _id: string;
  _rev?: string;
  uuid: string;
  marca_comercial: string;
  principio_activo: string;
  tipo: InputType;
  subtipo: string;
  unidad: string;
  precio: number;
  dosis_min?: number;
  dosis_sugerida?: number;
  dosis_max?: number;
  se_aplica_a: Crop[];
  cultivo?: Crop;
}
