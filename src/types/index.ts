import { useTranslation } from "react-i18next";


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



export interface TypeVehicle extends Document {
    name: string;
}


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

export interface Vehicle extends Document {
    vehicleType: string;
    make: string;
    model: string;
    modelYear: string;
    patent: string;
    tara: number;
    net: number;
    gross: number;
    chassisNumber: string;
    fuelType: string;
    fuelCapacity: number;
    unitMeasurement: string;
    connectivity?: string;
    owner?: string;
    lastMaintenance?: string;
    insurence: string;
    coverageType: string;
    policyNumber: string;
    insurenceStartDate: string;
    insurenceDueDate: string;
    location: string;
    maintenances: Mantenimiento[];
    technialSpecifications: RowData[];
}

export interface ColumnProps {
    text: string;
    align: 'inherit' | 'left' | 'center' | 'right' | 'justify';
}


export interface RowData {
    name: string;
    description: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface Document {
    _id?: string;
    _rev?: string;
}

export interface Authenticate {
    accessToken: string;
    refreshToken: string;
    expiration: number;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    accountId: string;
    isAdmin: boolean;
}

export interface ResponseAuthLogin {
    user: User;
    auth: Authenticate;
}
export interface ResponseAuthRenew {
    AccessToken: string;
    ExpiresIn: number;
}

export interface UserRegister {
    email: string;
    password: string;
    name: string;
}

export interface ErrorResponseAuth {
    code: "UserNotConfirmedException" | "NotAuthorizedException" | "UsernameExistsException";
    message: string;
}

export interface AuthState {
    status: 'checking' | 'authenticated' | 'not-authenticated';
    user: User | null;
    errorMessage: string;
    isLoading: boolean;
}

export interface Business extends Document {
    // id?: string;
    nombreCompleto?: string;
    documento?: string;
    telefono: string;
    email: string;
    tipoEntidad: string;
    razonSocial?: string;
    cuit?: string;
    contactoPrincipal?: string;
    contactoSecundario?: string;
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
}

export interface BusinessState {
    businessActive: Business | null;
    businesses: Business[];
}

export interface SupplyState {
    supplyActive: Supply | null;
    supplies: Supply[];
}

export interface Supply extends Document {
    accountId: string;
    barCode?: string;
    type: string;
    name: string;
    description?: string;
    unitMeasurement: string;
    currentStock: number;
    reservedStock: number;
    // stockDisponible: number;
    stockByLot: boolean;
    activePrincipal: string;
    mermaVolatile: string;
    minimumDose: string;
    maximumDose: string;
    recommendedDose: string;
    replenishmentPoint: string;
    labors: string[];
}

export interface OriginDestinationsState {
    originsDestinationsActive: OriginDestinations | null;
    OriginsDestinations: OriginDestinations[];
}

export interface OriginDestinations extends Document {
    name: string;
    description: string;
    procedencia: boolean;
    destino: boolean;
}

export const LaboresItems = [
    "Preparado",
    "Siembra",
    "Aplicacion",
    "Arrancado",
    "Cosecha",
];



export const UnidadesDeMedida = () => {
    const {t} = useTranslation();

    return [
    t("_kilogram"),
    t("_meters"),
    t("square_meter"),
    t("cubic_meter"),
    t("_liters"),
    t("_unit"),
    t("_pair"),
    t("_dozen"),
    t("_gram"),
    t("_millimeter"),
    t("cubic_millimeter"),
    t("_kilometer"),
    t("_hectoliter"),
    t("_centimeter"),
    t("set_pack_deck_of_cards"),
    t("cubic_centimeter"),
    t("_ton"),
    t("hectocubic_meter"),
    t("kilocubic_meter"),
    t("_microgram"),
    t("_nanogram"),
    t("_milligram"),
    t("_milliliter"),
    t("_gross"),
    t("gross_kilogram"),
    t("_seeds"),
    t("_bags"),
    t("_quintal"),
    ];
};

//"JGO.PQT.MAZO NAIPES",

export const TypeSupplies  = () => {
    const {t} = useTranslation();

    return [
    t("_various"),
    t("seeds_min"),
    t("_cultivation"),
    t("_fertilizers"),
    t("_phytosanitary"),
    t("spare_parts"),
    t("_materials"),
    t("_fuel"),
    ];
};

export const TypeMovements = () => {
    const { t } = useTranslation();
    return [
      t("_adjustments"),
      t("_purchase"),
      t("various_sales"),
      t("transfer_between_warehouses"),
      t("_loans"),
    ];
};

// export interface Lot {
//     nro: string;
//     location: string;
// }

export interface DepositState {
    depositActive: Deposit | null;
    deposits: Deposit[];
}

export interface Deposit extends Document {
    accountId: string;
    description: string;
    owner: string;
    isVirtual: boolean;
    geolocation: {lng : number, lat:number};
    isNegative: boolean;
    address: string;
    zipCode: string;
    locality: string;
    province: string;
    country: string;
    locations: string[];
}

export interface ItemZipCode extends Document {
    CP: string;
    locality: string;
    state: string;
}

export interface Category extends Document {
    name: string;
    description: string;
}


export interface StockMovement extends Document {
    accountId: string;
    movement: string;
    supplyId: string;
    userId: string;
    depositId: string;
    location: string;
    nroLot: string;
    creationDate: string;
    dueDate: string;
    typeMovement: TypeMovement;
    isIncome: boolean;
    detail: string;
    operationDate: string;
    amount: number;
    voucher: string;
    currency: string;
    totalValue: number;
    hours: string;
    campaignId: string;
}

export interface StockMovementItem extends StockMovement {
    supply?: Supply;
    deposit?: Deposit;
}

export interface StockByNroLot {
    nroLot: string;
    location?: string;
    currentStock: number;
    reservedStock: number;
}

export interface SupplyByDeposits {
    deposit: Deposit;
    supply?: Supply;
    movements?: StockMovement[];
    // unitMeasurement: string;
    location: string;
    nroLot: string;
    dueDate: string;
    currentStock: number;
    reservedStock: number;
    nroLotsStock?: StockByNroLot[];
}

export interface StockBySupply {
    supply: Supply;
    currentStock: number;
    reservedStock: number;
}

export interface DepositDestination {
    depositId: string;
    location: string;
}

export interface StockByLot extends Document {
    accountId: string;
    // userId: string;
    depositId: string;
    location: string;
    supplyId: string;
    nroLot: string;
    currentStock: number;
}

export interface TransformSupply {
    id: string;
    supply: Supply;
    deposit: Deposit,
    location: string;
    nroLot: string;
    dueDate: string;
    amount: number;
    currentStock: number;
    hours?: string;
    employee?: string;
}

export interface ExitField extends Document {
    accountId: string;
    creationDate: string;
    campaignId: string;
    fieldId: string;
    lotId: string;
    supplyId: string;
    transportId: string;
    truckerId: string;
    // has: string;
    cultive: string;
    transportDocument: string;
    ticket: string;
    vehicleId: string;
    truckTrailerId: string;
    chassis: string;
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    depositId: string;
    location: string;
    additionalInformation: string;
    humidityPercentage: number;
    mermaPercentage: number;
    volatilePercentage: number;
    otherPercentage: number;
    totalMerma: number;
    kgNet: number;
    harvesterId: string;
    destination: string;
}

export interface ExitFieldItem extends ExitField {
    deposit?: Deposit;
    supply?: Supply;
    transport?: Business;
    field?: Field;
    // trucker?: Business;
    // harvester?: Business;
}

export interface Campaign extends Document {
    accountId: string;
    campaignId: string;
    description: string;
    zoneId: string;
    creationDate: string;
    startDate: string;
    endDate: string;
    state: Estado;
}


//TODO: cambiar interfaz field
export interface Lot extends Document {
    // id: string;
    type: string;
    properties: {
        nombre: string;
        campo_parent_id: string;
        uuid: string;
        hectareas: number;
    };
    geometry: {
        coordinates: number[][][];
        type: string;
    };
}

export interface Field extends Document {
    accountId: string;
    nombre: string;
    campo_geojson: any;
    uuid: string;
    lotes: Lot[];
    // _id: string;
    // _rev: string;
}

//#region Enums

export enum TipoCombustible {
    Diesel = "Diesel",
    Nafta = "Nafta"
}

export enum Estado {
    Todos = 'Todos',
    Activo = 'Activo',
    Inactivo = 'Inactivo'
};


export enum TipoEntidad {
    FISICA = 'fisica',
    JURIDICA = 'juridica',
}

export enum CountryCode {
    ARGENTINA = 'ARG',
    BRASIL = "BRA",
    CHILE = "CHL",
}

export enum CurrencyCode {
    ARG = 'ARS',
    BRA = 'BRL',
    CHL = 'CLP',
    USA = 'USD',
    EURO = 'EUR',
}

export enum TypeMovement {
    Ajustes = "Ajustes",
    Compra = "Compra",
    VentasVarias = "Ventas Varias",
    TransferenciaDeposito = "Transferencia entre depositos",
    Prestamos = "Prestamos",
    Transformacion = "Transformacion",
    SalidaDeCampo = "Salida de Campo",
}

export enum Movement {
    Manual = "Manual",
    Automatico = "Automatico"
}

export enum DisplayModals {
    SupplyByDeposits = "SupplyByDeposits",
    SupplyByLots = "SupplyByLots"
}

export enum VehicleType {
    Cosechadora = "Cosechadora",
    Pulverizadora = "Pulverizadora",
    Tractor = "Tractor",
    Camioneta = "Camioneta",
    Acoplado = "Acoplado",
    Camion = "Camion",
    Tolva = "Tolva",
    Otros = "Otros",
}

export enum SupplyType {
    Varios = "Varios",
    Semillas = "Semillas",
    Cultivo = "Cultivo",
    Fertilizantes = "Fertilizantes",
    Fitosanitarios = "Fitosanitarios",
    Repuestos = "Repuestos",
    Materiales = "Materiales",
    Combustible = "Combustible"
}

export enum TipoInsumo {
    CULTIVO = "CuLtivo",
}

//#endregion