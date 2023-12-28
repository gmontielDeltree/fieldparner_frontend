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

export enum VehicleType {
    Cosechadora = "Cosechadora",
    Pulverizadora = "Pulverizadora",
    Tractor = "Tractor",
    Camioneta = "Camioneta",
    Camion = "Camion",
    Tolva = "Tolva",
    Otros = "Otros",
}

export interface TypeVehicle extends Document {
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

export interface Vehicle extends Document {
    vehicleType: string;
    make: string;
    model: string;
    modelYear: string;
    patent: string;
    tara: number;
    net: number;
    gross: number;
    chassis: string;
    truckTrailer: string;
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

export enum TipoEntidad {
    FISICA = 'fisica',
    JURIDICA = 'juridica',
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

export enum TipoInsumo {
    CULTIVO = "CuLtivo",
}

export const LaboresItems = [
    "Preparado",
    "Siembra",
    "Aplicacion",
    "Arrancado",
    "Cosecha",
];

export const UnidadesDeMedida = [
    "KILOGRAMO",
    "METROS",
    "METRO CUADRADO",
    "METRO CUBICO",
    "LITROS",
    "UNIDAD",
    "PAR",
    "DOCENA",
    "GRAMO",
    "MILIMETRO",
    "MMCUBICO",
    "KILOMETRO",
    "HECTOLITRO",
    "CENTIMETRO",
    "JGO.PQT.MAZO NAIPES",
    "CMCUBICO",
    "TONELADA",
    "HMCUBICO",
    "KMCUBICO",
    "MICROGRAMO",
    "NANOGRAMO",
    "MILIGRAMO",
    "MILILITRO",
    "GRUESA",
    "KG.BRUTO",
    "SEMILLAS",
    "BOLSAS",
    "QUINTAL",
];

export const TypeSupplies = [
    "Varios",
    "Semillas",
    "Cultivo",
    "Fertilizantes",
    "Fitosanitarios",
    "Repuestos",
    "Materiales",
    "Combustible"
];

export const TypeMovements = [
    "Ajustes",
    "Compra",
    "Ventas Varias",
    "Transferencia entre depositos",
    "Prestamos",
];

export interface Lot {
    nro: string;
    location: string;
}

export interface DepositState {
    depositActive: Deposit | null;
    deposits: Deposit[];
}

export interface Deposit extends Document {
    accountId: string;
    description: string;
    owner: string;
    isVirtual: boolean;
    geolocation: string;
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

export enum CountryCode {
    ARGENTINA = 'ARG',
    BRASIL = "BRA",
    CHILE = "CHL",
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
    campaign: number;
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
    campaign: number;
    field: string;
    lot: string;
    supplyId: string;
    transportId: string;
    truckerId: string;
    has: string;
    cultive: string;
    transportDocument: string;
    ticket: string;
    vehicleId: string;
    chassis: string;
    truckTrailer: string;
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
    // trucker?: Business;
    // harvester?: Business;
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