import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ICiclosPlanificacion } from "../../interfaces/planification";
import { ActividadCardBase } from "./ActividadCardBase";

export const Ciclo = (ciclo : ICiclosPlanificacion) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        Ciclo {ciclo.cultivoId}
      </AccordionSummary>
      <AccordionDetails>
        {ciclo.actividades.map((a)=>{
            return <ActividadCardBase actividad={a}></ActividadCardBase>
        })}
      </AccordionDetails>
    </Accordion>
  );
};
