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
    Tolva = "Tolva",
    Otros = "Otros",
}

export interface TypeVehicle {
    _id: string;
    name: string;
}

export enum TipoCombustible { Diesel = "Diesel", Nafta = "Nafta" }

export interface Mantenimiento {
    id: string;
    fecha: string;
    kilometros: number;
    descripcion: string;
    observacion: string | null;
    proximo: string;
};

export interface RowMantenimiento extends Mantenimiento {
    disabled: boolean;
}

export interface EspecificacionTecnica {
    especificacion: string;
    descripcion: string;
}

export interface Vehiculo {
    _id: string;
    tipoVehiculo: string;
    marca: string;
    modelo: string;
    año: string;
    patente: string;
    tara: number;
    neto: number;
    bruto: number;
    tipoCombustible: string;
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
    ubicacion: string;
    mantenimientos: Mantenimiento[];
    especificacionesTecnicas: RowData[];
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

export interface RowData {
    name: string;
    description: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

// export interface Document<T> {
//     _id: string;
//     title: string;
//     content: T;
// }