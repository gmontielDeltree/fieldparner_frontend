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
import { MoreVert, Campaign, Autorenew } from "@mui/icons-material";
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
import { dbContext } from "../../services";
import { uuidv7 } from "uuidv7";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Tooltip as MuiTooltip,
} from "@mui/material";

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
  allLotes: any[];
  name?: string;
  expanded: boolean;
  cicloSelected: string;
  campanaId: string;
  isCampaignClosed: boolean;
}

const LoteAccordion: React.FC<LoteAccordionProps> = ({
  lote,
  allLotes,
  name,
  expanded,
  cicloSelected,
  campanaId,
  isCampaignClosed,
}) => {
  const { t } = useTranslation();
  const [exp, setExp] = useState(expanded);

  console.log("LOTEACORDION", lote, name);
  // const [ciclos, setCiclos] = useState([])
  const { getCiclosFromCampanaAndLote, refreshCiclos } =
    useContext(CiclosContext) || {};
  let ciclos = getCiclosFromCampanaAndLote?.(campanaId, lote.id) || [];
  const { getCropLabelFromId, getCropColorFromId } = useContext(CultivoContext) || {};

  // Replicate planning dialog state
  const [replicateOpen, setReplicateOpen] = useState(false);
  const [selectedLots, setSelectedLots] = useState<string[]>([]);
  const availableLots = (allLotes || []).filter((l: any) => l?.id !== lote?.id);

  useEffect(() => {
    setExp(expanded);
  }, [expanded]);
  // useEffect(()=>{

  //   console.log("AVERRR from PlanifByField",ciclosLista,getCiclosFromCampanaAndLote(campanaId, lote.id))
  //  setCiclos(getCiclosFromCampanaAndLote(campanaId, lote.id))
  // },[ciclosLista, campanaId, lote])

  // const {ciclos, refreshCiclos} = useCiclos(campanaId, lote.id);

  const handleToggleLot = (uuid: string) => {
    setSelectedLots(prev => prev.includes(uuid) ? prev.filter(id => id !== uuid) : [...prev, uuid]);
  };

  const replicatePlanningToLots = async () => {
    try {
      const db = dbContext.fields as any;
      const sourceHa = lote?.properties?.hectareas || 0;
      if (!selectedLots.length || ciclos.length === 0 || !campanaId) {
        setReplicateOpen(false);
        return;
      }

      const newDocs: any[] = [];

      // Build a map of target lot hectares
      const targetLotHaMap = new Map<string, number>();
      const allLots = (allLotes || []) as any[];
      // Fallback: we can infer hectareas later by reading campos, but keep simple if not available

      // For each selected lot, we will create cycles and clone activities
      for (const targetLotId of selectedLots) {
        // Determine target hectares
        const targetHa = (allLots.find(l => l.id === targetLotId)?.properties?.hectareas)
          || (allLots.find(l => l.properties?.uuid === targetLotId)?.properties?.hectareas)
          || 0;
        targetLotHaMap.set(targetLotId, targetHa);

        for (const sourceCycle of ciclos) {
          const newCycleId = `ciclo:${campanaId}:${targetLotId}:${uuidv7()}`;
          const newCycle = {
            _id: newCycleId,
            campanaId,
            loteId: targetLotId,
            cultivoId: sourceCycle.cultivoId,
            zafra: sourceCycle.zafra,
            fechaInicio: sourceCycle.fechaInicio || new Date().toISOString(),
            fechaFin: sourceCycle.fechaFin || new Date().toISOString(),
            actividadesIds: [],
          } as any;
          newDocs.push(newCycle);

          // Load planned activities for this cycle
          const actIds: string[] = sourceCycle.actividadesIds || [];
          if (!actIds.length) continue;
          const actsResp = await db.allDocs({ include_docs: true, keys: actIds });
          const acts = (actsResp.rows || []).map((r: any) => r.doc).filter(Boolean);

          for (const act of acts) {
            // Load line docs
            const insResp = act.insumosLineasIds?.length ? await db.allDocs({ include_docs: true, keys: act.insumosLineasIds }) : { rows: [] } as any;
            const labResp = act.laboresLineasIds?.length ? await db.allDocs({ include_docs: true, keys: act.laboresLineasIds }) : { rows: [] } as any;

            const newInsumoIds: string[] = [];
            const newLaborIds: string[] = [];

            const scaleHa = sourceHa > 0 ? (targetHa / sourceHa) : 1;

            for (const row of (insResp.rows || [])) {
              if (!row.doc) continue;
              const src = row.doc as any;
              const newId = `planlinsumo:${uuidv7()}`;
              newInsumoIds.push(newId);
              newDocs.push({
                ...src,
                _id: newId,
                _rev: undefined,
                totalCantidad: (src.totalCantidad || 0) * scaleHa,
                ordenRetiro: undefined,
              });
            }
            for (const row of (labResp.rows || [])) {
              if (!row.doc) continue;
              const src = row.doc as any;
              const newId = `planlabor:${uuidv7()}`;
              newLaborIds.push(newId);
              newDocs.push({
                ...src,
                _id: newId,
                _rev: undefined,
                totalCosto: (src.costoPorHectarea || 0) * (targetHa || act.area || 0),
              });
            }

            const newActId = `planactividad:${uuidv7()}`;
            const newAct = {
              ...act,
              _id: newActId,
              _rev: undefined,
              cicloId: newCycleId,
              campanaId,
              loteId: targetLotId,
              area: targetHa || act.area,
              insumosLineasIds: newInsumoIds,
              laboresLineasIds: newLaborIds,
              ejecutada: false,
            } as any;
            newDocs.push(newAct);

            // update cycle actividadesIds
            const cycleToUpdate = newDocs.find(d => d._id === newCycleId);
            if (cycleToUpdate) {
              cycleToUpdate.actividadesIds = [...(cycleToUpdate.actividadesIds || []), newActId];
            }
          }
        }
      }

      if (newDocs.length) {
        await db.bulkDocs(newDocs);
        await refreshCiclos?.();
      }
    } catch (e) {
      console.error('Error replicating planning to lots:', e);
    } finally {
      setReplicateOpen(false);
      setSelectedLots([]);
    }
  };

  return (
    <Accordion expanded={exp} onChange={(_, expa) => setExp(expa)}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ backgroundColor: "#e0e5de", height: "2rem" }}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        {/** Safe date formatting helper */}
        {/** Keep inside component to use imported format */}
        {/** eslint-disable-next-line */}
        {(() => {})()}
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
            {ciclos?.map((ciclo: any, i: number) => {
              const safeFormat = (d: any) => {
                try {
                  if (!d) return 'N/A';
                  const dt = new Date(d);
                  if (isNaN(dt.getTime())) return 'N/A';
                  return format(dt, "dd-MM-yyyy");
                } catch {
                  return 'N/A';
                }
              };
              return (
              <Tooltip
                title={`${safeFormat(ciclo.fechaInicio)} / ${safeFormat(ciclo.fechaFin)}`}
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
              );
            })}
            <MuiTooltip title={
              isCampaignClosed
                ? t('campaignIsClosed')
                : (availableLots.length === 0 ? t('noOtherLotsInField') : t('replicatePlanningToLots'))
            }>
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Autorenew fontSize="small" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCampaignClosed && availableLots.length > 0) setReplicateOpen(true);
                  }}
                  disabled={isCampaignClosed || availableLots.length === 0}
                  sx={{
                    height: "1.9rem",
                    borderColor: 'rgba(0,0,0,0.2)'
                  }}
                >
                  {t('replicate')}
                </Button>
              </span>
            </MuiTooltip>
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
        {ciclos.length === 0 && t('noCyclesPlannedForLot')}
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
      <Dialog open={replicateOpen} onClose={() => setReplicateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('replicatePlanningToLots')}</DialogTitle>
        <DialogContent>
          {availableLots.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              {t('noOtherLotsAvailableToReplicate')}
            </Typography>
          ) : (
            <List>
              {availableLots.map((l: any) => (
                <ListItem key={l.id} onClick={() => handleToggleLot(l.id)} button>
                  <Checkbox checked={selectedLots.includes(l.id)} />
                  <ListItemText primary={l.properties?.nombre || l.id} secondary={`${l.properties?.hectareas || 0} ha`} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplicateOpen(false)}>{t('cancel')}</Button>
          <Button onClick={replicatePlanningToLots} variant="contained" disabled={selectedLots.length === 0}>{t('replicate')}</Button>
        </DialogActions>
      </Dialog>
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
  isCampaignClosed?: boolean;
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
  isCampaignClosed = false,
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
          background: "#1976d2",
          color: "white",
          padding: "16px",
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
                {t('campaignPlanning')}: <strong>{getCampanaDesc(campaignId)}</strong>
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
              allLotes={lotes}
              campanaId={campaignId}
              expanded={loteSelected === lote.id}
              cicloSelected={cicloSelected}
              isCampaignClosed={isCampaignClosed}
            />
          );
        })}
        {/* fin por cada lote */}
      </Box>
    </Box>
  );
};
