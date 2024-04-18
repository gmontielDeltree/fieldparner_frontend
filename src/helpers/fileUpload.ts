import { imagesAPI } from "../config";

export const uploadFile = async (fileInput: Blob) => {
    try {
        const form = new FormData();
        form.append('file', fileInput);

        return await imagesAPI.post('/general/upload', form);
    } catch (error) {
        console.log('error', error)
    }
}

export const getFileByName = async (fileName: string) => {
    try {
        return await imagesAPI.get(`/general/files/${fileName}`);
    } catch (error) {
        console.log('error', error)
    }
}
