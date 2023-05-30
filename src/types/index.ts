
export interface NavBarProps {
    drawerWidth: number;
    open: boolean;
    handleSideBarOpen: () => void;
}

export interface SideBarProps {
    drawerWidth: number;
    open: boolean;
    handleSideBarClose: () => void;
}

export interface MenuOptions {
    text: string;
    icon: React.ReactNode;
}

export enum TipoVehiculo {
    Cosechadora = "Cosechadora",
    Pulverizadora = "Pulverizadora",
    Tractor = "Tractor",
    Camioneta = "Camioneta",
    Tolva = "Tolva"
}

export enum TipoCombustible { "Diesel", "Nafta" }

export interface Equipo {
    nro: string;
    tipoVehiculo: TipoVehiculo;
    marca: string;
    modelo: string;
    año: string;
    patente: string;
    tara: number;
    neto: number;
    tipoCombustible: TipoCombustible;
    capacidadCombustible: number;
    unidadMedida: string;
    conectividad?: string;
    propietario?: string;
    ultimoMantenimiento?: string;
    seguro: string;
    tipoCobertura: string;
    nroPoliza: string;
    seguroFechaInicio: string;
    seguroFechaVencimiento: string;
}

export interface ColumnProps {
    text: string;
    align: 'inherit' | 'left' | 'center' | 'right' | 'justify';
}

export enum Estado {
    Todos = 'Todos',
    Activo = 'Activo',
    Inactivo = 'Inactivo'
};
