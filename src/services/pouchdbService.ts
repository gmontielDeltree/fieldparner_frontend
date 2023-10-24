import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import { getEnvVariables } from '../helpers/getEnvVariables';
import { Business, Category, CountryCode, Deposit, ItemZipCode, Supply, Vehiculo } from '../types';
import uuid4 from 'uuid4';

PouchDB.plugin(PouchDBFind);

const remoteCouchDBUrl = Object.freeze(getEnvVariables().VITE_COUCHDB_URL);

const dbNames = Object.freeze({
    deposits: "deposits",
    typeVehicles: "type-vehicles",
    zipCodeArg: "zip-code-arg",
    supplies: "supplies",
    socialEntities: "social-entities",
    categories: "categories",
});

export const dbContext = Object.freeze({
    typeVehicles: new PouchDB(dbNames.typeVehicles),
    deposits: new PouchDB<Deposit>(dbNames.deposits),
    zipCodeArg: new PouchDB<ItemZipCode>(dbNames.zipCodeArg),
    supplies: new PouchDB<Supply>(dbNames.supplies),
    socialEntities: new PouchDB<Business>(dbNames.socialEntities),
    categories: new PouchDB<Category>(dbNames.categories),
});

dbContext.deposits.sync(`${remoteCouchDBUrl}${dbNames.deposits}`, { live: true, retry: true, });
dbContext.zipCodeArg.sync(`${remoteCouchDBUrl}${dbNames.zipCodeArg}`, { live: true, retry: true, });
dbContext.supplies.sync(`${remoteCouchDBUrl}${dbNames.supplies}`, { live: true, retry: true, });
dbContext.typeVehicles.sync(`${remoteCouchDBUrl}${dbNames.typeVehicles}`, { live: true, retry: true, });
dbContext.socialEntities.sync(`${remoteCouchDBUrl}${dbNames.socialEntities}`, { live: true, retry: true, });
dbContext.categories.sync(`${remoteCouchDBUrl}${dbNames.categories}`, { live: true, retry: true, });

export const getLocalityAndStateByZipCode = async (country: string, zipCode: string) => {
    try {

        if (country === CountryCode.ARGENTINA) {
            const result = await dbContext.zipCodeArg.find({
                selector: { "CP": zipCode },
            });
            return result.docs;
        }
    } catch (error) {
        console.log(error);
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
export const createDocument = async (_content: Vehiculo) => {

};

// Función para obtener un documento por su ID
export const getDocumentById = async (_id: string) => {

};

// Función para actualizar un documento
export const updateDocument = async (_doc: Vehiculo) => {

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
