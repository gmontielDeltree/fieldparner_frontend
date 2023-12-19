import React from "react";
import Typography from "@mui/material/Typography";

function ExecutionContent() {
  return (
    <>
      <Typography variant="body1" gutterBottom>
        Actividad aun no ejecutada
      </Typography>
      <Typography variant="body2">
        Para "Ejecutar" debe generar la "Orden de Trabajo" primero.
      </Typography>
    </>
  );
}

export default ExecutionContent;
