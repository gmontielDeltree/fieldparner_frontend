import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ICiclosPlanificacion,
  IActividadPlanificacion,
} from "../../interfaces/planification";
import { ActividadCardBase } from "./ActividadCardBase";
import { ActividadEditorBase } from "./ActividadEditorBase";
import ActividadEditorDialog from "./ActividadEditorDialog";
import DeleteIcon from '@mui/icons-material/Delete';
import { CultivoContext } from "./contexts/CultivosContext";
import { useCiclos } from "../../hooks/usePlanifications";

export const Ciclo = ({ ciclo, loteId }) => {
  console.log(ciclo);

  const {getCropLabelFromId} = useContext(CultivoContext)

  const {removeCiclo} = useCiclos(ciclo.campanaId,loteId)
  const [actividades, setActividades] = useState<IActividadPlanificacion[]>();

  return (
    <Accordion sx={{backgroundColor:"#3E9913"}}>
      <AccordionSummary
      
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography>Ciclo {getCropLabelFromId(ciclo.cultivoId)}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{justifyContent:"flex-end",margin:"0.5rem",gap:"0.2rem",display:"flex"}}>
        <Button  variant="outlined" startIcon={<DeleteIcon />} onClick={()=>removeCiclo(ciclo._id)}>Eliminar</Button>
          <ActividadEditorDialog
            cicloId={ciclo._id}
            campanaId={ciclo.campanaId}
            loteId={loteId}
          />
        </Box>

      <Box sx={{display:"flex",flexDirection:"column", alignItems:"center", gap:"1rem", 
      backgroundColor:"#c7bb27",margin:"0.2rem",paddingY:"1rem",borderRadius:"1rem"}}>
          {ciclo.actividadesIds?.map((a ,i ) => {
            return <ActividadCardBase key={i} actividadId={a}></ActividadCardBase>;
          })}

          {!ciclo.actividadesIds.length && <Typography>Sin Actividades Planificadas</Typography>}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
