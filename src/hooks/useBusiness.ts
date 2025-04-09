import Swal from 'sweetalert2';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../services';
import { useAppSelector } from './useRedux';
import { Country } from '../interfaces/country';
import { Business, BusinessItem } from '../interfaces/socialEntity';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);
//TODO: REMOVER FUNCION DE REPLICA
// const urlDBSTG = "https://apikey-v2-1yb2cmamb0xx9crcw3bnhkext446sfm6qsi2irs1fl4k:d6ed49b33addbe40ae2c8aadf0d4dec3@53a5f67b-e352-46df-bd58-4d4a37b99dd2-bluemix.cloudantnosqldb.appdomain.cloud";

export const useBusiness = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    
    const replicate = async () => {
        try {
            // const result = await new PouchDB("system").allDocs({ include_docs: true });
            // const data = result.rows.map(row => {
            //     const doc = {...row.doc};
            //     delete doc._rev;
            //     delete doc._id;
            //     return doc;
            // })
            // debugger;

            // const enviroment = "stg";
            // const dbName = "system";
            // const db = new PouchDB(`${dbName}_${enviroment}`);
            // await db.bulkDocs(data);
            // db.sync(`${urlDBSTG}/${dbName}_${enviroment}`)
            //     .then(function (result) {
            //         console.log('replicated', result);
            //     });

        } catch (error) {
            console.error("Error replicating", error);

        }
    }

    const getBusinesses = async () => {
        setIsLoading(true);
        try {
            const result = await Promise.all([
                dbContext.socialEntities.find({
                    selector: { accountId: user?.accountId }
                }),
                dbContext.countries.allDocs({ include_docs: true })
            ]);
            const socialEntities = result[0].docs.map(d => d as Business);
            const countries = result[1].rows.map(row => row.doc as Country);
            setIsLoading(false);
            if (socialEntities.length) {
                // const documents: Business[] = result.docs.map(row => row as Business);
                let list = socialEntities.map((s) => {
                    let country = countries.find(c => c.code === s.pais);
                    return {
                        ...s,
                        country
                    } as BusinessItem

                });
                setBusinesses(list);
            } else {
                setBusinesses([]);
            }

        } catch (error) {
            console.log(error)
            //Swal.fire('Error', 'No hay registro de empresas/personas.', 'error');
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const createBusiness = async (newBusiness: Business) => {
        setIsLoading(true);

        if (!user) throw new Error("Business error:  User not found");

        let createBusiness: Business = { ...newBusiness, accountId: user.accountId }

        try {
            const response = await dbContext.socialEntities.post(createBusiness);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire({
                    title: 'Entidad Social',
                    text: 'Agregada con éxito.',
                    icon: 'success',
                });
            } else {
                Swal.fire({
                    title: 'Entidad Social',
                    text: 'Error al agregar. Verifica los campos.',
                    icon: 'error',
                });
            }

            navigate('/init/overview/business');
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: 'Ups',
                text: 'Ocurrió un error inesperado.',
                icon: 'error',
            });
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const updateBusiness = async (updateBusiness: Business) => {
        setIsLoading(true);
        try {
            // const response = await fieldpartnerAPI.patch(`${controller}/${businessId}`, updateBusiness);
            const response = await dbContext.socialEntities.put(updateBusiness);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire({
                    title: 'Entidad Social',
                    text: 'Actualizada con éxito.',
                    icon: 'success',
                });
            }
            navigate("/init/overview/business");

        } catch (error) {
            console.log(error)
            Swal.fire({
                title: 'Error',
                text: 'No hay registro de la Entidad Social.',
                icon: 'error',
            });
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const deleteBusiness = async (businessId: string, revBusiness: string) => {
        setIsLoading(true);
        try {
            const response = await dbContext.socialEntities.remove(businessId, revBusiness);
            setIsLoading(false);

            if (response.ok) {
                Swal.fire({
                    title: 'Entidad Social',
                    text: 'Eliminada con éxito.',
                    icon: 'success',
                });
            }
            navigate("/init/overview/business");

        } catch (error) {
            console.log(error)
            Swal.fire({
                title: 'Error',
                text: 'No hay registro de la Entidad Social.',
                icon: 'error',
            });
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        //* Props
        businesses,
        error,
        isLoading,


        //* Methods
        setBusinesses,
        deleteBusiness,
        getBusinesses,
        createBusiness,
        updateBusiness,
        replicate
    }
};