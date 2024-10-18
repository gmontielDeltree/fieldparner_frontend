import { Avatar, Box, CircularProgress, FormControl, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, useCompany } from '../../hooks';
import { urlImg } from '../../config';
import { setAuthUser } from '../../redux/auth';



const CompanyNavBar: React.FC = () => {

    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const { companies, getCompaniesByEmail } = useCompany();
    const [companySelected, setCompanySelected] = useState(localStorage.getItem('last_company') || "");
    const lincenIdSelected = companies?.find(company => company.companyId === companySelected)?.licenceId;

    const onChangeCompany = ({ target }: SelectChangeEvent) => {
        setCompanySelected(target.value as string);
        localStorage.setItem('last_company', target.value as string);
    }

    useEffect(() => {
        getCompaniesByEmail();
    }, []);

    useEffect(() => {
        if (companySelected == "" && companies.length > 0) {
            setCompanySelected(companies[0].companyId);
        }
    }, [companySelected, companies]);

    useEffect(() => {
        if (user && lincenIdSelected && user.licenceId !== lincenIdSelected) {
            dispatch(setAuthUser({ ...user, licenceId: lincenIdSelected }));
        }
    }, [dispatch, user, lincenIdSelected])


    return (
        <>
            {
                companies.length === 0 ? <CircularProgress />
                    :
                    <FormControl
                        key="select-company">
                        <Select
                            value={companySelected}
                            variant="outlined"
                            disabled={companies.length === 1}
                            sx={{
                                border: 'none',
                                '& fieldset': {
                                    border: 'none',
                                },
                            }}
                            onChange={onChangeCompany}
                            autoWidth
                        >
                            {
                                companies?.map((company) => (
                                    <MenuItem key={company._id} value={company.companyId}>
                                        <Box sx={{ display: "flex", alignItems: "center" }} >
                                            <Typography variant="h6" fontWeight={"bold"} sx={{ px: 1, letterSpacing: "1px" }}>
                                                {company.fantasyName?.toUpperCase()}
                                            </Typography>
                                            <Avatar
                                                alt={company.fantasyName}
                                                src={`${urlImg}/${company.companyLogo}`}
                                                sx={{ borderRadius: "50%", width: 30, height: 30 }} />
                                        </Box>
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
            }
        </>
    )
}

export default CompanyNavBar;