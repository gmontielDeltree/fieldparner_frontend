import React, { useEffect } from "react";
import Typography from "@mui/material/Typography";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Paper,
  Tooltip,
  LinearProgress
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { styled } from "@mui/material/styles";
import { format, parseISO } from "date-fns";
import { es, enUS, pt } from "date-fns/locale";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/Opacity";
import WindPowerIcon from "@mui/icons-material/Air";
import { Actividad } from "../../../../../interfaces/activity";
import { useTranslation } from 'react-i18next';

const CustomAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `rgba(255, 255, 255, 0.5)`,
  backdropFilter: "blur(10px)",
  boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
  "&:not(:last-child)": {
    borderBottom: 0
  },
  "&:before": {
    display: "none"
  },
  "&.Mui-expanded": {
    margin: theme.spacing(1, 0)
  },
  "& .MuiAccordionSummary-root": {
    backgroundColor: `rgba(255, 255, 255, 0.5)`,
    "&.Mui-expanded": {
      backgroundColor: `rgba(255, 255, 255, 0.7)`
    }
  },
  color: theme.palette.getContrastText(theme.palette.background.paper)
}));

const TemperatureGauge = styled(LinearProgress)(({ theme, value }) => ({
  height: 10,
  borderRadius: 5,
  "& .MuiLinearProgress-bar": {
    backgroundColor:
      value > 30 ? theme.palette.error.main : theme.palette.info.main
  }
}));
const HumidityGauge = styled(LinearProgress)(({ theme, value }) => ({
  height: 10,
  borderRadius: 5,
  "& .MuiLinearProgress-bar": {
    backgroundColor:
      value > 70 ? theme.palette.warning.main : theme.palette.primary.main
  }
}));

const WindGauge = styled(LinearProgress)(({ theme, value }) => ({
  height: 10,
  borderRadius: 5,
  "& .MuiLinearProgress-bar": {
    backgroundColor: theme.palette.secondary.main
  }
}));

function TemperatureIndicator({ min, max }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        marginBottom: "20px"
      }}
    >
      <ThermostatIcon color="primary" />
      <Tooltip title={t('temperatureRangeTooltip', { min, max })}>
        <Box sx={{ width: "160%" }}>
          {" "}
          <TemperatureGauge variant="determinate" value={(min + max) / 2} />
        </Box>
      </Tooltip>
      <Typography
        variant="body2"
        sx={{ width: "30%" }}
      >{`${min}°C - ${max}°C`}</Typography>{" "}
    </Box>
  );
}

function HumidityIndicator({ min, max }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        marginBottom: "20px"
      }}
    >
      <WaterDropIcon color="primary" />
      <Tooltip title={t('humidityRangeTooltip', { min, max })}>
        <Box sx={{ width: "160%" }}>
          {" "}
          <HumidityGauge variant="determinate" value={(min + max) / 2} />
        </Box>
      </Tooltip>
      <Typography
        variant="body2"
        sx={{ width: "30%" }}
      >{`${min}% - ${max}%`}</Typography>{" "}
    </Box>
  );
}

function WindIndicator({ min, max }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <WindPowerIcon color="primary" />
      <Tooltip title={t('windSpeedRangeTooltip', { min, max })}>
        <Box sx={{ width: "160%" }}>
          {" "}
          <WindGauge variant="determinate" value={(min + max) / 2} />
        </Box>
      </Tooltip>
      <Typography
        variant="body2"
        sx={{ width: "30%" }}
      >{`${min} - ${max} ${t('kmh')}`}</Typography>{" "}
    </Box>
  );
}

const DateBadge = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5))`,
  color: theme.palette.getContrastText(theme.palette.background.paper),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0 4px 8px 0 rgba(0,0,0,0.2)`,
  backdropFilter: "blur(10px)"
}));

const StyledEventNoteIcon = styled(EventNoteIcon)(({ theme }) => ({
  fontSize: "2.3rem",
  color: `rgba(255, 255, 255, 0.9)`,
  borderRadius: "50%",
  padding: "5px"
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  "&.Mui-expanded": {
    minHeight: 48
  },
  "& .MuiAccordionSummary-content.Mui-expanded": {
    margin: "12px 0"
  }
}));

