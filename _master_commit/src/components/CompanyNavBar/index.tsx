import { Avatar, Box, CircularProgress, FormControl, MenuItem, Select, SelectChangeEvent, Typography, ListItemIcon } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, useCompany } from '../../hooks';
import { urlImg } from '../../config';
import { setAuthUser } from '../../redux/auth';
import { Check, ExpandMore } from '@mui/icons-material';



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


    const selectedCompany = companies?.find(company => company.companyId === companySelected);

    return (
        <>
            {
                companies.length === 0 ? <CircularProgress size={30} />
                    :
                    <FormControl
                        key="select-company">
                        <Select
                            value={companySelected}
                            variant="outlined"
                            disabled={companies.length === 1}
                            IconComponent={ExpandMore}
                            sx={{
                                border: 'none',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                '& fieldset': {
                                    border: 'none',
                                },
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    py: 1,
                                    px: 2,
                                },
                                '& .MuiSelect-icon': {
                                    transition: 'transform 0.3s ease',
                                },
                                '&.Mui-focused .MuiSelect-icon': {
                                    transform: 'rotate(180deg)',
                                },
                            }}
                            onChange={onChangeCompany}
                            renderValue={() => (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Avatar
                                        alt={selectedCompany?.fantasyName}
                                        src={`${urlImg}/${selectedCompany?.companyLogo}`}
                                        sx={{
                                            borderRadius: "50%",
                                            width: 32,
                                            height: 32,
                                            border: '2px solid rgba(255, 255, 255, 0.2)',
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={600}
                                        sx={{
                                            letterSpacing: "0.5px",
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        {selectedCompany?.fantasyName?.toUpperCase()}
                                    </Typography>
                                </Box>
                            )}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        borderRadius: '12px',
                                        mt: 1,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        maxHeight: '400px',
                                        '& .MuiList-root': {
                                            py: 1,
                                        },
                                    }
                                }
                            }}
                        >
                            {
                                companies?.map((company) => (
                                    <MenuItem
                                        key={company._id}
                                        value={company.companyId}
                                        selected={company.companyId === companySelected}
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            mx: 1,
                                            borderRadius: '8px',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.16)',
                                                },
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                                            <Avatar
                                                alt={company.fantasyName}
                                                src={`${urlImg}/${company.companyLogo}`}
                                                sx={{
                                                    borderRadius: "50%",
                                                    width: 36,
                                                    height: 36,
                                                    border: company.companyId === companySelected
                                                        ? '2px solid #1976d2'
                                                        : '2px solid transparent',
                                                    transition: 'border 0.2s ease',
                                                }}
                                            />
                                            <Typography
                                                variant="body1"
                                                fontWeight={company.companyId === companySelected ? 600 : 500}
                                                sx={{
                                                    letterSpacing: "0.5px",
                                                    flex: 1,
                                                }}
                                            >
                                                {company.fantasyName?.toUpperCase()}
                                            </Typography>
                                            {company.companyId === companySelected && (
                                                <ListItemIcon sx={{ minWidth: 'auto', color: '#1976d2' }}>
                                                    <Check />
                                                </ListItemIcon>
                                            )}
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