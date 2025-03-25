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
// Fixed empty animation
const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); }
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
  const [loading, setLoading] = useState(true)

  console.log('CompanyNavBar rendering, companies:', companies, 'typeof companies:', typeof companies, 'isArray:', Array.isArray(companies))

  const lincenIdSelected = companies?.find(
    (company) => company.companyId === companySelected,
  )?.licenceId

  const onChangeCompany = ({ target }: SelectChangeEvent) => {
    console.log('Company changed to:', target.value)
    setCompanySelected(target.value as string)
    localStorage.setItem('last_company', target.value as string)
  }

  useEffect(() => {
    console.log('Initial useEffect - fetching companies')
    const fetchCompanies = async () => {
      try {
        const result = await getCompaniesByEmail()
        console.log('Companies fetched successfully, result:', result)
        // Check if useCompany hook updates state correctly
        console.log('Companies state after fetch:', companies)

        // If getCompaniesByEmail returns data but doesn't update state, we need to fix the hook
        if (result && Array.isArray(result) && result.length > 0 && companies.length === 0) {
          console.error('Hook not updating state properly with data:', result)
        }
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  useEffect(() => {
    console.log('Second useEffect - companies:', companies, 'companySelected:', companySelected)
    if (companySelected === '' && companies && companies.length > 0) {
      console.log('Setting default company:', companies[0].companyId)
      setCompanySelected(companies[0].companyId)
    }
  }, [companySelected, companies])

  useEffect(() => {
    console.log('Third useEffect - user:', user, 'licenceId:', lincenIdSelected)
    if (user && lincenIdSelected && user.licenceId !== lincenIdSelected) {
      console.log('Updating user licenceId to:', lincenIdSelected)
      dispatch(setAuthUser({ ...user, licenceId: lincenIdSelected }))
    }
  }, [dispatch, user, lincenIdSelected])

  // Check if companies is valid
  if (!companies) {
    console.log('Companies is undefined')
    return <CircularProgress />
  }

  // Add debugging for the hook
  console.log('useCompany hook returned:', {
    companies: companies,
    getCompaniesByEmail: typeof getCompaniesByEmail
  })

  // Added timeout to stop loading after a reasonable time
  useEffect(() => {
    // Force loading to complete after 3 seconds regardless of API response
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Forcing loading to complete after timeout')
        setLoading(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [loading])

  // Return null if no companies
  if (!companies || companies.length === 0) {
    console.log('No companies available, returning null');
    return null;
  }

  return (
    <>
      {loading ? (
        <CircularProgress size={24} />
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
                  // Efecto sutil de "glass"
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