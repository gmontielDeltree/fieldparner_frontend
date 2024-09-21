import { Document } from "@types";


export interface CertificateDeposit extends Document {
    accountId: string;
    licenceId: string;
    numeroCertificado: string;
    fechaEmision: string;
    campaniaId: string;
    cultivoId: string;
    tipoCertificado: string;
    cuitDepositario: string;
    cuitDepositor: string;
    planta: string;
    numeroAnalisis: string;
    archivoCertificado: string;
    rubro: string;
    porcentajeRubro: number;
    tipoRubro: string;
    valor: number;
    precioAlmacenaje: number; //almcenaje
    precioAcarreo: number; //acarreo
    precioGastosGenerales: number; //gastos generales
    precioZarandeo: number; //zarandeo
    precioOtros: number; //otros
    precioExcedente: number; //precio de excedente
    precioSecadoDe: number; //precio de secado de 
    precioSecadoA: number; //precio de secado a
    precioSecado: number; //precio de secado
    kgVolatil: number;
    kgZarandeo: number;
    kgSecado: number;
    kgNeto: number;
    kgBruto: number;
    formaPago: string;
    totalGastosGenerales: number; //TODO: verificar si es necesario
    iva: number;
    importeIVA: number;
    totalZarandeo: number;
    totalConceptoNoGravado: number;
    totalSecado: number;
    percepcionIVA: number;
    totalOtros: number;
    otrasPercepciones: number;
    total: number;
    descripcionAdicional: string;
    grado: string;
    contProteico: string;
    factor: string;
    observaciones: string;
    createdDate: string;

}

export interface TransportDocumentByCertificateDeposit extends Document {
    numeroCertificado: string;
    numeroCartaPorte: string;
    fechaCartaPorte: string;
    kgNeto: number;
    kgMermaZarandeo: number;
    tarifaZarandeo: number;
    importeZarandeo: number;
    humedadSecado: number;
    kgMermaSecado: number;
    tarifaSecado: number;
    importeSecado: number;
}

export interface CertificateDepositItemRow extends Document {
    numeroCertificado: string;
    fechaEmision: string;
    planta: string;
    campania: string;
    cultivo: string;
    kgConfirmados: string;
    archivoCertificado: string;
}