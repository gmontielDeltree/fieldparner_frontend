import React, { useEffect, useState } from "react";
import { PlanificationByField } from "../components/Planification/PlanificationByField";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import { useField } from "../hooks/useField";
import { useAppSelector, useCampaign } from "../hooks";
import { ItemPlanificationByField } from "../components/Planification/ItemPlanificationByField";
import { useNavigate, useLocation } from "react-router-dom";
import { CultivoContext } from "../components/Planification/contexts/CultivosContext";
import { useCrops } from "../hooks/useCrops";
import {
  CampanasContext,
  useListaCampanas,
} from "../components/Planification/contexts/CampanasContext";
import {
  InsumosContext,
  useInsumos,
} from "../components/Planification/contexts/InsumosContext";
import { LaboresContext } from "../components/Planification/contexts/LaboresContext";
import { useLabores } from "../hooks/useLabores";
import { CiclosContext } from "../components/Planification/contexts/CiclosContext";
import { useCiclos, useListaDeCiclos } from "../hooks/usePlanifications";
import { ArrowBack, Campaign, Info, VerifiedUser, ContentCopy } from "@mui/icons-material";
import { ReporteDeCampanas } from "../components/Planification/FuncionesInformes";
import { SearchBar } from "../components/Planification/SearchBar";
// import { Field } from "@types";
import { PlanificacionMoreButton } from "../components/Planification/PlanificacionMoreButton";
import { useTranslation } from "react-i18next";
import CreateCampaignModal from "../components/CreateCampaign";
import { dbContext } from "../services";
import { uuidv7 } from "uuidv7";
import { resolveSupplyDosificacion } from "../utils/supplyDose";
import { NotificationService } from "../services/notificationService";

const ItemMemo = React.memo(ItemPlanificationByField);

