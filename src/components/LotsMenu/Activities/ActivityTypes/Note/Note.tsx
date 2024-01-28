import { useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, Tabs, Tab, IconButton, Menu, MenuItem } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NoteContent from "../TabsContent/Note";
import AttachedContent from "../TabsContent/Attached";
import NotePoints from "../TabsContent/Points";

function Note({ activity, complementaryColor, handleDeleteActivity }) {
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
            {activity.actividad.fecha}
          </Typography>

          <Typography
            sx={{ fontSize: 16, fontWeight: "bold" }}
            style={{ marginLeft: "10px" }}
          >
            {activity.actividad.nombre}
          </Typography>

          <Typography
            sx={{ fontSize: 16, fontWeight: "bold" }}
            style={{ marginLeft: "10px", color: activity.actividad.color }}
          >
            {activity.actividad.color == "red" ? "URGENTE" : "NORMAL"}
          </Typography>
        </Box>
        <Typography
          sx={{ fontSize: 16, flexGrow: 2, textAlign: "right" }}
          color="text.secondary"
        >
          {activity.actividad.tipo}
        </Typography>
        <IconButton onClick={handleMenuClick} sx={{ marginLeft: "8px" }}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>Editar</MenuItem>
        <MenuItem onClick={handleMenuClose}>Reporte de Corrida</MenuItem>
        <MenuItem onClick={handleMenuClose}>Generar Planificacion</MenuItem>
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
        <Tab label="Nota" />
        <Tab label="Puntos" />
      </Tabs>

      {selectedTab === 0 && <NoteContent activity={activity.actividad} />}
      {selectedTab === 1 && <NotePoints activity={activity.actividad} />}
      {selectedTab === 2 && <AttachedContent />}
    </div>
  );
}

export default Note;
