import {
  Avatar,
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  styled,
  keyframes,
  alpha,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector, useCompany } from '../../hooks'
import { urlImg } from '../../config'
import { setAuthUser } from '../../redux/auth'

// === Animaciones === //
const glow = keyframes`
    
  `

// Podríamos hacer un styled Select para personalizarlo
const FancySelect = styled(Select)(({ theme }) => ({
  borderRadius: '8px',
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  backdropFilter: 'blur(4px)',
  boxShadow: `0 4px 12px ${alpha('#000', 0.1)}`,
  transition: 'all 0.3s ease',
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  '& fieldset': {
    border: 'none',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.15),
    boxShadow: `0 6px 16px ${alpha('#000', 0.15)}`,
  },
  // Estilo para el ícono de flecha
  '& .MuiSvgIcon-root': {
    transition: 'transform 0.3s ease',
  },
  // Animación del ícono al abrir
  '&.Mui-focused .MuiSvgIcon-root': {
    transform: 'rotate(180deg)',
  },
}))

// También podemos estilizar MenuItem para darle un toque distinto
const FancyMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}))

const CompanyNavBar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { companies, getCompaniesByEmail } = useCompany()
  const [companySelected, setCompanySelected] = useState(
    localStorage.getItem('last_company') || '',
  )
  const lincenIdSelected = companies?.find(
    (company) => company.companyId === companySelected,
  )?.licenceId

  const onChangeCompany = ({ target }: SelectChangeEvent) => {
    setCompanySelected(target.value as string)
    localStorage.setItem('last_company', target.value as string)
  }

  useEffect(() => {
    getCompaniesByEmail()
  }, [])

  useEffect(() => {
    if (companySelected === '' && companies.length > 0) {
      setCompanySelected(companies[0].companyId)
    }
  }, [companySelected, companies])

  useEffect(() => {
    if (user && lincenIdSelected && user.licenceId !== lincenIdSelected) {
      dispatch(setAuthUser({ ...user, licenceId: lincenIdSelected }))
    }
  }, [dispatch, user, lincenIdSelected])

  return (
    <>
      {companies.length === 0 ? (
        <CircularProgress />
      ) : (
        <FormControl key="select-company">
          <FancySelect
            value={companySelected}
            variant="outlined"
            disabled={companies.length === 1}
            onChange={onChangeCompany}
            // centrado del menú emergente
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: 2,
                  mt: 1,
                  py: 0,
                  // Efecto sutil de “glass”
                  backgroundColor: alpha('#ffffff', 0.7),
                  backdropFilter: 'blur(6px)',
                  boxShadow: `0 4px 20px ${alpha('#000', 0.15)}`,
                },
              },
            }}
          >
            {companies?.map((company) => (
              <FancyMenuItem key={company._id} value={company.companyId}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ px: 1, letterSpacing: '0.8px' }}
                  >
                    {company.fantasyName?.toUpperCase()}
                  </Typography>
                  <Avatar
                    alt={company.fantasyName}
                    src={`${urlImg}/${company.companyLogo}`}
                    sx={{
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      animation:
                        company.companyId === companySelected
                          ? `${glow} 2s infinite`
                          : 'none',
                      ml: 1,
                    }}
                  />
                </Box>
              </FancyMenuItem>
            ))}
          </FancySelect>
        </FormControl>
      )}
    </>
  )
}

export default CompanyNavBar
