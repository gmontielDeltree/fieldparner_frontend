import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CorporateCompanies, CorporateCompaniesState} from '../../types';


const initialState:  CorporateCompaniesState = {
    corporateCompaniesActive: null,
    CorporateCompanies: [],
}



export const corporateCompaniesSlice = createSlice({
    name: 'Corporate Companies',
    initialState: initialState,
    reducers: {
        setCorporateCompaniesActive: (state, action: PayloadAction<CorporateCompanies>) => {
            state. corporateCompaniesActive = action.payload;
        },
        removeCorporateCompaniesActive: (state) => {
            state. corporateCompaniesActive = null
        },
        loadCorporateCompaniesActive: (state, action: PayloadAction<CorporateCompanies[]>) => {
            state. CorporateCompanies = action.payload;
        },
        removeCorporateCompanies: (state) => {
            state. CorporateCompanies = [];
        }
    }
});


export const {
    loadCorporateCompaniesActive,
    removeCorporateCompanies,
    removeCorporateCompaniesActive,
    setCorporateCompaniesActive,
} = corporateCompaniesSlice.actions;
