import Swal from 'sweetalert2';
import { Deposit } from "../types";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';
import { useAppSelector } from '.';

// const remoteCouchDBUrl = getEnvVariables().VITE_COUCHDB_URL;
// const myDBs = {
//     deposits: "deposits",
// };

// const DbDeposits = new PouchDB(myDBs.deposits);
// DbDeposits.sync(`${remoteCouchDBUrl}/${myDBs.deposits}`, { live: true, retry: true, });
// const syncDb = async () => await DbDeposits.sync(`${remoteCouchDBUrl}/${myDBs.deposits}`, { live: true, retry: true, });


export const useDeposit = () => {

    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getDeposits = async () => {
        setIsLoading(true);
        try {
            const result = await dbContext.deposits.find(
                {
                    selector: { "accountId": user?.accountId },
                },
            );
            
            setIsLoading(false);
            if (result.docs) {
                const documents: Deposit[] = result.docs.map(row => row as Deposit);
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

            if (!user) throw new Error();

            const response = await dbContext.deposits.post({ ...newDeposit, accountId: user.accountId });
            setIsLoading(false);

            if (response.ok) {
                Swal.fire('Deposito', 'Agregado con exito.', 'success');
            }
            navigate("/init/overview/deposit");

        } catch (error) {
            console.log('Error al crear el documento: ', error);
            Swal.fire('Ups', 'Ocurrio un error inesperado ', 'error');
            setIsLoading(false);
        }
    }

    const updateDeposit = async (updateDeposit: Deposit) => {
        setIsLoading(true);
        try {
            const response = await dbContext.deposits.put(updateDeposit);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire('Deposito', 'Actualizado con exito.', 'success');
            }

            navigate("/init/overview/deposit");

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