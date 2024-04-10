import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, Tabs, Tab, IconButton, Menu, MenuItem } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlanificationContent from "./../TabsContent/Planification";
import LaborOrderContent from "./../TabsContent/LaborOrder";
import ExecutionContent from "./../TabsContent/Execution";
import AttachedContent from "./../TabsContent/Attached";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ComparisonReportPdf } from "../helper";
import { dbContext } from "../../../../../services";
import ActivityActionsBar from "../../../components/ActivityActionsBar";
import { Ejecucion } from "../../../../../interfaces/activity";

function Sowing({
  activity,
  fieldName,
  lotName,
  complementaryColor,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF,
  handleConfirmExecution,
  handleReplicateActivity
}) {
  const db = dbContext.fields;
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [execution, setExecution] = useState<Ejecucion>(null);
  const open = Boolean(anchorEl);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const response = await db.find({
          selector: { actividad_uuid: activity.actividad.uuid }
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

    if (activity.actividad.uuid) {
      fetchExecution();
    }
  }, [activity.uuid, db]);

  const formattedPlanificadaDate = activity.actividad.detalles
    ?.fecha_ejecucion_tentativa
    ? format(
        parseISO(activity.actividad.detalles.fecha_ejecucion_tentativa),
        "PPPP",
        { locale: es }
      )
    : "Fecha no definida";

  const formattedDate = (date?: string) =>
    date ? format(parseISO(date), "PPPP", { locale: es }) : "Fecha no definida";

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: "4px",
            padding: "4px 8px",
            flexGrow: 1
          }}
        >
          <EventNoteIcon
            sx={{ marginRight: "4px", color: complementaryColor }}
          />
          <Typography
            sx={{
              fontSize: 16,
              flexGrow: 2,
              textAlign: "left",
              marginTop: "5px"
            }}
            color="text.secondary"
          >
            {activity.actividad.tipo.toUpperCase()} en{" "}
            {activity.actividad.detalles?.hectareas} has.{" "}
            {execution ? (
              <Typography
                sx={{ fontSize: 16, fontWeight: "bold" }}
                color="green"
              >
                Ejecutada: {formattedDate(execution.detalles.fecha_ejecucion)}
              </Typography>
            ) : (
              <Typography
                sx={{ fontSize: 16, fontWeight: "bold" }}
                color="text.primary"
              >
                Programada para: {formattedPlanificadaDate}
              </Typography>
            )}
          </Typography>
        </Box>

        <ActivityActionsBar
          sx={{ marginLeft: "8px" }}
          onEditActivity={() => handleEditActivity(activity.actividad)}
          onDeleteActivity={() => handleDeleteActivity(activity.actividad._id)}
          onMeteo={() => alert("Proximamente - En Construcción")}
          onDownloadOT={() => handleDownloadPDF(activity.actividad)}
          onRepeatOT={() => handleReplicateActivity()}
          onShareOT={() => alert("Proximamente - En Construcción")}
          onDownloadCompare={() => {
            if (!execution) {
              alert("Debe ejecutar primero para generar el informe!!!");
              return;
            }
            ComparisonReportPdf(
              activity.actividad,
              execution,
              fieldName,
              lotName
            );
          }}
          disabledActions={{ edit: !!execution }}
        />

        {/* <IconButton onClick={handleMenuClick} sx={{ marginLeft: "8px" }}>
          <MoreVertIcon />

        </IconButton> */}
      </Box>

      {/* LGO Comento los items que no estan implementados aún */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditActivity(activity.actividad)}>
          Editar Siembra
        </MenuItem>
        <MenuItem onClick={() => handleReplicateActivity()}>
          Repetir Planificacion
        </MenuItem>
        <MenuItem onClick={() => handleDownloadPDF(activity.actividad)}>
          Orden de Trabajo PDF
        </MenuItem>
        {/* <MenuItem onClick={handleMenuClose}>
          Compartir Orden de Trabajo
        </MenuItem> */}
        {execution && (
          <MenuItem
            onClick={() =>
              ComparisonReportPdf(
                activity.actividad,
                execution,
                fieldName,
                lotName
              )
            }
          >
            Ejecución vs Planificación PDF
          </MenuItem>
        )}
        {/* <MenuItem onClick={handleMenuClose}>Datos Meteorológicos</MenuItem> */}
        <MenuItem onClick={() => handleDeleteActivity(activity.actividad._id)}>
          Eliminar
        </MenuItem>
      </Menu>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ marginBottom: "16px" }}
      >
        <Tab label="Programa" />
        <Tab label="Orden de trabajo" />
        <Tab label="Ejecucion" />
        <Tab label="Adjuntos" />
      </Tabs>

      {selectedTab === 0 && (
        <PlanificationContent
          activity={activity.actividad}
          backgroundColor={complementaryColor}
        />
      )}
      {selectedTab === 1 && (
        <LaborOrderContent
          activity={activity.actividad}
          handleDownloadPDF={handleDownloadPDF}
          handleConfirmExecution={handleConfirmExecution}
        />
      )}
      {selectedTab === 2 && (
        <ExecutionContent
          activity={activity.actividad}
          handleEditActivity={handleEditActivity}
        />
      )}
      {selectedTab === 3 && <AttachedContent />}
    </div>
  );
}

export default Sowing;
