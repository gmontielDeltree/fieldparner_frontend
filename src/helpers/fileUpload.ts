import { imagesAPI } from "../config";

export const uploadFile = async (fileInput: Blob) => {
    try {
        const form = new FormData();
        form.append('file', fileInput);
        
        return await imagesAPI.post('/general/upload', form);
    } catch (error) {
        console.log('error upload file: ', error)
    }
}

export const getFileByName = async (fileName: string) => {
    try {
        return await imagesAPI.get(`/general/files/${fileName}`);
    } catch (error) {
        console.log('error', error)
    }
}

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/\s+/g, '-')           // Reemplazar espacios con guiones
    // .replace(/[^\w\-_.]/g, '')      // Remover caracteres especiales (opcional)
    .toLowerCase();                 // Convertir a minúsculas (opcional)
};
