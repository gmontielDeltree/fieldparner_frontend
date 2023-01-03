
interface DepositosTransferencias {
    deposito_origen_uuid: string,
    deposito_destino_uuid: string,
    lineas_de_transferencia : string,
}

interface Campana {
    nombre: string,
    inicio: string,//ISODATE
    fin: string,
}