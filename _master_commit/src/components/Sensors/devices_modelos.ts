

const devices_modelos : any = {
    // Chacabuco Altura
    "WMM-05S" : {
        sensores : ["temperatura", "humedad", "presion","viento_velocidad","viento_direccion","sensacion_termica","punto_de_rocio", "inversion_termica_chacabuco_baja", "stress_termico"],
        sensores_reales : ["temperatura", "humedad", "presion","velocidad","direccion"],
    },
    // Chacabuco Baja
    "LMM-03S" : {
        sensores : ["temperatura", "humedad", "presion", "rssi","punto_de_rocio","stress_termico"],
        sensores_reales : ["temperatura", "humedad", "presion"],
    },
    // Santiago
    "LSMH01-1" : {
        sensores : ["temperatura","humedad","humedad_suelo"],
        sensores_reales : ["temperatura","humedad","humedad_suelo"],
    }, // GW santiago
    "GWMM05" : {
        sensores : ['temperatura', "humedad", "presion", "viento_velocidad", "viento_direccion", "pluviometro", "radiacion_solar", "sensacion_termica","punto_de_rocio", "stress_termico"],
        sensores_reales : ['temperatura', "humedad", "presion", "viento_velocidad", "viento_direccion", "pluviometro", "radiacion_solar"]
    },
    "AGTRACK01": {
        sensores: ["rssi"]
    }
}

export default devices_modelos;