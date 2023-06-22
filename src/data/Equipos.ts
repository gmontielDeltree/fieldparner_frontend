import { Vehiculo } from "@types";

export const Vehiculos: Vehiculo[] = [
    {
        "id": "0123",
        "tipoVehiculo": "Automovil",
        "marca": "Toyota",
        "modelo": "Etios",
        "año": "2006",
        "patente": "ABC123",
        "tara": 50,
        "neto": 1500,
        "bruto": 20,
        "tipoCombustible": "Nafta",
        "capacidadCombustible": 80,
        "unidadMedida": "mm",
        "conectividad": "",
        "propietario": "",
        "ultimoMantenimiento": "",
        "seguro": "",
        "tipoCobertura": "",
        "nroPoliza": "",
        "seguroFechaInicio": "22/04/2020",
        "seguroFechaVencimiento": "22/04/2020",
        "especificacionesTecnicas": [
            {
                "name": "Seguridad",
                "description": "Kit de Seguridad Completo"
            }
        ],
        "mantenimientos": [
            {
                id: "ASD321",
                fecha: "18/02/1994",
                descripcion: 'Aceite, Filtros, Pastillas de Freno',
                observacion: 'Ajustar direcciones',
                kilometros: 800000,
                proximo: "20/07/1998"
            }
        ]
    },
    {
        "id": "0100",
        "tipoVehiculo": "Camioneta",
        "marca": "Ford",
        "modelo": "Ranger",
        "año": "2006",
        "patente": "ABC123",
        "tara": 50,
        "neto": 1500,
        "bruto": 20,
        "tipoCombustible": "Nafta",
        "capacidadCombustible": 80,
        "unidadMedida": "mm",
        "conectividad": "",
        "propietario": "",
        "ultimoMantenimiento": "",
        "seguro": "",
        "tipoCobertura": "",
        "nroPoliza": "",
        "seguroFechaInicio": "22/04/2020",
        "seguroFechaVencimiento": "22/04/2020",
        "especificacionesTecnicas": [
            {
                "name": "Seguridad",
                "description": "Kit de Seguridad Completo"
            }
        ],
        "mantenimientos": [
            {
                id: "ASD123",
                fecha: "18/02/1994",
                descripcion: 'Aceite, Filtros, Pastillas de Freno',
                observacion: 'Ajustar direcciones',
                kilometros: 800000,
                proximo: "20/07/1998"
            }
        ]
    },
];