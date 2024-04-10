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
  disabledActions
}) => {
  const actions = [
    {
      icon: edicion_icon,
      text: "Editar Actividad",
      action: onEditActivity,
      disabled: disabledActions.edit ? disabledActions.edit : false
    },
    {
      icon: repetir_icon,
      text: "Repetir Actividad en otro Lote",
      action: onRepeatOT,
      disabled: disabledActions.repeat ? disabledActions.repeat : false
    },
    {
      icon: ot_icon,
      text: "Crear Orden de Trabajo",
      action: onDownloadOT,
      disabled: disabledActions.ot ? disabledActions.ot : false
    },
    {
      icon: compartir_ot_icon,
      text: "Compartir Orden de Trabajo",
      action: onShareOT,
      disabled: disabledActions.share ? disabledActions.share : false
    },
    {
      icon: comparativa_icon,
      text: "Comparativa entre Programa y Ejecucion",
      action: onDownloadCompare,
      disabled: disabledActions.compare ? disabledActions.compare : false
    },
    {
      icon: metereologia_icon,
      text: "Meteorologia",
      action: onMeteo,
      disabled: disabledActions.meteo ? disabledActions.meteo : false
    },
    {
      icon: basura_icon,
      text: "Eliminar Actividad",
      action: onDeleteActivity,
      disabled: disabledActions.delete ? disabledActions.delete : false
    }
  ];

  return (
    <Toolbar variant="dense">
      {actions.map((a) => (
        <Tooltip key={a.text} title={a.text} arrow placement="top">
          <span>
            {" "}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={a.action}
              disabled={a.disabled}
            >
              <img src={a.icon} width="32" height="32" alt={a.text} />
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Toolbar>
  );
};
export default ActivityActionsBar;