export const PlanificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [filteredFields, setFilteredFields] = useState<any[]>([]);
  const { fields, getFields } = useField();
  const { campaigns, getCampaigns } = useCampaign();

  // Get verification mode data from navigation state
  const verificationData = location.state as {
    selectedCampaignId?: string;
    selectedFieldId?: string;
    selectedLoteId?: string;
    selectedCicloId?: string;
    activityToVerify?: any;
    verificationMode?: boolean;
  } | null;

  const isVerificationMode = verificationData?.verificationMode || false;
  const activityToVerify = verificationData?.activityToVerify;

  const [selCampanaId, setSelCampanaId] = useState<string | undefined>(
    verificationData?.selectedCampaignId
  );
  const [selCampoId, setSelCampoId] = useState<string | undefined>(
    verificationData?.selectedFieldId
  );
  const [selLoteId, setSelLoteId] = useState<string | undefined>(
    verificationData?.selectedLoteId
  );
  const [selCicloId, setSelCicloId] = useState<string | undefined>(
    verificationData?.selectedCicloId
  );

  // New state for campaign selection
  const [selectedCampaignForPlanning, setSelectedCampaignForPlanning] = useState(
    verificationData?.selectedCampaignId || ''
  );
  const [showCurrentCampaignAlert, setShowCurrentCampaignAlert] = useState(false);
  const [pendingCampaignSelection, setPendingCampaignSelection] = useState('');

  // A073 - Copy plan dialog state
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [destinationCampaignId, setDestinationCampaignId] = useState<string>('');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [creatingCampaignInitialData, setCreatingCampaignInitialData] = useState<any>(null);

  const ciclos = useListaDeCiclos();
  const crops = useCrops();

  const { selectedCampaign } = useAppSelector((state) => state.campaign);

  // Workaround typing for CreateCampaignModal props
  const CreateCampaignAny: any = CreateCampaignModal;

  useEffect(() => {
    getCampaigns();
    getFields();
    crops.getCrops();
  }, []);

  useEffect(() => {
    console.log("campos", fields);
    console.log("campañas", campaigns);
    if (fields?.length) {
      setFilteredFields(fields);
    }
  }, [fields, campaigns]);

  // Add debugging for cycles
  useEffect(() => {
    console.log("🔄 CICLOS DEBUG - Estado completo:", {
      ciclosObject: ciclos,
      allCiclos: ciclos.ciclos,
      ciclosLength: ciclos.ciclos?.length || 0,
      hasGetCiclosFunction: typeof ciclos.getCiclosFromCampanaAndLote === 'function'
    });

    if (ciclos.ciclos?.length > 0) {
      console.log("📋 TODOS LOS CICLOS:", ciclos.ciclos.map(c => ({
        id: c._id,
        campaignId: c.campanaId,
        loteId: c.loteId,
        cultivoId: c.cultivoId
      })));
    } else {
      console.log("❌ NO HAY CICLOS CARGADOS");
    }
  }, [ciclos]);

  useEffect(() => {
    // Set default to current campaign if available
    if (selectedCampaign && selectedCampaign._id) {
      setSelectedCampaignForPlanning(selectedCampaign._id);
    }
  }, [selectedCampaign]);

  const handleCampaignChange = (campaignId: string) => {
    // Check if it's the current campaign
    if (selectedCampaign && campaignId === selectedCampaign._id) {
      setPendingCampaignSelection(campaignId);
      setShowCurrentCampaignAlert(true);
    } else {
      setSelectedCampaignForPlanning(campaignId);
    }
  };

  const confirmCurrentCampaignSelection = () => {
    setSelectedCampaignForPlanning(pendingCampaignSelection);
    setShowCurrentCampaignAlert(false);
    setPendingCampaignSelection('');
  };

  const cancelCurrentCampaignSelection = () => {
    setShowCurrentCampaignAlert(false);
    setPendingCampaignSelection('');
  };

  const getSelectedCampaignData = () => {
    return campaigns.find(c => c._id === selectedCampaignForPlanning);
  };

  const getCurrentCampaignName = () => {
    if (selectedCampaign) {
      return selectedCampaign.name || 'Campaña Actual';
    }
    return 'Campaña Actual';
  };

  const isCurrentCampaign = selectedCampaign && selectedCampaignForPlanning === selectedCampaign._id;

  // A073 - Copy annual plan logic
  const copyAnnualPlanToCampaign = async (originCampaignId: string, destCampaignId: string) => {
    const origin = campaigns.find(c => c._id === originCampaignId);
    const dest = campaigns.find(c => c._id === destCampaignId);
    if (!origin || !dest) return;

    // Validate zafra count equality
    const originZafras = Array.isArray(origin.zafra) ? origin.zafra : (origin.zafra ? [origin.zafra] : []);
    const destZafras = Array.isArray(dest.zafra) ? dest.zafra : (dest.zafra ? [dest.zafra] : []);
    if (originZafras.length !== destZafras.length) {
      NotificationService.showError(t('Las campañas deben tener la misma cantidad de zafras'), {}, t('error_label'));
      return;
    }

    const fieldsDb = dbContext.fields;

    // Check duplicates: any cycles for destination campaign already?
    const allCiclos = ciclos.ciclos || [];
    const getCampId = (c: any) => c?.campanaId ?? c?.campaignId;
    const destCyclesExist = allCiclos.some(c => getCampId(c) === destCampaignId);
    if (destCyclesExist) {
      NotificationService.showError(t('Ya existe planificación en la campaña destino'), {}, t('error_label'));
      return;
    }

    // Get all cycles of origin
    const originCycles = allCiclos.filter(c => getCampId(c) === originCampaignId);

    // Guard clause: nothing to copy
    if (!originCycles.length) {
      NotificationService.showError(t('No hay planificación para copiar en la campaña origen'), {}, t('error_label'));
      return;
    }

    // Build new cycles and clone planned activities
    const newCycleIdsMap = new Map<string, string>();
    const newDocs: any[] = [];

    for (const cycle of originCycles) {
      const newCycleId = `ciclo:${destCampaignId}:${cycle.loteId}:${uuidv7()}`;
      newCycleIdsMap.set(cycle._id as string, newCycleId);
      const newCycle = {
        ...cycle,
        _id: newCycleId,
        _rev: undefined,
        campanaId: destCampaignId,
        actividadesIds: [],
      } as any;
      newDocs.push(newCycle);
    }

    // Load all planactividad docs for origin cycles
    const allPlannedIds = originCycles.flatMap(c => c.actividadesIds || []);
    const plannedResp = allPlannedIds.length
      ? await fieldsDb.allDocs({ include_docs: true, keys: allPlannedIds })
      : { rows: [] } as any;
    const plannedActivities = (plannedResp.rows || []).map((r: any) => r.doc as any).filter(Boolean);

    for (const act of plannedActivities) {
      // Clone lines first
      const insResp = act.insumosLineasIds?.length ? await fieldsDb.allDocs({ include_docs: true, keys: act.insumosLineasIds }) : { rows: [] } as any;
      const labResp = act.laboresLineasIds?.length ? await fieldsDb.allDocs({ include_docs: true, keys: act.laboresLineasIds }) : { rows: [] } as any;

      const newInsumoIds: string[] = [];
      const newLaborIds: string[] = [];

      for (const row of (insResp.rows || [])) {
        if (!row.doc) continue;
        const newId = `planlinsumo:${uuidv7()}`;
        newInsumoIds.push(newId);
        newDocs.push({ ...row.doc, _id: newId, _rev: undefined, ordenRetiro: undefined });
      }
      for (const row of (labResp.rows || [])) {
        if (!row.doc) continue;
        const newId = `planlabor:${uuidv7()}`;
        newLaborIds.push(newId);
        newDocs.push({ ...row.doc, _id: newId, _rev: undefined });
      }

      // Clone the planned activity
      const newActId = `planactividad:${uuidv7()}`;
      const newCicloId = newCycleIdsMap.get(act.cicloId);
      if (!newCicloId) continue;

      const newAct = {
        ...act,
        _id: newActId,
        _rev: undefined,
        cicloId: newCicloId,
        campanaId: destCampaignId,
        insumosLineasIds: newInsumoIds,
        laboresLineasIds: newLaborIds,
        ejecutada: false,
      } as any;
      newDocs.push(newAct);

      // Add to cycle actividadesIds later after bulk put, but we can prepare now
      const cycleToUpdate = newDocs.find(d => d._id === newCicloId);
      if (cycleToUpdate) {
        cycleToUpdate.actividadesIds = [...(cycleToUpdate.actividadesIds || []), newActId];
      }
    }

    // Fallback: if there were no planned activities to clone, reconstruct planning from executed activities of origin campaign
    if (plannedActivities.length === 0) {
      // Build helper map lot+crop -> new cycle id using already prepared cycles
      const newCycleByLotCrop = new Map<string, string>();
      for (const cycle of originCycles) {
        const newId = newCycleIdsMap.get(cycle._id as string);
        if (newId) {
          const key = `${cycle.loteId}:${cycle.cultivoId}`;
          newCycleByLotCrop.set(key, newId);
        }
      }

      // Load executed activities from origin campaign
      const actsResp: any = await fieldsDb.allDocs({
        include_docs: true,
        startkey: 'actividad:',
        endkey: 'actividad:\ufff0'
      });
      const execActivities = (actsResp.rows || [])
        .map((r: any) => r.doc)
        .filter((doc: any) => doc && (
          doc.campaña?.campaignId === originCampaignId ||
          doc.campaña?.name === origin?.name
        ));

      // If no cycles existed, derive cycles from executed activities (by lot + crop)
      if (originCycles.length === 0 && execActivities.length > 0) {
        const uniquePairs = new Set<string>();
        for (const ea of execActivities) {
          const lotId = ea.lote_uuid || ea.loteUuid;
          const cropId = ea.detalles?.cultivo?._id || ea.detalles?.cultivoId || '';
          if (!lotId || !cropId) continue;
          const key = `${lotId}:${cropId}`;
          if (uniquePairs.has(key)) continue;
          uniquePairs.add(key);

          const newCycleId = `ciclo:${destCampaignId}:${lotId}:${uuidv7()}`;
          newCycleByLotCrop.set(key, newCycleId);
          const newCycle = {
            _id: newCycleId,
            campanaId: destCampaignId,
            loteId: lotId,
            cultivoId: cropId,
            fechaInicio: new Date().toISOString(),
            fechaFin: new Date().toISOString(),
            actividadesIds: [],
          } as any;
          newDocs.push(newCycle);
        }
      }

      // Create planned activities from executed ones
      for (const ea of execActivities) {
        const lotId = ea.lote_uuid || ea.loteUuid;
        const cropId = ea.detalles?.cultivo?._id || ea.detalles?.cultivoId || '';
        if (!lotId) continue;
        const key = `${lotId}:${cropId}`;
        const targetCycleId = newCycleByLotCrop.get(key);
        if (!targetCycleId) continue;

        // Create line docs from executed details
        const newInsumoIds: string[] = [];
        const newLaborIds: string[] = [];
        const area = ea.detalles?.hectareas || ea.detalles?.superficie || 0;

        for (const dosis of (ea.detalles?.dosis || [])) {
          const newId = `planlinsumo:${uuidv7()}`;
          newInsumoIds.push(newId);
          newDocs.push({
            _id: newId,
            insumoId: dosis.insumo?._id,
            dosis: resolveSupplyDosificacion(dosis, area) || 0,
            totalCantidad: dosis.total || 0,
            hectareas: area,
            precioUnitario: dosis.precio_estimado || 0,
            deposito: dosis.deposito || null,
            depositoId: dosis.deposito?._id,
            ubicacion: dosis.ubicacion || '',
            nroLote: dosis.nro_lote || '',
            ordenRetiro: undefined,
          });
        }
        for (const serv of (ea.detalles?.servicios || [])) {
          const newId = `planlabor:${uuidv7()}`;
          newLaborIds.push(newId);
          newDocs.push({
            _id: newId,
            laborId: serv.laborId || 'default-labor',
            laborNombre: serv.servicio || 'Servicio',
            totalCosto: serv.costo_total || 0,
            costoPorHectarea: serv.precio_unidad || 0,
            comentario: serv.comentario || '',
          });
        }

        const newActId = `planactividad:${uuidv7()}`;
        const plannedFecha = ea.detalles?.fecha_ejecucion_tentativa || ea.detalles?.fecha_ejecucion || new Date().toISOString();
        const newAct = {
          _id: newActId,
          tipo: ea.tipo,
          fecha: plannedFecha,
          area,
          cicloId: targetCycleId,
          campanaId: destCampaignId,
          loteId: lotId,
          insumosLineasIds: newInsumoIds,
          laboresLineasIds: newLaborIds,
          ejecutada: false,
        } as any;
        newDocs.push(newAct);

        const cycleToUpdate = newDocs.find(d => d._id === targetCycleId);
        if (cycleToUpdate) {
          cycleToUpdate.actividadesIds = [...(cycleToUpdate.actividadesIds || []), newActId];
        }
      }
    }

    // Persist in bulk
    await fieldsDb.bulkDocs(newDocs);
    await ciclos.refreshCiclos();
    NotificationService.showSuccess(t('Planificación copiada correctamente'), {}, t('success_label'));
  };

  return (
    <CultivoContext.Provider value={crops}>
      <CampanasContext.Provider value={useListaCampanas()}>
        <InsumosContext.Provider value={useInsumos()}>
          <LaboresContext.Provider value={useLabores()}>
            <CiclosContext.Provider value={ciclos}>
              <Grid
                container
                sx={{
                  position: "absolute",
                  zIndex: 2,
                  backgroundColor: "#f8fafcaa",
                  minHeight: "100vh",
                  padding: "16px",
                }}
                spacing={3}
              >
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={5}
                    sx={{
                      maxHeight: "calc(100vh - 32px)",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        background: "#1976d2",
                        color: "white",
                        paddingY: "16px",
                        paddingX: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <IconButton
                          onClick={() => navigate(-1)}
                          sx={{ color: "white" }}
                        >
                          <ArrowBack />
                        </IconButton>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                            {t('Annual Campaign Planning')}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {t('Manage and plan your agricultural activities')}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={t('Copia Planificación Completa')} placement="bottom" arrow>
                          <span>
                            <IconButton
                              onClick={() => setCopyDialogOpen(true)}
                              color="inherit"
                              disabled={!(getSelectedCampaignData() && String(getSelectedCampaignData()?.state) === 'closed')}
                            >
                              <ContentCopy sx={{ color: 'white' }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <PlanificacionMoreButton
                          onReportePorCultivoPDF={() => {
                            if (selectedCampaign) {
                              ReporteDeCampanas(
                                ciclos.ciclos,
                                campaigns,
                                crops,
                                "pdf",
                                selectedCampaign
                              );
                            }
                          }}
                          onReportePorCultivoXLS={() => {
                            if (selectedCampaign) {
                              ReporteDeCampanas(
                                ciclos.ciclos,
                                campaigns,
                                crops,
                                "xls",
                                selectedCampaign
                              );
                            }
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Verification Mode Alert */}
                    {isVerificationMode && activityToVerify && (
                      <Alert
                        severity="warning"
                        sx={{ m: 2 }}
                        icon={<VerifiedUser />}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {t('Activity Verification Required')}
                        </Typography>
                        <Typography variant="body2">
                          {t('You are verifying a planned activity of type')} <strong>{activityToVerify.tipo}</strong>.
                          {t(' Please complete the missing fields to make this activity executable.')}
                        </Typography>
                      </Alert>
                    )}

                    {/* Campaign Selection */}
                    <Card sx={{ m: 2, border: "1px solid #e3f2fd" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Campaign color="primary" />
                          <Typography variant="h6" color="primary">
                            {t('Campaign Selection')}
                          </Typography>
                        </Box>

                        <FormControl fullWidth>
                          <InputLabel>{t('Select Campaign for Planning')}</InputLabel>
                          <Select
                            value={selectedCampaignForPlanning}
                            onChange={(e) => handleCampaignChange(e.target.value)}
                            label={t('Select Campaign for Planning')}
                          >
                            {campaigns.map((campaign) => (
                              <MenuItem key={campaign._id} value={campaign._id}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                  <span>{campaign.name}</span>
                                  {selectedCampaign && campaign._id === selectedCampaign._id && (
                                    <Chip
                                      label={t('Current')}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {isCurrentCampaign && (
                          <Alert
                            severity="info"
                            sx={{ mt: 2 }}
                            icon={<Info />}
                          >
                            <strong>{t('Current Campaign Selected')}</strong>
                            <br />
                            {t('You are working with the current active campaign. Changes may affect ongoing operations.')}
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    <Divider />

                    {/* Fields List */}
                    <Box
                      sx={{
                        maxHeight: "calc(100vh - 400px)",
                        overflowY: "auto",
                        paddingX: "16px",
                        paddingBottom: "16px",
                      }}
                    >
                      <Box sx={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1, py: 2 }}>
                        <SearchBar
                          onChange={(e) => {
                            let text = e.target.value.toLowerCase();
                            let filtrados = fields.filter((f) =>
                              f.nombre.toLowerCase().includes(text)
                            );
                            setFilteredFields(filtrados);
                          }}
                        />
                      </Box>

                      {!selectedCampaignForPlanning && (
                        <Box
                          sx={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "text.secondary",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "12px",
                            border: "2px dashed #dee2e6"
                          }}
                        >
                          <Campaign sx={{ fontSize: 60, color: "#6c757d", mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            {t('No Campaign Selected')}
                          </Typography>
                          <Typography variant="body2">
                            {t('Please select a campaign above to view and plan activities')}
                          </Typography>
                        </Box>
                      )}

                      {selectedCampaignForPlanning && filteredFields === undefined && (
                        <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                          {t('No fields available')}
                        </Typography>
                      )}

                      {selectedCampaignForPlanning && filteredFields?.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            padding: "40px 20px",
                            color: "text.secondary",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px"
                          }}
                        >
                          <Typography variant="h6" gutterBottom>
                            {t('No fields match your search')}
                          </Typography>
                          <Typography variant="body2">
                            {t('Try adjusting your search criteria')}
                          </Typography>
                        </Box>
                      )}

                      {selectedCampaignForPlanning && filteredFields?.map((campo) => (
                        <ItemMemo
                          key={campo._id}
                          campo={campo}
                          campanas={selectedCampaignForPlanning ?
                            campaigns.filter(c => c._id === selectedCampaignForPlanning) :
                            []
                          }
                          onCampaignClick={(campana: any, lote: any, ciclo?: any) => {
                            setSelCampanaId(campana._id);
                            setSelCampoId(campo._id);
                            setSelLoteId(lote.id);
                            if (ciclo) {
                              setSelCicloId(ciclo._id);
                            } else {
                              // If no cycle exists, set a placeholder to open the planning panel
                              setSelCicloId("no-cycle");
                            }
                            console.log("CLICK!!!", campana, campo, lote, ciclo);
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Planning Details Panel */}
                {selectedCampaignForPlanning &&
                  selCampoId &&
                  selLoteId &&
                  selCicloId &&
                  crops.crops?.length && (
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={5}
                        sx={{
                          overflow: "hidden",
                          maxHeight: "calc(100vh - 32px)",
                          backgroundColor: "#fff",
                        }}
                      >
                        <PlanificationByField
                          campaignId={selectedCampaignForPlanning}
                          fieldId={selCampoId}
                          loteSelected={selLoteId}
                          cicloSelected={selCicloId === "no-cycle" ? "" : selCicloId}
                          isCampaignClosed={String(getSelectedCampaignData()?.state) === 'closed'}
                          onClose={() => {
                            setSelCampanaId(undefined);
                            setSelCampoId(undefined);
                            setSelLoteId(undefined);
                            setSelCicloId(undefined);
                          }}
                          verificationMode={isVerificationMode}
                          activityToVerify={activityToVerify}
                        />
                      </Paper>
                    </Grid>
                  )}

                {/* Current Campaign Confirmation Dialog */}
                <Dialog
                  open={showCurrentCampaignAlert}
                  onClose={cancelCurrentCampaignSelection}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Info color="warning" />
                    {t('Confirm Current Campaign Selection')}
                  </DialogTitle>
                  <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        <strong>{t('You are about to work with the current active campaign')} "{getCurrentCampaignName()}".</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {t('This campaign is currently in progress. Any planning changes you make may affect ongoing agricultural operations.')}
                      </Typography>
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                      {t('Are you sure you want to continue with the current campaign for planning?')}
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={cancelCurrentCampaignSelection} color="inherit">
                      {t('Cancel')}
                    </Button>
                    <Button
                      onClick={confirmCurrentCampaignSelection}
                      variant="contained"
                      color="warning"
                    >
                      {t('Yes, Continue with Current Campaign')}
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* A073 - Copy Annual Plan Dialog */}
                <Dialog
                  open={copyDialogOpen}
                  onClose={() => setCopyDialogOpen(false)}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>{t('Copia Planificación Completa')}</DialogTitle>
                  <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {t('Seleccione la campaña de destino. Debe tener la misma cantidad de zafras que la de origen. Si no existe, puede crearla aquí.')}
                      </Typography>
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Button variant="outlined" onClick={() => setIsCreatingCampaign(true)}>
                        {t('Agregar Nueva Campaña')} +
                      </Button>
                    </Box>
                    <FormControl fullWidth>
                      <InputLabel>{t('Campaña destino')}</InputLabel>
                      <Select
                        label={t('Campaña destino')}
                        value={destinationCampaignId}
                        onChange={(e) => setDestinationCampaignId(e.target.value)}
                      >
                        {campaigns.filter(c => c._id !== selectedCampaignForPlanning).map((c) => (
                          <MenuItem key={c._id} value={c._id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setCopyDialogOpen(false)}>{t('Cancel')}</Button>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        await copyAnnualPlanToCampaign(selectedCampaignForPlanning, destinationCampaignId);
                        setCopyDialogOpen(false);
                      }}
                      disabled={!destinationCampaignId}
                    >
                      {t('Copiar')}
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Inline create campaign modal if needed */}
                <CreateCampaignAny
                  open={isCreatingCampaign}
                  onClose={() => setIsCreatingCampaign(false)}
                  onCreate={(campaign: any) => {
                    // After creating, refresh and preselect as destination
                    getCampaigns().then(() => {
                      setDestinationCampaignId(campaign._id || campaign.campaignId);
                      setIsCreatingCampaign(false);
                    });
                  }}
                />
              </Grid>
            </CiclosContext.Provider>
          </LaboresContext.Provider>
        </InsumosContext.Provider>
      </CampanasContext.Provider>
    </CultivoContext.Provider>
  );
};
