import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { getEnvVariables } from '../helpers/getEnvVariables';
import store from '../redux/store';
import { incrementSyncCounter } from '../redux/syncStatus';
import {
  Category,
  Deposit,
  ItemZipCode,
  Supply,
  Vehicle,
  StockMovement,
  ExitField,
  Campaign,
  Field,
  OriginDestinations,
  UserByAccount,
  WithdrawalOrder,
  Numerator,
  DepositSupplyOrder,
  WithdrawalsByDepositSupply,
  MovementType,
  Crop,
  Zones,
  LaborsServices,
  PurchaseOrder,
  DetailPurchaseOrder,
} from '../types';
import { Country } from '../interfaces/country';
import { Business } from '../interfaces/socialEntity';
import { Modules } from '../interfaces/modules';
import { MenuModules, ModulesUsers } from '../interfaces/menuModules';
import { LicenceUse } from '../interfaces/licencesUse';
import { TransportDocument } from '../interfaces/transportDocument';
import { Company } from '../interfaces/company';
import { System } from '../interfaces/system';
import {
  CertificateDeposit,
  TransportDocumentByCertificateDeposit,
} from '../interfaces/certificate-deposit';
import { FieldsByProductUnit, ProductUnits } from '../interfaces/productiveUnits';
import { ContractDeliveyDate, ContractSaleCereal } from '../interfaces/contract-sale-cereals';
import { CostsExpenses } from '../interfaces/costsExpenses';
import { CropStockControl, Stock } from '../interfaces/stock';
import { CropMovement } from '../interfaces/crop-movement';
// import { CropDeposit } from '../interfaces/crop-deposit';
import { CampaingExpenses } from '../interfaces/campaignExpenses';
import { CompanyByContract, CorporateContract } from '../interfaces/corporateContract';

PouchDB.plugin(PouchDBFind);

const normalizeRemoteUrl = (value?: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
};

