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
import { es } from "date-fns/locale";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/Opacity";
import WindPowerIcon from "@mui/icons-material/Air";

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
      <Tooltip title={`Temperatura desde ${min} hasta ${max} grados`}>
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
      <Tooltip title={`Humedad desde ${min}% hasta ${max}%`}>
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
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <WindPowerIcon color="primary" />
      <Tooltip title={`Velocidad del viento desde ${min} hasta ${max} km/h`}>
        <Box sx={{ width: "160%" }}>
          {" "}
          <WindGauge variant="determinate" value={(min + max) / 2} />
        </Box>
      </Tooltip>
      <Typography
        variant="body2"
        sx={{ width: "30%" }}
      >{`${min} - ${max} km/h`}</Typography>{" "}
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
}) {
  const hasDosis =
    activity.detalles &&
    activity.detalles.dosis &&
    activity.detalles.dosis.length > 0;
  const formattedDate = activity.detalles.fecha_ejecucion_tentativa
    ? format(parseISO(activity.detalles.fecha_ejecucion_tentativa), "PPPP", {
        locale: es
      })
    : "No especificada";

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
          <StyledEventNoteIcon />
          <DateBadge>
            <Typography sx={{ fontWeight: "bold" }}>
              Fecha Estimada de Aplicación:
            </Typography>
            <Typography sx={{ ml: 1 }}>{formattedDate}</Typography>
          </DateBadge>
        </Box>
      )}

      {hasDosis &&
        activity.detalles.dosis.map((dosis, index) => (
          <CustomAccordion key={index}>
            <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Insumos</Typography>
            </CustomAccordionSummary>
            <CustomAccordionDetails>
              <Typography>
                {dosis.insumo.marca_comercial} - {dosis.insumo.precio}{" "}
                {dosis.insumo.unidad}
              </Typography>
            </CustomAccordionDetails>
          </CustomAccordion>
        ))}

      <CustomAccordion>
        <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Contratista</Typography>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography>
            {activity.contratista
              ? activity.contratista.nombre
              : "No especificado"}
          </Typography>
        </CustomAccordionDetails>
      </CustomAccordion>

      <CustomAccordion>
        <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Condiciones esperadas de trabajo</Typography>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <TemperatureIndicator
            min={activity.condiciones.temperatura_min}
            max={activity.condiciones.temperatura_max}
          />
          <HumidityIndicator
            min={activity.condiciones.humedad_min}
            max={activity.condiciones.humedad_max}
          />
          <WindIndicator
            min={activity.condiciones.velocidad_min}
            max={activity.condiciones.velocidad_max}
          />
        </CustomAccordionDetails>
      </CustomAccordion>

      <CustomAccordion>
        <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Observaciones</Typography>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography>
            {activity.comentario || "No hay observaciones"}
          </Typography>
        </CustomAccordionDetails>
      </CustomAccordion>
    </>
  );
});

export default PlanificationContent;
