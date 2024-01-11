import { useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, Tabs, Tab, IconButton, Menu, MenuItem } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlanificationContent from "./../TabsContent/Planification";
import LaborOrderContent from "./../TabsContent/LaborOrder";
import ExecutionContent from "./../TabsContent/Execution";
import AttachedContent from "./../TabsContent/Attached";

function Sowing({
  activity,
  complementaryColor,
  handleDeleteActivity,
  handleEditActivity,
  handleDownloadPDF
}) {
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
            {activity.actividad.detalles?.fecha_ejecucion_tentativa} Planificada
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

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>Editar</MenuItem>
        <MenuItem onClick={handleMenuClose}>Repetir Planificacion</MenuItem>
        <MenuItem onClick={() => handleDownloadPDF(activity.actividad)}>
          Orden de Trabajo PDF
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Compartir Orden de Trabajo
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Ejecución vs Planificación PDF
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>Datos Meteorológicos</MenuItem>
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
        <Tab label="Planificacion" />
        <Tab label="Orden de trabajo" />
        <Tab label="Ejecucion" />
        <Tab label="Adjuntos" />
      </Tabs>

      {selectedTab === 0 && (
        <PlanificationContent activity={activity.actividad} />
      )}
      {selectedTab === 1 && <LaborOrderContent />}
      {selectedTab === 2 && <ExecutionContent />}
      {selectedTab === 3 && <AttachedContent />}
    </div>
  );
}

export default Sowing;
