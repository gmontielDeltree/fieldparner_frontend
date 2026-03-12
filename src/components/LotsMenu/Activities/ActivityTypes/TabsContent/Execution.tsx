import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Chip,
  Button,
  Paper,
  Avatar,
  Grid,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import StraightenIcon from "@mui/icons-material/Straighten";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CampaignIcon from "@mui/icons-material/Campaign";
import GrassIcon from "@mui/icons-material/Grass";
import CommentIcon from "@mui/icons-material/Comment";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { styled, alpha } from "@mui/material/styles";
import { dbContext } from "../../../../../services";
import { Ejecucion } from "../../../../../interfaces/activity";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

// ─── Styled Components (matching Planification design) ──────────────

const StatusCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: 'rgba(145, 158, 171, 0.16) 0px 1px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 16px -4px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

const StatusBanner = styled(Box)<{ status?: string }>(({ theme, status }) => {
  const isExecuted = status === 'completada' || status === 'ejecutada';
  const color = isExecuted ? theme.palette.success.main : theme.palette.warning.main;
  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2.5),
    background: `linear-gradient(135deg, ${alpha(color, 0.06)} 0%, ${alpha(color, 0.02)} 100%)`,
    borderBottom: `1px solid ${alpha(color, 0.1)}`,
  };
});

const StatusIconBox = styled(Box)<{ status?: string }>(({ theme, status }) => {
  const isExecuted = status === 'completada' || status === 'ejecutada';
  const color = isExecuted ? theme.palette.success.main : theme.palette.warning.main;
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${color}, ${isExecuted ? theme.palette.success.dark : theme.palette.warning.dark})`,
    color: '#fff',
    flexShrink: 0,
  };
});

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

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 28px',
  fontWeight: 600,
  fontSize: '0.85rem',
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || '#1565c0'})`,
  color: '#fff',
  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.2s ease',
  "&:hover": {
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'translateY(-1px)',
  },
}));

// ─── Component ──────────────────────────────────────────────────────

