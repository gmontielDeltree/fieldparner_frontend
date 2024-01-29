import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Ciclo } from "./Ciclo";
import { useField } from "../../hooks/useField";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CicloEditorDialog from "./CicloEditorDialog";
import { MoreVert } from "@mui/icons-material";
import { CiclosContext } from "./contexts/CiclosContext";
import { CampanasContext } from "./contexts/CampanasContext";
import { useCiclos } from "../../hooks/usePlanifications";
import uuid4 from "uuid4";
import CancelIcon from '@mui/icons-material/Close';

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

const LoteAccordion: React.FC = ({ lote, campanaId, expanded, cicloSelected }) => {

  const [exp,setExp] = useState(expanded)

  console.log("LOTEACORDION", lote,campanaId)
  // const [ciclos, setCiclos] = useState([])
  const {getCiclosFromCampanaAndLote, refreshCiclos } = useContext(CiclosContext)
  let ciclos = getCiclosFromCampanaAndLote(campanaId, lote.id)

  useEffect(()=>{
    setExp(expanded)
  },[expanded])
  // useEffect(()=>{

  //   console.log("AVERRR from PlanifByField",ciclosLista,getCiclosFromCampanaAndLote(campanaId, lote.id))
  //  setCiclos(getCiclosFromCampanaAndLote(campanaId, lote.id))
  // },[ciclosLista, campanaId, lote])

  // const {ciclos, refreshCiclos} = useCiclos(campanaId, lote.id);


  return (
    <Accordion expanded={exp} onChange={(_,expa)=>setExp(expa)} >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{backgroundColor:"#e0e5de", height:"2rem"}}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Box sx={{display:"flex",justifyContent:"space-around", alignItems:"center", width:"100%"}}>
          <Typography>{lote.properties.nombre}</Typography>

          <CicloEditorDialog
            campanaId={campanaId}
            loteId={lote.id}
            onSave={() => {
              // Update
              refreshCiclos();
            }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {ciclos.length === 0 && "No hay ciclos planificados para este lote"}
        {/* por cada ciclo del lote */}
        {ciclos.map((c, i) => {
          return <Ciclo key={lote.id+uuid4()} ciclo={c} loteId={lote.id} expanded={cicloSelected===c._id}></Ciclo>;
        })}
      </AccordionDetails>
    </Accordion>
  );
};
export const PlanificationByField = ({ campaignId, fieldId, loteSelected, cicloSelected, onClose }) => {
  // Lista de Campañas
  // Planificaciones por campaña
  //

  const {getCampanaDesc} = useContext(CampanasContext)
  const [campo, setCampo] = useState([]);
  const [lotes, setLotes] = useState([]);

  const { fields, getFields } = useField();

  useEffect(() => {
    getFields();
  }, []);


  const handleClose =()=>{
    onClose()
  }

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
    <Box sx={{ width: "100%", height: "100%"}}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", paddingX:"1rem" }}>
          <Box>
            <Typography variant="h5">{campo?.nombre}</Typography>
            <Typography variant="subtitle2">Planificación Campaña {getCampanaDesc(campaignId)}</Typography>
          </Box>

          <IconButton onClick={handleClose}>
            <CancelIcon/>
             
            {/* <MoreVert></MoreVert> */}
          </IconButton>
        </Box>
        <Divider component={"div"} variant="middle" />
      </Box>

      <Box sx={{ marginBottom: "0.2rem", maxHeight: "70vh", overflowY:"auto" }}>
        {/* Por cada lote */}
        {lotes?.map((lote, i) => {
          return <LoteAccordion  key={lote.id} lote={lote} campanaId={campaignId} expanded={loteSelected === lote.id} cicloSelected={cicloSelected} />;
        })}
        {/* fin por cada lote */}
      </Box>
    </Box>
  );
};
