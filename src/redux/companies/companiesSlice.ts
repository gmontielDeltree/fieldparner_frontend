import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CompaniesState } from '../../types';
import { Company } from '../../interfaces/company';


const initialState: CompaniesState = {
    companyActive: null,
    companies: [],
}



export const companiesSlice = createSlice({
    name: 'Corporate Companies',
    initialState: initialState,
    reducers: {
        setCompanyActive: (state, action: PayloadAction<Company>) => {
            state.companyActive = action.payload;
        },
        removeCompanyActive: (state) => {
            state.companyActive = null
        },
        loadCompanies: (state, action: PayloadAction<Company[]>) => {
            state.companies = action.payload;
        },
        removeCompanies: (state) => {
            state.companies = [];
        }
    }
});


export const {
    loadCompanies,
    removeCompanies,
    removeCompanyActive,
    setCompanyActive,
} = companiesSlice.actions;
