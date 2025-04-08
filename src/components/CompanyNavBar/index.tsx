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
  0% { box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); }
`

// Simplificado el styled Select para reducir posibles conflictos
const FancySelect = styled(Select)(({ theme }) => ({
  borderRadius: '8px',
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  boxShadow: `0 4px 12px ${alpha('#000', 0.1)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer', // Asegurar que el cursor sea pointer
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.15),
  },
}))

const FancyMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer', // Asegurar que el cursor sea pointer
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}))

const CompanyNavBar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { companies, getCompaniesByEmail } = useCompany()
  const [companySelected, setCompanySelected] = useState(
    localStorage.getItem('last_company') || ''
  )
  const [loading, setLoading] = useState(true)
  const [localCompanies, setLocalCompanies] = useState([])

  // Actualizar estado local cuando companies cambia
  useEffect(() => {
    if (companies && Array.isArray(companies) && companies.length > 0) {
      setLocalCompanies(companies)

      // Si no hay compañía seleccionada, seleccionar la primera
      if (!companySelected && companies.length > 0) {
        setCompanySelected(companies[0].companyId)
        localStorage.setItem('last_company', companies[0].companyId)
      }
    }
  }, [companies, companySelected])

  const licenceIdSelected = localCompanies.find(
    (company) => company.companyId === companySelected
  )?.licenceId

  const onChangeCompany = (event) => {
    const value = event.target.value
    console.log('Company changed to:', value)
    setCompanySelected(value)
    localStorage.setItem('last_company', value)
  }

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        await getCompaniesByEmail()
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()

    // Establecer un timeout de seguridad
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Actualizar licenceId del usuario cuando cambia la compañía seleccionada
  useEffect(() => {
    if (user && licenceIdSelected && user.licenceId !== licenceIdSelected) {
      dispatch(setAuthUser({ ...user, licenceId: licenceIdSelected }))
    }
  }, [dispatch, user, licenceIdSelected])

  // Simplificar la lógica de renderizado
  if (loading) {
    return <CircularProgress size={24} />
  }

  // No renderizar nada si no hay compañías
  if (!localCompanies || localCompanies.length === 0) {
    return null
  }

  return (
    <FormControl key="select-company">
      <FancySelect
        value={companySelected}
        variant="outlined"
        disabled={localCompanies.length === 1}
        onChange={onChangeCompany}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 2,
              mt: 1,
              py: 0,
              backgroundColor: 'white', // Simplificar para evitar problemas
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            },
          },
        }}
      >
        {localCompanies.map((company) => (
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
  )
}

export default CompanyNavBar