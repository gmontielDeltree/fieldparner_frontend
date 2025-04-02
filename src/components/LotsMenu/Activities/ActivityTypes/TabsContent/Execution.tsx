import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  styled,
  Button,
  CardActions
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import EcoIcon from "@mui/icons-material/Nature";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PlanificationContent from "./Planification";
import { dbContext } from "../../../../../services";
import { Ejecucion } from "../../../../../interfaces/activity";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const FrostedGlassButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  padding: "10px 20px",
  color: theme.palette.getContrastText(theme.palette.background.paper),
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(12px)",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)"
  },
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: theme.palette.primary.light,
    opacity: 0.1,
    transition: "opacity 0.3s ease"
  },
  "&:hover:before": {
    opacity: 0.2
  }
}));

function ExecutionContent(props) {
  const { activity, handleEditActivity } = props;
  const [execution, setExecution] = useState<Ejecucion>(null);
  const db = dbContext.fields;
  const { t } = useTranslation();

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

  const executedStyle = {
    color: "green",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "space-between"
  };

  const pendingStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "orange",
    width: "100%"
  };

  return (
    <>
      <Card
        elevation={4}
        sx={{
          mt: 2,
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          backgroundImage:
            "linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
          marginBottom: "20px"
        }}
      >
        <CardContent>
          {execution ? (
            <>
              <Box sx={executedStyle}>
                <CheckCircleOutlineIcon color="success" />
                <Typography variant="body1">
                  {execution.estado === "completada" ||
                    execution.estado === "ejecutada"
                    ? `${t('executedOn')}: ${format(new Date(
                      execution.detalles.fecha_ejecucion
                    ), "dd/MM/yyyy")}`
                    : t('activityNotExecuted')}
                </Typography>
                <Box>
                  {execution.estado !== "pendiente" && (
                    <>
                      {/* <Chip
                        icon={<LocationOnIcon />}
                        label={`Lote: ${execution.lote_uuid || "N/A"}`}
                        style={{ margin: "5px" }}
                      /> */}
                      <Chip
                        icon={<BusinessIcon />}
                        label={`${t('contractor')}: ${execution.contratista
                          ? execution.contratista.nombreCompleto + "-" + execution.contratista.razonSocial
                          : t('notAvailable')
                          }`}
                        style={{ margin: "5px" }}
                      />
                      {execution.ingeniero && (
                        <Chip
                          icon={<EcoIcon />}
                          label={`${t('engineer')}: ${execution.ingeniero.nombre}`}
                          style={{ margin: "5px" }}
                        />
                      )}
                      {/* <Chip
                        icon={<EventIcon />}
                        label={`Tipo: ${execution.tipo || "N/A"}`}
                      /> */}
                    </>
                  )}
                </Box>
              </Box>
              {execution.estado === "ejecutada" && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {t('activityExecutedNotCompleted')}
                </Typography>
              )}
            </>
          ) : (
            <Box sx={pendingStyle}>
              <HourglassEmptyIcon color="warning" />
              <Typography variant="body1" sx={{ ml: 1 }}>
                {t('activityNotExecuted')}
              </Typography>
            </Box>
          )}
        </CardContent>
        {(execution?.estado === "ejecutada" || !execution) && (
          <CardActions>
            <FrostedGlassButton
              variant="contained"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() =>
                handleEditActivity(activity, true)//execution?.estado === "ejecutada")
              }
              sx={{ margin: "auto", marginTop: "10px", marginBottom: "20px" }}
            >
              {execution?.estado === "ejecutada"
                ? t('completeActivity')
                : t('executeActivity')}
            </FrostedGlassButton>
          </CardActions>
        )}
      </Card>
      {execution?.estado === "completada" && (
        <PlanificationContent
          activity={execution}
          showEstimatedApplicationDate={false}
        />
      )}
    </>
  );
}

export default ExecutionContent;