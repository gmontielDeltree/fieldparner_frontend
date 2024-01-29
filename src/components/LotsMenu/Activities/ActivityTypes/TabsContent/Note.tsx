import React from "react";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";

function NoteContent({ activity }) {
  const featureCount = activity.features.length;
  const activityDate = new Date(activity.fecha).toLocaleDateString();
  const nextVisitDate = new Date(activity.proxima_visita).toLocaleDateString();

  const renderPropertyValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return (
        <>
          {Object.entries(value).map(([key, val]) => (
            <Typography key={key} component="span" color="textSecondary">
              {key}: {JSON.stringify(val)}
            </Typography>
          ))}
        </>
      );
    }
    return value.toString();
  };

  return (
    <>
      <Typography variant="h6">
        {activity.nombre || "Actividad sin nombre"}
      </Typography>
      <Typography>{activity.texto || "No hay observaciones"}</Typography>
      <Typography color="textSecondary">
        Fecha de la actividad: {activityDate}
      </Typography>
      <Typography color="textSecondary">
        Próxima visita: {nextVisitDate}
      </Typography>
      <Typography color="textSecondary">
        Puntos (features): {featureCount}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<MapIcon />}
        sx={{
          borderRadius: "20px",
          marginTop: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            backgroundColor: "secondary.main"
          },
          padding: "10px 20px"
        }}
      >
        Localizar
      </Button>
    </>
  );
}

export default NoteContent;
