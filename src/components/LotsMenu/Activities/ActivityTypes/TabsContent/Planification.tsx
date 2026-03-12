import React from "react";
import Typography from "@mui/material/Typography";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Paper,
  Tooltip,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Divider,
  Grid,
  Avatar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EventNoteIcon from "@mui/icons-material/EventNote";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";
import TuneIcon from "@mui/icons-material/Tune";
import CommentIcon from "@mui/icons-material/Comment";
import GrassIcon from "@mui/icons-material/Grass";
import StraightenIcon from "@mui/icons-material/Straighten";
import ScaleIcon from "@mui/icons-material/Scale";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { styled, alpha } from "@mui/material/styles";
import { format, parseISO } from "date-fns";
import { es, enUS, pt } from "date-fns/locale";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/Opacity";
import WindPowerIcon from "@mui/icons-material/Air";
import { Actividad } from "../../../../../interfaces/activity";
import { useTranslation } from 'react-i18next';

// ─── Styled Components ──────────────────────────────────────────────

const SectionAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  borderRadius: '16px !important',
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'rgba(145, 158, 171, 0.16) 0px 1px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 16px -4px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease-in-out',
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: theme.spacing(0, 0, 1.5, 0),
    boxShadow: 'rgba(145, 158, 171, 0.2) 0px 2px 4px 0px, rgba(145, 158, 171, 0.14) 0px 12px 24px -4px',
  },
  "& .MuiAccordionSummary-root": {
    minHeight: 56,
    "&.Mui-expanded": {
      minHeight: 56,
    },
  },
}));

const SectionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(0, 2.5),
  "& .MuiAccordionSummary-content": {
    margin: "12px 0",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    "&.Mui-expanded": {
      margin: "12px 0",
    },
  },
}));

const SectionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0, 2.5, 2.5, 2.5),
}));

const SectionIcon = styled(Avatar)(({ theme }) => ({
  width: 34,
  height: 34,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  "& .MuiSvgIcon-root": {
    fontSize: "1.15rem",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  letterSpacing: '-0.01em',
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(0.8, 0),
  "&:not(:last-child)": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  minWidth: 130,
  flexShrink: 0,
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

const SupplyCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: '12px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: 'none',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  transition: 'background-color 0.15s ease',
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const SupplyName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
}));

const SupplyMeta = styled(Typography)(({ theme }) => ({
  fontSize: '0.78rem',
  color: theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const MetricChip = styled(Chip)(({ theme }) => ({
  height: 26,
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.75rem',
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  "& .MuiChip-label": {
    padding: '0 8px',
  },
}));

const ServiceTable = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  "& .MuiTableHead-root": {
    "& .MuiTableCell-root": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      fontWeight: 600,
      fontSize: '0.78rem',
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      padding: theme.spacing(1.2, 2),
    },
  },
  "& .MuiTableBody-root .MuiTableCell-root": {
    fontSize: '0.84rem',
    padding: theme.spacing(1.2, 2),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
  },
  "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root": {
    borderBottom: 'none',
  },
}));

const DateBanner = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: '14px',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginBottom: theme.spacing(2),
}));

const DateIconBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || '#1565c0'})`,
  color: '#fff',
  flexShrink: 0,
}));

// ─── Gauge indicators ───────────────────────────────────────────────

const GaugeContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 0),
  "&:not(:last-child)": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    paddingBottom: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
  },
}));

const GaugeIconBox = styled(Box)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  borderRadius: '10px',
  backgroundColor: bgcolor || alpha(theme.palette.primary.main, 0.08),
  flexShrink: 0,
}));

const GaugeBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  flex: 1,
  backgroundColor: alpha(theme.palette.grey[300], 0.4),
}));

const GaugeValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  minWidth: 95,
  textAlign: 'right',
  flexShrink: 0,
}));

function TemperatureIndicator({ min, max }) {
  const { t } = useTranslation();
  return (
    <GaugeContainer>
      <Tooltip title={t('temperatureRangeTooltip', { min, max })}>
        <GaugeIconBox bgcolor="rgba(239, 83, 80, 0.08)">
          <ThermostatIcon sx={{ fontSize: '1.1rem', color: '#ef5350' }} />
        </GaugeIconBox>
      </Tooltip>
      <GaugeBar
        variant="determinate"
        value={Math.min(((min + max) / 2 / 50) * 100, 100)}
        sx={{
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: (min + max) / 2 > 30
              ? 'linear-gradient(90deg, #ff9800, #ef5350)'
              : 'linear-gradient(90deg, #42a5f5, #1976d2)',
          },
        }}
      />
      <GaugeValue>{min}°C - {max}°C</GaugeValue>
    </GaugeContainer>
  );
}

function HumidityIndicator({ min, max }) {
  const { t } = useTranslation();
  return (
    <GaugeContainer>
      <Tooltip title={t('humidityRangeTooltip', { min, max })}>
        <GaugeIconBox bgcolor="rgba(25, 118, 210, 0.08)">
          <WaterDropIcon sx={{ fontSize: '1.1rem', color: '#1976d2' }} />
        </GaugeIconBox>
      </Tooltip>
      <GaugeBar
        variant="determinate"
        value={Math.min((min + max) / 2, 100)}
        sx={{
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: (min + max) / 2 > 70
              ? 'linear-gradient(90deg, #1976d2, #0d47a1)'
              : 'linear-gradient(90deg, #42a5f5, #1976d2)',
          },
        }}
      />
      <GaugeValue>{min}% - {max}%</GaugeValue>
    </GaugeContainer>
  );
}

function WindIndicator({ min, max }) {
  const { t } = useTranslation();
  return (
    <GaugeContainer>
      <Tooltip title={t('windSpeedRangeTooltip', { min, max })}>
        <GaugeIconBox bgcolor="rgba(21, 70, 111, 0.08)">
          <WindPowerIcon sx={{ fontSize: '1.1rem', color: '#15466f' }} />
        </GaugeIconBox>
      </Tooltip>
      <GaugeBar
        variant="determinate"
        value={Math.min(((min + max) / 2 / 60) * 100, 100)}
        sx={{
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: 'linear-gradient(90deg, #78909c, #546e7a)',
          },
        }}
      />
      <GaugeValue>{min} - {max} {t('kmh')}</GaugeValue>
    </GaugeContainer>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

const PlanificationContent = React.memo(function PlanificationContent({
  activity,
  showEstimatedApplicationDate = true,
}: {
  activity: Actividad;
  showEstimatedApplicationDate: boolean;
}) {
  const { t, i18n } = useTranslation();

  const getDateLocale = () => {
    const lang = i18n.language;
    if (lang.startsWith('es')) return es;
    if (lang.startsWith('pt')) return pt;
    return enUS;
  };

  const hasDosis =
    activity?.detalles?.dosis &&
    Array.isArray(activity.detalles.dosis) &&
    activity.detalles.dosis.length > 0;

  const hasServicios =
    activity?.detalles?.servicios &&
    Array.isArray(activity.detalles.servicios) &&
    activity.detalles.servicios.length > 0;

  const isSowing = activity?.tipo === 'siembra';
  const isApplication = activity?.tipo === 'aplicacion';

  const hasSowingDetails = isSowing && (
    activity?.detalles?.tipo_siembra ||
    activity?.detalles?.densidad_objetivo ||
    activity?.detalles?.profundidad ||
    activity?.detalles?.distancia ||
    activity?.detalles?.peso_1000
  );

  const formattedDate = activity?.detalles?.fecha_ejecucion_tentativa
    ? format(parseISO(activity.detalles.fecha_ejecucion_tentativa), "PPP", {
      locale: getDateLocale(),
    })
    : t('notSpecified');

  const getCropName = () => {
    const crop = activity?.detalles?.cultivo;
    if (!crop) return t('notSpecified');
    const lang = i18n.language;
    if (lang.startsWith('es')) return crop.descriptionES || crop.descriptionEN || crop.name || t('notSpecified');
    if (lang.startsWith('pt')) return crop.descriptionPT || crop.descriptionES || crop.name || t('notSpecified');
    return crop.descriptionEN || crop.descriptionES || crop.name || t('notSpecified');
  };

  const getIngenieroName = () => {
    const ing = activity?.detalles?.business || activity?.detalles?.ingeniero;
    if (!ing) return null;
    if (typeof ing === 'string') return ing;
    return ing.nombreCompleto || ing.razonSocial || ing.name || ing.nombreComercial || null;
  };

  const getContractorDisplayName = (contratista: any) => {
    if (!contratista) return t('notSpecified');
    if (typeof contratista === 'object') {
      return contratista.nombreCompleto || contratista.razonSocial || contratista.name || t('notSpecified');
    }
    return contratista;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── Date Banner ─────────────────────────────────── */}
      {showEstimatedApplicationDate && (
        <DateBanner
          onContextMenu={() => {
            let something = window.open(
              "data:text/json," +
              encodeURIComponent(JSON.stringify(activity, undefined, 4)),
              "_blank"
            );
            something.document.open();
            something.document.write(
              `<html><body><pre>${JSON.stringify(activity, undefined, 4)}</pre></body></html>`
            );
            something.document.close();
            something?.focus();
          }}
        >
          <DateIconBox>
            <EventNoteIcon sx={{ fontSize: '1.3rem' }} />
          </DateIconBox>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('estimatedApplicationDate')}
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.primary', lineHeight: 1.3 }}>
              {formattedDate}
            </Typography>
          </Box>
        </DateBanner>
      )}

      {/* ── General ─────────────────────────────────────── */}
      <SectionAccordion defaultExpanded>
        <SectionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
          <SectionIcon><InfoOutlinedIcon /></SectionIcon>
          <SectionTitle>{t('general')}</SectionTitle>
        </SectionSummary>
        <SectionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InfoRow>
                <AgricultureIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('Crop')}</InfoLabel>
                  <InfoValue>
                    {getCropName()}
                    {activity?.detalles?.cultivo?.cropType && (
                      <Chip
                        label={activity.detalles.cultivo.cropType}
                        size="small"
                        sx={{ ml: 1, height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                      />
                    )}
                  </InfoValue>
                </Box>
              </InfoRow>
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow>
                <StraightenIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('Hectares')}</InfoLabel>
                  <InfoValue>{activity?.detalles?.hectareas || t('notSpecified')} ha</InfoValue>
                </Box>
              </InfoRow>
            </Grid>
            {getIngenieroName() && (
              <Grid item xs={12} sm={6}>
                <InfoRow>
                  <PersonIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Box>
                    <InfoLabel>{t('agronomist')}</InfoLabel>
                    <InfoValue>{getIngenieroName()}</InfoValue>
                  </Box>
                </InfoRow>
              </Grid>
            )}
            {activity?.detalles?.zafra && (
              <Grid item xs={12} sm={6}>
                <InfoRow>
                  <GrassIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Box>
                    <InfoLabel>{t('Zafra')}</InfoLabel>
                    <InfoValue>{activity.detalles.zafra}</InfoValue>
                  </Box>
                </InfoRow>
              </Grid>
            )}
            {isApplication && activity?.detalles?.fertilizacion && (
              <Grid item xs={12} sm={6}>
                <InfoRow>
                  <Box>
                    <InfoLabel>{t('Fertilization')}</InfoLabel>
                    <Chip label={t('yes')} size="small" color="success" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }} />
                  </Box>
                </InfoRow>
              </Grid>
            )}
            {isApplication && activity?.detalles?.fitosanitaria && (
              <Grid item xs={12} sm={6}>
                <InfoRow>
                  <Box>
                    <InfoLabel>{t('Phytosanitary')}</InfoLabel>
                    <Chip label={t('yes')} size="small" color="warning" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }} />
                  </Box>
                </InfoRow>
              </Grid>
            )}
          </Grid>
        </SectionDetails>
      </SectionAccordion>

      {/* ── Sowing Details ──────────────────────────────── */}
      {hasSowingDetails && (
        <SectionAccordion>
          <SectionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
            <SectionIcon><GrassIcon /></SectionIcon>
            <SectionTitle>{t('otherData')}</SectionTitle>
          </SectionSummary>
          <SectionDetails>
            <Grid container spacing={2}>
              {activity.detalles.tipo_siembra && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <Box>
                      <InfoLabel>{t('seedingType')}</InfoLabel>
                      <InfoValue>{activity.detalles.tipo_siembra}</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}
              {activity.detalles.densidad_objetivo && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <Box>
                      <InfoLabel>{t('targetDensity')}</InfoLabel>
                      <InfoValue>{activity.detalles.densidad_objetivo} plantas/ha</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}
              {activity.detalles.profundidad && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <Box>
                      <InfoLabel>{t('depth')}</InfoLabel>
                      <InfoValue>{activity.detalles.profundidad} cm</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}
              {activity.detalles.distancia && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <Box>
                      <InfoLabel>{t('rowSpacing')}</InfoLabel>
                      <InfoValue>{activity.detalles.distancia} cm</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}
              {activity.detalles.peso_1000 && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <Box>
                      <InfoLabel>{t('thousandSeedWeight')}</InfoLabel>
                      <InfoValue>{activity.detalles.peso_1000} grs</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}
            </Grid>
          </SectionDetails>
        </SectionAccordion>
      )}

      {/* ── Supplies ────────────────────────────────────── */}
      {hasDosis && (
        <SectionAccordion>
          <SectionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
            <SectionIcon><InventoryIcon /></SectionIcon>
            <SectionTitle>{t('inputs')}</SectionTitle>
            <Chip
              label={activity.detalles.dosis.length}
              size="small"
              sx={{ ml: 'auto', mr: 1, height: 22, minWidth: 28, fontSize: '0.72rem', fontWeight: 700, backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
            />
          </SectionSummary>
          <SectionDetails sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {activity.detalles.dosis.map((lineaInsumo, index) => {
              const insumoName = lineaInsumo?.insumo?.name ?? t('notSpecified');
              const insumoBrand = lineaInsumo?.insumo?.brand ?? '';
              const insumoType = lineaInsumo?.insumo?.type ?? '';
              const insumoUnit = lineaInsumo?.insumo?.unitMeasurement ?? t('unit');
              const dosisValue = lineaInsumo?.dosificacion ?? lineaInsumo?.dosis ?? 0;
              const total = lineaInsumo?.total ?? 0;
              const depositoName = lineaInsumo?.deposito?.description ?? '';
              const precioEstimado = lineaInsumo?.precio_estimado ?? 0;

              return (
                <SupplyCard elevation={0} key={lineaInsumo?.uuid || index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <SupplyName>{insumoName}</SupplyName>
                      {insumoBrand && (
                        <SupplyMeta>{insumoBrand}</SupplyMeta>
                      )}
                    </Box>
                    {insumoType && (
                      <Chip
                        label={insumoType}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                          color: 'secondary.main',
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <MetricChip
                      icon={<ScaleIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label={`${dosisValue} ${insumoUnit}/${t('hectare')}`}
                    />
                    <MetricChip
                      label={`${t('total')}: ${total} ${insumoUnit}`}
                    />
                    {depositoName && (
                      <Chip
                        icon={<WarehouseIcon sx={{ fontSize: '0.85rem !important' }} />}
                        label={depositoName}
                        size="small"
                        sx={{
                          height: 26,
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
                          color: 'text.secondary',
                        }}
                      />
                    )}
                    {precioEstimado > 0 && (
                      <Chip
                        label={`$${(precioEstimado * Number(total)).toFixed(2)} USD`}
                        size="small"
                        sx={{
                          height: 26,
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: (theme) => alpha(theme.palette.success.main, 0.08),
                          color: 'success.dark',
                        }}
                      />
                    )}
                  </Box>
                </SupplyCard>
              );
            })}
          </SectionDetails>
        </SectionAccordion>
      )}

      {/* ── Services ────────────────────────────────────── */}
      {hasServicios && (
        <SectionAccordion>
          <SectionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
            <SectionIcon><BuildIcon /></SectionIcon>
            <SectionTitle>{t('services')}</SectionTitle>
            <Chip
              label={activity.detalles.servicios.length}
              size="small"
              sx={{ ml: 'auto', mr: 1, height: 22, minWidth: 28, fontSize: '0.72rem', fontWeight: 700, backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
            />
          </SectionSummary>
          <SectionDetails>
            <ServiceTable>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('service')}</TableCell>
                    <TableCell>{t('contractor')}</TableCell>
                    <TableCell align="right">{t('units')}</TableCell>
                    <TableCell>{t('comment')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.detalles.servicios.map((svc, index) => {
                    const serviceName = svc?.servicio?.service || svc?.servicio?.name || t('notSpecified');
                    const contractorName = getContractorDisplayName(svc?.contratista);
                    const units = svc?.unidades ?? '';
                    const comment = svc?.comentario || '';

                    return (
                      <TableRow key={svc?.uuid || index} sx={{ '&:hover': { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.84rem' }}>{serviceName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>{contractorName}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          {units && <MetricChip label={`${units} ha`} />}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontStyle: comment ? 'normal' : 'italic' }}>
                            {comment || '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ServiceTable>
          </SectionDetails>
        </SectionAccordion>
      )}

      {/* ── Contractor ──────────────────────────────────── */}
      <SectionAccordion>
        <SectionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
          <SectionIcon><PersonIcon /></SectionIcon>
          <SectionTitle>{t('contractor')}</SectionTitle>
        </SectionSummary>
        <SectionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InfoRow>
                <Box>
                  <InfoLabel>{t('fullName')}</InfoLabel>
                  <InfoValue>{activity?.detalles?.contratista?.nombreCompleto || t('notSpecified')}</InfoValue>
                </Box>
              </InfoRow>
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow>
                <Box>
                  <InfoLabel>{t('businessName')}</InfoLabel>
                  <InfoValue>{activity?.detalles?.contratista?.razonSocial || t('notSpecified')}</InfoValue>
                </Box>
              </InfoRow>
            </Grid>
            {activity?.detalles?.contratista?.cuit && (
              <Grid item xs={12} sm={6}>
                <InfoRow>
                  <Box>
                    <InfoLabel>{t('taxId')}</InfoLabel>
                    <InfoValue>{activity.detalles.contratista.cuit}</InfoValue>
                  </Box>
                </InfoRow>
              </Grid>
            )}
          </Grid>
        </SectionDetails>
      </SectionAccordion>

      {/* ── Conditions ──────────────────────────────────── */}
      <SectionAccordion>
        <SectionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
          <SectionIcon><TuneIcon /></SectionIcon>
          <SectionTitle>{t('expectedWorkingConditions')}</SectionTitle>
        </SectionSummary>
        <SectionDetails>
          <TemperatureIndicator
            min={activity?.condiciones?.temperatura_min ?? 0}
            max={activity?.condiciones?.temperatura_max ?? 0}
          />
          <HumidityIndicator
            min={activity?.condiciones?.humedad_min ?? 0}
            max={activity?.condiciones?.humedad_max ?? 0}
          />
          <WindIndicator
            min={activity?.condiciones?.velocidad_min ?? 0}
            max={activity?.condiciones?.velocidad_max ?? 0}
          />
        </SectionDetails>
      </SectionAccordion>

      {/* ── Observations ────────────────────────────────── */}
      <SectionAccordion>
        <SectionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
          <SectionIcon><CommentIcon /></SectionIcon>
          <SectionTitle>{t('observations')}</SectionTitle>
        </SectionSummary>
        <SectionDetails>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.04),
              border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: activity?.comentario ? 'text.primary' : 'text.disabled',
                fontStyle: activity?.comentario ? 'normal' : 'italic',
                lineHeight: 1.6,
              }}
            >
              {activity?.comentario || t('noObservations')}
            </Typography>
          </Paper>
        </SectionDetails>
      </SectionAccordion>
    </Box>
  );
});

export default PlanificationContent;
