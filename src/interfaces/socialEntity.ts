import { DataFileName, Document } from '../types';
import { Country } from './country';

export interface Business extends Document {
    accountId: string;
    nombreCompleto?: string;
    documento?: string;
    telefono: string;
    taxSituation: string;
    email: string;
    tipoEntidad: string;
    razonSocial?: string;
    cuit?: string;
    contactoPrincipal?: string;
    contactoSecundario?: string;
    nameMainContact?: string;
    sitioWeb?: string;
    domicilio: string;
    localidad: string;
    cp: string;
    zipCode: string;
    provincia: string;
    pais: string;
    estado?: boolean;
    esEmpleado?: boolean;
    legajo?: string;
    matricula?: string;
    categorias: string[];
    logoBusiness?: DataFileName;
}

export interface BusinessItem extends Business {
    country: Country;
}