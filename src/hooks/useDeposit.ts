import PouchDB from 'pouchdb';
import Swal from 'sweetalert2';
import { Deposit } from "../types";
import { useState } from "react";

const DbDeposits: PouchDB.Database<Deposit> = new PouchDB('deposits');

export const useDeposit = () => {

    // const dispatch = useAppDispatch();
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getDeposits = async () => {
        setIsLoading(true);
        try {
            const result = await DbDeposits.allDocs({ include_docs: true });

            setIsLoading(false);
            if (result.rows.length) {
                const documents: Deposit[] = result.rows.map(row => row.doc as Deposit);
                setDeposits(documents);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error al cargar documentos:', error);
        }
    }

    const createDeposit = async (newDeposit: Deposit) => {
        setIsLoading(true);
        try {
            const response = await DbDeposits.post(newDeposit);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire('Deposito', 'Agregado con exito.', 'success');
            }

        } catch (error) {
            console.log('Error al crear el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const updateDeposit = async (updateDeposit: Deposit) => {
        setIsLoading(true);
        try {
            const response = await DbDeposits.put(updateDeposit);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire('Deposito', 'Actualizado con exito.', 'success');
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
        deposits,
        isLoading,

        setDeposits,
        getDeposits,
        createDeposit,
        updateDeposit,
        removeSupply,
    }

}