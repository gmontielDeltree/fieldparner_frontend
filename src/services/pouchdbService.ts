import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import { getEnvVariables } from '../helpers/getEnvVariables';
import {
  Category,
  CountryCode,
  Deposit,
  ItemZipCode,
  Supply,
  Vehicle,
  StockMovement,
  StockByLot,
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
  Crops,
  Zones,
  LaborsServices,
  PurchaseOrder,
  DetailPurchaseOrder,
  CorporateCompanies,
  CorporateContract,
} from '../types';
import { Country } from '../interfaces/country';
import { Business } from '../interfaces/socialEntity';
import { MenuModules, ModulesUsers } from '../interfaces/menuModules';
import { LicenceUse } from '../interfaces/licencesUse';
import { TransportDocument } from '../interfaces/transportDocument';
import { Company } from '../interfaces/company';
import { CertificateDeposit, TransportDocumentByCertificateDeposit } from '../interfaces/certificate-deposit';


PouchDB.plugin(PouchDBFind);

export const remoteCouchDBUrl = Object.freeze(getEnvVariables().VITE_COUCHDB_URL);
const remoteCouchDBQTSServerURL = Object.freeze(getEnvVariables().VITE_COUCHDB_QTS_URL);

export const opts: PouchDB.Replication.SyncOptions = {
  live: true,
  retry: false,
  //  filter: 'app/by_account',
  //  query_params: { "agent": agent }
};

const dbNames = Object.freeze({
  vehicles: "vehicles",
  deposits: "deposits",
  typeVehicles: "type-vehicles",
  zipCodeARG: "zip-code-arg",
  zipCodePRY: "zip-code-pry",
  supplies: "supplies",
  socialEntities: "social-entities",
  categories: "categories",
  stockMovements: "stock-movements",
  stockByLots: "lots-stock",
  exitFields: "exit-fields",
  campaigns: "campaigns",
  fields: "fields",
  originsDestinations: "origins-destinations",
  users: "users",
  numerators: "numerators",
  withdrawalOrders: "withdrawal-orders",
  depositSupplyOrder: "deposit-supply-order",
  withdrawalsByDepositSupply: "withdrawals-deposit-supply",
  movementsType: "movements-type",
  platform: "platform",
  platformSupplies: "test-supplies",
  crops: "crops",
  zones: "zones",
  fieldpartner: "fieldpartner",
  laborsServices: "labors-services",
  purchaseOrder: "purchase-order",
  detailPurchaseOrder: "detail-purchase-order",
  countries: "countries",
  menuModules: "menu-modules",
  modulesUsers: "modules-users",
  licencesUse: "licences-use",
  transportDocument: "transport-documents",
  companies: "companies",
  corporateCompanies: "corporate-companies",
  corporateContract: "corporate-contract",
  certificateDeposit: "certificate-deposit",
  transportDocumentCertificateDeposit: "transport-document-certificate-deposit",
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
  stockByLots: new PouchDB<StockByLot>(dbNames.stockByLots),
  exitFields: new PouchDB<ExitField>(dbNames.exitFields),
  campaigns: new PouchDB<Campaign>(dbNames.campaigns),
  fields: new PouchDB<Field>(dbNames.fields), //TODO: revisar db
  originsDestinations: new PouchDB<OriginDestinations>(dbNames.originsDestinations),
  users: new PouchDB<UserByAccount>(dbNames.users),
  withdrawalOrders: new PouchDB<WithdrawalOrder>(dbNames.withdrawalOrders),
  depositSupplyOrder: new PouchDB<DepositSupplyOrder>(dbNames.depositSupplyOrder),
  withdrawalsByDepositSupply: new PouchDB<WithdrawalsByDepositSupply>(dbNames.withdrawalsByDepositSupply),
  numerators: new PouchDB<Numerator>(dbNames.numerators),
  movementsType: new PouchDB<MovementType>(dbNames.movementsType),
  platform: new PouchDB<any>(dbNames.platform),
  platformSupplies: new PouchDB<Supply>(`${dbNames.platformSupplies}`),
  crops: new PouchDB<Crops>(dbNames.crops),
  zones: new PouchDB<Zones>(dbNames.zones),
  fieldpartner: new PouchDB(dbNames.fieldpartner),
  laborsServices: new PouchDB<LaborsServices>(dbNames.laborsServices),
  purchaseOrder: new PouchDB<PurchaseOrder>(dbNames.purchaseOrder),
  detailPurchaseOrder: new PouchDB<DetailPurchaseOrder>(dbNames.detailPurchaseOrder),
  countries: new PouchDB<Country>(dbNames.countries),
  menuModules: new PouchDB<MenuModules>(dbNames.menuModules),
  modulesUsers: new PouchDB<ModulesUsers>(dbNames.modulesUsers),
  licencesUse: new PouchDB<LicenceUse>(dbNames.licencesUse),
  transportDocument: new PouchDB<TransportDocument>(dbNames.transportDocument),
  companies: new PouchDB<Company>(dbNames.companies),
  corporateCompanies: new PouchDB<CorporateCompanies>(dbNames.corporateCompanies),
  corporateContract: new PouchDB<CorporateContract>(dbNames.corporateContract),
  certificateDeposit: new PouchDB<CertificateDeposit>(dbNames.certificateDeposit),
  transportDocumentCertificateDeposit: new PouchDB<TransportDocumentByCertificateDeposit>(dbNames.transportDocumentCertificateDeposit),
});

