
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

export interface Presupuestos {
    nro: string;
    proveedor: string;
    estado: boolean;
    moneda: string;
    totalPresupuesto: string;
}
