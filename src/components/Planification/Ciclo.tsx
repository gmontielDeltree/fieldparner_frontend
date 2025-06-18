import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Paper,
  Typography,
  Chip,
} from "@mui/material";
import React, { createContext, useContext, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ICiclosPlanificacion,
  IActividadPlanificacion,
} from "../../interfaces/planification";
import { ActividadCardBase } from "./ActividadCardBase";
import { ActividadEditorBase } from "./ActividadEditorBase";
import ActividadEditorDialog from "./ActividadEditorDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import { Lock, LockOpen } from "@mui/icons-material";
import { CultivoContext } from "./contexts/CultivosContext";
import { useCiclos, usePlanActividad } from "../../hooks/usePlanifications";
import { CiclosContext } from "./contexts/CiclosContext";
import { format } from "date-fns";
import { Lot } from "@types";
import PlanificationStatusButton from "./PlanificationStatusButton";

const ActividadContext = createContext();

export const Ciclo = ({
  ciclo,
  loteId,
  expanded,
  lote,
}: {
  ciclo: ICiclosPlanificacion;
  loteId: string;
  expanded: boolean;
  lote: Lot;
}) => {
  const [expan, setExpan] = useState(expanded);

  console.log(ciclo);

  const { getCropLabelFromId, getCropColorFromId } = useContext(CultivoContext);

  const [actividades, setActividades] = useState<string[]>([]);
  const { removeCiclo } = useContext(CiclosContext);
  const { getCicloSortedActivities } = usePlanActividad()

  useEffect(() => {
    if (ciclo.actividadesIds?.length > 0) {
      getCicloSortedActivities(ciclo).then((a) => setActividades(a))
    }
  }, [ciclo])

  return (
    <Accordion
      sx={{ backgroundColor: getCropColorFromId(ciclo.cultivoId) }}
      expanded={expan}
      onChange={(_, e) => setExpan(e)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
          <Box>
            <Typography>Zafra {getCropLabelFromId(ciclo.cultivoId)}</Typography>
            <Typography variant="subtitle2">
              {format(new Date(ciclo.fechaInicio), "dd-MM-yyyy")} /{" "}
              {format(new Date(ciclo.fechaFin), "dd-MM-yyyy")}
            </Typography>
          </Box>
          <Box onClick={(e) => e.stopPropagation()}>
            <PlanificationStatusButton
              isOpen={ciclo.status !== 'closed'}
              onStatusChange={(newStatus) => {
                // TODO: Actualizar el estado del ciclo en la base de datos
                console.log('Cambiar estado del ciclo:', ciclo._id, 'a', newStatus ? 'open' : 'closed');
              }}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            justifyContent: "flex-end",
            margin: "0.5rem",
            gap: "0.2rem",
            display: "flex",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => removeCiclo(ciclo._id)}
          >
            Eliminar
          </Button>
          <ActividadEditorDialog
            cicloId={ciclo._id}
            campanaId={ciclo.campanaId}
            loteId={loteId}
            campoId={lote.properties.campo_parent_id}
          />
        </Box>

        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            backgroundColor: "#c7bb27",
            margin: "0.2rem",
            paddingY: "1rem",
            borderRadius: "1rem",
          }}
        >
          {actividades.map((a, i) => {
            return (
              <ActividadCardBase key={a} actividadId={a}></ActividadCardBase>
            );
          })}

          {!ciclo.actividadesIds.length && (
            <Typography>Sin Actividades Planificadas</Typography>
          )}
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};
