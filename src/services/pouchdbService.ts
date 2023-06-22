import PouchDB from 'pouchdb';

const db = new PouchDB('mydb');

// Función para crear un nuevo documento
export const createDocument = async (title: string, content: string) => {
    try {
        const doc = {
            _id: new Date().toISOString(),
            title,
            content,
        };
        const response = await db.put(doc);
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
export const updateDocument = async (doc: any) => {
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
