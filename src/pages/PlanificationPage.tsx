import React, { useEffect, useState } from "react";
import { PlanificationByField } from "../components/Planification/PlanificationByField";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  createFilterOptions,
} from "@mui/material";
import { useField } from "../hooks/useField";
import { useAppSelector, useCampaign } from "../hooks";
import { ItemPlanificationByField } from "../components/Planification/ItemPlanificationByField";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
import { ArrowBack } from "@mui/icons-material";
import { ReporteDeCampanas } from "../components/Planification/FuncionesInformes";
import { CloseButtonPage } from "../components";
import { SearchBar } from "../components/Planification/SearchBar";
import { Field } from "@types";
import { PlanificacionMoreButton } from "../components/Planification/PlanificacionMoreButton";
import CampaignSelector from "../components/Planification/CampaignSelector";

const ItemMemo = React.memo(ItemPlanificationByField);

export const PlanificationPage: React.FC = () => {
  const navigation = useNavigate();
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const { fields, getFields } = useField();
  const { campaigns, getCampaigns } = useCampaign();

  const [selCampanaId, setSelCampanaId] = useState();
  const [selCampoId, setSelCampoId] = useState();
  const [selLoteId, setSelLoteId] = useState();
  const [selCicloId, setSelCicloId] = useState();

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

  const navigate = useNavigate();

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
                  backgroundColor: "#ffffff52",
                }}
                spacing={"2rem"}
              >
                <Grid item sx={{ maxHeight: "100%" }}>
                  <Paper sx={{ maxHeight: "100%" }}>
                    <Box
                      sx={{
                        paddingY: "8px",
                        paddingX: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <IconButton onClick={() => navigate(-1)}>
                          <ArrowBack></ArrowBack>
                        </IconButton>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                            Planificación Anual de Campañas
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Gestione la planificación anual de cultivos por campo y campaña
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
                    <Divider variant="middle" component={"div"}></Divider>
                    <Box
                      sx={{
                        maxHeight: "85vh",
                        height: "85vh",
                        overflowY: "auto",
                        paddingX: "1rem",
                      }}
                    >
                      {/* Selector de Campaña */}
                      <Box sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Seleccionar Campaña para Planificación
                        </Typography>
                        <CampaignSelector
                          campaigns={campaigns || []}
                          selectedCampaignId={selectedCampaign?._id || ''}
                          currentCampaignId={campaigns?.find(c => c.isCurrent)?._id}
                          onCampaignChange={(campaignId) => {
                            // TODO: Actualizar campaña seleccionada
                            console.log('Campaña seleccionada:', campaignId);
                          }}
                        />
                      </Box>

                      <SearchBar
                        onChange={(e) => {
                          let text = e.target.value.toLowerCase();
                          let filtrados = fields.filter((f) =>
                            f.nombre.toLowerCase().includes(text)
                          );
                          setFilteredFields(filtrados);
                        }}
                      />
                      {filteredFields === undefined && <li>"No hay campos"</li>}
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

                {selCampanaId &&
                  selCampoId &&
                  selLoteId &&
                  selCicloId &&
                  crops.crops?.length && (
                    <Grid item xs={6}>
                      <Paper sx={{ marginTop: "4rem" }}>
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
              </Grid>
            </CiclosContext.Provider>
          </LaboresContext.Provider>
        </InsumosContext.Provider>
      </CampanasContext.Provider>
    </CultivoContext.Provider>
  );
};
