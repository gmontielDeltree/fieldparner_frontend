import { Accordion, AccordionDetails, AccordionSummary, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ICiclosPlanificacion, IActividadPlanificacion } from '../../interfaces/planification';
import { ActividadCardBase } from "./ActividadCardBase";
import { ActividadEditorBase } from "./ActividadEditorBase";
import ActividadEditorDialog from "./ActividadEditorDialog";

export const Ciclo = ({ciclo}) => {
  console.log(ciclo)

  const [actividades, setActividades] = useState<IActividadPlanificacion[]>()

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

    <ActividadEditorDialog />
        <Button>Eliminar</Button>
        {ciclo.actividadesIds?.map((a)=>{
            return <ActividadCardBase actividadId={a}></ActividadCardBase>
        })}
      </AccordionDetails>
    </Accordion>
  );
};
