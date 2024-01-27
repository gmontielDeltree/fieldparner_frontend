import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Ciclo } from "./Ciclo";
import { useCiclos } from "../../hooks/usePlanifications";
import { useField } from "../../hooks/useField";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CicloEditorDialog from "./CicloEditorDialog";

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

const LoteAccordion: React.FC = ({ lote, campanaId }) => {
  const [ciclos, refreshCiclos] = useCiclos(campanaId, lote.id);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        {lote.properties.nombre} <CicloEditorDialog campanaId={campanaId} loteId={ lote.id } onSave={()=>{
          // Update
          refreshCiclos()

        }}></CicloEditorDialog>
      </AccordionSummary>
      <AccordionDetails>
        {ciclos.length === 0 && "No hay ciclos planificados para este lote"}
        {/* por cada ciclo del lote */}
        {ciclos.map((c) => {
          return <Ciclo ciclo={c}></Ciclo>;
        })}
      </AccordionDetails>
    </Accordion>
  );
};
export const PlanificationByField = ({ campaignId, fieldId }) => {
  // Lista de Campañas
  // Planificaciones por campaña
  //

  const [campo, setCampo] = useState([]);
  const [lotes, setLotes] = useState([]);

  const { fields, getFields } = useField();

  useEffect(() => {
    getFields();
  }, []);

  useEffect(() => {
    if (fields && fieldId) {
      let campoEste = fields.find((f) => f._id === fieldId);
      if (campoEste) {
        setCampo(campoEste);
        setLotes(campoEste.lotes);
      }

      console.log("casdsdd", campo, campoEste);
    }
  }, [fields, fieldId]);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Box>
        <Box>{campo?.nombre}</Box>
      </Box>


      {/* Por cada lote */}
      {lotes?.map((lote) => {
        return <LoteAccordion lote={lote} campanaId={campaignId} />;
      })}
      {/* fin por cada lote */}
    </Box>
  );
};
