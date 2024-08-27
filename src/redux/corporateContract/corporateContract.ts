import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CorporateContract, CorporateContractState} from '../../types';


const initialState:  CorporateContractState = {
    corporateContractActive: null,
    CorporateContract: [],
}



export const corporateContractSlice = createSlice({
    name: 'Corporate Contract',
    initialState: initialState,
    reducers: {
        setCorporateContractActive: (state, action: PayloadAction<CorporateContract>) => {
            state. corporateContractActive = action.payload;
        },
        removeCorporateContractActive: (state) => {
            state. corporateContractActive = null
        },
        loadCorporateContractActive: (state, action: PayloadAction<CorporateContract[]>) => {
            state. CorporateContract = action.payload;
        },
        removeCorporateContract: (state) => {
            state. CorporateContract = [];
        }
    }
});


export const {
    loadCorporateContractActive,
    removeCorporateContract,
    removeCorporateContractActive,
    setCorporateContractActive,
} = corporateContractSlice.actions;