const normalizeEnvironment = (value?: string) => {
  const trimmed = String(value || 'stg').trim().toLowerCase();
  return trimmed.replace(/^['"]+|['"]+$/g, '');
};

export const remoteCouchDBUrl = Object.freeze(
  normalizeRemoteUrl(getEnvVariables().VITE_COUCHDB_URL as string | undefined),
);
// const remoteCouchDBQTSServerURL = Object.freeze(getEnvVariables().VITE_COUCHDB_QTS_URL);
const environment = normalizeEnvironment(
  getEnvVariables().VITE_ENVIRONMENT as string | undefined,
);

//TODO: ajustar para varios ambientes
export const isEnvSTG = () => {
  return environment === 'stg' ? '_stg' : '';
};

const dbNames = Object.freeze({
  vehicles: `vehicles${isEnvSTG()}`,
  deposits: `deposits${isEnvSTG()}`,
  typeVehicles: `type-vehicles${isEnvSTG()}`,
  zipCodeARG: `zip-code-arg`,
  zipCodePRY: `zip-code-pry${isEnvSTG()}`,
  supplies: `supplies${isEnvSTG()}`,
  socialEntities: `social-entities${isEnvSTG()}`,
  categories: `categories${isEnvSTG()}`,
  stockMovements: `stock-movements${isEnvSTG()}`,
  stock: `stock${isEnvSTG()}`,
  exitFields: `exit-fields${isEnvSTG()}`,
  campaigns: `campaigns${isEnvSTG()}`,
  fields: `fields${isEnvSTG()}`,
  originsDestinations: `origins-destinations${isEnvSTG()}`,
  users: `users${isEnvSTG()}`,
  numerators: `numerators${isEnvSTG()}`,
  withdrawalOrders: `withdrawal-orders${isEnvSTG()}`,
  depositSupplyOrder: `deposit-supply-order${isEnvSTG()}`,
  withdrawalsByDepositSupply: `withdrawals-deposit-supply${isEnvSTG()}`,
  movementsType: `movements-type${isEnvSTG()}`,
  platform: `platform${isEnvSTG()}`,
  platformSupplies: `test-supplies${isEnvSTG()}`,
  crops: `crops${isEnvSTG()}`,
  zones: `zones${isEnvSTG()}`,
  laborsServices: `labors-services${isEnvSTG()}`,
  // fieldpartner: "fieldpartner",
  purchaseOrder: `purchase-order${isEnvSTG()}`,
  detailPurchaseOrder: `detail-purchase-order${isEnvSTG()}`,
  countries: `countries${isEnvSTG()}`,
  modules: `modules${isEnvSTG()}`,
  menuModules: `menu-modules${isEnvSTG()}`,
  modulesUsers: `modules-users${isEnvSTG()}`,
  licencesUse: `licences-use${isEnvSTG()}`,
  transportDocument: `transport-documents${isEnvSTG()}`,
  companies: `companies${isEnvSTG()}`,
  companiesByContract: `companies-by-contract${isEnvSTG()}`,
  corporateContract: `corporate-contract${isEnvSTG()}`,
  certificateDeposit: `certificate-deposit${isEnvSTG()}`,
  transportDocumentCertificateDeposit: `transport-document-certificate-deposit${isEnvSTG()}`,
  productiveUnits: `productive-units${isEnvSTG()}`,
  contractSaleCereals: `contract-sale-cereals${isEnvSTG()}`,
  contractDeliveryDates: `contract-delivery-dates${isEnvSTG()}`,
  costsExpenses: `costs-expenses${isEnvSTG()}`,
  cropStockControl: `crop-stock-control${isEnvSTG()}`,
  campaingExpenses: `campaing-expenses`,
  fieldsByProductUnit: `fields-by-product-unit${isEnvSTG()}`,
  system: `system${isEnvSTG()}`,
  cropMovements: `crop-movements${isEnvSTG()}`,
  cropDeposits: `crop-deposits${isEnvSTG()}`,
});

export const dbContext = Object.freeze({
  vehicles: new PouchDB<Vehicle>(dbNames.vehicles),
  typeVehicles: new PouchDB(dbNames.typeVehicles),
  deposits: new PouchDB<Deposit>(dbNames.deposits),
  zipCodeARG: new PouchDB<ItemZipCode>(dbNames.zipCodeARG),
  zipCodePRY: new PouchDB<ItemZipCode>(dbNames.zipCodePRY),
  supplies: new PouchDB<Supply>(dbNames.supplies),
  socialEntities: new PouchDB<Business>(dbNames.socialEntities),
  categories: new PouchDB<Category>(dbNames.categories),
  stockMovements: new PouchDB<StockMovement>(dbNames.stockMovements),
  stock: new PouchDB<Stock>(dbNames.stock),
  exitFields: new PouchDB<ExitField>(dbNames.exitFields),
  campaigns: new PouchDB<Campaign>(dbNames.campaigns),
  fields: new PouchDB<Field>(dbNames.fields),
  originsDestinations: new PouchDB<OriginDestinations>(dbNames.originsDestinations),
  users: new PouchDB<UserByAccount>(dbNames.users),
  withdrawalOrders: new PouchDB<WithdrawalOrder>(dbNames.withdrawalOrders),
  depositSupplyOrder: new PouchDB<DepositSupplyOrder>(dbNames.depositSupplyOrder),
  withdrawalsByDepositSupply: new PouchDB<WithdrawalsByDepositSupply>(
    dbNames.withdrawalsByDepositSupply,
  ),
  numerators: new PouchDB<Numerator>(dbNames.numerators),
  movementsType: new PouchDB<MovementType>(dbNames.movementsType),
  platform: new PouchDB<any>(dbNames.platform),
  platformSupplies: new PouchDB<Supply>(`${dbNames.platformSupplies}`), //TODO: Verificar si se necesita
  crops: new PouchDB<Crop>(dbNames.crops),
  zones: new PouchDB<Zones>(dbNames.zones),
  // fieldpartner: new PouchDB(dbNames.fieldpartner),
  laborsServices: new PouchDB<LaborsServices>(dbNames.laborsServices),
  purchaseOrder: new PouchDB<PurchaseOrder>(dbNames.purchaseOrder),
  detailPurchaseOrder: new PouchDB<DetailPurchaseOrder>(dbNames.detailPurchaseOrder),
  countries: new PouchDB<Country>(dbNames.countries),
  modules: new PouchDB<Modules>(dbNames.modules),
  menuModules: new PouchDB<MenuModules>(dbNames.menuModules),
  modulesUsers: new PouchDB<ModulesUsers>(dbNames.modulesUsers),
  licencesUse: new PouchDB<LicenceUse>(dbNames.licencesUse),
  transportDocument: new PouchDB<TransportDocument>(dbNames.transportDocument),
  companies: new PouchDB<Company>(dbNames.companies),
  companiesByContract: new PouchDB<CompanyByContract>(dbNames.companiesByContract),
  corporateContract: new PouchDB<CorporateContract>(dbNames.corporateContract),
  certificateDeposit: new PouchDB<CertificateDeposit>(dbNames.certificateDeposit),
  transportDocumentCertificateDeposit: new PouchDB<TransportDocumentByCertificateDeposit>(
    dbNames.transportDocumentCertificateDeposit,
  ),
  productiveUnits: new PouchDB<ProductUnits>(dbNames.productiveUnits),
  contractSaleCereals: new PouchDB<ContractSaleCereal>(dbNames.contractSaleCereals),
  contractDeliveryDates: new PouchDB<ContractDeliveyDate>(dbNames.contractDeliveryDates),
  costsExpenses: new PouchDB<CostsExpenses>(dbNames.costsExpenses),
  campaingExpenses: new PouchDB<CampaingExpenses>(dbNames.campaingExpenses),
  cropStockControl: new PouchDB<CropStockControl>(dbNames.cropStockControl),
  fieldsByProductUnit: new PouchDB<FieldsByProductUnit>(dbNames.fieldsByProductUnit),
  system: new PouchDB<System>(dbNames.system),
  cropMovements: new PouchDB<CropMovement>(dbNames.cropMovements),
  cropDeposits: new PouchDB<any>(dbNames.cropDeposits),
});

// TODO Analizar "Filtered Replication" https://pouchdb.com/2015/04/05/filtered-replication.html
// para no sincronizar todos los docs de TODOS los usuarios (accountId's)

// #region ÍNDICES
// Crear índices para las queries más frecuentes. Se ejecuta una vez al arrancar;
// PouchDB ignora la llamada si el índice ya existe.
const createIndexes = async () => {
  await Promise.all([
    // supplies: filtrar por accountId + countryId + isDefault (usado en getSupplies y getStockData)
    dbContext.supplies.createIndex({ index: { fields: ['accountId', 'countryId', 'isDefault'] } }),
    // stock: filtrar por accountId + depositId (usado en getStockByDeposits y getStockBySupplyAndDeposit)
    dbContext.stock.createIndex({ index: { fields: ['accountId', 'depositId'] } }),
    // stock: filtrar por accountId + id (supplyId/cropId) (usado en getStockBySupplyActive)
    dbContext.stock.createIndex({ index: { fields: ['accountId', 'id'] } }),
    // stockMovements: filtrar por supplyId + accountId (usado en getStockBySupplyActive)
    dbContext.stockMovements.createIndex({ index: { fields: ['supplyId', 'accountId'] } }),
    // cropStockControl: filtrar por accountId + licenceId
    dbContext.cropStockControl.createIndex({ index: { fields: ['accountId', 'licenceId'] } }),
    // deposits: filtrar por accountId
    dbContext.deposits.createIndex({ index: { fields: ['accountId'] } }),
  ]);
};

createIndexes().catch((err) => console.error('[pouchdbService] Error creating indexes:', err));
// #endregion

// #region SYNC MANAGER
let syncRefreshTimer: ReturnType<typeof setTimeout> | null = null;

const scheduleSyncRefresh = () => {
  if (syncRefreshTimer) return;

  syncRefreshTimer = setTimeout(() => {
    syncRefreshTimer = null;
    store.dispatch(incrementSyncCounter());
  }, 500);
};

/**
 * SyncManager — repositorio singleton de todos los handlers de sincronización.
 *
 * Responsabilidades:
 * - Registrar y almacenar cada handler de sync (permite cancelarlos individualmente o todos a la vez)
 * - Añadir event listeners de error y estado a cada sync
 * - Control de batch_size para evitar saturar CouchDB con DBs grandes
 *
 * Uso externo:
 *   import { syncManager } from '../services';
 *   syncManager.cancel('supplies');   // pausar una DB
 *   syncManager.cancelAll();          // pausar todo (ej: al hacer logout)
 */
class SyncManager {
  private syncs = new Map<string, PouchDB.Replication.Sync<any>>();

  register<T extends Record<string, any>>(
    name: string,
    local: PouchDB.Database<T>,
    remoteUrl: string,
    opts: PouchDB.Replication.SyncOptions = {},
  ) {
    const handler = local
      .sync(remoteUrl, { live: true, retry: true, batch_size: 100, batches_limit: 5, ...opts })
      .on('active', () => console.debug(`[sync:${name}] active`))
      .on('change', () => {
        scheduleSyncRefresh();
      })
      .on('paused', (err) => {
        if (err) console.warn(`[sync:${name}] paused with error:`, err);
        scheduleSyncRefresh();
      })
      .on('error', (err) => console.error(`[sync:${name}] error:`, err));

    this.syncs.set(name, handler);
    return handler;
  }

  cancel(name: string) {
    this.syncs.get(name)?.cancel();
    this.syncs.delete(name);
  }

  cancelAll() {
    this.syncs.forEach((s) => s.cancel());
    this.syncs.clear();
  }
}

export const syncManager = new SyncManager();
// #endregion

// #region SINCRONIZACIÓN POR PRIORIDAD
// Las DBs se inician en 3 grupos escalonados para evitar saturar CouchDB al arrancar.

// Prioridad ALTA: datos críticos para la operación diaria → se inician inmediatamente
const syncHighPriority = () => {
  syncManager.register('modules', dbContext.modules, `${remoteCouchDBUrl}${dbNames.modules}`);
  syncManager.register('menuModules', dbContext.menuModules, `${remoteCouchDBUrl}${dbNames.menuModules}`);
  syncManager.register('modulesUsers', dbContext.modulesUsers, `${remoteCouchDBUrl}${dbNames.modulesUsers}`);
  syncManager.register('system', dbContext.system, `${remoteCouchDBUrl}${dbNames.system}`);
  syncManager.register('fields', dbContext.fields, `${remoteCouchDBUrl}${dbNames.fields}`);
  syncManager.register('campaigns', dbContext.campaigns, `${remoteCouchDBUrl}${dbNames.campaigns}`);
  syncManager.register('supplies', dbContext.supplies, `${remoteCouchDBUrl}${dbNames.supplies}`);
  syncManager.register('deposits', dbContext.deposits, `${remoteCouchDBUrl}${dbNames.deposits}`);
  syncManager.register('users', dbContext.users, `${remoteCouchDBUrl}${dbNames.users}`);
  syncManager.register('stock', dbContext.stock, `${remoteCouchDBUrl}${dbNames.stock}`);
  syncManager.register('stockMovements', dbContext.stockMovements, `${remoteCouchDBUrl}${dbNames.stockMovements}`);
};

// Prioridad MEDIA: datos operativos secundarios → se inician después de 1.5s
const syncMediumPriority = () => {
  syncManager.register('vehicles', dbContext.vehicles, `${remoteCouchDBUrl}${dbNames.vehicles}`);
  syncManager.register('exitFields', dbContext.exitFields, `${remoteCouchDBUrl}${dbNames.exitFields}`);
  syncManager.register('withdrawalOrders', dbContext.withdrawalOrders, `${remoteCouchDBUrl}${dbNames.withdrawalOrders}`);
  syncManager.register('numerators', dbContext.numerators, `${remoteCouchDBUrl}${dbNames.numerators}`);
  syncManager.register('originsDestinations', dbContext.originsDestinations, `${remoteCouchDBUrl}${dbNames.originsDestinations}`);
  syncManager.register('zones', dbContext.zones, `${remoteCouchDBUrl}${dbNames.zones}`);
  syncManager.register('crops', dbContext.crops, `${remoteCouchDBUrl}${dbNames.crops}`);
  syncManager.register('cropStockControl', dbContext.cropStockControl, `${remoteCouchDBUrl}${dbNames.cropStockControl}`);
  syncManager.register('cropMovements', dbContext.cropMovements, `${remoteCouchDBUrl}${dbNames.cropMovements}`);
  syncManager.register('depositSupplyOrder', dbContext.depositSupplyOrder, `${remoteCouchDBUrl}${dbNames.depositSupplyOrder}`);
  syncManager.register('withdrawalsByDepositSupply', dbContext.withdrawalsByDepositSupply, `${remoteCouchDBUrl}${dbNames.withdrawalsByDepositSupply}`);
  syncManager.register('purchaseOrder', dbContext.purchaseOrder, `${remoteCouchDBUrl}${dbNames.purchaseOrder}`);
  syncManager.register('detailPurchaseOrder', dbContext.detailPurchaseOrder, `${remoteCouchDBUrl}${dbNames.detailPurchaseOrder}`);
  syncManager.register('laborsServices', dbContext.laborsServices, `${remoteCouchDBUrl}${dbNames.laborsServices}`);
  syncManager.register('socialEntities', dbContext.socialEntities, `${remoteCouchDBUrl}${dbNames.socialEntities}`);
  syncManager.register('categories', dbContext.categories, `${remoteCouchDBUrl}${dbNames.categories}`);
};

// Prioridad BAJA: datos de referencia y configuración → se inician después de 3.5s
const syncLowPriority = () => {
  syncManager.register('typeVehicles', dbContext.typeVehicles, `${remoteCouchDBUrl}${dbNames.typeVehicles}`);
  syncManager.register('movementsType', dbContext.movementsType, `${remoteCouchDBUrl}${dbNames.movementsType}`);
  syncManager.register('zipCodeARG', dbContext.zipCodeARG, `${remoteCouchDBUrl}${dbNames.zipCodeARG}`);
  syncManager.register('zipCodePRY', dbContext.zipCodePRY, `${remoteCouchDBUrl}${dbNames.zipCodePRY}`);
  syncManager.register('countries', dbContext.countries, `${remoteCouchDBUrl}${dbNames.countries}`);
  syncManager.register('licencesUse', dbContext.licencesUse, `${remoteCouchDBUrl}${dbNames.licencesUse}`);
  syncManager.register('platform', dbContext.platform, `${remoteCouchDBUrl}${dbNames.platform}`);
  // syncManager.register('platformSupplies', dbContext.platformSupplies, `${remoteCouchDBQTSServerURL}${dbNames.platformSupplies}`); //TODO: Verificar si se necesita
  syncManager.register('transportDocument', dbContext.transportDocument, `${remoteCouchDBUrl}${dbNames.transportDocument}`);
  syncManager.register('companies', dbContext.companies, `${remoteCouchDBUrl}${dbNames.companies}`);
  syncManager.register('companiesByContract', dbContext.companiesByContract, `${remoteCouchDBUrl}${dbNames.companiesByContract}`);
  syncManager.register('corporateContract', dbContext.corporateContract, `${remoteCouchDBUrl}${dbNames.corporateContract}`);
  syncManager.register('certificateDeposit', dbContext.certificateDeposit, `${remoteCouchDBUrl}${dbNames.certificateDeposit}`);
  syncManager.register('transportDocumentCertificateDeposit', dbContext.transportDocumentCertificateDeposit, `${remoteCouchDBUrl}${dbNames.transportDocumentCertificateDeposit}`);
  syncManager.register('productiveUnits', dbContext.productiveUnits, `${remoteCouchDBUrl}${dbNames.productiveUnits}`);
  syncManager.register('contractSaleCereals', dbContext.contractSaleCereals, `${remoteCouchDBUrl}${dbNames.contractSaleCereals}`);
  syncManager.register('contractDeliveryDates', dbContext.contractDeliveryDates, `${remoteCouchDBUrl}${dbNames.contractDeliveryDates}`);
  syncManager.register('costsExpenses', dbContext.costsExpenses, `${remoteCouchDBUrl}${dbNames.costsExpenses}`);
  syncManager.register('campaingExpenses', dbContext.campaingExpenses, `${remoteCouchDBUrl}${dbNames.campaingExpenses}`);
  syncManager.register('fieldsByProductUnit', dbContext.fieldsByProductUnit, `${remoteCouchDBUrl}${dbNames.fieldsByProductUnit}`);
  // syncManager.register('cropDeposits', dbContext.cropDeposits, `${remoteCouchDBUrl}${dbNames.cropDeposits}`);
};

// Timers internos para poder cancelarlos si se llama startSync antes de que disparen
let mediumTimer: ReturnType<typeof setTimeout> | null = null;
let lowTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Inicia todas las sincronizaciones en 3 grupos escalonados.
 * Debe llamarse una única vez, después de que el usuario se autenticó.
 * Si ya hay syncs activas (ej: doble llamada accidental), las cancela primero.
 */
export const startSync = () => {
  // Cancelar syncs previas y timers pendientes antes de reiniciar
  if (mediumTimer) clearTimeout(mediumTimer);
  if (lowTimer) clearTimeout(lowTimer);
  syncManager.cancelAll();

  if (!remoteCouchDBUrl) {
    console.error(
      '[pouchdbService] Missing VITE_COUCHDB_URL. PouchDB sync was not started in this build.',
    );
    return;
  }

  syncHighPriority();
  mediumTimer = setTimeout(syncMediumPriority, 1500);
  lowTimer = setTimeout(syncLowPriority, 3500);
};
// #endregion
