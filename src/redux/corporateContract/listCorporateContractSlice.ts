import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ListCorporateContract, ListCorporateContractState} from '../../types';


const initialState:  ListCorporateContractState = {
    listCorporateContractActive: null,
    ListCorporateContract: [],
}



export const listCorporateContractSlice = createSlice({
    name: 'ListCorporate Contract',
    initialState: initialState,
    reducers: {
        setListCorporateContractActive: (state, action: PayloadAction<ListCorporateContract>) => {
            state. listCorporateContractActive = action.payload;
        },
        removeListCorporateContractActive: (state) => {
            state. listCorporateContractActive = null
        },
        loadListCorporateContractActive: (state, action: PayloadAction<ListCorporateContract[]>) => {
            state. ListCorporateContract = action.payload;
        },
        removeListCorporateContract: (state) => {
            state. ListCorporateContract = [];
        }
    }
});


export const {
    loadListCorporateContractActive,
    removeListCorporateContract,
    removeListCorporateContractActive,
    setListCorporateContractActive,
} = listCorporateContractSlice.actions;