const CustomAccordionDetails = styled(AccordionDetails)({
  flexDirection: "column",
  padding: "16px"
});

const PlanificationContent = React.memo(function PlanificationContent({
  activity,
  showEstimatedApplicationDate = true
}: {
  activity: Actividad;
  showEstimatedApplicationDate: boolean;
}) {
  const { t, i18n } = useTranslation();

  // Determine date-fns locale based on current language
  const getDateLocale = () => {
    const lang = i18n.language;
    if (lang.startsWith('es')) return es;
    if (lang.startsWith('pt')) return pt;
    return enUS; // Default to English
  };

  const hasDosis =
    activity?.detalles?.dosis &&
    Array.isArray(activity.detalles.dosis) &&
    activity.detalles.dosis.length > 0;

  const formattedDate = activity?.detalles?.fecha_ejecucion_tentativa
    ? format(parseISO(activity.detalles.fecha_ejecucion_tentativa), "PPPP", {
      locale: getDateLocale()
    })
    : t('notSpecified');

  return (
    <>
      {showEstimatedApplicationDate && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <StyledEventNoteIcon
            onContextMenu={() => {
              console.log(" CTX MENU on BTN");
              let something = window.open(
                "data:text/json," +
                encodeURIComponent(JSON.stringify(activity, undefined, 4)),
                "_blank"
              );
              something.document.open();
              something.document.write(
                `<html><body><pre>${JSON.stringify(
                  activity,
                  undefined,
                  4
                )}</pre></body></html>`
              );
              something.document.close();
              something?.focus();
            }}
          />
          <DateBadge>
            <Typography sx={{ fontWeight: "bold" }}>
              {t('estimatedApplicationDate')}:
            </Typography>
            <Typography sx={{ ml: 1 }}>{formattedDate}</Typography>
          </DateBadge>
        </Box>
      )}

      {hasDosis && (
        <CustomAccordion>
          <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('inputs')}</Typography>
          </CustomAccordionSummary>
          <CustomAccordionDetails
            sx={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {activity.detalles.dosis.map((lineaInsumo, index) => {
              const insumoName = lineaInsumo?.insumo?.name ?? t('notSpecified');
              const insumoBrand = lineaInsumo?.insumo?.brand ?? '';
              const insumoUnit = lineaInsumo?.insumo?.unitMeasurement ?? t('unit');
              const dosis = lineaInsumo?.dosis ?? 0;
              const total = lineaInsumo?.total ?? 0;
              const maxTotal = lineaInsumo?.maxTotal ?? 1;
              const precioEstimado = lineaInsumo?.precio_estimado ?? 0;

              return (
                <Paper
                  elevation={3}
                  sx={{
                    padding: "10px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  key={index}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <Typography variant="body1">
                      <strong>{insumoName}</strong>
                      {insumoBrand && ` - ${insumoBrand}`}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "20px" }}
                  >
                    <Typography variant="body2">
                      {dosis} {insumoUnit}/{t('hectare')}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((total / maxTotal) * 100, 100)}
                      sx={{ width: "100px" }}
                    />
                    <Typography variant="body2">
                      {total} {insumoUnit}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    ${(precioEstimado * total).toFixed(2)} USD
                  </Typography>
                </Paper>
              );
            })}
          </CustomAccordionDetails>
        </CustomAccordion>
      )}

      <CustomAccordion>
        <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{t('contractor')}</Typography>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography>
            {t('fullName')}:{" "}
            {activity?.detalles?.contratista?.nombreCompleto || t('notSpecified')}
          </Typography>
          <Typography>
            {t('businessName')}:{" "}
            {activity?.detalles?.contratista?.razonSocial || t('notSpecified')}
          </Typography>
          <Typography>
            {t('taxId')}:{" "}
            {activity?.detalles?.contratista?.cuit || t('notSpecified')}
          </Typography>
        </CustomAccordionDetails>
      </CustomAccordion>

      <CustomAccordion>
        <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{t('expectedWorkingConditions')}</Typography>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
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
        </CustomAccordionDetails>
      </CustomAccordion>

      <CustomAccordion>
        <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{t('observations')}</Typography>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography>
            {activity?.comentario || t('noObservations')}
          </Typography>
        </CustomAccordionDetails>
      </CustomAccordion>
    </>
  );
});

export default PlanificationContent;