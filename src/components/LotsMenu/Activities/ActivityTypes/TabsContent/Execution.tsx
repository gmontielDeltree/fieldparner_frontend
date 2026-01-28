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
                        label={`${t('contractor')}: ${execution.detalles?.contratista
                          ? (execution.detalles.contratista.nombreCompleto || '') + (execution.detalles.contratista.razonSocial ? " - " + execution.detalles.contratista.razonSocial : '')
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
        <Card
          elevation={4}
          sx={{
            mt: 2,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", fontWeight: "bold" }}>
              {t('executionDetails')}
            </Typography>
            
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>
              {/* Información General */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('executionDate')}:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {execution.detalles?.fecha_ejecucion 
                    ? format(new Date(execution.detalles.fecha_ejecucion), "dd/MM/yyyy") 
                    : t('notAvailable')}
                </Typography>
              </Box>

              {/* Cultivo */}
              {execution.detalles?.cultivo && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('crop')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {execution.detalles.cultivo.descriptionES || 
                     execution.detalles.cultivo.name || 
                     t('notAvailable')}
                  </Typography>
                </Box>
              )}

              {/* Campaña */}
              {(execution.campaña || execution.campanaId) && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('campaign')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {execution.campaña?.name || 
                     execution.campaña?.campaignId ||
                     execution.campanaId ||
                     t('notAvailable')}
                  </Typography>
                </Box>
              )}

              {/* Zafra */}
              {(execution.detalles?.zafra || execution.zafra) && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('Zafra')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {execution.detalles?.zafra || execution.zafra}
                  </Typography>
                </Box>
              )}

              {/* Hectáreas */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('hectares')}:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {execution.detalles?.hectareas || 0} ha
                </Typography>
              </Box>

              {/* Contratista */}
              {execution.detalles?.contratista && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('contractor')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {execution.detalles.contratista.nombreCompleto || 
                     execution.detalles.contratista.razonSocial || 
                     t('notAvailable')}
                  </Typography>
                </Box>
              )}

              {/* Depósito - Solo para cosecha */}
              {execution.tipo === "cosecha" && execution.detalles?.deposito && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('deposit_label')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {execution.detalles.deposito.description || 
                     execution.detalles.deposito.name || 
                     execution.detalles.deposito.nombreDeposito || 
                     t('notAvailable')}
                  </Typography>
                </Box>
              )}

              {/* Rendimiento obtenido - Solo para cosecha */}
              {execution.tipo === "cosecha" && execution.detalles?.rinde_obtenido && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('yield')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {execution.detalles.rinde_obtenido} ton/ha
                  </Typography>
                </Box>
              )}

              {/* Horarios de ejecución */}
              {execution.detalles?.fecha_hora_inicio && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('startTime')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {format(new Date(execution.detalles.fecha_hora_inicio), "HH:mm")}
                  </Typography>
                </Box>
              )}

              {execution.detalles?.fecha_hora_fin && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('endTime')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {format(new Date(execution.detalles.fecha_hora_fin), "HH:mm")}
                  </Typography>
                </Box>
              )}

              {/* Ingeniero Agrónomo */}
              {execution.detalles?.business && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('engineer')}:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {typeof execution.detalles.business === 'string'
                      ? (execution.detalles.business.length > 30 ? t('notAvailable') : execution.detalles.business)
                      : (execution.detalles.business.nombreCompleto ||
                         execution.detalles.business.razonSocial ||
                         execution.detalles.business.name ||
                         execution.detalles.business.nombreComercial ||
                         t('notAvailable'))}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Observaciones si existen */}
            {execution.observaciones && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('observations')}:
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                  {execution.observaciones}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* T2-77: Mostrar info del primer paso al clickear Ejecución */}
      {execution && (
        <Card
          elevation={2}
          sx={{
            mt: 2,
            backgroundColor: "rgba(245, 245, 245, 0.8)",
            border: "1px solid rgba(200, 200, 200, 0.3)",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('executionDetails')}
            </Typography>
            
            {/* Información general del primer paso */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {execution.detalles?.fecha_ejecucion && (
                <Typography variant="body2">
                  <strong>{t('executionDate')}:</strong> {format(new Date(execution.detalles.fecha_ejecucion), "dd/MM/yyyy")}
                </Typography>
              )}
              
              {execution.detalles?.hectareas && (
                <Typography variant="body2">
                  <strong>{t('hectares')}:</strong> {execution.detalles.hectareas} ha
                </Typography>
              )}
              
              {execution.detalles?.cultivo?.name && (
                <Typography variant="body2">
                  <strong>{t('crop')}:</strong> {execution.detalles.cultivo.name}
                </Typography>
              )}

              {(execution.campaña || execution.campanaId) && (
                <Typography variant="body2">
                  <strong>{t('campaign')}:</strong> {execution.campaña?.name || execution.campaña?.campaignId || execution.campanaId}
                </Typography>
              )}

              {(execution.detalles?.zafra || execution.zafra) && (
                <Typography variant="body2">
                  <strong>{t('Zafra')}:</strong> {execution.detalles?.zafra || execution.zafra}
                </Typography>
              )}
              
              {(execution.detalles?.deposito?.description || execution.detalles?.deposito?.name) && execution.tipo === 'cosecha' && (
                <Typography variant="body2">
                  <strong>{t('deposit_label')}:</strong> {execution.detalles.deposito.description || execution.detalles.deposito.name}
                </Typography>
              )}
              
              {execution.detalles?.rinde_obtenido && execution.tipo === 'cosecha' && (
                <Typography variant="body2">
                  <strong>{t('yield')}:</strong> {execution.detalles.rinde_obtenido} ton/ha
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default ExecutionContent;