import { useState } from "react";

export interface Supply {
    _id: string;
    tipo: string;
    insumo: string;
    descripcion?: string;
    unidadMedida: string;
    stockActual: number;
    stockReservado: number;
    stockDisponible: number;
}

export const useSupply = () => {

    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getSupplies = async () => {
        try {
            // setIsLoading(true);
            setSupplies([]);


        } catch (error) {
            console.log(error);
        }
    }

    const createSupply = async () => {

    }

    const updateSupply = async () => {

    }

    const removeSupply = async () => {

    }

    return {
        supplies,
        isLoading,


        getSupplies,
        createSupply,
        updateSupply,
        removeSupply,
    }

}