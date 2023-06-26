import PouchDB from 'pouchdb';
import { Vehiculo, TypeVehicle } from '@types';
import uuid4 from 'uuid4';

const db: PouchDB.Database = new PouchDB('test_pouchdb');
// const dbTipoVehiculo = new PouchDB('tipoVehiculo_db');

const mydb = {
    vehiculos: new PouchDB('test_pouchdb'),
    tipoVehiculos: new PouchDB('tipoVehiculos'),
};

// Función para obtener todos los documentos de la base de datos
export const getTypeVehicles = async () => {
    try {
        const result = await mydb.tipoVehiculos.allDocs({ include_docs: true });
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
        const response = await mydb.tipoVehiculos.put(newTypeVehicle);
        console.log('document type of vehicle created:', response);
        return response;

    } catch (error) {
        console.error('Error creating document type of vehicle:', error);
        throw error;
    }
}

// Función para crear un nuevo documento
export const createDocument = async (content: Vehiculo) => {
    try {
        // const doc = {
        //     _id: new Date().toISOString(),
        //     title,
        //     content,
        // };
        const response = await db.put(content);
        console.log('Document created:', response);
        return response;
    } catch (error) {
        console.error('Error creating document:', error);
        throw error;
    }
};

// Función para obtener un documento por su ID
export const getDocumentById = async (id: string) => {
    try {
        const doc = await db.get(id);
        console.log('Document retrieved:', doc);
        return doc;
    } catch (error) {
        console.error('Error retrieving document:', error);
        throw error;
    }
};

// Función para actualizar un documento
export const updateDocument = async (doc: Vehiculo) => {
    try {
        const response = await db.put(doc);
        console.log('Document updated:', response);
        return response;
    } catch (error) {
        console.error('Error updating document:', error);
        throw error;
    }
};

// Función para eliminar un documento
export const deleteDocument = async (doc: any) => {
    try {
        const response = await db.remove(doc);
        console.log('Document deleted:', response);
        return response;
    } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
};
