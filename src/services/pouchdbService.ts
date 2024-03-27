import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import { getEnvVariables } from '../helpers/getEnvVariables';
import {
    Business,
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
    WithdrawalOrder,
    Numerator,
    DepositSupplyOrder,
    WithdrawalsByDepositSupply,
    MovementType,
    Crops,
} from '../types';
import uuid4 from 'uuid4';

PouchDB.plugin(PouchDBFind);

const remoteCouchDBUrl = Object.freeze(getEnvVariables().VITE_COUCHDB_URL);
const remoteCouchDBQTSServerURL = Object.freeze(getEnvVariables().VITE_COUCHDB_QTS_URL);

const opts: PouchDB.Replication.SyncOptions = { live: true, retry: true };

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
    numerators: "numerators",
    withdrawalOrders: "withdrawal-orders",
    depositSupplyOrder: "deposit-supply-order",
    withdrawalsByDepositSupply: "withdrawals-deposit-supply",
    movementsType: "movements-type",
    platform: "platform",
    platformSupplies:"test-supplies",
    crops: "crops",
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
    withdrawalOrders: new PouchDB<WithdrawalOrder>(dbNames.withdrawalOrders),
    depositSupplyOrder: new PouchDB<DepositSupplyOrder>(dbNames.depositSupplyOrder),
    withdrawalsByDepositSupply: new PouchDB<WithdrawalsByDepositSupply>(dbNames.withdrawalsByDepositSupply),
    numerators: new PouchDB<Numerator>(dbNames.numerators),
    movementsType: new PouchDB<MovementType>(dbNames.movementsType),
    platform: new PouchDB<any>(dbNames.platform),
    platformSupplies: new PouchDB<Supply>(`${dbNames.platformSupplies}`),
    crops: new PouchDB<Crops>(dbNames.crops),
});

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
dbContext.originsDestinations.sync(`${remoteCouchDBUrl}${dbNames.originsDestinations}`);
dbContext.withdrawalOrders.sync(`${remoteCouchDBUrl}${dbNames.withdrawalOrders}`);
dbContext.numerators.sync(`${remoteCouchDBUrl}${dbNames.numerators}`);
dbContext.depositSupplyOrder.sync(`${remoteCouchDBUrl}${dbNames.depositSupplyOrder}`);
dbContext.withdrawalsByDepositSupply.sync(`${remoteCouchDBUrl}${dbNames.withdrawalsByDepositSupply}`);
dbContext.movementsType.sync(`${remoteCouchDBUrl}${dbNames.movementsType}`);

dbContext.platform.sync(`${remoteCouchDBUrl}${dbNames.platform}`, opts);
dbContext.platformSupplies.sync(`${remoteCouchDBQTSServerURL}${dbNames.platformSupplies}`, opts);
dbContext.crops.sync(`${remoteCouchDBUrl}${dbNames.crops}`, { live: true, retry: true, });

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

//TODO: remover esta funcion
// Función para obtener todos los documentos de la base de datos
export const getTypeVehicles = async () => {
    try {
        const result = await dbContext.typeVehicles.allDocs({ include_docs: true });
        const documents: any = result.rows.map(row => row.doc);

        return documents;

    } catch (error) {
        console.error('Error al conectar con DB:', error);
    }
};

//TODO: remover esta funcion
export const createTypeVehicles = async (type: string) => {
    try {
        const newTypeVehicle = {
            _id: uuid4(),
            name: type
        }
        const response = await dbContext.typeVehicles.put(newTypeVehicle);
        console.log('document type of vehicle created:', response);
        return response;

    } catch (error) {
        console.error('Error creating document type of vehicle:', error);
        throw error;
    }
}

// Función para crear un nuevo documento
export const createDocument = async (_content: Vehicle) => {

};

// Función para obtener un documento por su ID
export const getDocumentById = async (_id: string) => {

};

// Función para actualizar un documento
export const updateDocument = async (_doc: Vehicle) => {

};

// Función para eliminar un documento
export const deleteDocument = async (_doc: any) => {
    // try {
    //     const response = await db.remove(doc);
    //     console.log('Document deleted:', response);
    //     return response;
    // } catch (error) {
    //     console.error('Error deleting document:', error);
    //     throw error;
    // }
};