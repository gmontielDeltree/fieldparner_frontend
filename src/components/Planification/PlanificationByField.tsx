import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Ciclo } from "./Ciclo";
import { usePlanification } from "../../hooks/usePlanifications";
import { useField } from "../../hooks/useField";
import { IPlanificacion } from "../../interfaces/planification";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const PlanificationByField = ({planId, fieldId}) => {
  // Lista de Campañas
  // Planificaciones por campaña
  //

  const [lotes, setLotes] = useState([]);
  const [planification, setPlanification] = useState<IPlanificacion>([]);

  const { fields, getFields } = useField();
  const { planifications, getPlanifications } = usePlanification();

  useEffect(() => {
    getFields();
    getPlanifications();
  }, []);

  useEffect(() => {
    let p = planifications.find((p) => p._id === planId);
    if (p) {
      setPlanification(p);
    }
  }, [planifications]);

  useEffect(() => {
    let campo = fields.filter((f) => f._id === fieldId);

    setLotes(campo.lotes);
  }, [fields]);

  const ciclosPorLote = (plan: IPlanificacion, loteId: string) => {
    return plan.ciclos.filter((c) => c.loteId === loteId);
  };

  return (
    <>
      <Box>
        <Box>titulo</Box>
      </Box>

      {/* Por cada lote */}
      {lotes.map((lote) => {
        return (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              {lote._id} <Button>+ Ciclo</Button>
            </AccordionSummary>
            <AccordionDetails>
              {/* por cada ciclo del lote */}
              {ciclosPorLote(planification, lote._id).map((c) => {
                return <Ciclo></Ciclo>;
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}
      {/* fin por cada lote */}
    </>
  );
};
