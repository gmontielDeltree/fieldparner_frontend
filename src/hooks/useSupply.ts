import Swal from 'sweetalert2';
import { Supply } from "../types";
import { useState } from "react";
import { dbContext } from '../services';
import { useAppSelector } from '.';
// const DBSupplies: PouchDB.Database<Supply> = new PouchDB('supplies');


export const useSupply = () => {

    const { user } = useAppSelector(state => state.auth);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getSupplies = async () => {
        setIsLoading(true);
        try {
            const result = await dbContext.supplies.find({
                selector: { "accountId": user?.accountId },
            },);

            setIsLoading(false);
            if (result.docs.length) {
                const documents: Supply[] = result.docs.map(row => row as Supply);
                setSupplies(documents);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error al cargar documentos:', error);
        }
    }

    const createSupply = async (newSupply: Supply) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error();
            const response = await dbContext.supplies.post({ ...newSupply, accountId: user.accountId });
            setIsLoading(false);

            if (response.ok) {
                Swal.fire('Insumo', 'Agregado con exito.', 'success');
            }

        } catch (error) {
            console.log('Error al crear el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const updateSupply = async (updateSupply: Supply) => {
        setIsLoading(true);
        try {
            const response = await dbContext.supplies.put(updateSupply);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire('Insumo', 'Actualizado con exito.', 'success');
            }

        } catch (error) {
            console.log('Error al actualizar el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const removeSupply = async () => {

    }

    return {
        supplies,
        isLoading,

        setSupplies,
        getSupplies,
        createSupply,
        updateSupply,
        removeSupply,
    }

}