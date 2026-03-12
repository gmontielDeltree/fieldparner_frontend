import { FPDocument } from './planification';

export interface IAnnualPlan extends FPDocument {
  campanaId: string;
  campanaName?: string;
  zafra: string;
  campoId: string;
  campoNombre?: string;
  loteId: string;
  loteNombre?: string;
  has: number;
  cultivoId: string;
  cultivoNombre?: string;
  cosechaEstimada: number; // En toneladas
  status: 'abierto' | 'cerrado' | 'en_proceso';
  // Campos para valorización
  rindeHistorico?: number; // En Kg/Ha
  monedaAlterId?: string;
  cotizMonAlt?: number;
  operacMonAlt?: 'multiplicar' | 'dividir';
  cotizFutCer?: number; // En moneda local por tonelada
  valorizada?: boolean;
}

export interface IAnnualPlanValorization extends FPDocument {
  annualPlanId: string;
  campanaId: string;
  campanaName?: string;
  zafra: string;
  campoId: string;
  campoName?: string;
  loteId: string;
  loteName?: string;
  has: number;
  cultivoId: string;
  cultivoName?: string;
  cosechaEstimada: number; // En toneladas
  tendenciaMonLocal: number; // Valor en moneda local
  status: 'abierto' | 'cerrado' | 'en_proceso';
  createdDate?: string;
  modifiedDate?: string;
}

export interface IInsumosxAnnualPlan extends FPDocument {
  annualPlanId: string;
  labor?: string;
  item: string;
  insumoId: string;
  cantidad: number;
  cantidadHa?: number;
  valorUnidad?: number; // En moneda local
  valorTotal?: number; // cantidad x valorUnidad x cantHectareas
}

export interface IServicxAnnualPlan extends FPDocument {
  annualPlanId: string;
  labor?: string;
  item: string;
  servicioId: string;
  descripcion: string;
  cantidad: number;
  cantidadHa?: number;
  valorUnidad?: number; // En moneda local
  valorTotal?: number; // cantidad x valorUnidad x cantHectareas
} 