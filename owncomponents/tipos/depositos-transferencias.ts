
interface DepositosTransferencias {
    deposito_origen_uuid: string,
    deposito_destino_uuid: string,
    lineas_de_transferencia : string,
}

interface Campana {
    _id?:string,
    _rev?:string,
    nombre: string,
    inicio: string,//ISODATE
    fin: string,
}