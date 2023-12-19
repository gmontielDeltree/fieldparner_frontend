import React from "react";
import Typography from "@mui/material/Typography";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function PlanificationContent({ activity }) {
  const hasDosis =
    activity.detalles &&
    activity.detalles.dosis &&
    activity.detalles.dosis.length > 0;

  return (
    <>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
        Fecha Estimada de Aplicación:{" "}
        {activity.detalles.fecha_ejecucion_tentativa}
      </Typography>
      {hasDosis &&
        activity.detalles.dosis.map((dosis, index) => (
          <Accordion key={index} sx={{ marginBottom: "8px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Insumos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {dosis.insumo.marca_comercial} - {dosis.insumo.precio}{" "}
                {dosis.insumo.unidad}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      <Accordion sx={{ marginBottom: "8px" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Contratista</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {activity.contratista
              ? activity.contratista.nombre
              : "No especificado"}
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ marginBottom: "8px" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Condiciones esperadas de trabajo</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Temperatura min...max: {activity.condiciones.temperatura_min}...
            {activity.condiciones.temperatura_max}
          </Typography>
          <Typography>
            Humedad min...max: {activity.condiciones.humedad_min}...
            {activity.condiciones.humedad_max}
          </Typography>
          <Typography>
            Velocidad min...max: {activity.condiciones.velocidad_min}...
            {activity.condiciones.velocidad_max}
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ marginBottom: "8px" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Observaciones</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {activity.comentario || "No hay observaciones"}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default PlanificationContent;
