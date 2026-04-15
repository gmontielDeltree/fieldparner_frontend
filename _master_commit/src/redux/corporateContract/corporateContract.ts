import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CorporateContract, CorporateContractState} from '../../interfaces/corporateContract';


const initialState:  CorporateContractState = {
    corporateContractActive: null,
    listCorporateContract: [],
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
            state. listCorporateContract = action.payload;
        },
        removeCorporateContract: (state) => {
            state. listCorporateContract = [];
        }
    }
});


export const {
    loadCorporateContractActive,
    removeCorporateContract,
    removeCorporateContractActive,
    setCorporateContractActive,
} = corporateContractSlice.actions;