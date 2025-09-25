import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { getEnvVariables } from '../helpers/getEnvVariables';
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
import {
  CertificateDeposit,
  TransportDocumentByCertificateDeposit,
} from '../interfaces/certificate-deposit';
import { FieldsByProductUnit, ProductUnits } from '../interfaces/productiveUnits';
import { ContractDeliveyDate, ContractSaleCereal } from '../interfaces/contract-sale-cereals';
import { CostsExpenses } from '../interfaces/costsExpenses';
import { CropStockControl, Stock } from '../interfaces/stock';
import { CampaingExpenses } from '../interfaces/campaignExpenses';
import { CompanyByContract, CorporateContract } from '../interfaces/corporateContract';

PouchDB.plugin(PouchDBFind);

export const remoteCouchDBUrl = Object.freeze(getEnvVariables().VITE_COUCHDB_URL);
// const remoteCouchDBQTSServerURL = Object.freeze(getEnvVariables().VITE_COUCHDB_QTS_URL);
const environment = getEnvVariables().VITE_ENVIRONMENT;

//TODO: ajustar para varios ambientes
export const isEnvSTG = () => {
  return environment === 'stg' ? '_stg' : '';
};

export const opts: PouchDB.Replication.SyncOptions = {
  live: true,
  retry: true,
  //  filter: 'app/by_account',
  //  query_params: { "agent": agent }
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
});

// TODO Analizar "Filtered Replication" https://pouchdb.com/2015/04/05/filtered-replication.html
// para no sincronizar todos los docs the TODOS los usuarios (accountId's)

// #region SINCRONIZACION DE BASES DE DATOS
dbContext.fields.sync(`${remoteCouchDBUrl}${dbNames.fields}`, opts);
dbContext.vehicles.sync(`${remoteCouchDBUrl}${dbNames.vehicles}`, opts);
dbContext.deposits.sync(`${remoteCouchDBUrl}${dbNames.deposits}`, opts);
dbContext.zipCodeARG.sync(`${remoteCouchDBUrl}${dbNames.zipCodeARG}`, opts);
dbContext.zipCodePRY.sync(`${remoteCouchDBUrl}${dbNames.zipCodePRY}`, opts);
dbContext.supplies.sync(`${remoteCouchDBUrl}${dbNames.supplies}`, opts);
dbContext.typeVehicles.sync(`${remoteCouchDBUrl}${dbNames.typeVehicles}`, opts);
dbContext.socialEntities.sync(`${remoteCouchDBUrl}${dbNames.socialEntities}`, opts);
dbContext.categories.sync(`${remoteCouchDBUrl}${dbNames.categories}`, opts);
dbContext.stockMovements.sync(`${remoteCouchDBUrl}${dbNames.stockMovements}`, opts);
dbContext.stock.sync(`${remoteCouchDBUrl}${dbNames.stock}`, opts);
dbContext.exitFields.sync(`${remoteCouchDBUrl}${dbNames.exitFields}`, opts);
dbContext.campaigns.sync(`${remoteCouchDBUrl}${dbNames.campaigns}`, opts);
dbContext.users.sync(`${remoteCouchDBUrl}${dbNames.originsDestinations}`, opts);
dbContext.originsDestinations.sync(`${remoteCouchDBUrl}${dbNames.originsDestinations}`, opts);
dbContext.withdrawalOrders.sync(`${remoteCouchDBUrl}${dbNames.withdrawalOrders}`, opts);
dbContext.numerators.sync(`${remoteCouchDBUrl}${dbNames.numerators}`, opts);
dbContext.depositSupplyOrder.sync(`${remoteCouchDBUrl}${dbNames.depositSupplyOrder}`, opts);
dbContext.withdrawalsByDepositSupply.sync(
  `${remoteCouchDBUrl}${dbNames.withdrawalsByDepositSupply}`,
  opts,
);
dbContext.movementsType.sync(`${remoteCouchDBUrl}${dbNames.movementsType}`, opts);
dbContext.platform.sync(`${remoteCouchDBUrl}${dbNames.platform}`, opts);
// dbContext.platformSupplies.sync(`${remoteCouchDBQTSServerURL}${dbNames.platformSupplies}`, opts); //TODO: Verificar si se necesita
dbContext.crops.sync(`${remoteCouchDBUrl}${dbNames.crops}`, opts);
dbContext.zones.sync(`${remoteCouchDBUrl}${dbNames.zones}`, opts);
dbContext.laborsServices.sync(`${remoteCouchDBUrl}${dbNames.laborsServices}`, opts);
dbContext.purchaseOrder.sync(`${remoteCouchDBUrl}${dbNames.purchaseOrder}`, opts);
dbContext.detailPurchaseOrder.sync(`${remoteCouchDBUrl}${dbNames.detailPurchaseOrder}`, opts);
dbContext.countries.sync(`${remoteCouchDBUrl}${dbNames.countries}`, opts);
dbContext.menuModules.sync(`${remoteCouchDBUrl}${dbNames.menuModules}`, opts);
dbContext.modulesUsers.sync(`${remoteCouchDBUrl}${dbNames.modulesUsers}`, opts);
dbContext.licencesUse.sync(`${remoteCouchDBUrl}${dbNames.licencesUse}`, opts);
dbContext.transportDocument.sync(`${remoteCouchDBUrl}${dbNames.transportDocument}`, opts);
dbContext.companies.sync(`${remoteCouchDBUrl}${dbNames.companies}`, opts);
dbContext.corporateContract.sync(`${remoteCouchDBUrl}${dbNames.corporateContract}`, opts);
dbContext.certificateDeposit.sync(`${remoteCouchDBUrl}${dbNames.certificateDeposit}`, opts);
dbContext.transportDocumentCertificateDeposit.sync(
  `${remoteCouchDBUrl}${dbNames.transportDocumentCertificateDeposit}`,
  opts,
);
dbContext.productiveUnits.sync(`${remoteCouchDBUrl}${dbNames.productiveUnits}`, opts);
dbContext.contractSaleCereals.sync(`${remoteCouchDBUrl}${dbNames.contractSaleCereals}`, opts);
dbContext.contractDeliveryDates.sync(`${remoteCouchDBUrl}${dbNames.contractDeliveryDates}`, opts);
dbContext.costsExpenses.sync(`${remoteCouchDBUrl}${dbNames.costsExpenses}`, opts);
dbContext.campaingExpenses.sync(`${remoteCouchDBUrl}${dbNames.campaingExpenses}`, opts);
dbContext.cropStockControl.sync(`${remoteCouchDBUrl}${dbNames.cropStockControl}`, opts);
dbContext.companiesByContract.sync(`${remoteCouchDBUrl}${dbNames.companiesByContract}`, opts);
dbContext.fieldsByProductUnit.sync(`${remoteCouchDBUrl}${dbNames.fieldsByProductUnit}`, opts);

// #endregion
