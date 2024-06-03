import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Fab,
  IconButton,
  Tooltip,
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
import CancelIcon from "@mui/icons-material/Close";
import { CultivoContext } from "./contexts/CultivosContext";
import { format } from "date-fns";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

const LoteAccordion: React.FC = ({
  lote,
  campanaId,
  expanded,
  cicloSelected,
}) => {
  const [exp, setExp] = useState(expanded);

  console.log("LOTEACORDION", lote, campanaId);
  // const [ciclos, setCiclos] = useState([])
  const {
    ciclos: todos_los_ciclos,
    getCiclosFromCampanaAndLote,
    refreshCiclos,
  } = useContext(CiclosContext);
  let ciclos = getCiclosFromCampanaAndLote(campanaId, lote.id);
  const { crops, getCropLabelFromId, getCropColorFromId } =
    useContext(CultivoContext);

  useEffect(() => {
    setExp(expanded);
  }, [expanded]);

  if (!todos_los_ciclos || !crops) {
    return null;
  }

  return (
    <Accordion expanded={exp} onChange={(_, expa) => setExp(expa)}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ backgroundColor: "#e0e5de", height: "2rem" }}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography>{lote.properties.nombre}</Typography>

          <Box sx={{ display: "flex", gap: "0.4rem" }}>
            {ciclos?.map((ciclo, i) => (
              <Tooltip
                title={
                  format(new Date(ciclo.fechaInicio), "dd-MM-yyyy") +
                  " / " +
                  format(new Date(ciclo.fechaFin), "dd-MM-yyyy")
                }
              >
                <Fab
                  key={i}
                  variant="extended"
                  sx={{
                    borderRadius: "4px",
                    height: "1.9rem",
                    backgroundColor: getCropColorFromId(ciclo.cultivoId),
                  }}
                >
                  {getCropLabelFromId(ciclo.cultivoId)}
                </Fab>
              </Tooltip>
            ))}
          </Box>

          <CicloEditorDialog
            otrosCiclos={ciclos}
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
          return (
            <Ciclo
              key={lote.id + uuid4()}
              ciclo={c}
              loteId={lote.id}
              lote={lote}
              expanded={true}
            ></Ciclo>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};

export const PlanificationByFieldForLotPage = ({
  campaignId,
  fieldId,
  loteId,
  loteSelected,
  cicloSelected,
  onClose,
  onlyLoteSelected,
}) => {
  // Lista de Campañas
  // Planificaciones por campaña
  //
  const { t } = useTranslation();
  const { getCampanaDesc } = useContext(CampanasContext);
  const [campo, setCampo] = useState([]);
  const [lotes, setLotes] = useState([]);

  const { lote, field, refreshCallback } = useOutletContext();

  const handleClose = () => {
    onClose();
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            paddingX: "1rem",
          }}
        >
          <Box>
            <Typography variant="h5">{field?.nombre}</Typography>
            <Typography variant="subtitle2">
              Planificación Campaña {getCampanaDesc(campaignId)}
            </Typography>
          </Box>

          <IconButton onClick={handleClose}>
            <CancelIcon />

            {/* <MoreVert></MoreVert> */}
          </IconButton>
        </Box>
        <Divider component={"div"} variant="middle" />
      </Box>

      <Box sx={{ margin: "10px" }}>
        <Typography variant="body2">
          {t("Click en 'PROGRAMAR' para agregar")}
        </Typography>
      </Box>

      <Box
        sx={{ marginBottom: "0.2rem", maxHeight: "70vh", overflowY: "auto" }}
      >
        <LoteAccordion
          key={lote.id}
          lote={lote}
          campanaId={campaignId}
          expanded={true}
          cicloSelected={cicloSelected}
        />
      </Box>
    </Box>
  );
};