// TODO Analizar "Filtered Replication" https://pouchdb.com/2015/04/05/filtered-replication.html
// para no sincronizar todos los docs the TODOS los usuarios (accountId's)

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
dbContext.stockByLots.sync(`${remoteCouchDBUrl}${dbNames.stockByLots}`, opts);
dbContext.exitFields.sync(`${remoteCouchDBUrl}${dbNames.exitFields}`, opts);
dbContext.campaigns.sync(`${remoteCouchDBUrl}${dbNames.campaigns}`, opts);
dbContext.users.sync(`${remoteCouchDBUrl}${dbNames.originsDestinations}`, opts);
dbContext.originsDestinations.sync(`${remoteCouchDBUrl}${dbNames.originsDestinations}`, opts);
dbContext.withdrawalOrders.sync(`${remoteCouchDBUrl}${dbNames.withdrawalOrders}`, opts);
dbContext.numerators.sync(`${remoteCouchDBUrl}${dbNames.numerators}`, opts);
dbContext.depositSupplyOrder.sync(`${remoteCouchDBUrl}${dbNames.depositSupplyOrder}`, opts);
dbContext.withdrawalsByDepositSupply.sync(`${remoteCouchDBUrl}${dbNames.withdrawalsByDepositSupply}`, opts);
dbContext.movementsType.sync(`${remoteCouchDBUrl}${dbNames.movementsType}`, opts);
dbContext.platform.sync(`${remoteCouchDBUrl}${dbNames.platform}`, opts);
dbContext.platformSupplies.sync(`${remoteCouchDBQTSServerURL}${dbNames.platformSupplies}`, opts);
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
dbContext.corporateCompanies.sync(`${remoteCouchDBUrl}${dbNames.corporateCompanies}`, opts);
dbContext.corporateContract.sync(`${remoteCouchDBUrl}${dbNames.corporateContract}`, opts);
dbContext.certificateDeposit.sync(`${remoteCouchDBUrl}${dbNames.certificateDeposit}`, opts);
dbContext.transportDocumentCertificateDeposit.sync(`${remoteCouchDBUrl}${dbNames.transportDocumentCertificateDeposit}`, opts);

//TODO: Agregar codigo postal de Brasil,Chile,Paraguay 
export const getLocalityAndStateByZipCode = async (country: string, zipCode: string) => {
  try {
    let result;
    switch (country) {
      case CountryCode.ARGENTINA:
        result = await dbContext.zipCodeARG.find({
          selector: { "CP": zipCode },
        });
        return result.docs;
      case CountryCode.PARAGUAY:
        result = await dbContext.zipCodePRY.find({
          selector: { "CP": zipCode },
        });
        return result.docs;
      default:
        return [];
    }
    // if (country === CountryCode.ARGENTINA) {
    //     const result = await dbContext.zipCodeARG.find({
    //         selector: { "CP": zipCode },
    //     });
    //     return result.docs;
    // }
    // if (country === CountryCode.PARAGUAY) {
    //     const result = await dbContext.zipCodePRY.find({
    //         selector: { "CP": zipCode },
    //     });
    //     return result.docs;
    // }
  } catch (error) {
    console.log(error);
    return [];
  }
}



