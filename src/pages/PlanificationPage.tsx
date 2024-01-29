import React, { useEffect, useState } from "react";
import { PlanificationByField } from "../components/Planification/PlanificationByField";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useField } from "../hooks/useField";
import { useCampaign } from "../hooks";
import { ItemPlanificationByField } from "../components/Planification/ItemPlanificationByField";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CultivoContext } from "../components/Planification/contexts/CultivosContext";
import { useCrops } from "../hooks/useCrops";
import { CampanasContext, useListaCampanas } from "../components/Planification/contexts/CampanasContext";
import {
  InsumosContext,
  useInsumos,
} from "../components/Planification/contexts/InsumosContext";
import { LaboresContext } from "../components/Planification/contexts/LaboresContext";
import { useLabores } from "../hooks/useLabores";
import { CiclosContext } from '../components/Planification/contexts/CiclosContext';
import { useCiclos, useListaDeCiclos } from "../hooks/usePlanifications";
import { ArrowBack } from "@mui/icons-material";
import { ReporteDeCampanas } from "../components/Planification/FuncionesInformes";
import { CloseButtonPage } from "../components";

export const PlanificationPage: React.FC = () => {
  const navigation = useNavigate();

  const { fields, getFields } = useField();
  const { campaigns, getCampaigns } = useCampaign();

  const [selCampanaId, setSelCampanaId] = useState();
  const [selCampoId, setSelCampoId] = useState();
  const [selLoteId, setSelLoteId] = useState();
  const [selCicloId, setSelCicloId] = useState();


  const ciclos = useListaDeCiclos()

  useEffect(() => {
    getCampaigns();
    getFields();
  }, []);

  useEffect(() => {
    console.log("campos", fields);
    console.log("campañas", campaigns);
  }, [fields, campaigns]);

  const navigate = useNavigate()

  return (
    <CultivoContext.Provider value={useCrops()}>
      <CampanasContext.Provider value={useListaCampanas()}>
        <InsumosContext.Provider value={useInsumos()}>
          <LaboresContext.Provider value={useLabores()}>
            <CiclosContext.Provider value={useListaDeCiclos()}>

            
              <Grid container sx={{ position: "absolute", zIndex:2, backgroundColor:"#ffffff52" }} spacing={"2rem"}>
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
                      <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems:"center"
                      }}>
                        <IconButton onClick={()=>navigate(-1)}><ArrowBack></ArrowBack></IconButton>
                        <Typography variant="h5">
                        Planificación Anual de Campañas
                      </Typography>
                      </Box>
                      

                      
                      {/* <IconButton onClick={()=>{
                        ReporteDeCampanas(ciclos,campaigns)
                      }}>
                        <MoreVertIcon />
                      </IconButton> */}
                    </Box>
                    <Divider variant="middle" component={"div"}></Divider>
                    <Box
                      sx={{
                        maxHeight: "85vh",
                        overflowY: "auto",
                        paddingX: "1rem",
                      }}
                    >
                      {fields === undefined && <li>"No hay campos"</li>}
                      {fields?.map((campo, i) => (
                        <ItemPlanificationByField
                          key={i}
                          campo={campo}
                          campanas={campaigns}
                          onCampaignClick={(campana, lote,ciclo) => {
                            setSelCampanaId(campana._id);
                            setSelCampoId(campo._id);
                            setSelLoteId(lote.id)
                            if(ciclo){
                              setSelCicloId(ciclo._id)
                            }else{
                              setSelCicloId(" ")
                            }
                            
                            console.log("CLICK!!!", campana, campo);
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {selCampanaId && selCampoId && selLoteId && selCicloId && (
                  <Grid item xs={6} >
                    <Paper sx={{ marginTop: "4rem" }}>
                      <PlanificationByField
                        campaignId={selCampanaId}
                        fieldId={selCampoId}
                        loteSelected={selLoteId}
                        cicloSelected={selCicloId}
                        onClose={()=>{
                          setSelCampanaId(undefined)
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
