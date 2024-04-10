import React, { createContext, useEffect} from 'react';
import { useSupply } from '../../../hooks';


export const useInsumos =()=>{

    const {supplies, getSupplies} = useSupply()

    useEffect(()=>{
        getSupplies()
    },[])

    const getInsumoFromId = (id)=>{
        return supplies.find((d)=>d._id === id)
    }

    return {supplies, getInsumoFromId}
}
export const InsumosContext = createContext()
