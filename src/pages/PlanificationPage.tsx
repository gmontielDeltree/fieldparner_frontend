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
} from "@mui/material";
import { useField } from "../hooks/useField";
import { useAppSelector, useCampaign } from "../hooks";
import { ItemPlanificationByField } from "../components/Planification/ItemPlanificationByField";
import { useNavigate } from "react-router-dom";
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
import { ArrowBack, Campaign, Info } from "@mui/icons-material";
import { ReporteDeCampanas } from "../components/Planification/FuncionesInformes";
import { SearchBar } from "../components/Planification/SearchBar";
import { Field } from "@types";
import { PlanificacionMoreButton } from "../components/Planification/PlanificacionMoreButton";
import { useTranslation } from "react-i18next";

const ItemMemo = React.memo(ItemPlanificationByField);

export const PlanificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const { fields, getFields } = useField();
  const { campaigns, getCampaigns } = useCampaign();

  const [selCampanaId, setSelCampanaId] = useState();
  const [selCampoId, setSelCampoId] = useState();
  const [selLoteId, setSelLoteId] = useState();
  const [selCicloId, setSelCicloId] = useState();

  // New state for campaign selection
  const [selectedCampaignForPlanning, setSelectedCampaignForPlanning] = useState('');
  const [showCurrentCampaignAlert, setShowCurrentCampaignAlert] = useState(false);
  const [pendingCampaignSelection, setPendingCampaignSelection] = useState('');

  const ciclos = useListaDeCiclos();
  const crops = useCrops();

  const { selectedCampaign } = useAppSelector((state) => state.campaign);

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

  useEffect(() => {
    // Set default to current campaign if available
    if (selectedCampaign) {
      setSelectedCampaignForPlanning(selectedCampaign._id);
    }
  }, [selectedCampaign]);

  const navigate = useNavigate();

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
      return selectedCampaign.name || selectedCampaign.nombreComercial || 'Campaña Actual';
    }
    return 'Campaña Actual';
  };

  const isCurrentCampaign = selectedCampaign && selectedCampaignForPlanning === selectedCampaign._id;

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
                  backgroundColor: "#f8fafcee",
                  minHeight: "100vh",
                  padding: "16px",
                }}
                spacing={3}
              >
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={3}
                    sx={{
                      maxHeight: "calc(100vh - 32px)",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

                      <PlanificacionMoreButton
                        onReportePorCultivoPDF={() => {
                          ReporteDeCampanas(
                            ciclos.ciclos,
                            campaigns,
                            crops,
                            "pdf",
                            selectedCampaign
                          );
                        }}
                        onReportePorCultivoXLS={() => {
                          ReporteDeCampanas(
                            ciclos.ciclos,
                            campaigns,
                            crops,
                            "xls",
                            selectedCampaign
                          );
                        }}
                      />
                    </Box>

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
                                  <span>{campaign.name || campaign.nombreComercial}</span>
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

                        {getSelectedCampaignData() && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {t('Selected Campaign')}:
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                              {getSelectedCampaignData()?.name || getSelectedCampaignData()?.nombreComercial}
                            </Typography>
                          </Box>
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

                      {filteredFields === undefined && (
                        <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                          {t('No fields available')}
                        </Typography>
                      )}

                      {filteredFields?.map((campo, i) => (
                        <ItemMemo
                          key={campo._id}
                          campo={campo}
                          campanas={campaigns}
                          onCampaignClick={(campana, lote, ciclo) => {
                            setSelCampanaId(campana._id);
                            setSelCampoId(campo._id);
                            setSelLoteId(lote.id);
                            if (ciclo) {
                              setSelCicloId(ciclo._id);
                            } else {
                              setSelCicloId(" ");
                            }
                            console.log("CLICK!!!", campana, campo);
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Planning Details Panel */}
                {selCampanaId &&
                  selCampoId &&
                  selLoteId &&
                  selCicloId &&
                  crops.crops?.length && (
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={3}
                        sx={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          maxHeight: "calc(100vh - 32px)",
                        }}
                      >
                        <PlanificationByField
                          campaignId={selCampanaId}
                          fieldId={selCampoId}
                          loteSelected={selLoteId}
                          cicloSelected={selCicloId}
                          onClose={() => {
                            setSelCampanaId(undefined);
                          }}
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
              </Grid>
            </CiclosContext.Provider>
          </LaboresContext.Provider>
        </InsumosContext.Provider>
      </CampanasContext.Provider>
    </CultivoContext.Provider>
  );
};
