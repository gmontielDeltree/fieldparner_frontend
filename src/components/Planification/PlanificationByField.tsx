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
  Alert,
  AlertTitle,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Ciclo } from "./Ciclo";
import { useField } from "../../hooks/useField";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CicloEditorDialog from "./CicloEditorDialog";
import { MoreVert, Campaign } from "@mui/icons-material";
import { CiclosContext } from "./contexts/CiclosContext";
import { CampanasContext } from "./contexts/CampanasContext";
import { useCiclos } from "../../hooks/usePlanifications";
import uuid4 from "uuid4";
import CancelIcon from "@mui/icons-material/Close";
import { CultivoContext } from "./contexts/CultivosContext";
import { format } from "date-fns";
import { filter } from "jszip";
import { get_ingresos_egresos } from "./FuncionesInformes";
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

interface LoteAccordionProps {
  lote: any;
  name?: string;
  expanded: boolean;
  cicloSelected: string;
  campanaId: string;
}

const LoteAccordion: React.FC<LoteAccordionProps> = ({
  lote,
  name,
  expanded,
  cicloSelected,
  campanaId,
}) => {
  const [exp, setExp] = useState(expanded);

  console.log("LOTEACORDION", lote, name);
  // const [ciclos, setCiclos] = useState([])
  const { getCiclosFromCampanaAndLote, refreshCiclos } =
    useContext(CiclosContext) || {};
  let ciclos = getCiclosFromCampanaAndLote?.(campanaId, lote.id) || [];
  const { getCropLabelFromId, getCropColorFromId } = useContext(CultivoContext) || {};

  useEffect(() => {
    setExp(expanded);
  }, [expanded]);
  // useEffect(()=>{

  //   console.log("AVERRR from PlanifByField",ciclosLista,getCiclosFromCampanaAndLote(campanaId, lote.id))
  //  setCiclos(getCiclosFromCampanaAndLote(campanaId, lote.id))
  // },[ciclosLista, campanaId, lote])

  // const {ciclos, refreshCiclos} = useCiclos(campanaId, lote.id);

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
            {ciclos?.map((ciclo: any, i: number) => (
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
                    backgroundColor: getCropColorFromId?.(ciclo.cultivoId) || '#ccc',
                  }}
                >
                  {getCropLabelFromId?.(ciclo.cultivoId) || 'Unknown'}
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
              refreshCiclos?.();
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
              expanded={cicloSelected === c._id}
              lote={lote}
            ></Ciclo>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};
interface PlanificationByFieldProps {
  name?: string;
  fieldId: string;
  loteSelected: string;
  cicloSelected: string;
  onClose: () => void;
  onlyLoteSelected?: boolean;
  campaignId: string;
  verificationMode?: boolean;
  activityToVerify?: any;
}

export const PlanificationByField: React.FC<PlanificationByFieldProps> = ({
  name,
  fieldId,
  loteSelected,
  cicloSelected,
  onClose,
  onlyLoteSelected,
  campaignId,
  verificationMode = false,
  activityToVerify,
}) => {
  // Lista de Campañas
  // Planificaciones por campaña
  //

  const { t } = useTranslation();
  const { getCampanaDesc } = useContext(CampanasContext);
  const [campo, setCampo] = useState<any>(null);
  const [lotes, setLotes] = useState<any[]>([]);

  const { fields, getFields } = useField();

  const [input, setIn] = useState<number>(0);
  const [out, setOut] = useState<number>(0);

  const { ciclos, getCiclosFromCampanaAndLote } = useContext(CiclosContext);

  useEffect(() => {
    getFields();
  }, []);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (fields && fieldId) {
      let campoEste = fields.find((f) => f._id === fieldId);
      if (campoEste) {
        setCampo(campoEste);
        setLotes(campoEste.lotes);

        let ids = campoEste.lotes.map((l) => l.id);
        let ciclos_d = ciclos.filter((c) => ids.includes(c.loteId));

        get_ingresos_egresos(ciclos_d).then((data) => {
          setIn(data[0]), setOut(data[1]);
        });
      }

      console.log("casdsdd", campo, campoEste);
    }
  }, [fields, fieldId]);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {/* Header con información de campaña */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "16px",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {campo?.nombre}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Campaign fontSize="small" />
              <Typography variant="subtitle1">
                Planificación de Campaña: <strong>{getCampanaDesc(campaignId)}</strong>
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <CancelIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Verification Mode Alert */}
      {verificationMode && activityToVerify && (
        <Alert
          severity="warning"
          sx={{ m: 2 }}
          icon={<MoreVert />}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t("activityVerificationModeTitle")}
          </Typography>
          <Typography variant="body2">
            {t("activityVerificationModeDescription", { activityType: activityToVerify.tipo })}
          </Typography>
        </Alert>
      )}

      {/* Alert informativo */}
      <Alert
        severity="info"
        sx={{
          margin: "10px",
          borderRadius: "8px",
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle sx={{ fontWeight: 'bold' }}>{t("productiveCyclesManagementTitle")}</AlertTitle>
        <Typography variant="body2">
          {t("productiveCyclesManagementDescription", { campaignName: getCampanaDesc(campaignId) })}
        </Typography>
      </Alert>

      <Box
        sx={{ marginBottom: "0.2rem", maxHeight: "calc(100vh - 350px)", overflowY: "auto" }}
      >
        {/* Por cada lote */}

        {lotes?.length === 0 && (
          <Box sx={{ textAlign: "center", padding: "40px", color: "text.secondary" }}>
            <Typography variant="h6">{t("noLotesInFieldMessage")}</Typography>
          </Box>
        )}

        {lotes?.map((lote, i) => {
          return (
            <LoteAccordion
              key={lote.id}
              lote={lote}
              campanaId={campaignId}
              expanded={loteSelected === lote.id}
              cicloSelected={cicloSelected}
            />
          );
        })}
        {/* fin por cada lote */}
      </Box>
    </Box>
  );
};
