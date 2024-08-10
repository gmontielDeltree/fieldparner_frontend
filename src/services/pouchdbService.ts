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
} from '../types';
import { Country } from '../interfaces/country';
import { Business } from '../interfaces/socialEntity';
import { MenuModules, ModulesUsers } from '../interfaces/menuModules';
import { LicenceUse } from '../interfaces/licencesUse';
import { TransportDocument } from '../interfaces/transportDocument';
import { Company } from '../interfaces/company';


PouchDB.plugin(PouchDBFind);

const remoteCouchDBUrl = Object.freeze(getEnvVariables().VITE_COUCHDB_URL);
const remoteCouchDBQTSServerURL = Object.freeze(getEnvVariables().VITE_COUCHDB_QTS_URL);

const opts: PouchDB.Replication.SyncOptions = {
  live: true,
  retry: true,
  //  filter: 'app/by_account',
  //  query_params: { "agent": agent }
};

const dbNames = Object.freeze({
  Vehicles: "vehicles",
  Deposits: "deposits",
  TypeVehicles: "type-vehicles",
  ZipCodeARG: "zip-code-arg",
  ZipCodePRY: "zip-code-pry",
  Supplies: "supplies",
  SocialEntities: "social-entities",
  Categories: "categories",
  StockMovements: "stock-movements",
  StockByLots: "lots-stock",
  ExitFields: "exit-fields",
  Campaigns: "campaigns",
  Fields: "fields",
  OriginsDestinations: "origins-destinations",
  Users: "users",
  Numerators: "numerators",
  WithdrawalOrders: "withdrawal-orders",
  DepositSupplyOrder: "deposit-supply-order",
  WithdrawalsByDepositSupply: "withdrawals-deposit-supply",
  MovementsType: "movements-type",
  Platform: "platform",
  PlatformSupplies: "test-supplies",
  Crops: "crops",
  Zones: "zones",
  Fieldpartner: "fieldpartner",
  LaborsServices: "labors-services",
  PurchaseOrder: "purchase-order",
  DetailPurchaseOrder: "detail-purchase-order",
  Countries: "countries",
  MenuModules: "menu-modules",
  ModulesUsers: "modules-users",
  LicencesUse: "licences-use",
  TransportDocument: "transport-documents",
  Companies: "companies",
});

export const dbContext = Object.freeze({
  Vehicles: new PouchDB<Vehicle>(dbNames.Vehicles),
  TypeVehicles: new PouchDB(dbNames.TypeVehicles),
  Deposits: new PouchDB<Deposit>(dbNames.Deposits),
  ZipCodeARG: new PouchDB<ItemZipCode>(dbNames.ZipCodeARG),
  ZipCodePRY: new PouchDB<ItemZipCode>(dbNames.ZipCodePRY),
  Supplies: new PouchDB<Supply>(dbNames.Supplies),
  SocialEntities: new PouchDB<Business>(dbNames.SocialEntities),
  Categories: new PouchDB<Category>(dbNames.Categories),
  StockMovements: new PouchDB<StockMovement>(dbNames.StockMovements),
  StockByLots: new PouchDB<StockByLot>(dbNames.StockByLots),
  ExitFields: new PouchDB<ExitField>(dbNames.ExitFields),
  Campaigns: new PouchDB<Campaign>(dbNames.Campaigns),
  Fields: new PouchDB<Field>(dbNames.Fields), //TODO: revisar db
  OriginsDestinations: new PouchDB<OriginDestinations>(dbNames.OriginsDestinations),
  Users: new PouchDB<UserByAccount>(dbNames.Users),
  WithdrawalOrders: new PouchDB<WithdrawalOrder>(dbNames.WithdrawalOrders),
  DepositSupplyOrder: new PouchDB<DepositSupplyOrder>(dbNames.DepositSupplyOrder),
  WithdrawalsByDepositSupply: new PouchDB<WithdrawalsByDepositSupply>(dbNames.WithdrawalsByDepositSupply),
  Numerators: new PouchDB<Numerator>(dbNames.Numerators),
  MovementsType: new PouchDB<MovementType>(dbNames.MovementsType),
  Platform: new PouchDB<any>(dbNames.Platform),
  PlatformSupplies: new PouchDB<Supply>(`${dbNames.PlatformSupplies}`),
  Crops: new PouchDB<Crops>(dbNames.Crops),
  Zones: new PouchDB<Zones>(dbNames.Zones),
  Fieldpartner: new PouchDB(dbNames.Fieldpartner),
  LaborsServices: new PouchDB<LaborsServices>(dbNames.LaborsServices),
  PurchaseOrder: new PouchDB<PurchaseOrder>(dbNames.PurchaseOrder),
  DetailPurchaseOrder: new PouchDB<DetailPurchaseOrder>(dbNames.DetailPurchaseOrder),
  Countries: new PouchDB<Country>(dbNames.Countries),
  MenuModules: new PouchDB<MenuModules>(dbNames.MenuModules),
  ModulesUsers: new PouchDB<ModulesUsers>(dbNames.ModulesUsers),
  LicencesUse: new PouchDB<LicenceUse>(dbNames.LicencesUse),
  TransportDocument: new PouchDB<TransportDocument>(dbNames.TransportDocument),
  Companies: new PouchDB<Company>(dbNames.Companies),
});

