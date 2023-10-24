import PouchDB from 'pouchdb';
import { agregarNuevoVehiculo, cargarVehiculos, actualizarVehiculo, removerVehiculoActivo } from ".";
import { createDocument, getDocumentById, getVehiculoService, updateDocument } from "../../services";
import { Vehiculo } from "@types";
import { AppDispatch, RootState } from "../store";
import { uiFinishLoading, uiStartLoading } from "../ui";
import uuid4 from 'uuid4';


const db = new PouchDB('test_pouchdb');

// Función para obtener todos los documentos de la base de datos
const getAllDocuments = async () => {
    try {
        const result = await db.allDocs({ include_docs: true });
        const documents: any = result.rows.map(row => row.doc);

        return documents;

    } catch (error) {
        console.error('Error al conectar con DB:', error);
    }
};

export const getVehiculos = () => {
    return async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(uiStartLoading());
        try {
            // if (getState().vehiculo.vehiculos.length === 0) {
            //     const response = await getVehiculoService();
            //     if (response) dispatch(cargarVehiculos(response));
            // }
            const response = await getAllDocuments();
            // const vehiculos = response.map((v: any) => v.content);
            if (response) dispatch(cargarVehiculos(response));

            dispatch(uiFinishLoading());
        } catch (error) {
            dispatch(uiFinishLoading());
        }
    }
}

export const startAddVehiculo = (newVehiculo: Vehiculo) => {
    return async (dispatch: AppDispatch) => {
        try {
            dispatch(uiStartLoading());

            const nuevoVehiculo = {
                ...newVehiculo,
                _id: uuid4()
            };
            const response = await createDocument(nuevoVehiculo);

            if (response) dispatch(agregarNuevoVehiculo(nuevoVehiculo));

            dispatch(uiFinishLoading());
        } catch (error) {
            dispatch(uiFinishLoading());
        }
    }
}

export const startUpdateVehiculo = (oldVehiculo: Vehiculo) => {
    return async (dispatch: AppDispatch) => {
        try {
            dispatch(uiStartLoading());

            // const vehiculo = await getDocumentById(oldVehiculo._id);
            const response = await updateDocument(oldVehiculo);

            if (response) {
                dispatch(actualizarVehiculo(oldVehiculo));
                dispatch(removerVehiculoActivo());
            }

            dispatch(uiFinishLoading());
        } catch (error) {
            dispatch(uiFinishLoading());
        }
    }
}

