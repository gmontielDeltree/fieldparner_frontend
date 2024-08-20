import { Document, ExitField } from "../types";
import { Company } from "./company";

export interface TransportDocument extends Document {
    accountId: string;
    licenceId: string;
    contractId: string;
    nroCartaPorte: string;
    fechaEmision: string;
    fechaVencimiento: string;
    nroCTG: string;
    arancel: string;
    cuitGenerador: string;
    cuitCompania: string;
    categoriaEntidadId: string;
    salidaCampoId: string;
    cpSalidaCampo: string;
    nroOperadorONCCA: string;
    nroPlantaONCCA: string;
    cuitRemitenteComercialPrimario: string;
    cuitRemitenteComercialSecundario: string;
    cuitRemitenteComercialSecundario2: string;
    cuitMAT: string;
    cuitComercialVentaPrimaria: string;
    cuitComercialVentaSecundaria: string;
    cuitRepresentanteEntrega: string;
    cuitRepresentanteRecibidor: string;
    contrato: string;
    cpGenerador: string;
    kgEstimado: number;
    kgBruto: number;
    kgTara: number;
    kgNeto: number;
    cuitComprador: string;
    cuitAsignadorCupo: string;
    nroCupo: string;
    fechaCupo: string;
    cuitDestinatario: string;
    esCampo: boolean;
    campoDestinatario: string;
    vehiculoIdChasis: string;
    vehiculoIdAcoplado1: string;
    vehiculoIdAcoplado2: string;
    loteDestinatario: string;
    cuitDestino: string;
    domicilioDestino: string;
    localidadDestino: string;
    cpDestino: string;
    provinciaDestino: string;
    cuitTransportista: string;
    razonSocialTransportista: string;
    cuitChofer: string;
    razonSocialChofer: string;
    kmARecorrer: number;
    tipoFlete: string;
    tarifaRef: number;
    tarifaTT: number;
    calidadEnvoltura: string;
    calidad: string;
    fechaPartida: string;
    cuitPagadorFlete: string;
    cuitIntermediarioFlete: string;
    observaciones: string;
    status: string;
    fileName: string;
}

export interface TransportDocumentItem extends TransportDocument {
    exitField?: ExitField;
    company?: Company
}
