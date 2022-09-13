

const devices_modelos : any = {
    // Chacabuco Altura
    "WMM-05S" : {
        sensores : ["temperatura", "humedad", "presion","viento_velocidad","viento_direccion","punto_de_rocio", "inversion_termica", "stress_termico"],
    },
    // Chacabuco Baja
    "LMM-03S" : {
        sensores : ["temperatura", "humedad", "presion", "rssi"],
    },
    // Santiago
    "LSMH01-1" : {
        sensores : ["temperatura","humedad","presion","humedad_suelo","rssi"]
    }, // GW santiago
    "GWMM05" : {
        sensores : ['temperatura', "humedad", "presion", "viento_velocidad", "viento_direccion", "pluviometro", "radiacion_solar"]
    },
    "AGTRACK01": {
        sensores: ["rssi"]
    }
}

export default devices_modelos;