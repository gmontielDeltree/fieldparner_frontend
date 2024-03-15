import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import {
  List,
  ListItem,
  Box,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlanificationContent from "../TabsContent/Planification";
import LaborOrderContent from "../TabsContent/LaborOrder";
import ExecutionContent from "../TabsContent/Execution";
import AttachedContent from "../TabsContent/Attached";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import ActivityActionsBar from "../../../components/ActivityActionsBar";
import { dbContext } from "../../../../../services";
import { ComparisonReportPdf } from "../helper";

function Application({
  activity,
  complementaryColor,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF,
  handleConfirmExecution,
  handleReplicateActivity,
  lotDoc,
  fieldName
}) {
  console.log("RENDER");
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
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

  const [execution, setExecution] = useState(null);

  const db = dbContext.fields;

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
          />{" "}
          <Typography
            sx={{ fontSize: 16, flexGrow: 2, textAlign: "left" }}
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
            {/* <Typography
              sx={{ fontSize: 16, fontWeight: "bold" }}
              color="text.primary"
            >
              Programada para: {formattedPlanificadaDate}
            </Typography> */}
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
              lotDoc?.properties?.nombre
            );
          }}
        />
        {/* <IconButton onClick={handleMenuClick} sx={{ marginLeft: "8px" }}>
          <MoreVertIcon />
          <ActivityActionsBar />
        </IconButton> */}
      </Box>

      {/* LGO Comento los items que no estan implementados aún */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>Editar</MenuItem>
        {/* <MenuItem onClick={handleMenuClose}>Repetir Planificacion</MenuItem> */}
        <MenuItem onClick={handleMenuClose}>Orden de Trabajo PDF</MenuItem>
        {/* <MenuItem onClick={handleMenuClose}>
          Compartir Orden de Trabajo
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Ejecución vs Planificación PDF
        </MenuItem> */}
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
        <Tab label="Programacion" />
        <Tab label="Orden de trabajo" />
        <Tab label="Ejecucion" />
        <Tab label="Adjuntos" />
      </Tabs>

      {selectedTab === 0 && (
        <PlanificationContent
          activity={activity.actividad}
          showEstimatedApplicationDate={false}
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

export default Application;