function ExecutionContent(props) {
  const { activity, handleEditActivity } = props;
  const [execution, setExecution] = useState<Ejecucion>(null);
  const db = dbContext.fields;
  const { t, i18n } = useTranslation();
  const isPortuguese = i18n.language?.startsWith('pt');
  const isSpanish = i18n.language?.startsWith('es');

  // Convert stored ton/ha value to display unit
  const formatYield = (tonValue: number) => {
    if (isSpanish) return (tonValue * 10).toFixed(2);  // quintales
    if (isPortuguese) return (tonValue * 1000 / 60).toFixed(2);  // sacas
    return tonValue;
  };
  const yieldUnit = isSpanish ? 'qq/ha' : isPortuguese ? 'sc/ha' : 'ton/ha';
  const getHarvestKgObtained = (executionDoc: Ejecucion | null) => {
    const yieldTonPerHa = Number(executionDoc?.detalles?.rinde_obtenido || 0);
    const hectares = Number(executionDoc?.detalles?.hectareas || 0);
    if (!yieldTonPerHa || !hectares) return 0;
    return yieldTonPerHa * hectares * 1000;
  };

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const response = await db.find({
          selector: { actividad_uuid: activity.uuid }
        });
        if (response.docs.length > 0) {
          setExecution(response.docs[0]);
        } else {
          setExecution(null);
        }
      } catch (error) {
        console.error("Error fetching executions:", error);
        setExecution(null);
      }
    };

    if (activity.uuid) {
      fetchExecution();
    }
  }, [activity.uuid, db]);

  const getBusinessName = (business: any) => {
    if (!business) return t('notAvailable');
    if (typeof business === 'string') return business.length > 30 ? t('notAvailable') : business;
    return business.nombreCompleto || business.razonSocial || business.name || business.nombreComercial || t('notAvailable');
  };

  const executionStatus = execution?.estado || 'pendiente';
  const isCompleted = executionStatus === 'completada';
  const isExecuted = executionStatus === 'ejecutada';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* ── Status Card ───────────────────────────────── */}
      <StatusCard elevation={0}>
        <StatusBanner status={executionStatus}>
          <StatusIconBox status={executionStatus}>
            {execution
              ? <CheckCircleOutlineIcon sx={{ fontSize: '1.3rem' }} />
              : <HourglassEmptyIcon sx={{ fontSize: '1.3rem' }} />
            }
          </StatusIconBox>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('execution')}
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.primary', lineHeight: 1.3 }}>
              {execution
                ? (isCompleted || isExecuted)
                  ? `${t('executedOn')}: ${format(new Date(execution.detalles.fecha_ejecucion), "dd/MM/yyyy")}`
                  : t('activityNotExecuted')
                : t('activityNotExecuted')
              }
            </Typography>
          </Box>
          {execution && (
            <Chip
              label={executionStatus}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '8px',
                backgroundColor: (theme) =>
                  isCompleted
                    ? alpha(theme.palette.success.main, 0.1)
                    : isExecuted
                      ? alpha(theme.palette.info.main, 0.1)
                      : alpha(theme.palette.warning.main, 0.1),
                color: (theme) =>
                  isCompleted
                    ? theme.palette.success.dark
                    : isExecuted
                      ? theme.palette.info.dark
                      : theme.palette.warning.dark,
              }}
            />
          )}
        </StatusBanner>

        {execution && execution.estado !== "pendiente" && (
          <Box sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {execution.detalles?.contratista && (
              <Chip
                icon={<PersonIcon sx={{ fontSize: '0.9rem !important' }} />}
                label={`${t('contractor')}: ${execution.detalles.contratista.nombreCompleto || execution.detalles.contratista.razonSocial || t('notAvailable')}`}
                size="small"
                sx={{
                  height: 28,
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
                }}
              />
            )}
            {execution.ingeniero && (
              <Chip
                icon={<AgricultureIcon sx={{ fontSize: '0.9rem !important' }} />}
                label={`${t('engineer')}: ${execution.ingeniero.nombre}`}
                size="small"
                sx={{
                  height: 28,
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
                }}
              />
            )}
          </Box>
        )}

        {isExecuted && (
          <Box sx={{ px: 2.5, pb: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: (theme) => alpha(theme.palette.info.main, 0.04),
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                {t('activityExecutedNotCompleted')}
              </Typography>
            </Paper>
          </Box>
        )}

        {(isExecuted || !execution) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2.5, pt: execution ? 1.5 : 2.5 }}>
            <ActionButton
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() => handleEditActivity(activity, true)}
            >
              {isExecuted ? t('completeActivity') : t('executeActivity')}
            </ActionButton>
          </Box>
        )}
      </StatusCard>

      {/* ── Execution Details ─────────────────────────── */}
      {isCompleted && execution && (
        <StatusCard elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, pb: 0 }}>
            <SectionIcon><InfoOutlinedIcon /></SectionIcon>
            <SectionTitle>{t('executionDetails')}</SectionTitle>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow>
                  <EventIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Box>
                    <InfoLabel>{t('executionDate')}</InfoLabel>
                    <InfoValue>
                      {execution.detalles?.fecha_ejecucion
                        ? format(new Date(execution.detalles.fecha_ejecucion), "dd/MM/yyyy")
                        : t('notAvailable')}
                    </InfoValue>
                  </Box>
                </InfoRow>
              </Grid>

              <Grid item xs={12} sm={6}>
                <InfoRow>
                  <StraightenIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Box>
                    <InfoLabel>{t('hectares')}</InfoLabel>
                    <InfoValue>{execution.detalles?.hectareas || 0} ha</InfoValue>
                  </Box>
                </InfoRow>
              </Grid>

              {execution.detalles?.cultivo && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <AgricultureIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('crop')}</InfoLabel>
                      <InfoValue>
                        {execution.detalles.cultivo.descriptionES || execution.detalles.cultivo.name || t('notAvailable')}
                      </InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {(execution.campaña || execution.campanaId) && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <CampaignIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('campaign')}</InfoLabel>
                      <InfoValue>
                        {execution.campaña?.name || execution.campaña?.campaignId || execution.campanaId || t('notAvailable')}
                      </InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {(execution.detalles?.zafra || execution.zafra) && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <GrassIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('Zafra')}</InfoLabel>
                      <InfoValue>{execution.detalles?.zafra || execution.zafra}</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {execution.detalles?.contratista && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <PersonIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('contractor')}</InfoLabel>
                      <InfoValue>
                        {execution.detalles.contratista.nombreCompleto || execution.detalles.contratista.razonSocial || t('notAvailable')}
                      </InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {execution.tipo === "cosecha" && execution.detalles?.deposito && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <WarehouseIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('deposit_label')}</InfoLabel>
                      <InfoValue>
                        {execution.detalles.deposito.description || execution.detalles.deposito.name || execution.detalles.deposito.nombreDeposito || t('notAvailable')}
                      </InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {execution.tipo === "cosecha" && execution.detalles?.rinde_obtenido && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <TrendingUpIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('yield')}</InfoLabel>
                      <InfoValue>{formatYield(Number(execution.detalles.rinde_obtenido))} {yieldUnit}</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {execution.tipo === "cosecha" && execution.detalles?.rinde_obtenido && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <AgricultureIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('kgObtained')}</InfoLabel>
                      <InfoValue>{getHarvestKgObtained(execution).toLocaleString('es-AR')} kg</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {execution.detalles?.fecha_hora_inicio && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('startTime')}</InfoLabel>
                      <InfoValue>{format(new Date(execution.detalles.fecha_hora_inicio), "HH:mm")}</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {execution.detalles?.fecha_hora_fin && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('endTime')}</InfoLabel>
                      <InfoValue>{format(new Date(execution.detalles.fecha_hora_fin), "HH:mm")}</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}

              {execution.detalles?.business && (
                <Grid item xs={12} sm={6}>
                  <InfoRow>
                    <PersonIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Box>
                      <InfoLabel>{t('engineer')}</InfoLabel>
                      <InfoValue>{getBusinessName(execution.detalles.business)}</InfoValue>
                    </Box>
                  </InfoRow>
                </Grid>
              )}
            </Grid>

            {execution.observaciones && (
              <Box sx={{ mt: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CommentIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {t('observations')}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontStyle: 'italic', lineHeight: 1.6 }}>
                    {execution.observaciones}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </StatusCard>
      )}

      {/* ── Quick Info (when executed but not completed) ── */}
      {execution && !isCompleted && (
        <StatusCard elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, pb: 0 }}>
            <SectionIcon><InfoOutlinedIcon /></SectionIcon>
            <SectionTitle>{t('executionDetails')}</SectionTitle>
          </Box>

          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {execution.detalles?.fecha_ejecucion && (
              <InfoRow>
                <EventIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('executionDate')}</InfoLabel>
                  <InfoValue>{format(new Date(execution.detalles.fecha_ejecucion), "dd/MM/yyyy")}</InfoValue>
                </Box>
              </InfoRow>
            )}

            {execution.detalles?.hectareas && (
              <InfoRow>
                <StraightenIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('hectares')}</InfoLabel>
                  <InfoValue>{execution.detalles.hectareas} ha</InfoValue>
                </Box>
              </InfoRow>
            )}

            {execution.detalles?.cultivo?.name && (
              <InfoRow>
                <AgricultureIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('crop')}</InfoLabel>
                  <InfoValue>{execution.detalles.cultivo.name}</InfoValue>
                </Box>
              </InfoRow>
            )}

            {(execution.campaña || execution.campanaId) && (
              <InfoRow>
                <CampaignIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('campaign')}</InfoLabel>
                  <InfoValue>{execution.campaña?.name || execution.campaña?.campaignId || execution.campanaId}</InfoValue>
                </Box>
              </InfoRow>
            )}

            {(execution.detalles?.zafra || execution.zafra) && (
              <InfoRow>
                <GrassIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('Zafra')}</InfoLabel>
                  <InfoValue>{execution.detalles?.zafra || execution.zafra}</InfoValue>
                </Box>
              </InfoRow>
            )}

            {execution.tipo === 'cosecha' && execution.detalles?.deposito && (
              <InfoRow>
                <WarehouseIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('deposit_label')}</InfoLabel>
                  <InfoValue>{execution.detalles.deposito.description || execution.detalles.deposito.name}</InfoValue>
                </Box>
              </InfoRow>
            )}

            {execution.tipo === 'cosecha' && execution.detalles?.rinde_obtenido && (
              <InfoRow>
                <TrendingUpIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('yield')}</InfoLabel>
                  <InfoValue>{formatYield(Number(execution.detalles.rinde_obtenido))} {yieldUnit}</InfoValue>
                </Box>
              </InfoRow>
            )}

            {execution.tipo === 'cosecha' && execution.detalles?.rinde_obtenido && (
              <InfoRow>
                <AgricultureIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Box>
                  <InfoLabel>{t('kgObtained')}</InfoLabel>
                  <InfoValue>{getHarvestKgObtained(execution).toLocaleString('es-AR')} kg</InfoValue>
                </Box>
              </InfoRow>
            )}
          </Box>
        </StatusCard>
      )}
    </Box>
  );
}

export default ExecutionContent;
