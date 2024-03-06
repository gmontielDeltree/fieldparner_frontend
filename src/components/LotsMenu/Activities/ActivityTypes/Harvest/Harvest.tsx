import React, { useState } from "react";
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
import PlanificationContent from "./../TabsContent/Planification";
import LaborOrderContent from "./../TabsContent/LaborOrder";
import ExecutionContent from "./../TabsContent/Execution";
import AttachedContent from "./../TabsContent/Attached";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

function Harvest({
  activity,
  lotDoc,
  complementaryColor,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF,
  handleConfirmExecution
}) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const formattedPlanificadaDate = activity.actividad.detalles
    ?.fecha_ejecucion_tentativa
    ? format(
        parseISO(activity.actividad.detalles.fecha_ejecucion_tentativa),
        "PPPP",
        { locale: es }
      )
    : "Fecha no definida";

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
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
            sx={{ fontSize: 16, fontWeight: "bold" }}
            color="text.primary"
          >
            Planificada para: {formattedPlanificadaDate}
          </Typography>
        </Box>
        <Typography
          sx={{ fontSize: 16, flexGrow: 2, textAlign: "right" }}
          color="text.secondary"
        >
          {activity.actividad.tipo} en {activity.actividad.detalles?.hectareas}{" "}
          has.
        </Typography>
        <IconButton onClick={handleMenuClick} sx={{ marginLeft: "8px" }}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* LGO Comento los items que no estan implementados aún */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditActivity(activity.actividad)}>
          Editar
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>Repetir Planificacion</MenuItem>
        <MenuItem onClick={() => handleDownloadPDF()}>
          Orden de Trabajo PDF
        </MenuItem>
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
        <PlanificationContent activity={activity.actividad} />
      )}
      {selectedTab === 1 && (
        <LaborOrderContent
          activity={activity.actividad}
          lotDoc={lotDoc}
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

export default Harvest;
