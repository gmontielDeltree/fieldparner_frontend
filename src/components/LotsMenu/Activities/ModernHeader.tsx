import React from 'react'
import { Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  MapPin,
  Home,
  ChevronRight,
  Calendar,
  ClipboardList,
  Ruler,
} from 'lucide-react'

const ModernHeader = styled(Paper)(({ theme }) => ({
  padding: '16px 20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(226, 232, 240, 1)',
}))

const GlowEffect = styled('div')({
  position: 'absolute',
  width: '300px',
  height: '300px',
  background:
    'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(56, 189, 248, 0) 70%)',
  borderRadius: '50%',
  top: '-150px',
  right: '-150px',
  zIndex: 1,
})

const ContentWrapper = styled('div')({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
})

const MainInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

const LocationWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#64748b',
  fontSize: '0.875rem',
  fontWeight: 500,
})

const TitleWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
})

const Title = styled('h2')({
  margin: 0,
  color: '#0f172a',
  fontSize: '1.5rem',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  lineHeight: '1.2',
})

const Subtitle = styled('h3')({
  margin: 0,
  color: '#64748b',
  fontSize: '1rem',
  fontWeight: 500,
})

const StatsContainer = styled('div')({
  display: 'flex',
  gap: '24px',
  alignItems: 'center',
  marginLeft: 'auto',
  borderLeft: '1px solid rgba(226, 232, 240, 0.8)',
  paddingLeft: '24px',
})

const StatBox = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

const StatIcon = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #edf2f7 100%)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
})

const StatInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
})

const StatValue = styled('div')({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#0f172a',
})

const StatLabel = styled('div')({
  fontSize: '0.75rem',
  color: '#64748b',
  fontWeight: 500,
})

const Header = ({ fieldDoc, lotDoc, activitiesData = [] }) => {
  const hectareas = lotDoc.properties?.hectareas || '0'

  const proximaActividad = activitiesData
    ?.filter((data) => data.actividad.estado === 'pendiente')
    ?.sort(
      (a, b) =>
        new Date(a.actividad.detalles.fecha_ejecucion_tentativa) -
        new Date(b.actividad.detalles.fecha_ejecucion_tentativa),
    )?.[0]

  const getDiasRestantes = (fechaFutura) => {
    const hoy = new Date()
    const fecha = new Date(fechaFutura)
    const diferencia = fecha.getTime() - hoy.getTime()
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24))
    return dias
  }

  const diasHastaProximaActividad = proximaActividad
    ? getDiasRestantes(
      proximaActividad.actividad.detalles.fecha_ejecucion_tentativa,
    )
    : null

  const actividadesPendientes = activitiesData.filter(
    (act) => act.actividad.estado === 'pendiente',
  ).length

  return (
    <ModernHeader elevation={0}>
      <GlowEffect />
      <ContentWrapper>
        <MainInfo>
          <LocationWrapper>
            <Home size={14} strokeWidth={2.5} />
            <span>Campo</span>
            <ChevronRight size={12} />
            <MapPin size={14} strokeWidth={2.5} />
            <span>Lote</span>
          </LocationWrapper>
          <TitleWrapper>
            <Title>{fieldDoc.nombre}</Title>
            <Subtitle>Lote {lotDoc.properties.nombre}</Subtitle>
          </TitleWrapper>
        </MainInfo>

        <StatsContainer>
          <StatBox>
            <StatIcon>
              <Ruler size={20} strokeWidth={2} color="#0284c7" />
            </StatIcon>
            <StatInfo>
              <StatValue>{hectareas} has</StatValue>
              <StatLabel>Superficie</StatLabel>
            </StatInfo>
          </StatBox>

          <StatBox>
            <StatIcon>
              <ClipboardList size={20} strokeWidth={2} color="#0284c7" />
            </StatIcon>
            <StatInfo>
              <StatValue>{actividadesPendientes}</StatValue>
              <StatLabel>Act. Pendientes</StatLabel>
            </StatInfo>
          </StatBox>

          {diasHastaProximaActividad !== null && (
            <StatBox>
              <StatIcon>
                <Calendar size={20} strokeWidth={2} color="#0284c7" />
              </StatIcon>
              <StatInfo>
                <StatValue>
                  {diasHastaProximaActividad <= 0
                    ? 'Hoy'
                    : diasHastaProximaActividad === 1
                      ? 'Mañana'
                      : `${diasHastaProximaActividad} días`}
                </StatValue>
                <StatLabel>Próx. Actividad</StatLabel>
              </StatInfo>
            </StatBox>
          )}
        </StatsContainer>
      </ContentWrapper>
    </ModernHeader>
  )
}

export default Header