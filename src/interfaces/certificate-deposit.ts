import { Document } from "@types";

// Interface principal del Certificado de Depósito
export interface CertificateDeposit extends Document {
    accountId: string;
    licenceId: string;
    archivoCertificado: string;
    createdDate: string;

    certificacionElectronicaGranos: {
        fechaEmision: string;
        tipoCertificado: string;
        granoYTipo: string;
        campana: number;
        coe: string;
    };

    depositario: {
        razonSocial: string;
        domicilio: string;
        localidad: string;
        provincia: string;
        cuit: string;
        iva: string;
    };

    depositante: {
        razonSocial: string;
        domicilio: string;
        localidad: string;
        provincia: string;
        cuit: string;
        iva: string;
        ingresosBrutosNro: number;
    };

    plantaNro: string;

    tarifasCada100Kgrs: {
        almacenaje: number;
        acarreo: number;
        gastosGenerales: number;
        zarandeo: number;
        secado: {
            dePorcentaje: number;
            aPorcentaje: number;
            montoSecado: number;
        };
        porCptoExceso: number;
        otros: number;
        observaciones: string;
    };

    peso: {
        pesoBruto: number;
        mermas: {
            volatil: number;
            secado: number;
            zarandeo: number;
        };
        pesoNeto: number;
    };

    servicios: {
        formaDePago: string;
        gastosGenerales: number;
        alicuotaIva: string;
        importeIva: number;
        zarandeo: number;
        cptosNoGravados: number;
        secado: number;
        percepcionesIva: number;
        otros: number;
        otrasPercepciones: number;
        total: number;
    };

    datosAdicionales: string;

    // Campos adicionales para el formulario
    cultivoId: string;
    campaniaId: string;
    numeroAnalisis: string;
    grado: string;
    contProteico: string;
    factor: string;
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

// Interfaces para la respuesta del servicio de procesamiento de PDF
export interface CertificatePDFResponse {
    certificacion_electronica_granos: {
        fecha_emision: string;
        tipo_certificado: string;
        grano_y_tipo: string;
        campana: number;
        coe: string;
    };
    depositario: {
        razon_social: string;
        domicilio: string;
        localidad: string;
        provincia: string;
        cuit: string;
        iva: string;
    };
    depositante: {
        razon_social: string;
        domicilio: string;
        localidad: string;
        provincia: string;
        cuit: string;
        iva: string;
        ingresos_brutos_nro: number;
    };
    planta_nro: string;
    tarifas_cada_100_kgrs: {
        almacenaje: number;
        acarreo: number;
        gastos_generales: number;
        zarandeo: number;
        secado: {
            de_porcentaje: number;
            a_porcentaje: number;
            monto_secado: number;
        };
        por_cpto_exceso: number;
        otros: number;
        observaciones: string;
    };
    granos: GranoPDFResponse[];
    peso: {
        peso_bruto: number;
        mermas: {
            volatil: number;
            secado: number;
            zarandeo: number;
        };
        peso_neto: number;
    };
    servicios: {
        forma_de_pago: string;
        gastos_generales: number;
        alicuota_iva: string;
        importe_iva: number;
        zarandeo: number;
        cptos_no_gravados: number;
        secado: number;
        percepciones_iva: number;
        otros: number;
        otras_percepciones: number;
        total: number;
    };
    datos_adicionales: string;
    pagina: string;
}

export interface GranoPDFResponse {
    ctg_carta_porte: string;
    fecha_ctg: string;
    kgs_conf_def: number;
    zarandeo: {
        merma_kgs: number;
        tarifa: number;
        importe: number;
    };
    secado: {
        humedad_porcentaje: number;
        merma_kgs: number;
        tarifa: number;
        importe: number;
    };
    total: number;
}