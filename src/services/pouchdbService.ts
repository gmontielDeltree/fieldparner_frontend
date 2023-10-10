import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import { getEnvVariables } from '../helpers/getEnvVariables';
import { CountryCode, ItemZipCode, Vehiculo } from '../types';
import uuid4 from 'uuid4';

PouchDB.plugin(PouchDBFind);

const remoteCouchDBUrl = Object.freeze(getEnvVariables().VITE_COUCHDB_URL);

// const db: PouchDB.Database = new PouchDB('test_pouchdb');
const dbNames = Object.freeze({
    deposits: "deposits",
    typeVehicles: "type-vehicles",
    zipCodeArg: "zip-code-arg"
});

export const dbContext = {
    typeVehicles: new PouchDB(dbNames.typeVehicles),
    deposits: new PouchDB(dbNames.deposits),
    zipCodeArg: new PouchDB<ItemZipCode>(dbNames.zipCodeArg),
};

// const dbZipCodeArg = new PouchDB(dbNames.zipCodeArg);

dbContext.deposits.sync(`${remoteCouchDBUrl}/${dbNames.deposits}`, { live: true, retry: true, });
dbContext.zipCodeArg.sync(`${remoteCouchDBUrl}/${dbNames.zipCodeArg}`, { live: true, retry: true, });

export const getLocalityAndStateByZipCode = async (country: string, zipCode: string) => {
    try {

        if (country === CountryCode.ARGENTINA) {

            const result = await dbContext.zipCodeArg.find({
                selector: { "CP": zipCode },
            });

            console.log("result", result);
            return result.docs;
        }
    } catch (error) {
        console.log(error);
    }
}

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