// TODO Analizar "Filtered Replication" https://pouchdb.com/2015/04/05/filtered-replication.html
// para no sincronizar todos los docs the TODOS los usuarios (accountId's)

// dbContext.fields.sync(`${remoteCouchDBUrl}${dbNames.fields}`, opts);
// dbContext.vehicles.sync(`${remoteCouchDBUrl}${dbNames.vehicles}`, opts);
// dbContext.deposits.sync(`${remoteCouchDBUrl}${dbNames.deposits}`, opts);
// dbContext.zipCodeARG.sync(`${remoteCouchDBUrl}${dbNames.zipCodeARG}`, opts);
// dbContext.zipCodePRY.sync(`${remoteCouchDBUrl}${dbNames.zipCodePRY}`, opts);
// dbContext.supplies.sync(`${remoteCouchDBUrl}${dbNames.supplies}`, opts);
// dbContext.typeVehicles.sync(`${remoteCouchDBUrl}${dbNames.typeVehicles}`, opts);
// dbContext.socialEntities.sync(`${remoteCouchDBUrl}${dbNames.socialEntities}`, opts);
// dbContext.categories.sync(`${remoteCouchDBUrl}${dbNames.categories}`, opts);
// dbContext.stockMovements.sync(`${remoteCouchDBUrl}${dbNames.stockMovements}`, opts);
// dbContext.stockByLots.sync(`${remoteCouchDBUrl}${dbNames.stockByLots}`, opts);
// dbContext.exitFields.sync(`${remoteCouchDBUrl}${dbNames.exitFields}`, opts);
// dbContext.campaigns.sync(`${remoteCouchDBUrl}${dbNames.campaigns}`, opts);
// dbContext.users.sync(`${remoteCouchDBUrl}${dbNames.originsDestinations}`, opts);
// dbContext.originsDestinations.sync(`${remoteCouchDBUrl}${dbNames.originsDestinations}`, opts);
// dbContext.withdrawalOrders.sync(`${remoteCouchDBUrl}${dbNames.withdrawalOrders}`, opts);
// dbContext.numerators.sync(`${remoteCouchDBUrl}${dbNames.numerators}`, opts);
// dbContext.depositSupplyOrder.sync(`${remoteCouchDBUrl}${dbNames.depositSupplyOrder}`, opts);
// dbContext.withdrawalsByDepositSupply.sync(`${remoteCouchDBUrl}${dbNames.withdrawalsByDepositSupply}`, opts);
// dbContext.movementsType.sync(`${remoteCouchDBUrl}${dbNames.movementsType}`, opts);
// dbContext.platform.sync(`${remoteCouchDBUrl}${dbNames.platform}`, opts);
// dbContext.platformSupplies.sync(`${remoteCouchDBQTSServerURL}${dbNames.platformSupplies}`, opts);
// dbContext.crops.sync(`${remoteCouchDBUrl}${dbNames.crops}`, opts);
// dbContext.zones.sync(`${remoteCouchDBUrl}${dbNames.zones}`, opts);
// dbContext.laborsServices.sync(`${remoteCouchDBUrl}${dbNames.laborsServices}`, opts);
// dbContext.purchaseOrder.sync(`${remoteCouchDBUrl}${dbNames.purchaseOrder}`, opts);
// dbContext.detailPurchaseOrder.sync(`${remoteCouchDBUrl}${dbNames.detailPurchaseOrder}`, opts);
// dbContext.countries.sync(`${remoteCouchDBUrl}${dbNames.countries}`, opts);
// dbContext.menuModules.sync(`${remoteCouchDBUrl}${dbNames.menuModules}`, opts);
// dbContext.modulesUsers.sync(`${remoteCouchDBUrl}${dbNames.modulesUsers}`, opts);
// dbContext.licencesUse.sync(`${remoteCouchDBUrl}${dbNames.licencesUse}`, opts);
dbContext.TransportDocument.sync(`${remoteCouchDBUrl}${dbNames.TransportDocument}`, opts);
dbContext.Companies.sync(`${remoteCouchDBUrl}${dbNames.Companies}`, opts);

//TODO: Agregar codigo postal de Brasil,Chile,Paraguay 
export const getLocalityAndStateByZipCode = async (country: string, zipCode: string) => {
  try {
    let result;
    switch (country) {
      case CountryCode.ARGENTINA:
        result = await dbContext.ZipCodeARG.find({
          selector: { "CP": zipCode },
        });
        return result.docs;
      case CountryCode.PARAGUAY:
        result = await dbContext.ZipCodePRY.find({
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



