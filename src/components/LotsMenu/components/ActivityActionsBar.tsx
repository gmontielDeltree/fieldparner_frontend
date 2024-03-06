import { Menu } from "@mui/icons-material";
import { IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import React from "react";

import edicion_icon from "../../../images/icons/edicion.webp";
import repetir_icon from "../../../images/icons/repetir.webp";
import ot_icon from "../../../images/icons/ot.webp";
import compartir_ot_icon from "../../../images/icons/compartir_ot.webp";
import comparativa_icon from "../../../images/icons/comparativa.webp";
import metereologia_icon from "../../../images/icons/metereologia.webp";
import basura_icon from "../../../images/icons/basura.webp";
import { Actividad, Ejecucion } from "../../../interfaces/activity";

const ActivityActionsBar = ({
  onEditActivity,
  onDownloadOT,
  onRepeatOT,
  onShareOT,
  onDownloadCompare,
  onMeteo,
  onDeleteActivity,
}) => {
  const actions = [
    {
      icon: edicion_icon,
      text: "Eliminar Actividad",
      action: onEditActivity,
    },
    {
      icon: repetir_icon,
      text: "Repetir Actividad en otro Lote",
      action: onRepeatOT,
    },
    {
      icon: ot_icon,
      text: "Crear Orden de Trabajo",
      action: onDownloadOT,
    },
    {
      icon: compartir_ot_icon,
      text: "Compartir Orden de Trabajo",
      action: onShareOT,
    },
    {
      icon: comparativa_icon,
      text: "Comparativa entre Programa y Ejecucion",
      action: onDownloadCompare,
    },
    {
      icon: metereologia_icon,
      text: "Meteorologia",
      action: onMeteo,
    },
    {
      icon: basura_icon,
      text: "Eliminar Actividad",
      action: onDeleteActivity,
    },
  ];

  return (
    <Toolbar variant="dense">
      {actions.map((a) => (
        <Tooltip
          title={a.text}
          arrow
          placement="top"
          sx={{
            tooltip: {
              backgroundColor: "#333",
              color: "white",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              fontSize: "1em",
            },
            arrow: {
              color: "#333",
            },
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={a.action}
          >
            <img src={a.icon} width="32" height="32" alt={a.text} />
          </IconButton>
        </Tooltip>
      ))}
    </Toolbar>
  );
};

export default ActivityActionsBar;
